const express = require('express');
const router = express.Router();
const { getTickets, createTicket, updateTicketStatus } = require('../controllers/ticketcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTickets)
    .post(protect, createTicket);

router.route('/:id/status')
    .put(protect, updateTicketStatus);

module.exports = router;
