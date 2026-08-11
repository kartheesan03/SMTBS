const OcrDocument = require('../models/OcrDocument');
const AuditLog = require('../models/AuditLog');

const getOcrDocuments = async (req, res) => {
    try {
        const documents = await OcrDocument.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching OCR documents:', error);
        res.status(500).json({ message: 'Failed to fetch OCR documents', error: error.message });
    }
};

const getOcrDocumentById = async (req, res) => {
    try {
        const doc = await OcrDocument.findByPk(req.params.id);
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
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: "You have view-only access to this module. Contact an admin or manager to save documents." });
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
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: "You have view-only access. Contact an admin or manager to edit documents." });
        }
        
        const docId = req.params.id;
        const doc = await OcrDocument.findByPk(docId);
        
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        const { tables, details, status } = req.body;
        
        const oldTables = doc.tables;
        
        doc.tables = tables !== undefined ? tables : doc.tables;
        doc.details = details !== undefined ? details : doc.details;
        doc.status = status !== undefined ? status : doc.status;
        
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

module.exports = {
    getOcrDocuments,
    getOcrDocumentById,
    createOcrDocument,
    updateOcrDocument
};
