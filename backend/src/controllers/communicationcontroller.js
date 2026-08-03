const CommunicationLog = require('../models/CommunicationLog');
const { logAudit } = require('../services/auditService');
const getCustomerCommunications = async (req, res) => {
    try {
        const communications = await CommunicationLog.find({ customerId: req.params.customerId })
            .populate('createdBy', 'name role')
            .sort({ contactDate: -1 });
        res.json(communications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createCommunication = async (req, res) => {
    try {
        const { customerId, type, subject, notes, contactDate } = req.body;
        if (!customerId || !type || !subject) {
            return res.status(400).json({ message: 'Customer, type, and subject are required.' });
        }
        const communication = await CommunicationLog.create({
            customerId,
            type,
            subject,
            notes: notes || '',
            contactDate: contactDate || new Date(),
            createdById: req.user._id
        });
        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Customer',
            targetId: customerId,
            description: `Communication log added: ${type} — ${subject}`,
            ipAddress: req.ip
        });
        res.status(201).json(communication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateCommunication = async (req, res) => {
    try {
        const comm = await CommunicationLog.findById(req.params.id);
        if (!comm) {
            return res.status(404).json({ message: 'Communication log not found' });
        }
        const { type, subject, notes, contactDate } = req.body;
        if (type) comm.type = type;
        if (subject) comm.subject = subject;
        if (notes !== undefined) comm.notes = notes;
        if (contactDate) comm.contactDate = contactDate;
        const updated = await comm.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteCommunication = async (req, res) => {
    try {
        const comm = await CommunicationLog.findById(req.params.id);
        if (!comm) {
            return res.status(404).json({ message: 'Communication log not found' });
        }
        await comm.deleteOne();
        res.json({ message: 'Communication log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getCustomerCommunications, createCommunication, updateCommunication, deleteCommunication };
