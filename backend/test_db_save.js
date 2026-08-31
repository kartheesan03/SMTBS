const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const OCRDocument = require('./src/models/OCRDocument');
const { processDocumentWithGemini } = require('./src/services/geminiOcrService');
const fs = require('fs');

async function normalizeOCRData(data) {
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

async function run() {
    await connectDB();
    
    // create pending doc
    const ocrDoc = await OCRDocument.create({
        originalFileName: 'test.jpeg',
        fileSize: 1000,
        mimeType: 'image/jpeg',
        originalImagePath: '/uploads/ocr/document-1788010534668-891395976.jpeg',
        processingStatus: 'Processing'
    });

    try {
        const data = {
            success: true,
            structured_doc: {
                vendor: { name: 'Test Vendor', address: 'Test Address' },
                invoice: { number: 'INV-001', date: '2023-10-27', po_number: 'PO-123' },
                totals: { grand_total: '100.00' }
            },
            vendor: { name: 'Test Vendor', address: 'Test Address' },
            invoice: { number: 'INV-001', date: '2023-10-27', po_number: 'PO-123' },
            totals: { grand_total: '100.00' },
            fingerprint: 'TEST_FINGERPRINT'
        };
        const processedImagePath = ocrDoc.originalImagePath;

        const fingerprint = data.fingerprint || '';
        const duplicate = null; 
        
        const normalized = await normalizeOCRData(data);
        const poNumber = normalized.invoiceInfo?.po_number || '';
        const PurchaseRequest = require('./src/models/PurchaseRequest');
        let poMatch = null;
        if (poNumber) {
            const po = await PurchaseRequest.findOne({ where: { purchaseRequestId: poNumber } });
            if (po) poMatch = { found: true };
        }
        
        const validation = data.validation || {};
        validation.duplicate_check = { found: false };

        const status = 'Ready_For_Approval';
        const originalOcrData = { ...data };

        ocrDoc.set({
            originalOcrData:     originalOcrData,
            originalImagePath:   ocrDoc.originalImagePath,
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
            correctedData:       null, 

            confidenceScore:     data.confidence || 0,
            fieldConfidence:     data.field_confidence || {},
            validationResult:    validation,
            documentFingerprint: fingerprint,
            isDuplicate:         false,
            duplicateOf:         null,
            processingStatus:    status,
        });

        ['vendorInfo', 'invoiceInfo', 'customerInfo', 'lineItems', 'totalsBlock', 'rawFields', 'fieldConfidence', 'validationResult'].forEach(f => ocrDoc.changed(f, true));
        
        appendAudit(ocrDoc, 'OCR Completed', null,
                `Status: ${status} | Confidence: ${Math.round((data.confidence || 0) * 100)}% | Issues: ${validation.issue_count || 0} | Pages: ${data.page_count || 1}`);

        await ocrDoc.save();
        console.log("SAVE SUCCESS!");

    } catch (dbErr) {
        console.error("DB Error:", dbErr);
    }
}
run();
