const SalesGoal = require('../models/SalesGoal');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all sales goals
// @route   GET /api/sales-goals
// @access  Private
const getSalesGoals = async (req, res) => {
    try {
        let query = {};
        
        // If not admin/manager, only see assigned goals
        if (!req.user.permissions.includes('all') && !req.user.permissions.includes('manage_crm')) {
            query.assignedTo = req.user._id;
        }

        const goals = await SalesGoal.find(query)
            .populate('assignedTo', 'firstName lastName email')
            .sort({ startDate: -1 });

        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new sales goal
// @route   POST /api/sales-goals
// @access  Private
const createSalesGoal = async (req, res) => {
    try {
        const { assignedTo, period, startDate, endDate, targetAmount, targetOrders } = req.body;

        const goal = await SalesGoal.create({
            assignedTo,
            period,
            startDate,
            endDate,
            targetAmount: Number(targetAmount) || 0,
            targetOrders: Number(targetOrders) || 0,
            createdBy: req.user._id
        });

        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a sales goal
// @route   PUT /api/sales-goals/:id
// @access  Private
const updateSalesGoal = async (req, res) => {
    try {
        const goal = await SalesGoal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.status(200).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get goal progress (combines goals with actual orders)
// @route   GET /api/sales-goals/progress
// @access  Private
const getGoalProgress = async (req, res) => {
    try {
        let query = {};
        if (!req.user.permissions.includes('all') && !req.user.permissions.includes('manage_crm')) {
            query.assignedTo = req.user._id;
        }

        const goals = await SalesGoal.find(query).populate('assignedTo', 'firstName lastName');
        
        const progressData = await Promise.all(goals.map(async (goal) => {
            // Find all completed/delivered orders for this user in the date range
            const orders = await Order.find({
                'createdBy': goal.assignedTo._id,
                'status': 'Delivered', // count as closed-won
                'createdAt': { $gte: goal.startDate, $lte: goal.endDate }
            });

            const currentAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const currentOrders = orders.length;

            // Determine status
            const progressPct = goal.targetAmount > 0 
                ? (currentAmount / goal.targetAmount) * 100 
                : (goal.targetOrders > 0 ? (currentOrders / goal.targetOrders) * 100 : 0);
            
            const timeElapsed = (new Date() - new Date(goal.startDate)) / (new Date(goal.endDate) - new Date(goal.startDate)) * 100;
            
            let status = 'On Track';
            if (progressPct >= 100) status = 'Achieved';
            else if (timeElapsed > progressPct + 15 && timeElapsed < 100) status = 'At Risk';
            else if (timeElapsed > 100 && progressPct < 100) status = 'Failed';

            return {
                ...goal.toObject(),
                currentAmount,
                currentOrders,
                progressPct: Math.min(100, Math.round(progressPct)),
                status
            };
        }));

        res.status(200).json(progressData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSalesGoals,
    createSalesGoal,
    updateSalesGoal,
    getGoalProgress
};
