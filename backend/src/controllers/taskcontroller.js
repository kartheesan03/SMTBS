const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin/Manager)
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, isBroadcast } = req.body;

        let finalAssignedTo = assignedTo || [];

        if (isBroadcast) {
            const employees = await User.find({ role: 'Employee' }).select('_id');
            finalAssignedTo = employees.map(emp => emp._id);
        }

        const task = await Task.create({
            title,
            description,
            assignedTo: finalAssignedTo,
            assignedBy: req.user._id,
            completions: finalAssignedTo.map(userId => ({ user: userId, status: 'Pending' })),
            priority,
            dueDate,
            isBroadcast
        });

        res.status(201).json(task);
    } catch (error) {
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
            .populate('assignedTo', 'name')
            .populate('assignedBy', 'name')
            .populate('completions.user', 'name');
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

        const completionIndex = task.completions.findIndex(c => c.user.toString() === req.user._id.toString());
        
        if (completionIndex === -1 && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        if (completionIndex !== -1) {
            task.completions[completionIndex].status = status;
        }
        
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createTask, getMyTasks, getAllTasks, updateTaskStatus };
