const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    seedNotifications
} = require('../controllers/notificationcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-all-read', markAllAsRead);          // must be BEFORE /:id routes
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/seed', authorize('manage_settings'), seedNotifications);

module.exports = router;
