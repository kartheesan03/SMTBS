const express = require('express');
const router = express.Router();
const { getFollowUps, createFollowUp, updateFollowUpStatus, getFollowUpById, updateFollowUp } = require('../controllers/followupcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFollowUps)
    .post(protect, createFollowUp);

router.route('/:id/status')
    .put(protect, updateFollowUpStatus);

router.route('/:id')
    .get(protect, getFollowUpById)
    .put(protect, updateFollowUp);

module.exports = router;
