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

        // Check if user already exists
        const userExists = await User.findOne({ email: contact });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create User
        const user = await User.create({
            name: `${firstName} ${lastName || ''}`.trim(),
            email: contact,
            password: password || 'password123', // Default if not provided
            role: department || 'Employee'
        });

        // Create Employee linked to User
        const employee = new Employee({
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

        const createdEmployee = await employee.save();
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
            await employee.deleteOne();
            res.json({ message: 'Employee removed' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };
