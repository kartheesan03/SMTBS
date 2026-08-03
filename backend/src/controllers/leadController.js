const Lead = require('../models/Lead');
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({});
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createLead = async (req, res) => {
    try {
        const lead = await Lead.create(req.body);
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
