const OCRDocument = require('../models/OcrDocument');
const PurchaseRequest = require('../models/PurchaseRequest');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { Op } = require('sequelize');
const { processDocumentWithGemini, askDocumentQuestion } = require('../services/geminiOcrService');
// ─── Python OCR Service URL ───────────────────────────────────────────────────
const OCR_SERVICE_URL = process.env.FASTAPI_URL
    ? `${process.env.FASTAPI_URL}/api/ocr`
    : 'http://127.0.0.1:8000/api/ocr';

// ─── Role helpers ─────────────────────────────────────────────────────────────
const ADMIN_ROLES    = ['admin', 'super admin'];
const MANAGER_ROLES  = ['manager'];
// Adding hr, employee, sales to EDIT_ROLES as requested by user
const EDIT_ROLES     = [...ADMIN_ROLES, ...MANAGER_ROLES, 'hr', 'employee', 'sales'];
const VIEW_ONLY      = ['customer', 'vendor'];

function userRole(req) {
    return (req.user?.role || '').toLowerCase();
}
function canEdit(req)    { return EDIT_ROLES.includes(userRole(req)); }
function canApprove(req) { return EDIT_ROLES.includes(userRole(req)); }
function isAdmin(req)    { return ADMIN_ROLES.includes(userRole(req)); }
function isViewOnly(req) { return VIEW_ONLY.includes(userRole(req)); }

// ─── Audit helper ─────────────────────────────────────────────────────────────
function appendAudit(doc, action, user, detail = '') {
    const log = Array.isArray(doc.auditLog) ? [...doc.auditLog] : [];
    log.push({
        timestamp:  new Date().toISOString(),
        action,
        userId:     user?.id   || null,
        userName:   user?.name || 'System',
        userRole:   user?.role || '',
        detail,
    });
    doc.auditLog = log;
}

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/ocr');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'ocr-' + suffix + path.extname(file.originalname).toLowerCase());
    },
});

const ALLOWED_MIMETYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'image/tiff', 'image/heic',
    'application/pdf',
];

const upload = multer({
    storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.pdf'];
        if (ALLOWED_MIMETYPES.includes(file.mimetype) || allowedExt.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(
                `Unsupported file type. Please upload JPG, PNG, WEBP, TIFF, or PDF. Got: ${file.mimetype}`
            ));
        }
    },
}).single('file');

// ─── Helper: duplicate check ──────────────────────────────────────────────────
async function checkDuplicate(fingerprint, excludeId = null) {
    if (!fingerprint) return null;
    const where = { documentFingerprint: fingerprint };
    if (excludeId) where.id = { $ne: excludeId };
    return await OCRDocument.findOne(where);
}

// ─── Helper: PO matching with partial match support ───────────────────────────
async function findMatchingPO(invoiceInfo, structuredData) {
    const poNumber = invoiceInfo?.po_number || '';
    const vendorName = structuredData?.vendor?.name || '';
    const grandTotal = parseFloat(
        String(structuredData?.totals?.grand_total || '0').replace(/[^0-9.]/g, '')
    ) || 0;

    try {
        // 1. Try exact PO number match
        if (poNumber) {
            const po = await PurchaseRequest.findOne({ purchaseRequestId: poNumber });
            if (po) {
                return {
                    found: true,
                    poId: po.id,
                    poNumber: po.purchaseRequestId,
                    status: 'Matched',
                    matchLevel: 'exact',
                    matched_fields: ['PO Number'],
                };
            }
        }

        // 2. Try vendor + amount partial match (if vendor name available)
        if (vendorName) {
            // Fetch recent POs (limit 50) for vendor-based partial match
            const recentPOs = await PurchaseRequest.sequelizeModel.findAll({
                limit: 50,
                order: [['id', 'DESC']],
            });

            for (const po of recentPOs) {
                // Check vendor ID match
                const vendorMatch = po.vendorId !== null;
                if (vendorMatch) {
                    return {
                        found: true,
                        poId: po.id,
                        poNumber: po.purchaseRequestId,
                        status: 'Partial Match',
                        matchLevel: 'partial',
                        matched_fields: ['Vendor'],
                    };
                }
            }
        }

        // No match found
        if (poNumber) {
            return {
                found: false,
                status: 'PO Not Found',
                matchLevel: 'none',
                matched_fields: [],
                note: `PO number ${poNumber} not found in system — manual verification required`,
            };
        }

        return null; // No PO number on invoice — normal for non-PO invoices
    } catch (err) {
        console.error('PO matching error:', err.message);
        return null;
    }
}

