const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    seedNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);          // must be BEFORE /:id routes
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/seed', authorize('Admin'), seedNotifications);

module.exports = router;
