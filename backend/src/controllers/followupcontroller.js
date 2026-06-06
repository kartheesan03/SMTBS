const FollowUp = require('../models/FollowUp');

// @desc    Get all follow-ups
// @route   GET /api/follow-ups
// @access  Private
const getFollowUps = async (req, res) => {
    try {
        const followups = await FollowUp.find({}).sort({ createdAt: -1 });
        res.json(followups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a follow-up
// @route   POST /api/follow-ups
// @access  Private
const createFollowUp = async (req, res) => {
    try {
        const { name, type, time, phone, email, notes, status } = req.body;
        const followup = new FollowUp({
            name,
            type,
            time,
            phone,
            email,
            notes,
            status: status || 'Pending',
            createdBy: req.user._id
        });
        const createdFollowUp = await followup.save();
        res.status(201).json(createdFollowUp);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update follow-up status (e.g. Mark Done)
// @route   PUT /api/follow-ups/:id/status
// @access  Private
const updateFollowUpStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const followup = await FollowUp.findById(req.params.id);
        
        if (followup) {
            followup.status = status || followup.status;
            const updatedFollowUp = await followup.save();
            res.json(updatedFollowUp);
        } else {
            res.status(404).json({ message: 'Follow-up not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get follow-up by ID
// @route   GET /api/follow-ups/:id
// @access  Private
const getFollowUpById = async (req, res) => {
    try {
        const followup = await FollowUp.findById(req.params.id);
        if (followup) {
            res.json(followup);
        } else {
            res.status(404).json({ message: 'Follow-up not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a follow-up
// @route   PUT /api/follow-ups/:id
// @access  Private
const updateFollowUp = async (req, res) => {
    try {
        const { name, type, time, phone, email, notes, status } = req.body;
        const followup = await FollowUp.findById(req.params.id);
        
        if (followup) {
            followup.name = name || followup.name;
            followup.type = type || followup.type;
            followup.time = time || followup.time;
            followup.phone = phone !== undefined ? phone : followup.phone;
            followup.email = email !== undefined ? email : followup.email;
            followup.notes = notes !== undefined ? notes : followup.notes;
            followup.status = status || followup.status;

            const updatedFollowUp = await followup.save();
            res.json(updatedFollowUp);
        } else {
            res.status(404).json({ message: 'Follow-up not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getFollowUps, createFollowUp, updateFollowUpStatus, getFollowUpById, updateFollowUp };
