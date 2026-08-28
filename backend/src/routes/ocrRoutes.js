const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect, authorize } = require('../middleware/authMiddleware');
const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getDashboardStats
} = require('../controllers/ocrController');

// Ensure uploads/ocr directory exists
const ocrUploadDir = path.join(__dirname, '../../uploads/ocr');
if (!fs.existsSync(ocrUploadDir)) {
    fs.mkdirSync(ocrUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ocrUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, BMP, TIFF, and PDF are allowed.'));
        }
    }
});

// All routes are protected
router.use(protect);

// Upload and process document
router.post('/upload', upload.single('document'), uploadDocument);

// Get dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Get paginated list of OCR documents
router.get('/', getDocuments);

// Get specific document by ID
router.get('/:id', getDocumentById);

// Update document (Admin only) - using authorize for 'admin' role, or we enforce via controller
router.put('/:id', authorize('Admin'), updateDocument);

// Delete document (Admin only)
router.delete('/:id', authorize('Admin'), deleteDocument);

module.exports = router;
