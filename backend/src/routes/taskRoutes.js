const express = require('express');
const router = express.Router();
const { createTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask } = require('../controllers/taskcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllTasks)
    .post(protect, createTask);

router.get('/my', protect, getMyTasks);
router.put('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;
