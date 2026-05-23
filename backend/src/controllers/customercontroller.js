const Customer = require('../models/Customer');

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

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private/Admin/Sales
const createCustomer = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const customerData = { ...req.body, createdBy: _id };

        if (role === 'Sales') {
            customerData.status = 'Pending Review';
        }

        const customer = new Customer(customerData);
        const createdCustomer = await customer.save();
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
            Object.assign(customer, req.body);
            const updatedCustomer = await customer.save();
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
            await customer.deleteOne();
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer, approveCustomer };
