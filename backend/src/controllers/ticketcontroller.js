const Ticket = require('../models/Ticket');

// @desc    Get all support tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({})
            .populate('customer', 'name email company')
            .populate('assignedTo', 'name role')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { customer, subject, description, priority, assignedTo } = req.body;
        
        if (!customer || !subject || !description) {
            return res.status(400).json({ message: 'Customer, subject, and description are required.' });
        }

        const ticketNumber = `TIC-${Math.floor(100000 + Math.random() * 900000)}`;

        const ticket = new Ticket({
            ticketNumber,
            customer,
            subject,
            description,
            priority: priority || 'Medium',
            status: 'Open',
            assignedTo: assignedTo || req.user._id
        });

        const createdTicket = await ticket.save();
        
        // Populate customer and user details for front-end response consistency
        const populatedTicket = await Ticket.findById(createdTicket._id)
            .populate('customer', 'name email company')
            .populate('assignedTo', 'name role');

        res.status(201).json(populatedTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update support ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (ticket) {
            ticket.status = status || ticket.status;
            await ticket.save();
            
            const populatedTicket = await Ticket.findById(ticket._id)
                .populate('customer', 'name email company')
                .populate('assignedTo', 'name role');
                
            res.json(populatedTicket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getTickets, createTicket, updateTicketStatus };
