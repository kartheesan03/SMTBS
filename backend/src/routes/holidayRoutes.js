const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getHolidays, createHoliday, updateHoliday, deleteHoliday } = require('../controllers/holidayController');

router.get('/',        protect, getHolidays);
router.post('/',       protect, createHoliday);
router.put('/:id',     protect, updateHoliday);
router.delete('/:id',  protect, deleteHoliday);

module.exports = router;
