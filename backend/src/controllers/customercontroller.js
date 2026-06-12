const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const { notifySales } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a specific customer
// @route   GET /api/customers/:id/orders
// @access  Private
const getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id })
            .populate('vendor', 'name')
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get support tickets for a specific customer
// @route   GET /api/customers/:id/tickets
// @access  Private
const getCustomerTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ customerId: req.params.id })
            .populate('assignedTo', 'name role')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private/Admin/Sales
const createCustomer = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const customerData = { ...req.body, createdBy: _id };

        if (!customerData.company && customerData.name) {
            customerData.company = customerData.name;
        }

        if (role === 'Sales') {
            customerData.status = 'Pending Review';
        }

        const customer = new Customer(customerData);
        const createdCustomer = await customer.save();

        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Customer',
            targetId: createdCustomer._id,
            description: `Customer created: ${customerData.name}`,
            ipAddress: req.ip
        });

        await notifySales({
            title: 'New Customer Added',
            message: `${customerData.name} has been added as a customer.`,
            type: 'info',
            category: 'general'
        });

        res.status(201).json(createdCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve a customer
// @route   PUT /api/customers/:id/approve
// @access  Private/Admin
const approveCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            customer.status = 'Active';
            const updatedCustomer = await customer.save();

            await logAudit({
                user: req.user,
                action: 'APPROVE',
                module: 'Customer',
                targetId: updatedCustomer._id,
                description: `Customer approved: ${updatedCustomer.name}`,
                ipAddress: req.ip
            });

            await notifySales({
                title: 'Customer Approved',
                message: `${updatedCustomer.name} has been approved.`,
                type: 'success',
                category: 'general'
            });

            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private/Admin/Sales
const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            const updateData = { ...req.body };
            if (!updateData.company && updateData.name) {
                updateData.company = updateData.name;
            }
            Object.assign(customer, updateData);
            const updatedCustomer = await customer.save();

            await logAudit({
                user: req.user,
                action: 'UPDATE',
                module: 'Customer',
                targetId: updatedCustomer._id,
                description: `Customer updated: ${updatedCustomer.name}`,
                ipAddress: req.ip
            });

            await notifySales({
                title: 'Customer Updated',
                message: `Details for customer ${updatedCustomer.name} have been updated.`,
                type: 'info',
                category: 'general'
            });

            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            const customerName = customer.name;
            await customer.deleteOne();

            await logAudit({
                user: req.user,
                action: 'DELETE',
                module: 'Customer',
                targetId: req.params.id,
                description: `Customer deleted: ${customerName}`,
                ipAddress: req.ip
            });

            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, approveCustomer, getCustomerOrders, getCustomerTickets };
