const express = require('express');
const router = express.Router();
const { createTask, getMyTasks, getAllTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllTasks)
    .post(protect, createTask);

router.get('/my', protect, getMyTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
