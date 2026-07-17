const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCourses, getStats, getMyProgress,
    createCourse, updateCourse, deleteCourse,
    enrollCourse, updateProgress
} = require('../controllers/trainingController');

router.get('/courses',          protect, getCourses);
router.post('/courses',         protect, createCourse);
router.put('/courses/:id',      protect, updateCourse);
router.delete('/courses/:id',   protect, deleteCourse);
router.post('/courses/:id/enroll',   protect, enrollCourse);
router.put('/courses/:id/progress',  protect, updateProgress);
router.get('/stats',            protect, getStats);
router.get('/my-progress',      protect, getMyProgress);

module.exports = router;
