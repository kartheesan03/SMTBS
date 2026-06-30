const StockRequest = require('../models/StockRequest');
const Material = require('../models/Material');
const User = require('../models/User');
const Order = require('../models/Order');
const { broadcast } = require('../services/notificationService');

// Helper to create notifications
const createNotification = async (userId, title, message, type = 'info', referenceId) => {
    try {
        await broadcast({
            module: 'Stock Requests',
            referenceId: String(referenceId),
            targetUserId: userId,
            targetRoles: [],
            title,
            message,
            type
        });
    } catch (err) {
        console.error('Failed to create notification', err);
    }
};

const addHistory = (request, status, user) => {
    let history = [];
    if (request.history) {
        try {
            history = JSON.parse(request.history);
        } catch (e) {
            history = [];
        }
    }
    history.push({
        status,
        timestamp: new Date().toISOString(),
        user: { id: user.id || user._id, name: user.name, role: user.role }
    });
    request.history = JSON.stringify(history);
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
        
        addHistory(request, 'Pending', req.user);
        await request.save();

        // Notify Managers and Admins
        const managers = await User.sequelizeModel.findAll({ where: { role: ['Manager', 'Admin'] } });
        for (const manager of managers) {
            await createNotification(
                manager.id, 
                'New Stock Request', 
                `Employee ${req.user.name} requested ${requiredQuantity} ${material.unit} of ${material.name}.`,
                'warning',
                request.id
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
            whereClause.status = ['Manager Approved', 'Processing', 'Dispatched', 'Delivered'];
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
        const { actionType, managerMessage } = req.body;
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
        
        let newStatus = 'Pending';
        if (actionType === 'Approve' || actionType === 'CreatePO') {
            newStatus = 'Manager Approved';
            
            if (actionType === 'CreatePO') {
                const newOrder = await Order.sequelizeModel.create({
                    orderNumber: `PO-${Date.now()}`,
                    orderType: 'purchase',
                    companyName: 'Internal Request',
                    totalAmount: 0,
                    status: 'Pending',
                    paymentStatus: 'Pending',
                    createdById: managerId
                });
                request.orderId = newOrder.id;
            }

            // Notify Sales if approved
            const salesTeam = await User.sequelizeModel.findAll({ where: { role: 'Sales' } });
            for (const sales of salesTeam) {
                await createNotification(
                    sales.id,
                    'New Stock Delivery Required',
                    `A stock request for ${request.material.name} has been approved and requires delivery processing.`,
                    'warning',
                    request.id
                );
            }
        } else if (actionType === 'Reject') {
            newStatus = 'Rejected';
        } else if (actionType === 'MoreInfo') {
            newStatus = 'More Info Requested';
        }

        request.status = newStatus;
        addHistory(request, newStatus, req.user);
        
        await request.save();

        // Notify Employee
        await createNotification(
            request.employeeId,
            `Manager ${actionType === 'Approve' || actionType === 'CreatePO' ? 'Approved' : 'Responded to'} Stock Request`,
            `Manager ${req.user.name} responded to your request for ${request.material.name}: ${newStatus}.`,
            actionType === 'Reject' ? 'error' : 'info',
            request.id
        );

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process manager action' });
    }
};

exports.employeeReceive = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await StockRequest.sequelizeModel.findByPk(id, {
            include: [{ model: Material.sequelizeModel, as: 'material' }]
        });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Ensure only the employee who created it can receive it
        const userId = req.user.id || req.user._id;
        if (request.employeeId !== userId && !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized to receive this request' });
        }

        if (request.status !== 'Delivered') {
            return res.status(400).json({ message: 'Cannot receive material that has not been delivered' });
        }

        request.status = 'Completed';
        
        // Add actual stock
        const material = await Material.sequelizeModel.findByPk(request.materialId);
        if (material) {
            material.quantity += request.requiredQuantity;
            await material.save();
        }

        addHistory(request, 'Completed', req.user);
        await request.save();

        // Notify Manager
        if (request.managerId) {
            await createNotification(
                request.managerId,
                `Stock Request Completed`,
                `Employee ${req.user.name} has received the material for ${request.material.name}.`,
                'success',
                request.id
            );
        }

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to process employee receive' });
    }
};

exports.requestReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await StockRequest.sequelizeModel.findByPk(id);
        
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const userId = req.user.id || req.user._id;
        if (request.employeeId !== userId && !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized to return this request' });
        }

        if (request.status !== 'Completed') {
            return res.status(400).json({ message: 'Can only return completed requests' });
        }

        request.status = 'Return Requested';
        addHistory(request, 'Return Requested', req.user);
        await request.save();

        if (request.managerId) {
            await createNotification(
                request.managerId,
                'Return Requested',
                `Employee ${req.user.name} has requested to return a material.`,
                'warning',
                request.id
            );
        }

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to request return' });
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
        addHistory(request, status, req.user);
        await request.save();

        // Notify Employee and Manager
        const notificationMsg = `Sales updated delivery status of ${request.material.name} to ${status}.`;
        await createNotification(request.employeeId, 'Delivery Update', notificationMsg, 'info', request.id);
        if (request.managerId) {
            await createNotification(request.managerId, 'Delivery Update', notificationMsg, 'info', request.id);
        }

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update delivery status' });
    }
};
