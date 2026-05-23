const Lead = require('../models/Lead');
const Vendor = require('../models/Vendor');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private/Sales/Admin
const createLead = async (req, res) => {
    try {
        const leadData = { ...req.body, status: 'Awaiting Review' };
        const lead = new Lead(leadData);
        const createdLead = await lead.save();
        res.status(201).json(createdLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Convert lead to vendor (Admin Review)
// @route   PUT /api/leads/:id/convert
// @access  Private/Admin
const convertToVendor = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (lead.status === 'Converted to Vendor') {
            return res.status(400).json({ message: 'Lead already converted' });
        }

        // Create Vendor
        const vendor = await Vendor.create({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            contactPerson: lead.name,
            category: 'From Lead'
        });

        // Update Lead
        lead.status = 'Converted to Vendor';
        await lead.save();

        res.json({ message: 'Lead successfully converted to Vendor', vendor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private/Sales/Admin
const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            lead.name = req.body.name || lead.name;
            lead.email = req.body.email || lead.email;
            lead.phone = req.body.phone || lead.phone;
            lead.status = req.body.status || lead.status;
            lead.notes = req.body.notes || lead.notes;
            lead.estimatedValue = req.body.estimatedValue !== undefined ? req.body.estimatedValue : lead.estimatedValue;

            const updatedLead = await lead.save();
            res.json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getLeads, createLead, updateLead, convertToVendor };
