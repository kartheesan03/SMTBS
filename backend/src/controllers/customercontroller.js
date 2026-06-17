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
        const customers = await Customer.find({}).populate('createdBy', 'name email');
        console.log(`[API /customers] Fetched ${customers.length} customers.`);
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
            module: 'Customers',
            referenceId: createdCustomer._id || createdCustomer.id,
            title: 'New Customer Added',
            message: `${customerData.name} has been added as a customer.`,
            type: 'info'
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
                module: 'Customers',
                referenceId: updatedCustomer._id || updatedCustomer.id,
                title: 'Customer Approved',
                message: `${updatedCustomer.name} has been approved.`,
                type: 'success'
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
                module: 'Customers',
                referenceId: updatedCustomer._id || updatedCustomer.id,
                title: 'Customer Updated',
                message: `Details for customer ${updatedCustomer.name} have been updated.`,
                type: 'info'
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

// @desc    Get current user's customer profile
// @route   GET /api/customers/my-profile
// @access  Private/Customer
const getMyCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.user._id });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create self-service customer profile
// @route   POST /api/customers/profile
// @access  Private/Customer
const createCustomerProfile = async (req, res) => {
    try {
        const { _id } = req.user;
        const customerData = { ...req.body, userId: _id, createdBy: _id, status: 'Active' };

        if (!customerData.company && customerData.name) {
            customerData.company = customerData.name;
        }

        const customer = new Customer(customerData);
        const createdCustomer = await customer.save();

        // Update User profile status
        const User = require('../models/User');
        const user = await User.findById(_id);
        if (user) {
            user.isProfileComplete = true;
            await user.save();
        }

        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Customer Profile',
            targetId: createdCustomer._id,
            description: `Self-registered customer created: ${customerData.name}`,
            ipAddress: req.ip
        });

        res.status(201).json(createdCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update self-service customer profile
// @route   PUT /api/customers/profile
// @access  Private/Customer
const updateMyCustomerProfile = async (req, res) => {
    try {
        let customer = await Customer.findOne({ userId: req.user._id });
        
        // Match CRM customer record using userId first, email as fallback
        if (!customer) {
            customer = await Customer.findOne({ email: req.user.email });
        }

        const updateData = { ...req.body };
        // Don't allow changing restricted fields via this endpoint
        delete updateData.userId;
        delete updateData.createdBy;
        delete updateData.status;

        if (!customer) {
            // If CRM customer record does not exist: Create one automatically.
            customer = new Customer({
                userId: req.user._id,
                createdBy: req.user._id,
                email: req.user.email,
                status: 'Active',
                ...updateData
            });
        } else {
            // Update existing customer record
            Object.assign(customer, updateData);
            // Ensure userId is linked if it matched by email fallback
            if (!customer.userId) {
                customer.userId = req.user._id;
            }
        }

        const updatedCustomer = await customer.save();

        // Update User table
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        if (user) {
            let userModified = false;
            if (updateData.name && user.name !== updateData.name) {
                user.name = updateData.name;
                userModified = true;
            }
            if (updateData.phone && user.phone !== updateData.phone) {
                user.phone = updateData.phone;
                userModified = true;
            }
            // Only sync email if it's explicitly provided and valid
            if (updateData.email && user.email !== updateData.email) {
                user.email = updateData.email;
                userModified = true;
            }
            
            if (userModified) {
                await user.save();
            }
        }

        await logAudit({
            user: req.user,
            action: 'UPDATE',
            module: 'Customer Profile',
            targetId: updatedCustomer._id,
            description: `Self-registered customer updated profile: ${updatedCustomer.name}`,
            ipAddress: req.ip
        });

        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, approveCustomer, getCustomerOrders, getCustomerTickets, getMyCustomerProfile, createCustomerProfile, updateMyCustomerProfile };
