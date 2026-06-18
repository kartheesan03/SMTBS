const Employee = require('../models/Employee');
const User = require('../models/User');
const { logAudit } = require('../services/auditService');

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
        const { employeeId, firstName, lastName, department, designation, contact, phone, address, joinDate, password } = req.body;

        // Requirement 9: Validate role/department
        const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales'];
        if (!allowedRoles.includes(department)) {
            return res.status(400).json({ message: `Invalid department/role. Allowed departments are: ${allowedRoles.join(', ')}` });
        }

        // Requirement 6: Prevent duplicate email addresses across all users/employees
        const userExists = await User.findOne({ email: contact });
        const employeeExists = await Employee.findOne({ contact });
        if (userExists || employeeExists) {
            return res.status(400).json({ message: 'Email is already in use by another user' });
        }

        // Create User (let User hooks:beforeSave handle hashed password automatically)
        const user = await User.create({
            name: `${firstName} ${lastName || ''}`.trim(),
            email: contact,
            password: password || 'password123',
            role: department
        });

        // Create Employee linked to User via Employee.create
        const createdEmployee = await Employee.create({
            userId: user._id,
            employeeId,
            firstName,
            lastName,
            department,
            designation,
            contact,
            phone,
            address,
            joinDate
        });

        const { notifyHR } = require('../services/notificationService');
        await notifyHR({
            module: 'Employees',
            referenceId: createdEmployee._id || createdEmployee.id,
            title: 'New Employee Added',
            message: `${firstName} ${lastName || ''} has been added to the system as ${designation || 'Employee'}.`,
            type: 'info'
        });

        // Audit log
        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Employee',
            targetId: createdEmployee._id,
            description: `Employee created: ${firstName} ${lastName || ''} (${employeeId})`,
            ipAddress: req.ip
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

        const { firstName, lastName, contact, phone, department, designation, employeeId, salary, joinDate, address, password } = req.body;

        const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales'];
        if (department && !allowedRoles.includes(department)) {
            return res.status(400).json({ message: `Invalid department/role. Allowed departments are: ${allowedRoles.join(', ')}` });
        }

        // Sync with User model
        let user = null;
        if (employee.userId) {
            user = await User.findById(employee.userId);
        }

        if (!user && contact && contact.includes('@')) {
            // Try to find by email first
            const existingUser = await User.findOne({ email: contact });
            if (existingUser) {
                user = existingUser;
            } else {
                const name = `${firstName || employee.firstName} ${lastName || employee.lastName || ''}`.trim();
                user = await User.create({
                    name: name,
                    email: contact,
                    password: password || 'password123',
                    role: department || employee.department || 'Employee'
                });
            }
            // Link employee to this user
            employee.userId = user._id || user.id;
        }

        if (user) {
            if (contact && contact !== user.email) {
                const emailExists = await User.findOne({ email: contact });
                const empEmailExists = await Employee.findOne({ contact });
                if ((emailExists && String(emailExists.id || emailExists._id) !== String(user.id || user._id)) ||
                    (empEmailExists && String(empEmailExists.id || empEmailExists._id) !== String(employee.id || employee._id))) {
                    return res.status(400).json({ message: 'Email is already in use by another user' });
                }
                user.email = contact;
            }

            if (firstName || lastName) {
                user.name = `${firstName || employee.firstName} ${lastName || employee.lastName || ''}`.trim();
            }

            if (department) user.role = department;
            if (password && password.trim() !== '') {
                // Set password (beforeSave hook in User model will automatically re-hash if it's not hashed)
                user.password = password;
            }

            await user.save();
        }

        // Update Employee fields explicitly
        if (firstName) employee.firstName = firstName;
        if (lastName !== undefined) employee.lastName = lastName;
        if (contact) employee.contact = contact;
        if (phone !== undefined) employee.phone = phone;
        if (department) employee.department = department;
        if (designation) employee.designation = designation;
        if (employeeId) employee.employeeId = employeeId;
        if (salary) employee.salary = salary;
        if (joinDate) employee.joinDate = joinDate;
        if (address !== undefined) employee.address = address;

        const updatedEmployee = await employee.save();

        const { notifyHR } = require('../services/notificationService');
        await notifyHR({
            module: 'Employees',
            referenceId: updatedEmployee._id || updatedEmployee.id,
            title: 'Employee Profile Updated',
            message: `Profile details for ${updatedEmployee.firstName} ${updatedEmployee.lastName || ''} have been updated.`,
            type: 'info'
        });

        // Audit log
        await logAudit({
            user: req.user,
            action: 'UPDATE',
            module: 'Employee',
            targetId: updatedEmployee._id,
            description: `Employee profile updated: ${updatedEmployee.firstName} ${updatedEmployee.lastName || ''}`,
            ipAddress: req.ip
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
            const employeeName = `${employee.firstName} ${employee.lastName || ''}`.trim();
            // Delete associated user if exists
            if (employee.userId) {
                const user = await User.findById(employee.userId);
                if (user) await user.deleteOne();
            }
            // Optionally, we could delete associated Salaries and Leaves here, but for now just deleting the employee and user is fine
            await employee.deleteOne();

            // Audit log
            await logAudit({
                user: req.user,
                action: 'DELETE',
                module: 'Employee',
                targetId: req.params.id,
                description: `Employee deleted: ${employeeName}`,
                ipAddress: req.ip
            });

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
        if (email !== undefined) employee.contact = email;
        if (phone !== undefined) employee.phone = phone;
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
