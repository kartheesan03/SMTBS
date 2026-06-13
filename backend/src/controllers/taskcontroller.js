const Task = require('../models/Task');
const User = require('../models/User');
const { broadcast } = require('../services/notificationService');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin/Manager/HR)
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, isBroadcast, broadcastRoles } = req.body;

        let finalAssignedTo = assignedTo || [];

        if (isBroadcast) {
            // Support broadcasting to specific roles or default to Employee + Sales
            const targetRoles = broadcastRoles && broadcastRoles.length > 0 
                ? broadcastRoles 
                : ['Employee', 'Sales'];
            const users = await User.find({ role: { $in: targetRoles } }).select('_id');
            finalAssignedTo = users.map(u => u._id);
        }

        if (finalAssignedTo.length === 0) {
            return res.status(400).json({ message: 'Please select at least one assignee or broadcast target' });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo: JSON.stringify(finalAssignedTo),
            assignedBy: req.user._id,
            completions: JSON.stringify(finalAssignedTo.map(userId => ({ user: userId, status: 'Pending' }))),
            priority,
            dueDate,
            isBroadcast: !!isBroadcast
        });

        // Send notifications to all assigned users
        if (finalAssignedTo.length > 0) {
            try {
                for (const uid of finalAssignedTo) {
                    await broadcast({
                        targetUserId: uid,
                        targetRoles: [],
                        title: `📋 New Task Assigned: ${title}`,
                        message: `${req.user.role} ${req.user.name} has assigned you a new task: "${title}". Priority: ${priority || 'Medium'}. ${dueDate ? 'Due: ' + new Date(dueDate).toLocaleDateString() : ''}`,
                        type: priority === 'High' ? 'warning' : 'info',
                        category: req.user.role === 'HR' ? 'hr' : 'general',
                        link: '/my-tasks'
                    });
                }
            } catch (err) {
                console.error('Error generating task notifications:', err.message);
            }
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('createTask error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Parse completions from JSON string if needed
        let completions = task.completions;
        if (typeof completions === 'string') {
            try { completions = JSON.parse(completions); } catch (e) { completions = []; }
        }
        if (!Array.isArray(completions)) completions = [];

        const completionIndex = completions.findIndex(c => {
            const userId = c.user?._id || c.user;
            return String(userId) === String(req.user._id);
        });
        
        if (completionIndex === -1 && !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        if (completionIndex !== -1) {
            completions[completionIndex].status = status;
            completions[completionIndex].updatedAt = new Date().toISOString();
        }

        task.completions = JSON.stringify(completions);
        await task.save();

        // Notify the assigner when task is completed
        if (status === 'Completed' && task.assignedBy) {
            try {
                await broadcast({
                    targetUserId: task.assignedBy,
                    targetRoles: [],
                    title: `✅ Task Completed: ${task.title}`,
                    message: `${req.user.name} has completed the task "${task.title}".`,
                    type: 'success',
                    category: 'general',
                    link: '/my-tasks'
                });
            } catch (err) {
                console.error('Error creating task completion notification:', err.message);
            }
        }

        res.json(task);
    } catch (error) {
        console.error('updateTaskStatus error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin/Manager/HR)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await task.destroy();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask };