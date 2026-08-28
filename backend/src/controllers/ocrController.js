const OCRDocument = require('../models/OCRDocument.js');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Replace with actual python microservice URL if deployed
const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/process';

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const documentUrl = `/uploads/ocr/${req.file.filename}`;
        
        // Create initial DB record
        const ocrDoc = await OCRDocument.create({
            originalFilename: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            documentUrl: documentUrl,
            uploadedBy: req.user._id,
            status: 'Processing'
        });

        res.status(202).json({
            success: true,
            message: 'Document uploaded and processing started',
            data: ocrDoc
        });

        // Async processing
        processOCR(ocrDoc._id, req.file.path).catch(console.error);

    } catch (error) {
        console.error('Error in uploadDocument:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const processOCR = async (docId, filePath) => {
    const startTime = Date.now();
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axios.post(PYTHON_OCR_URL, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60 seconds timeout for OCR
        });

        const ocrResult = response.data;
        
        const duration = Date.now() - startTime;

        await OCRDocument.findByIdAndUpdate(docId, {
            status: ocrResult.confidence < 0.7 ? 'Needs Review' : 'Completed',
            confidence: ocrResult.confidence || 0,
            fields: ocrResult.fields || {},
            items: ocrResult.items || [],
            rawText: ocrResult.rawText || '',
            pageCount: ocrResult.pageCount || 1,
            processingDurationMs: duration
        });

    } catch (error) {
        console.error(`OCR Processing failed for doc ${docId}:`, error.message);
        await OCRDocument.findByIdAndUpdate(docId, {
            status: 'Failed',
            errorMessage: error.response?.data?.detail || error.message || 'Unknown processing error',
            processingDurationMs: Date.now() - startTime
        });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await OCRDocument.countDocuments();
        
        const documents = await OCRDocument.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: documents.length,
            total,
            pagination: { page, limit },
            data: documents
        });
    } catch (error) {
        console.error('Error in getDocuments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const doc = await OCRDocument.findById(req.params.id)
            .populate('uploadedBy', 'name email')
            .populate('history.modifiedBy', 'name email');

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.error('Error in getDocumentById:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateDocument = async (req, res) => {
    try {
        // Enforce Admin role again just in case route middleware misses it
        if (req.user.role.name !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to edit OCR data' });
        }

        const doc = await OCRDocument.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const { fields, items, rawText } = req.body;
        
        const historyEntry = {
            modifiedBy: req.user._id,
            modifiedAt: new Date(),
            changes: { fields, items, rawText }
        };

        doc.fields = fields || doc.fields;
        doc.items = items || doc.items;
        if (rawText !== undefined) doc.rawText = rawText;
        doc.status = 'Verified'; // If admin edits, we assume it's reviewed and completed
        doc.history.push(historyEntry);

        await doc.save();

        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        console.error('Error in updateDocument:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        if (req.user.role.name !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete OCR data' });
        }

        const doc = await OCRDocument.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Delete file
        const filePath = path.join(__dirname, '../../', doc.documentUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await doc.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error in deleteDocument:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const total = await OCRDocument.countDocuments();
        
        // Get today's start date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processedToday = await OCRDocument.countDocuments({
            createdAt: { $gte: today }
        });

        const failed = await OCRDocument.countDocuments({ status: 'Failed' });
        const needsReview = await OCRDocument.countDocuments({ status: 'Needs Review' });

        // Calculate average confidence
        const docsWithConfidence = await OCRDocument.find({ confidence: { $gt: 0 } });
        const avgConf = docsWithConfidence.length > 0 
            ? docsWithConfidence.reduce((acc, doc) => acc + doc.confidence, 0) / docsWithConfidence.length 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalDocuments: total,
                processedToday,
                failedDocuments: failed,
                needsReview,
                averageConfidence: avgConf
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
