const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getJobs, createJob, updateJob, deleteJob,
    getCandidates, addCandidate, updateCandidate, deleteCandidate,
    getStats
} = require('../controllers/recruitmentController');

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
