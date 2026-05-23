const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Material = require('./models/Material');
const Employee = require('./models/Employee');
const Customer = require('./models/Customer');

const Lead = require('./models/Lead');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Clear existing
        await User.deleteMany();
        await Material.deleteMany();
        await Employee.deleteMany();
        await Customer.deleteMany();
        await Lead.deleteMany();

        // Create Users for each Role
        const users = [
            { name: 'Admin User', email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
            { name: 'HR Manager', email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
            { name: 'Store Manager', email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
            { name: 'Sales Head', email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' },
            { name: 'General Employee', email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
        ];

        for (const u of users) {
            await User.create(u);
        }

        // Materials
        await Material.insertMany([
            { name: 'Steel Rods', sku: 'ST-001', category: 'Raw Metal', quantity: 150, lowStockThreshold: 20, unit: 'kg', price: 45, status: 'In Stock' },
            { name: 'Aluminum Sheets', sku: 'AL-002', category: 'Raw Metal', quantity: 5, lowStockThreshold: 10, unit: 'pcs', price: 120, status: 'Low Stock' },
            { name: 'Copper Wires', sku: 'CP-003', category: 'Wiring', quantity: 500, lowStockThreshold: 50, unit: 'm', price: 12, status: 'In Stock' }
        ]);

        // Employees
        await Employee.insertMany([
            { firstName: 'Alice', lastName: 'Johnson', department: 'Production', designation: 'Production Manager', salary: 5500, employeeId: 'EMP001' },
            { firstName: 'Bob', lastName: 'Smith', department: 'Sales', designation: 'Sales Executive', salary: 4000, employeeId: 'EMP002' }
        ]);

        // Customers
        await Customer.insertMany([
            { name: 'BuildCorp Ltd', email: 'contact@buildcorp.com', status: 'Active' },
            { name: 'TechManufacture', email: 'info@techman.com', status: 'Active' }
        ]);

        // Leads
        await Lead.insertMany([
            { name: 'Global Solutions', email: 'sales@globalsol.com', source: 'Web', status: 'Awaiting Review' },
            { name: 'NextGen Systems', email: 'hello@nextgen.io', source: 'Referral', status: 'Initial Contact' },
            { name: 'Prime Industries', email: 'ceo@primeind.com', source: 'LinkedIn', status: 'Qualified Lead' }
        ]);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
