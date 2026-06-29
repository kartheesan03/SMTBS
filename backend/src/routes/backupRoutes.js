const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const backupController = require('../controllers/backupController');

// All backup routes require authentication
router.use(protect);

router.post('/create', backupController.createBackup);
router.get('/list', backupController.listBackups);
router.get('/download/:id', backupController.downloadBackup);
router.post('/restore/:id', backupController.restoreBackup);
router.delete('/delete/:id', backupController.deleteBackup);
router.get('/statistics', backupController.getStatistics);
router.post('/schedule', backupController.scheduleBackup);
router.get('/schedule', backupController.getSchedule);

module.exports = router;