// ─── Helper: normalize OCR data from Python response ─────────────────────────
function normalizeOCRData(data) {
    const sd = data.structured_data || {};
    return {
        vendorInfo:   sd.vendor     || data.vendor     || {},
        invoiceInfo:  sd.invoice    || data.invoice    || {},
        customerInfo: sd.customer   || data.customer   || {},
        lineItems:    sd.line_items || data.line_items || { columns: [], rows: [] },
        totalsBlock:  sd.totals     || data.totals     || {},
        rawFields:    sd.raw_fields || data.raw_fields || [],
    };
}

// ─── POST /ocr/upload ─────────────────────────────────────────────────────────
exports.uploadDocument = (req, res) => {
    // Block view-only roles from uploading
    if (isViewOnly(req)) {
        return res.status(403).json({
            error: 'Access denied. Only Admin and Manager can upload invoices.'
        });
    }

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const originalImagePath = `/uploads/ocr/${req.file.filename}`;

        try {
            // 1. Create pending record
            const ocrDoc = await OCRDocument.create({
                originalFileName: req.file.originalname,
                fileSize:         req.file.size,
                mimeType:         req.file.mimetype,
                originalImagePath,
                processingStatus: 'Processing',
                createdBy: req.user?.id || null,
                updatedBy: req.user?.id || null,
                auditLog: [{
                    timestamp: new Date().toISOString(),
                    action:   'Uploaded',
                    userId:   req.user?.id   || null,
                    userName: req.user?.name || 'Unknown',
                    userRole: req.user?.role || '',
                    detail:   `File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
                }],
            });

            // 2. Call Gemini OCR service
            let data;
            try {
                data = await processDocumentWithGemini(req.file.path);
            } catch (ocrErr) {
                console.error('Gemini OCR unavailable:', ocrErr.message);
                ocrDoc.processingStatus = 'Failed';
                appendAudit(ocrDoc, 'OCR Failed', req.user,
                    'Gemini OCR service failed: ' + ocrErr.message);
                await ocrDoc.save();
                return res.status(200).json({
                    message: 'OCR extraction failed. Document saved — click Reprocess when the service is running.',
                    data: ocrDoc,
                });
            }

            // 3. Keep original image for preview
            let processedImagePath = originalImagePath;

            // 4. Duplicate check
            const fingerprint = data.fingerprint || '';
            const duplicate   = fingerprint ? await checkDuplicate(fingerprint, ocrDoc.id) : null;

            // 5. PO match
            const normalized = normalizeOCRData(data);
            const poMatch    = await findMatchingPO(normalized.invoiceInfo, data.structured_data || data);

            // 6. Build validation result
            const validation = data.validation || {};
            if (poMatch) {
                validation.po_match = poMatch;
            }
            validation.duplicate_check = duplicate
                ? { found: true, ref: duplicate.id, refFileName: duplicate.originalFileName }
                : { found: false };

            // 7. Determine workflow status
            let status = 'OCR_Completed';
            if (duplicate) {
                status = 'Duplicate';
            } else if (
                validation.overall_status === 'Needs_Verification' ||
                validation.issue_count > 0 ||
                (data.confidence || 0) < 0.80
            ) {
                status = 'Needs_Verification';
            } else {
                status = 'Ready_For_Approval';
            }

            // 8. Persist — NEVER overwrite original OCR result after first save
            const originalOcrData = { ...data };

            ocrDoc.set({
                originalOcrData:     originalOcrData,
                originalImagePath:   `/uploads/ocr/${req.file.filename}`,
                processedImagePath,
                documentType:        data.document_type || 'General',
                pageCount:           data.page_count   || 1,

                vendorInfo:          normalized.vendorInfo,
                invoiceInfo:         normalized.invoiceInfo,
                customerInfo:        normalized.customerInfo,
                lineItems:           normalized.lineItems,
                totalsBlock:         normalized.totalsBlock,
                rawFields:           normalized.rawFields,

                extractedData:       originalOcrData,
                correctedData:       null,  // no corrections yet

                confidenceScore:     data.confidence || 0,
                fieldConfidence:     data.field_confidence || {},
                validationResult:    validation,
                documentFingerprint: fingerprint,
                isDuplicate:         !!duplicate,
                duplicateOf:         duplicate?.id || null,
                processingStatus:    status,
                updatedBy:           req.user?.id || null,
            });

            // Force Sequelize to detect JSON changes
            ['vendorInfo', 'invoiceInfo', 'customerInfo', 'lineItems', 'totalsBlock', 'rawFields', 'fieldConfidence', 'validationResult'].forEach(f => ocrDoc.changed(f, true));

            appendAudit(ocrDoc, 'OCR Completed', req.user,
                `Status: ${status} | Confidence: ${Math.round((data.confidence || 0) * 100)}% | Issues: ${validation.issue_count || 0} | Pages: ${data.page_count || 1}`);

            if (duplicate) {
                appendAudit(ocrDoc, 'Duplicate Detected', req.user,
                    `Matches existing document ID: ${duplicate.id}`);
            }

            if (poMatch) {
                appendAudit(ocrDoc, 'PO Match', req.user,
                    `${poMatch.status}: ${poMatch.poNumber || 'N/A'}`);
            }

            await ocrDoc.save();

            res.status(200).json({ message: 'Document processed successfully.', data: ocrDoc });

        } catch (dbErr) {
            console.error('DB Error in uploadDocument:', dbErr);
            require('fs').writeFileSync(require('path').join(__dirname, '../../db_error.log'), dbErr.stack || dbErr.toString());
            res.status(500).json({ error: 'Internal server error while processing document.' });
        }
    });
};

// ─── GET /ocr ─────────────────────────────────────────────────────────────────
exports.getAllDocuments = async (req, res) => {
    try {
        const { status, approval, search, vendor, from, to, limit = 100, offset = 0 } = req.query;
        const where = {};

        if (status)   where.processingStatus = status;
        if (approval) where.approvalStatus   = approval;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from);
            if (to)   where.createdAt[Op.lte] = new Date(to + 'T23:59:59');
        }

        let docs = await OCRDocument.sequelizeModel.findAll({
            where,
            order:  [['createdAt', 'DESC']],
            limit:  parseInt(limit),
            offset: parseInt(offset),
        });

        // Client-side search
        if (search) {
            const q = search.toLowerCase();
            docs = docs.filter(d => {
                const inv  = (d.invoiceInfo?.number || '').toLowerCase();
                const vend = (d.vendorInfo?.name   || '').toLowerCase();
                const file = (d.originalFileName   || '').toLowerCase();
                return inv.includes(q) || vend.includes(q) || file.includes(q);
            });
        }

        if (vendor) {
            const q = vendor.toLowerCase();
            docs = docs.filter(d =>
                (d.vendorInfo?.name || '').toLowerCase().includes(q)
            );
        }

        res.status(200).json({ data: docs, total: docs.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching documents' });
    }
};

// ─── GET /ocr/:id ─────────────────────────────────────────────────────────────
exports.getDocumentById = async (req, res) => {
    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.status(200).json({ data: doc });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching document' });
    }
};

// ─── PUT /ocr/:id (save corrected data) ──────────────────────────────────────
exports.updateDocument = async (req, res) => {
    // Strict backend role check — HR / Employee / Sales cannot modify
    if (!canEdit(req)) {
        return res.status(403).json({
            error: 'Access denied. Only Admin and Manager can edit invoice data.'
        });
    }

    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        // Prevent editing an already-approved document (unless admin)
        if (doc.approvalStatus === 'Approved' && !isAdmin(req)) {
            return res.status(403).json({
                error: 'Document is already approved. Only Admin can modify approved documents.'
            });
        }

        // NEVER overwrite originalOcrData
        const { vendorInfo, invoiceInfo, customerInfo, lineItems, totalsBlock, rawFields, correctedData } = req.body;

        if (vendorInfo)    { doc.vendorInfo   = vendorInfo;   doc.changed('vendorInfo', true); }
        if (invoiceInfo)   { doc.invoiceInfo  = invoiceInfo;  doc.changed('invoiceInfo', true); }
        if (customerInfo)  { doc.customerInfo = customerInfo; doc.changed('customerInfo', true); }
        if (lineItems)     { doc.lineItems    = lineItems;    doc.changed('lineItems', true); }
        if (totalsBlock)   { doc.totalsBlock  = totalsBlock;  doc.changed('totalsBlock', true); }
        if (rawFields)     { doc.rawFields    = rawFields;    doc.changed('rawFields', true); }

        // Store corrected snapshot (original is preserved in originalOcrData)
        doc.correctedData = {
            ...(doc.correctedData || {}),
            vendorInfo:   doc.vendorInfo,
            invoiceInfo:  doc.invoiceInfo,
            customerInfo: doc.customerInfo,
            lineItems:    doc.lineItems,
            totalsBlock:  doc.totalsBlock,
            rawFields:    doc.rawFields,
            correctedAt:  new Date().toISOString(),
            correctedBy:  req.user?.id || null,
            ...(correctedData || {}),
        };
        doc.changed('correctedData', true);

        doc.updatedBy = req.user?.id || null;

        const changedFields = Object.keys(req.body).filter(k =>
            ['vendorInfo', 'invoiceInfo', 'customerInfo', 'lineItems', 'totalsBlock'].includes(k)
        ).join(', ');
        appendAudit(doc, 'Data Corrected', req.user, `Fields: ${changedFields || 'correctedData'}`);

        await doc.save();
        res.status(200).json({ message: 'Changes saved successfully.', data: doc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating document' });
    }
};

// ─── POST /ocr/:id/approve ────────────────────────────────────────────────────
exports.approveDocument = async (req, res) => {
    if (!canApprove(req)) {
        return res.status(403).json({ error: 'Access denied. Manager or Admin required.' });
    }

    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        doc.approvalStatus   = 'Approved';
        doc.processingStatus = 'Approved';
        doc.approvedBy       = req.user?.id || null;
        doc.updatedBy        = req.user?.id || null;

        appendAudit(doc, 'Approved', req.user, 'Invoice approved');
        await doc.save();

        res.status(200).json({ message: 'Document approved successfully.', data: doc });
    } catch (err) {
        res.status(500).json({ error: 'Error approving document' });
    }
};

// ─── POST /ocr/:id/reject ─────────────────────────────────────────────────────
exports.rejectDocument = async (req, res) => {
    if (!canApprove(req)) {
        return res.status(403).json({ error: 'Access denied. Manager or Admin required.' });
    }

    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Rejection reason is required.' });

    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        doc.approvalStatus   = 'Rejected';
        doc.processingStatus = 'Rejected';
        doc.rejectionReason  = reason;
        doc.updatedBy        = req.user?.id || null;

        appendAudit(doc, 'Rejected', req.user, `Reason: ${reason}`);
        await doc.save();

        res.status(200).json({ message: 'Document rejected.', data: doc });
    } catch (err) {
        res.status(500).json({ error: 'Error rejecting document' });
    }
};

// ─── POST /ocr/:id/reprocess ──────────────────────────────────────────────────
exports.reprocessDocument = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Access denied. Admin required.' });
    }

    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const filePath = path.join(__dirname, '../../', doc.originalImagePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Original file not found for reprocessing.' });
        }

        doc.processingStatus = 'Processing';
        appendAudit(doc, 'Reprocess Started', req.user);
        await doc.save();

        try {
            const data = await processDocumentWithGemini(filePath);

            let processedImagePath = doc.originalImagePath;

            const fingerprint = data.fingerprint || '';
            const duplicate   = fingerprint ? await checkDuplicate(fingerprint, doc.id) : null;
            const normalized  = normalizeOCRData(data);
            const validation  = data.validation || {};
            if (duplicate) validation.duplicate_check = { found: true, ref: duplicate.id };

            let status = 'OCR_Completed';
            if (duplicate) status = 'Duplicate';
            else if (validation.issue_count > 0 || (data.confidence || 0) < 0.80) status = 'Needs_Verification';
            else status = 'Ready_For_Approval';

            const originalOcrData = { ...data };
            delete originalOcrData.processed_image_base64;

            // Do NOT overwrite originalOcrData — append to reprocessed_snapshots
            const existingSnapshots = Array.isArray(doc.originalOcrData?.reprocessed_snapshots)
                ? doc.originalOcrData.reprocessed_snapshots
                : [];
            existingSnapshots.push({ timestamp: new Date().toISOString(), data: originalOcrData });

            Object.assign(doc, {
                ...normalized,
                documentType:        data.document_type || doc.documentType,
                pageCount:           data.page_count    || 1,
                extractedData:       originalOcrData,
                correctedData:       null,
                confidenceScore:     data.confidence || 0,
                fieldConfidence:     data.field_confidence || {},
                validationResult:    validation,
                documentFingerprint: fingerprint,
                isDuplicate:         !!duplicate,
                duplicateOf:         duplicate?.id || null,
                processedImagePath,
                processingStatus:    status,
                updatedBy:           req.user?.id || null,
            });

            appendAudit(doc, 'Reprocessed', req.user,
                `Status: ${status} | Confidence: ${Math.round((data.confidence || 0) * 100)}%`);
            await doc.save();

            res.status(200).json({ message: 'Reprocessed successfully.', data: doc });

        } catch (ocrErr) {
            console.error('Reprocess OCR error:', ocrErr.message);
            doc.processingStatus = 'Failed';
            appendAudit(doc, 'Reprocess Failed', req.user, ocrErr.message);
            await doc.save();
            res.status(200).json({
                message: 'OCR service unavailable. Start the Python service and try again.',
                data: doc,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// ─── GET /ocr/:id/audit ───────────────────────────────────────────────────────
exports.getAuditLog = async (req, res) => {
    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id, {
            attributes: ['id', 'auditLog', 'originalFileName', 'createdAt'],
        });
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.status(200).json({ data: doc.auditLog || [] });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching audit log' });
    }
};

// ─── GET /ocr/:id/export/word ─────────────────────────────────────────────────
exports.exportWord = async (req, res) => {
    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const vendor   = doc.vendorInfo   || {};
        const invoice  = doc.invoiceInfo  || {};
        const customer = doc.customerInfo || {};
        const items    = doc.lineItems    || { columns: [], rows: [] };
        const totals   = doc.totalsBlock  || {};
        const colHeaders = items.columns || [];
        const rows       = items.rows    || [];

        const tableHead = colHeaders.length
            ? `<tr>${colHeaders.map(c =>
                `<th style="background:#1a73e8;color:#fff;padding:8px 12px;border:1px solid #1a73e8;font-size:11pt;">${c}</th>`
              ).join('')}</tr>`
            : '';

        const tableRows = rows.map(row =>
            `<tr>${colHeaders.map(c =>
                `<td style="border:1px solid #ccc;padding:6px 10px;font-size:10pt;">${row[c] || ''}</td>`
            ).join('')}</tr>`
        ).join('');

        const totalsRows = Object.entries(totals)
            .map(([k, v]) =>
                `<tr><td style="padding:4px 16px;font-weight:600;font-size:10pt;">${
                    k.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())
                }</td><td style="padding:4px 16px;text-align:right;font-size:10pt;">${v}</td></tr>`
            ).join('');

        const validation = doc.validationResult || {};
        const poMatch    = validation.po_match || {};
        const dupCheck   = validation.duplicate_check || {};

        const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<title>Invoice ${invoice.number || ''}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 40px; color: #1a1a1a; }
  h1   { color: #1a73e8; font-size: 20pt; margin-bottom: 4px; }
  h2   { color: #333; font-size: 13pt; border-bottom: 2px solid #1a73e8; padding-bottom: 4px; margin-top: 24px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 16px 0; }
  .label  { font-weight: 600; color: #555; font-size: 10pt; }
  table   { border-collapse: collapse; width: 100%; margin: 12px 0; }
  .badge  { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; }
  .badge-ok  { background: #dcfce7; color: #166534; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  .badge-bad { background: #fef2f2; color: #991b1b; }
  .meta { font-size: 9pt; color: #888; }
</style></head>
<body>
<h1>📄 Invoice Verification Report</h1>
<p class="meta">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp;
  Confidence: ${Math.round((doc.confidenceScore || 0) * 100)}% &nbsp;|&nbsp;
  Status: <span class="badge ${doc.processingStatus === 'Approved' ? 'badge-ok' : 'badge-warn'}">${doc.processingStatus.replace(/_/g,' ')}</span>
</p>

<h2>Vendor Information</h2>
<table><tr><td class="label">Company</td><td>${vendor.name || '-'}</td>
  <td class="label">GSTIN</td><td>${vendor.gstin || '-'}</td></tr>
<tr><td class="label">Address</td><td colspan="3">${vendor.address || '-'}</td></tr>
<tr><td class="label">Phone</td><td>${vendor.phone || '-'}</td>
  <td class="label">Email</td><td>${vendor.email || '-'}</td></tr></table>

<h2>Invoice Details</h2>
<table><tr><td class="label">Invoice No</td><td>${invoice.number || '-'}</td>
  <td class="label">Date</td><td>${invoice.date || '-'}</td></tr>
<tr><td class="label">Due Date</td><td>${invoice.due_date || '-'}</td>
  <td class="label">PO Number</td><td>${invoice.po_number || '-'}</td></tr>
<tr><td class="label">Currency</td><td>${invoice.currency || 'INR'}</td>
  <td class="label">Payment Terms</td><td>${invoice.payment_terms || '-'}</td></tr></table>

<h2>Customer / Bill To</h2>
<table><tr><td class="label">Name</td><td>${customer.name || '-'}</td>
  <td class="label">GSTIN</td><td>${customer.gstin || '-'}</td></tr>
<tr><td class="label">Billing Address</td><td colspan="3">${customer.billing_address || '-'}</td></tr></table>

<h2>Line Items</h2>
<table><thead>${tableHead || '<tr><th>No column headers detected</th></tr>'}</thead>
<tbody>${tableRows || '<tr><td colspan="10" style="padding:12px;color:#aaa;">No line items extracted</td></tr>'}</tbody></table>

<h2>Totals</h2>
<table>${totalsRows || '<tr><td>No totals extracted</td></tr>'}</table>

<h2>Validation Summary</h2>
<table>
  <tr><td class="label">Math Validation</td>
    <td><span class="badge ${validation.math_valid !== false ? 'badge-ok' : 'badge-bad'}">${validation.math_valid !== false ? 'PASSED' : 'FAILED'}</span></td>
    <td class="label">Duplicate Check</td>
    <td><span class="badge ${!dupCheck.found ? 'badge-ok' : 'badge-bad'}">${dupCheck.found ? 'DUPLICATE DETECTED' : 'No Duplicate'}</span></td></tr>
  <tr><td class="label">PO Match</td>
    <td colspan="3"><span class="badge badge-warn">${poMatch.status || 'No PO Number'}</span></td></tr>
</table>

${(validation.issues || []).length > 0 ? `
<h2>Issues Identified</h2>
<ul>${(validation.issues || []).map(i => `<li>${i.message}</li>`).join('')}</ul>` : ''}

<p class="meta" style="margin-top:40px;border-top:1px solid #eee;padding-top:16px;">
  SMTBMS Invoice OCR &amp; Verification System &nbsp;|&nbsp;
  Document: ${doc.originalFileName || 'N/A'} &nbsp;|&nbsp;
  Uploaded by: ${doc.createdBy || 'N/A'}
</p>
</body></html>`;

        const filename = `Invoice_${invoice.number || doc.id}_${Date.now()}.doc`;
        res.setHeader('Content-Type', 'application/msword');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating Word document' });
    }
};

// ─── GET /ocr/:id/export/pdf ──────────────────────────────────────────────────
exports.exportPdf = async (req, res) => {
    try {
        const doc = await OCRDocument.sequelizeModel.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const vendor   = doc.vendorInfo   || {};
        const invoice  = doc.invoiceInfo  || {};
        const customer = doc.customerInfo || {};
        const items    = doc.lineItems    || { columns: [], rows: [] };
        const totals   = doc.totalsBlock  || {};
        const colHeaders = items.columns || [];
        const rows       = items.rows    || [];
        const validation = doc.validationResult || {};
        const poMatch    = validation.po_match || {};
        const dupCheck   = validation.duplicate_check || {};

        const tableRows = rows.map(row =>
            `<tr>${colHeaders.map(c => `<td>${row[c] || ''}</td>`).join('')}</tr>`
        ).join('');

        const totalsRows = Object.entries(totals).map(([k, v]) =>
            `<tr><td>${k.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</td><td class="amount">${v}</td></tr>`
        ).join('');

        const issuesHtml = (validation.issues || []).length > 0
            ? `<div class="issues-box">
                <div class="section-title" style="color:#b91c1c;">⚠ Validation Issues</div>
                <ul>${(validation.issues || []).map(i => `<li>${i.message}</li>`).join('')}</ul>
              </div>`
            : '';

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${invoice.number || ''}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1a1a1a;padding:40px;background:#fff;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #1a73e8;}
.company-name{font-size:22px;font-weight:700;color:#1a73e8;}
.invoice-title{font-size:26px;font-weight:700;color:#1a1a1a;text-align:right;}
.invoice-number{font-size:14px;color:#666;text-align:right;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin:18px 0;}
.card{background:#f8faff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;}
.section-title{font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#6b7280;font-weight:700;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}
.field-row{display:flex;margin-bottom:5px;font-size:11px;}
.field-label{width:120px;color:#6b7280;font-size:10.5px;}
.field-value{font-size:11.5px;font-weight:500;color:#111827;}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:11px;}
thead th{background:#1a73e8;color:#fff;padding:9px 12px;text-align:left;font-weight:600;font-size:10.5px;}
tbody tr:nth-child(even){background:#f9fafb;}
tbody td{padding:7px 12px;border-bottom:1px solid #eee;font-size:11px;}
.totals-table{width:280px;margin-left:auto;border:1px solid #e5e7eb;border-radius:4px;}
.totals-table td{padding:5px 12px;font-size:11px;}
.totals-table .amount{text-align:right;font-weight:500;}
.grand-total td{font-size:13px;font-weight:700;color:#1a73e8;border-top:2px solid #1a73e8;padding-top:8px;}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #eee;font-size:10px;color:#9ca3af;text-align:center;}
.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600;}
.badge-ok{background:#dcfce7;color:#166534;}
.badge-warn{background:#fef3c7;color:#92400e;}
.badge-bad{background:#fef2f2;color:#991b1b;}
.issues-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:12px;margin:14px 0;font-size:11px;color:#991b1b;}
.issues-box ul{padding-left:18px;}
.issues-box li{margin-bottom:3px;}
.val-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:14px 0;}
.val-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center;}
.val-card .v-label{font-size:9px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;}
@media print{body{padding:20px;}}
</style></head><body>

<div class="header">
  <div>
    <div class="company-name">${vendor.name || 'Vendor'}</div>
    <div style="color:#666;margin-top:4px;font-size:11px;">${vendor.address || ''}</div>
    ${vendor.gstin ? `<div style="color:#666;font-size:11px;margin-top:2px;">GSTIN: ${vendor.gstin}</div>` : ''}
    ${vendor.phone ? `<div style="color:#666;font-size:11px;">📞 ${vendor.phone}</div>` : ''}
    ${vendor.email ? `<div style="color:#666;font-size:11px;">✉ ${vendor.email}</div>` : ''}
  </div>
  <div>
    <div class="invoice-title">${doc.documentType || 'INVOICE'}</div>
    <div class="invoice-number">#${invoice.number || '-'}</div>
    <div style="color:#666;font-size:11px;text-align:right;margin-top:4px;">Date: ${invoice.date || '-'}</div>
    ${invoice.due_date ? `<div style="color:#666;font-size:11px;text-align:right;">Due: ${invoice.due_date}</div>` : ''}
    <div style="margin-top:8px;text-align:right;">
      <span class="badge ${doc.processingStatus === 'Approved' ? 'badge-ok' : 'badge-warn'}">${doc.processingStatus.replace(/_/g,' ')}</span>
    </div>
  </div>
</div>

<div class="grid-2">
  <div class="card">
    <div class="section-title">Bill From</div>
    <div class="field-row"><span class="field-label">Company</span><span class="field-value">${vendor.name || '-'}</span></div>
    <div class="field-row"><span class="field-label">GSTIN</span><span class="field-value">${vendor.gstin || '-'}</span></div>
    <div class="field-row"><span class="field-label">Phone</span><span class="field-value">${vendor.phone || '-'}</span></div>
    <div class="field-row"><span class="field-label">Email</span><span class="field-value">${vendor.email || '-'}</span></div>
  </div>
  <div class="card">
    <div class="section-title">Bill To</div>
    <div class="field-row"><span class="field-label">Customer</span><span class="field-value">${customer.name || '-'}</span></div>
    <div class="field-row"><span class="field-label">GSTIN</span><span class="field-value">${customer.gstin || '-'}</span></div>
    <div class="field-row"><span class="field-label">Address</span><span class="field-value">${customer.billing_address || '-'}</span></div>
    ${invoice.po_number ? `<div class="field-row"><span class="field-label">PO Number</span><span class="field-value">${invoice.po_number}</span></div>` : ''}
  </div>
</div>

<div class="section-title" style="margin-top:16px;">Line Items</div>
<table>
  <thead><tr>${colHeaders.map(c => `<th>${c}</th>`).join('') || '<th>No columns detected</th>'}</tr></thead>
  <tbody>${tableRows || '<tr><td colspan="10" style="color:#aaa;text-align:center;padding:20px;">No line items extracted</td></tr>'}</tbody>
</table>

<table class="totals-table">
  <tbody>${totalsRows || ''}</tbody>
</table>

<div class="section-title" style="margin-top:20px;">Validation Summary</div>
<div class="val-grid">
  <div class="val-card">
    <div class="v-label">Math Validation</div>
    <span class="badge ${validation.math_valid !== false ? 'badge-ok' : 'badge-bad'}">${validation.math_valid !== false ? 'PASSED' : 'FAILED'}</span>
  </div>
  <div class="val-card">
    <div class="v-label">Duplicate Check</div>
    <span class="badge ${!dupCheck.found ? 'badge-ok' : 'badge-bad'}">${dupCheck.found ? 'DUPLICATE' : 'Unique'}</span>
  </div>
  <div class="val-card">
    <div class="v-label">PO Match</div>
    <span class="badge badge-warn">${poMatch.status || 'No PO'}</span>
  </div>
</div>

${issuesHtml}

<div class="footer">
  SMTBMS Invoice OCR &amp; Verification System &nbsp;·&nbsp;
  ${new Date().toLocaleString()} &nbsp;·&nbsp;
  OCR Confidence: ${Math.round((doc.confidenceScore || 0) * 100)}% &nbsp;·&nbsp;
  File: ${doc.originalFileName || 'N/A'}
</div>

<script>window.onload = function(){ window.print(); }</script>
</body></html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating PDF view' });
    }
};


// ─── AI Document Assistant Q&A ──────────────────────────────────────────────
exports.askQuestion = async (req, res) => {
    try {
        const docId = req.params.id;
        const { question } = req.body;

        if (!question || question.trim() === '') {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }


        const doc = await OCRDocument.sequelizeModel.findByPk(docId);
        
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        if (!doc.originalImagePath) {
            return res.status(400).json({ success: false, error: 'Document image not found' });
        }

        const path = require('path');
        const filePath = path.join(__dirname, '../../', doc.originalImagePath);
        const answer = await askDocumentQuestion(filePath, question, doc.originalOcrData);
        
        res.json({ success: true, answer });
    } catch (error) {
        console.error('Q&A Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
