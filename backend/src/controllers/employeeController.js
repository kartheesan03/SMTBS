const Employee = require('../models/Employee');
const User = require('../models/User');

const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({}).populate('userId', 'name email role');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { employeeId, firstName, lastName, department, designation, contact, address, joinDate, password } = req.body;

        // Check if user already exists; if so, reuse it
        const [user, userCreated] = await User.findOrCreate({
            where: { email: contact },
            defaults: {
                name: `${firstName} ${lastName || ''}`.trim(),
                password: password || 'password123',
                role: department || 'Employee'
            }
        });
        // If user already existed, you may want to update its name/role if needed
        if (!userCreated) {
            // optional: update fields
            await user.update({
                name: `${firstName} ${lastName || ''}`.trim(),
                role: department || user.role
            });
        }
        // Create Employee linked to User via Employee.create
        const createdEmployee = await Employee.create({
            userId: user._id,
            employeeId,
            firstName,
            lastName,
            department,
            designation,
            contact,
            address,
            joinDate
        });

        const { notifyHR } = require('../services/notificationService');
        await notifyHR({
            title: 'New Employee Added',
            message: `${firstName} ${lastName || ''} has been added to the system as ${designation || 'Employee'}.`,
            type: 'info'
        });

        res.status(201).json(createdEmployee);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const { firstName, lastName, contact, department, designation, employeeId, salary, joinDate, address, password } = req.body;

        // Sync with User model
        if (employee.userId) {
            const user = await User.findById(employee.userId);
            if (user) {
                // If email is changing, check for uniqueness
                if (contact && contact !== employee.contact) {
                    const emailExists = await User.findOne({ email: contact });
                    if (emailExists) return res.status(400).json({ message: 'Email is already in use by another user' });
                    user.email = contact;
                }

                if (firstName || lastName) {
                    user.name = `${firstName || employee.firstName} ${lastName || employee.lastName || ''}`.trim();
                }

                if (department) user.role = department;
                if (password && password.trim() !== '') user.password = password;

                await user.save();
            }
        }

        // Update Employee fields explicitly
        if (firstName) employee.firstName = firstName;
        if (lastName !== undefined) employee.lastName = lastName;
        if (contact) employee.contact = contact;
        if (department) employee.department = department;
        if (designation) employee.designation = designation;
        if (employeeId) employee.employeeId = employeeId;
        if (salary) employee.salary = salary;
        if (joinDate) employee.joinDate = joinDate;
        if (address !== undefined) employee.address = address;

        const updatedEmployee = await employee.save();

        const { notifyHR } = require('../services/notificationService');
        await notifyHR({
            title: 'Employee Profile Updated',
            message: `Profile details for ${updatedEmployee.firstName} ${updatedEmployee.lastName || ''} have been updated.`,
            type: 'info'
        });

        res.json(updatedEmployee);
    } catch (error) {
        console.error('Update Employee Error:', error);
        res.status(400).json({ message: error.message || 'Internal Server Error during update' });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            // Delete associated user if exists
            if (employee.userId) {
                const user = await User.findById(employee.userId);
                if (user) await user.deleteOne();
            }
            // Optionally, we could delete associated Salaries and Leaves here, but for now just deleting the employee and user is fine
            await employee.deleteOne();
            res.json({ message: 'Employee removed successfully' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id }).populate('userId', 'name email role');
        if (!employee) {
            return res.status(404).json({ message: 'Employee record not found for this user' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMe = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const { firstName, lastName, phone, email, address, password } = req.body;

        if (employee.userId) {
            const user = await User.findById(employee.userId);
            if (user) {
                if (email && email !== user.email) {
                    const emailExists = await User.findOne({ email });
                    if (emailExists && emailExists.id !== user.id) return res.status(400).json({ message: 'Email is already in use by another user' });
                    user.email = email;
                }
                if (firstName || lastName) {
                    user.name = `${firstName || employee.firstName} ${lastName || employee.lastName || ''}`.trim();
                }
                if (password && password.trim() !== '') user.password = password;
                await user.save();
            }
        }

        if (firstName) employee.firstName = firstName;
        if (lastName !== undefined) employee.lastName = lastName;
        if (phone !== undefined) employee.contact = phone;
        if (address !== undefined) employee.address = address;

        await employee.save();
        
        const populatedEmployee = await Employee.findOne({ userId: req.user._id }).populate('userId', 'name email role');
        res.json(populatedEmployee);
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(400).json({ message: error.message || 'Internal Server Error during update' });
    }
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee, getMe, updateMe };
