const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/authMiddleware');
const {
    getJobs, createJob, updateJob, deleteJob,
    getCandidates, addCandidate, updateCandidate, deleteCandidate,
    getStats, getPublicJob, applyForJob
} = require('../controllers/recruitmentController');

// Multer Config for Resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/resumes');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

// Public Routes
router.get('/public/jobs/:slug', getPublicJob);
router.post('/public/jobs/:slug/apply', upload.single('resume'), applyForJob);

// Protected Routes
router.get('/stats',              protect, getStats);
router.get('/jobs',               protect, getJobs);
router.post('/jobs',              protect, createJob);
router.put('/jobs/:id',           protect, updateJob);
router.delete('/jobs/:id',        protect, deleteJob);
router.get('/candidates',         protect, getCandidates);
router.post('/candidates',        protect, addCandidate);
router.put('/candidates/:id',     protect, updateCandidate);
router.delete('/candidates/:id',  protect, deleteCandidate);
module.exports = router;
