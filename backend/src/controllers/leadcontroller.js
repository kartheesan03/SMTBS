const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { notifySales } = require('../services/notificationService');

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
        const { _id } = req.user;
        const leadData = { ...req.body, status: req.body.status || 'Initial Contact' };
        leadData.assignedTo = _id;
        const lead = new Lead(leadData);
        const createdLead = await lead.save();

        await notifySales({
            title: 'New Lead Created',
            message: `${leadData.name} has been added as a lead.`,
            type: 'info',
            category: 'general'
        });

        res.status(201).json(createdLead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Convert lead to customer (Admin Review)
// @route   PUT /api/leads/:id/convert
// @access  Private/Admin
const convertToCustomer = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        if (lead.status === 'Converted to Customer') {
            return res.status(400).json({ message: 'Lead already converted' });
        }

        // Create Customer
        const customer = await Customer.create({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.name,
            status: 'Active'
        });

        // Update Lead
        lead.status = 'Converted to Customer';
        await lead.save();

        await notifySales({
            title: 'Lead Converted to Customer',
            message: `${lead.name} has been successfully converted to a customer!`,
            type: 'success',
            category: 'general'
        });

        res.json({ message: 'Lead successfully converted to Customer', customer });
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
            const oldStatus = lead.status;
            lead.name = req.body.name || lead.name;
            lead.email = req.body.email || lead.email;
            lead.phone = req.body.phone || lead.phone;
            lead.status = req.body.status || lead.status;
            lead.notes = req.body.notes || lead.notes;
            lead.estimatedValue = req.body.estimatedValue !== undefined ? req.body.estimatedValue : lead.estimatedValue;

            // Auto-convert to customer if status becomes 'Won'
            if (lead.status === 'Won' && oldStatus !== 'Won') {
                const existingCustomer = await Customer.findOne({ email: lead.email });
                if (!existingCustomer && lead.email) {
                    await Customer.create({
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        company: lead.name,
                        status: 'Active'
                    });
                }
            }

            const updatedLead = await lead.save();

            if (updatedLead.status !== oldStatus) {
                await notifySales({
                    title: 'Lead Status Updated',
                    message: `${updatedLead.name} status changed to ${updatedLead.status}.`,
                    type: updatedLead.status === 'Won' ? 'success' : 'info',
                    category: 'general'
                });
            }

            res.json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get CRM Statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res) => {
    try {
        const leads = await Lead.find({}).sort({ createdAt: -1 });

        const activeStatuses = ['Initial Contact', 'Qualified Lead', 'Proposal Sent', 'Negotiation', 'Closing Deal'];
        const wonStatuses = ['Won', 'Converted To Customer'];
        
        let openDealsCount = 0;
        let wonDealsCount = 0;
        let pipelineValue = 0;
        let stagnantLeadsCount = 0;
        
        const pipelineCounts = {
            'Initial Contact': 0,
            'Qualified Lead': 0,
            'Proposal Sent': 0,
            'Negotiation': 0,
            'Closing Deal': 0,
            'Won': 0
        };
        
        const pipelineValueByStage = {
            'Initial Contact': 0,
            'Qualified Lead': 0,
            'Proposal Sent': 0,
            'Negotiation': 0,
            'Closing Deal': 0,
            'Won': 0
        };

        let totalDaysToClose = 0;
        let convertedCount = 0;

        const now = Date.now();

        leads.forEach(l => {
            const val = l.estimatedValue || 0;
            const status = l.status;

            if (activeStatuses.includes(status)) {
                openDealsCount++;
                pipelineValue += val;
                
                pipelineCounts[status] = (pipelineCounts[status] || 0) + 1;
                pipelineValueByStage[status] = (pipelineValueByStage[status] || 0) + val;

                const diff = now - new Date(l.updatedAt).getTime();
                if (diff > (7 * 24 * 60 * 60 * 1000)) {
                    stagnantLeadsCount++;
                }
            } else if (wonStatuses.includes(status)) {
                wonDealsCount++;
                
                // Keep 'Won' count for funnel chart (combining both won statuses)
                pipelineCounts['Won'] = (pipelineCounts['Won'] || 0) + 1;
                pipelineValueByStage['Won'] = (pipelineValueByStage['Won'] || 0) + val;

                const diff = new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime();
                totalDaysToClose += (diff / (1000 * 60 * 60 * 24));
                convertedCount++;
            }
        });

        const avgVelocity = convertedCount > 0 ? Math.round(totalDaysToClose / convertedCount) : 14;

        // Recent activities based on the latest updated leads
        const recentLeads = [...leads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);
        
        const formatTimeAgo = (date) => {
            const diffMin = Math.round((now - new Date(date).getTime()) / 60000);
            if (diffMin < 60) return `${diffMin} mins ago`;
            const diffHours = Math.round(diffMin / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;
            return `${Math.round(diffHours / 24)} days ago`;
        };

        const recentActivities = recentLeads.map(l => {
            let type = 'web';
            if (['Won', 'Converted To Customer'].includes(l.status)) type = 'won';
            else if (['Proposal Sent', 'Negotiation'].includes(l.status)) type = 'prop';
            else if (l.status === 'Closing Deal') type = 'meet';

            let desc = `Lead created: ${l.name}`;
            if (l.status === 'Won') desc = `Deal won with ${l.name}`;
            else if (l.status === 'Proposal Sent') desc = `Proposal sent to ${l.name}`;
            else if (l.status === 'Negotiation') desc = `Negotiating with ${l.name}`;
            else if (l.status !== 'Initial Contact') desc = `Status updated to ${l.status} for ${l.name}`;

            return {
                desc,
                time: formatTimeAgo(l.updatedAt),
                type
            };
        });

        res.json({
            openDeals: openDealsCount,
            wonDeals: wonDealsCount,
            totalActivePipelineLeads: openDealsCount + wonDealsCount,
            pipelineValue,
            pipelineCounts,
            pipelineValueByStage,
            avgVelocity,
            stagnantLeads: stagnantLeadsCount,
            recentActivities
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeads, createLead, updateLead, convertToCustomer, getLeadStats };
