const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const User = require('../models/User');
const { broadcast } = require('../services/notificationService');

const getTickets = async (req, res) => {
    try {
        const isAdminOrManager = ['Admin', 'Manager', 'HR'].includes(req.user.role);
        
        // If admin/manager, fetch all, otherwise fetch only those submitted by the user
        let query = {};
        if (!isAdminOrManager) {
            query.submittedById = req.user.id;
        }

        const tickets = await Ticket.find(query)
            .populate('customer', 'name email company') // Legacy fallback
            .populate('submittedBy', 'name email role picture')
            .populate('assignedTo', 'name role picture')
            .sort({ createdAt: -1 });
            
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('customer', 'name email company') // Legacy fallback
            .populate('submittedBy', 'name email role picture')
            .populate('assignedTo', 'name role picture');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify permissions
        const isAdminOrManager = ['Admin', 'Manager', 'HR'].includes(req.user.role);
        if (!isAdminOrManager && String(ticket.submittedById) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await TicketMessage.find({ ticketId: ticket._id || ticket.id })
            .populate('sender', 'name email role picture')
            .sort({ createdAt: 1 });

        res.json({ ticket, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTicket = async (req, res) => {
    try {
        const { subject, description, priority, category, attachment, customer, customerModel } = req.body;
        
        if (!subject || !description) {
            return res.status(400).json({ message: 'Subject and description are required.' });
        }

        const ticketNumber = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const ticket = new Ticket({
            ticketNumber,
            submittedById: req.user.id,
            subject,
            description,
            priority: priority || 'Medium',
            category: category || 'General Query',
            status: 'Open',
            attachment: attachment || null,
            customer: customer || null, // For legacy compatibility if provided
            customerModel: customerModel || 'Customer'
        });

        const createdTicket = await ticket.save();
        
        const populatedTicket = await Ticket.findById(createdTicket._id || createdTicket.id)
            .populate('submittedBy', 'name email role picture');

        await broadcast({
            module: 'Tickets',
            referenceId: createdTicket._id || createdTicket.id,
            targetRoles: ['Admin', 'Manager'],
            title: `New Support Ticket: ${createdTicket.ticketNumber}`,
            message: `${req.user.name} submitted a new ticket: "${createdTicket.subject}"`,
            type: createdTicket.priority === 'High' || createdTicket.priority === 'Critical' ? 'warning' : 'info'
        });

        res.status(201).json(populatedTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { status, priority, assignedToId } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedToId) ticket.assignedToId = assignedToId;

        await ticket.save();
        
        const populatedTicket = await Ticket.findById(ticket._id || ticket.id)
            .populate('submittedBy', 'name email role picture')
            .populate('assignedTo', 'name role picture');

        // Notify user if admin changed status
        if (ticket.submittedById && String(ticket.submittedById) !== String(req.user.id)) {
            await broadcast({
                module: 'Tickets',
                referenceId: ticket._id || ticket.id,
                targetUserId: ticket.submittedById,
                title: `Ticket Updated: ${ticket.ticketNumber}`,
                message: `Your ticket status was changed to ${ticket.status}.`,
                type: 'info'
            });
        }

        res.json(populatedTicket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addMessage = async (req, res) => {
    try {
        const { message, attachment, isInternal } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const ticketMessage = new TicketMessage({
            ticketId: ticket._id || ticket.id,
            senderId: req.user.id,
            message,
            attachment: attachment || null,
            isInternal: isInternal || false
        });

        await ticketMessage.save();

        const populatedMessage = await TicketMessage.findById(ticketMessage._id || ticketMessage.id)
            .populate('sender', 'name email role picture');

        // Notification logic
        const isAdmin = ['Admin', 'Manager', 'HR'].includes(req.user.role);
        
        // If an admin replies, notify the ticket submitter
        if (isAdmin && !isInternal && ticket.submittedById && String(ticket.submittedById) !== String(req.user.id)) {
            await broadcast({
                module: 'Tickets',
                referenceId: ticket._id || ticket.id,
                targetUserId: ticket.submittedById,
                title: `New Reply on Ticket ${ticket.ticketNumber}`,
                message: `Support replied: "${message.substring(0, 40)}..."`,
                type: 'info'
            });
        }
        
        // If the user replies, notify admins/assignee
        if (!isAdmin) {
            const targetRoles = ticket.assignedToId ? [] : ['Admin', 'Manager'];
            const targetUserId = ticket.assignedToId || null;
            
            await broadcast({
                module: 'Tickets',
                referenceId: ticket._id || ticket.id,
                targetUserId: targetUserId,
                targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
                title: `User Replied to ${ticket.ticketNumber}`,
                message: `${req.user.name} added a new message to their ticket.`,
                type: 'info'
            });
            
            // Auto update status to Open if it was waiting for user
            if (ticket.status === 'Waiting for User') {
                ticket.status = 'Open';
                await ticket.save();
            }
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getTickets, getTicketById, createTicket, updateTicketStatus, addMessage };
