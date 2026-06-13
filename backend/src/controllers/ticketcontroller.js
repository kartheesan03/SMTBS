const Ticket = require('../models/Ticket');
const { broadcast } = require('../services/notificationService');

// @desc    Get all support tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({})
            .populate('customer', 'name email company')
            .populate('assignedTo', 'name role')
            .sort({ createdAt: -1 });
        // Admin, HR, and Manager can see all tickets; Sales and Employee see only their assigned tickets
        if (['Admin', 'HR', 'Manager'].includes(req.user.role)) {
            return res.json(tickets);
        }
        const userIdStr = String(req.user._id);
        const filtered = tickets.filter(t => t.assignedTo && String(t.assignedTo._id) === userIdStr);
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { customer, customerModel, subject, description, priority, category, assignedTo } = req.body;
        
        if (!customer || !subject || !description) {
            return res.status(400).json({ message: 'Customer, subject, and description are required.' });
        }

        const ticketNumber = `TIC-${Math.floor(100000 + Math.random() * 900000)}`;

        const ticket = new Ticket({
            ticketNumber,
            customer,
            customerModel: customerModel || 'Customer',
            subject,
            description,
            priority: priority || 'Medium',
            category: category || 'General',
            status: 'Open',
            assignedTo: assignedTo || req.user._id
        });

        const createdTicket = await ticket.save();
        
        // Populate customer and user details for front-end response consistency
        const populatedTicket = await Ticket.findById(createdTicket._id)
            .populate('customer', 'name email company')
            .populate('assignedTo', 'name role');

        await broadcast({
            targetUserId: ticket.assignedTo,
            targetRoles: ['Manager'],
            title: `New Ticket Created: ${ticket.ticketNumber}`,
            message: `A new support ticket "${ticket.subject}" has been created and assigned.`,
            type: ticket.priority === 'High' ? 'warning' : 'info',
            category: 'system'
        });

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
                
            await broadcast({
                targetUserId: ticket.assignedTo?._id || ticket.assignedTo,
                targetRoles: ['Manager'],
                title: `Ticket Status Updated: ${ticket.ticketNumber}`,
                message: `Ticket "${ticket.subject}" status changed to ${ticket.status}.`,
                type: ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'success' : 'info',
                category: 'system'
            });

            res.json(populatedTicket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getTickets, createTicket, updateTicketStatus };
