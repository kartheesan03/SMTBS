const express = require('express');
const router = express.Router();
const { getTickets, createTicket, getTicketById, updateTicketStatus, addMessage } = require('../controllers/ticketcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTickets)
    .post(protect, createTicket);

router.route('/:id')
    .get(protect, getTicketById)
    .put(protect, updateTicketStatus);

router.route('/:id/status')
    .put(protect, updateTicketStatus); // Keeping for legacy

router.route('/:id/messages')
    .post(protect, addMessage);

module.exports = router;
