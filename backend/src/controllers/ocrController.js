const OCRDocument = require('../models/OCRDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { User } = require('../models/User');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/ocr');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/heic'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, TIFF, HEIC are allowed.'));
        }
    }
}).single('file');

const OCR_SERVICE_URL = 'http://localhost:8000/api/ocr';

exports.uploadDocument = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const originalImagePath = `/uploads/ocr/${req.file.filename}`;
        
        try {
            // 1. Save pending document
            const ocrDoc = await OCRDocument.create({
                originalImagePath,
                processingStatus: 'Processing',
                createdBy: req.user ? req.user.id : null,
                updatedBy: req.user ? req.user.id : null
            });

            // 2. Call Python FastAPI Service
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));
            
            try {
                const pythonRes = await axios.post(OCR_SERVICE_URL, formData, {
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                });

                const data = pythonRes.data;

                // 3. Save processed image if provided (as base64 or path)
                let processedImagePath = originalImagePath;
                if (data.processed_image_base64) {
                    const buffer = Buffer.from(data.processed_image_base64, 'base64');
                    const processedFilename = `processed-${req.file.filename}`;
                    const processedPath = path.join(__dirname, '../../uploads/ocr', processedFilename);
                    fs.writeFileSync(processedPath, buffer);
                    processedImagePath = `/uploads/ocr/${processedFilename}`;
                }

                // 4. Update Database
                ocrDoc.documentType = data.document_type || 'General';
                ocrDoc.extractedData = data;
                ocrDoc.confidenceScore = data.confidence || 0;
                ocrDoc.processedImagePath = processedImagePath;
                ocrDoc.processingStatus = 'Completed';
                await ocrDoc.save();

                res.status(200).json({ message: 'OCR completed successfully', data: ocrDoc });
            } catch (pythonError) {
                console.error("OCR Service Error:", pythonError.message);
                ocrDoc.processingStatus = 'Failed';
                await ocrDoc.save();
                res.status(503).json({ error: 'OCR processing service is currently unavailable. Please try again.' });
            }

        } catch (dbError) {
            console.error("DB Error:", dbError);
            res.status(500).json({ error: 'Internal server error while saving document.' });
        }
    });
};

exports.getAllDocuments = async (req, res) => {
    try {
        const docs = await OCRDocument.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({ data: docs });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const doc = await OCRDocument.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.status(200).json({ data: doc });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching document' });
    }
};

exports.updateDocument = async (req, res) => {
    // Only Admin can edit
    if (!req.user || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
    
    try {
        const doc = await OCRDocument.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        
        doc.extractedData = req.body.extractedData || doc.extractedData;
        doc.updatedBy = req.user.id;
        await doc.save();
        
        res.status(200).json({ message: 'Changes saved successfully.', data: doc });
    } catch (error) {
        res.status(500).json({ error: 'Error updating document' });
    }
};

exports.approveDocument = async (req, res) => {
    if (!req.user || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    try {
        const doc = await OCRDocument.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        
        doc.approvalStatus = 'Approved';
        doc.updatedBy = req.user.id;
        await doc.save();
        
        res.status(200).json({ message: 'Document approved successfully.', data: doc });
    } catch (error) {
        res.status(500).json({ error: 'Error approving document' });
    }
};

exports.reprocessDocument = async (req, res) => {
    if (!req.user || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    try {
        const doc = await OCRDocument.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        
        doc.processingStatus = 'Processing';
        await doc.save();

        const filePath = path.join(__dirname, '../../', doc.originalImagePath);
        if (!fs.existsSync(filePath)) {
            doc.processingStatus = 'Failed';
            await doc.save();
            return res.status(404).json({ error: 'Original image not found for reprocessing.' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        try {
            const pythonRes = await axios.post(OCR_SERVICE_URL, formData, {
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            const data = pythonRes.data;

            let processedImagePath = doc.originalImagePath;
            if (data.processed_image_base64) {
                const buffer = Buffer.from(data.processed_image_base64, 'base64');
                const processedFilename = `processed-reprocess-${Date.now()}.jpg`;
                const processedPath = path.join(__dirname, '../../uploads/ocr', processedFilename);
                fs.writeFileSync(processedPath, buffer);
                processedImagePath = `/uploads/ocr/${processedFilename}`;
            }

            doc.documentType = data.document_type || 'General';
            doc.extractedData = data;
            doc.confidenceScore = data.confidence || 0;
            doc.processedImagePath = processedImagePath;
            doc.processingStatus = 'Completed';
            doc.updatedBy = req.user.id;
            await doc.save();

            res.status(200).json({ message: 'Reprocessed successfully', data: doc });
        } catch (pythonError) {
            console.error("OCR Service Reprocess Error:", pythonError.message);
            doc.processingStatus = 'Failed';
            await doc.save();
            res.status(503).json({ error: 'OCR processing service is currently unavailable. Please try again.' });
        }

    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ error: 'Internal server error while reprocessing document.' });
    }
};

exports.rejectDocument = async (req, res) => {
    if (!req.user || req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    try {
        const doc = await OCRDocument.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        
        doc.approvalStatus = 'Rejected';
        doc.updatedBy = req.user.id;
        await doc.save();
        
        res.status(200).json({ message: 'Document rejected.', data: doc });
    } catch (error) {
        res.status(500).json({ error: 'Error rejecting document' });
    }
};
