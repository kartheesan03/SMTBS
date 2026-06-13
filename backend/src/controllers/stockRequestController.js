const StockRequest = require('../models/StockRequest');
const Material = require('../models/Material');
const User = require('../models/User');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Helper to create notifications
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            isRead: false
        });
    } catch (err) {
        console.error('Failed to create notification', err);
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { materialId, requiredQuantity, reason } = req.body;
        const employeeId = req.user.id || req.user._id;

        const material = await Material.sequelizeModel.findByPk(materialId);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        const request = await StockRequest.sequelizeModel.create({
            materialId,
            employeeId,
            currentStock: material.quantity,
            requiredQuantity,
            reason,
            status: 'Pending'
        });

        // Notify Managers and Admins
        const managers = await User.sequelizeModel.findAll({ where: { role: ['Manager', 'Admin'] } });
        for (const manager of managers) {
            await createNotification(
                manager.id, 
                'New Stock Request', 
                `Employee ${req.user.name} requested ${requiredQuantity} ${material.unit} of ${material.name}.`,
                'warning'
            );
        }

        res.status(201).json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create stock request', error: err.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id || req.user._id;

        let whereClause = {};

        if (userRole === 'Employee') {
            whereClause.employeeId = userId;
        } else if (userRole === 'Sales') {
            whereClause.status = ['Employee Approved', 'Processing', 'Dispatched', 'Delivered'];
        }

        const requests = await StockRequest.sequelizeModel.findAll({
            where: whereClause,
            include: [
                { model: Material.sequelizeModel, as: 'material' },
                { model: User.sequelizeModel, as: 'employee', attributes: ['id', 'name', 'email'] },
                { model: User.sequelizeModel, as: 'manager', attributes: ['id', 'name', 'email'] },
                { model: Order.sequelizeModel, as: 'order' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch stock requests' });
    }
};

exports.managerAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerMessage, orderId } = req.body;
        const managerId = req.user.id || req.user._id;

        const request = await StockRequest.sequelizeModel.findByPk(id, {
            include: [
                { model: Material.sequelizeModel, as: 'material' },
                { model: User.sequelizeModel, as: 'employee' }
            ]
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.managerId = managerId;
        request.managerMessage = managerMessage;
        if (orderId) request.orderId = orderId;
        request.status = 'Manager Action Taken';
        
        await request.save();

        // Notify Employee
        await createNotification(
            request.employeeId,
            'Manager Responded to Stock Request',
            `Manager ${req.user.name} responded to your request for ${request.material.name}. Action required.`,
            'info'
        );

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process manager action' });
    }
};

exports.employeeApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;

        const request = await StockRequest.sequelizeModel.findByPk(id, {
            include: [{ model: Material.sequelizeModel, as: 'material' }]
        });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Ensure only the employee who created it can approve it
        const userId = req.user.id || req.user._id;
        if (request.employeeId !== userId && !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized to approve this request' });
        }

        request.status = approved ? 'Employee Approved' : 'Employee Rejected';
        await request.save();

        // Notify Manager
        if (request.managerId) {
            await createNotification(
                request.managerId,
                `Stock Request ${approved ? 'Approved' : 'Rejected'}`,
                `Employee ${req.user.name} ${approved ? 'approved' : 'rejected'} your action for ${request.material.name}.`,
                approved ? 'success' : 'error'
            );
        }

        // Notify Sales if approved
        if (approved) {
            const salesTeam = await User.sequelizeModel.findAll({ where: { role: 'Sales' } });
            for (const sales of salesTeam) {
                await createNotification(
                    sales.id,
                    'New Stock Delivery Required',
                    `A stock request for ${request.material.name} has been approved and requires delivery processing.`,
                    'warning'
                );
            }
        }

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process employee approval' });
    }
};

exports.salesUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Processing, Dispatched, Delivered, Cancelled

        const validStatuses = ['Processing', 'Dispatched', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await StockRequest.sequelizeModel.findByPk(id, {
            include: [
                { model: Material.sequelizeModel, as: 'material' },
                { model: User.sequelizeModel, as: 'employee' },
                { model: User.sequelizeModel, as: 'manager' }
            ]
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await request.save();

        // Automatically update material quantity if delivered (simplified for this workflow, can be extended)
        if (status === 'Delivered') {
            const material = await Material.sequelizeModel.findByPk(request.materialId);
            if (material) {
                material.quantity += request.requiredQuantity;
                await material.save();
            }
        }

        // Notify Employee and Manager
        const notificationMsg = `Sales updated delivery status of ${request.material.name} to ${status}.`;
        await createNotification(request.employeeId, 'Delivery Update', notificationMsg, 'info');
        if (request.managerId) {
            await createNotification(request.managerId, 'Delivery Update', notificationMsg, 'info');
        }

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update delivery status' });
    }
};
