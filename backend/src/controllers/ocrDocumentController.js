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
        // SECURITY: Only Admin can save/create OCR documents
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "You have view-only access to this module. Contact an admin to save documents." });
        }

        const { fileName, fileUrl, module, documentType, tables, details, rawText, confidence, status } = req.body;

        const historyEntry = {
            action: 'Created',
            userId: req.user.id,
            userName: req.user.name,
            timestamp: new Date().toISOString(),
            status: status || 'Extracted'
        };

        const newDoc = await OcrDocument.create({
            fileName,
            fileUrl,
            uploaderId: req.user.id,
            uploaderName: req.user.name,
            module,
            documentType,
            tables,
            details,
            rawText,
            confidence,
            status: status || 'Extracted',
            processingHistory: [historyEntry]
        });

        // Log audit
        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'CREATE',
            module: 'OCR',
            targetId: newDoc.id,
            description: `Saved new OCR Document: ${fileName}`,
            changes: { tables: (tables || []).length, type: documentType },
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
        // SECURITY: Only Admin can edit OCR documents
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
        doc.lastModifiedById = req.user.id;
        doc.lastModifiedByName = req.user.name;

        // Append history
        const history = Array.isArray(doc.processingHistory) ? [...doc.processingHistory] : [];
        history.push({
            action: 'Edited',
            userId: req.user.id,
            userName: req.user.name,
            timestamp: new Date().toISOString(),
            status: doc.status
        });
        doc.processingHistory = history;

        await doc.save();

        // Audit Trail for updates
        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'UPDATE',
            module: 'OCR',
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

const approveOcrDocument = async (req, res) => {
    try {
        // SECURITY: Only Admin can approve
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only Admin can approve OCR documents." });
        }

        const doc = await OcrDocument.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        doc.status = 'Approved';
        doc.approvedById = req.user.id;
        doc.approvedByName = req.user.name;
        doc.approvedAt = new Date();
        doc.rejectReason = null;

        const history = Array.isArray(doc.processingHistory) ? [...doc.processingHistory] : [];
        history.push({
            action: 'Approved',
            userId: req.user.id,
            userName: req.user.name,
            timestamp: new Date().toISOString(),
            status: 'Approved'
        });
        doc.processingHistory = history;

        await doc.save();

        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'APPROVE',
            module: 'OCR',
            targetId: doc.id,
            description: `Approved OCR Document: ${doc.fileName}`,
            ipAddress: req.ip
        });

        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('Error approving OCR document:', error);
        res.status(500).json({ message: 'Failed to approve document', error: error.message });
    }
};

const rejectOcrDocument = async (req, res) => {
    try {
        // SECURITY: Only Admin can reject
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only Admin can reject OCR documents." });
        }

        const doc = await OcrDocument.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { reason } = req.body;

        doc.status = 'Rejected';
        doc.rejectReason = reason || 'No reason provided';
        doc.lastModifiedById = req.user.id;
        doc.lastModifiedByName = req.user.name;

        const history = Array.isArray(doc.processingHistory) ? [...doc.processingHistory] : [];
        history.push({
            action: 'Rejected',
            userId: req.user.id,
            userName: req.user.name,
            timestamp: new Date().toISOString(),
            status: 'Rejected',
            note: reason
        });
        doc.processingHistory = history;

        await doc.save();

        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'REJECT',
            module: 'OCR',
            targetId: doc.id,
            description: `Rejected OCR Document: ${doc.fileName}. Reason: ${reason}`,
            ipAddress: req.ip
        });

        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('Error rejecting OCR document:', error);
        res.status(500).json({ message: 'Failed to reject document', error: error.message });
    }
};

const deleteOcrDocument = async (req, res) => {
    try {
        // SECURITY: Only Admin can delete
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only Admin can delete OCR documents." });
        }

        const doc = await OcrDocument.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const fileName = doc.fileName;
        await OcrDocument.findByIdAndDelete(doc.id);

        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'DELETE',
            module: 'OCR',
            targetId: req.params.id,
            description: `Deleted OCR Document: ${fileName}`,
            ipAddress: req.ip
        });

        res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting OCR document:', error);
        res.status(500).json({ message: 'Failed to delete document', error: error.message });
    }
};

const getOcrSummary = async (req, res) => {
    try {
        const totalProcessed = await OcrDocument.countDocuments({});
        const needsReview = await OcrDocument.countDocuments({ status: 'Needs Review' });
        const approved = await OcrDocument.countDocuments({ status: 'Approved' });
        const failed = await OcrDocument.countDocuments({ status: 'Failed' });
        const pendingApproval = await OcrDocument.countDocuments({ status: 'Pending Approval' });
        const rejected = await OcrDocument.countDocuments({ status: 'Rejected' });

        res.json({
            processed: totalProcessed,
            needsReview,
            approved,
            failed,
            pendingApproval,
            rejected
        });
    } catch (error) {
        console.error('Error fetching OCR summary:', error);
        res.status(500).json({ message: 'Failed to fetch OCR summary', error: error.message });
    }
};

module.exports = {
    getOcrDocuments,
    getOcrDocumentById,
    createOcrDocument,
    updateOcrDocument,
    approveOcrDocument,
    rejectOcrDocument,
    deleteOcrDocument,
    getOcrSummary
};
