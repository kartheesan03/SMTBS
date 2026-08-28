const OcrDocument = require('../models/OcrDocument');
const AuditLog = require('../models/AuditLog');

const getOcrDocuments = async (req, res) => {
    try {
        const documents = await OcrDocument.find({}).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching OCR documents:', error);
        res.status(500).json({ message: 'Failed to fetch OCR documents', error: error.message });
    }
};

const getOcrDocumentById = async (req, res) => {
    try {
        const doc = await OcrDocument.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(doc);
    } catch (error) {
        console.error('Error fetching OCR document:', error);
        res.status(500).json({ message: 'Failed to fetch OCR document', error: error.message });
    }
};

const createOcrDocument = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "You have view-only access to this module. Contact an admin to save documents." });
        }
        
        const { fileName, module, documentType, tables, details, rawText, confidence, status } = req.body;
        
        const newDoc = await OcrDocument.create({
            fileName,
            uploaderId: req.user.id,
            module,
            documentType,
            tables,
            details,
            rawText,
            confidence,
            status: status || 'Extracted'
        });

        // Log audit
        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'CREATE',
            module: 'System', // Generic module for OCR Docs
            targetId: newDoc.id,
            description: `Saved new OCR Document: ${fileName}`,
            changes: { tables: tables.length, type: documentType },
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, document: newDoc });
    } catch (error) {
        console.error('Error saving OCR document:', error);
        res.status(500).json({ message: 'Failed to save document', error: error.message });
    }
};

const updateOcrDocument = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "You have view-only access. Contact an admin to edit documents." });
        }
        
        const docId = req.params.id;
        const doc = await OcrDocument.findById(docId);
        
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        const { tables, details, status, rejectReason } = req.body;
        
        const oldTables = doc.tables;
        
        doc.tables = tables !== undefined ? tables : doc.tables;
        doc.details = details !== undefined ? details : doc.details;
        doc.status = status !== undefined ? status : doc.status;
        doc.rejectReason = rejectReason !== undefined ? rejectReason : doc.rejectReason;
        
        await doc.save();

        // Audit Trail for updates
        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'UPDATE',
            module: 'System',
            targetId: doc.id,
            description: `Updated OCR Document: ${doc.fileName}`,
            changes: {
                old: { tables: oldTables },
                new: { tables: doc.tables }
            },
            ipAddress: req.ip
        });

        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('Error updating OCR document:', error);
        res.status(500).json({ message: 'Failed to update document', error: error.message });
    }
};

const getOcrSummary = async (req, res) => {
    try {
        const totalProcessed = await OcrDocument.countDocuments({});
        const needsReview = await OcrDocument.countDocuments({ status: 'Needs Review' });
        const approved = await OcrDocument.countDocuments({ status: 'Approved' });
        const failed = await OcrDocument.countDocuments({ status: 'Failed' });
        const pendingApproval = await OcrDocument.countDocuments({ status: 'Pending Approval' });

        res.json({
            processed: totalProcessed,
            needsReview,
            approved,
            failed,
            pendingApproval
        });
    } catch (error) {
        console.error('Error fetching OCR summary:', error);
        res.status(500).json({ message: 'Failed to fetch OCR summary', error: error.message });
    }
};

const deleteOcrDocument = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "You have view-only access. Contact an admin to delete documents." });
        }
        
        const docId = req.params.id;
        const doc = await OcrDocument.findById(docId);
        
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        await OcrDocument.findByIdAndDelete(docId);

        // Audit Trail for delete
        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'DELETE',
            module: 'System',
            targetId: doc.id,
            description: `Deleted OCR Document: ${doc.fileName}`,
            ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting OCR document:', error);
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
    }
};

module.exports = {
    getOcrDocuments,
    getOcrDocumentById,
    createOcrDocument,
    updateOcrDocument,
    getOcrSummary,
    deleteOcrDocument
};
