const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import all models
const User = require('./src/models/User');
const Material = require('./src/models/Material');
const Employee = require('./src/models/Employee');
const Customer = require('./src/models/Customer');
const Lead = require('./src/models/Lead');
const Vendor = require('./src/models/Vendor');
const Order = require('./src/models/Order');
const Attendance = require('./src/models/Attendance');
const Leave = require('./src/models/Leave');
const Salary = require('./src/models/Salary');
const Task = require('./src/models/Task');
const Notification = require('./src/models/Notification');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // 1. Clear existing collections
        await User.deleteMany();
        await Material.deleteMany();
        await Employee.deleteMany();
        await Customer.deleteMany();
        await Lead.deleteMany();
        await Vendor.deleteMany();
        await Order.deleteMany();
        await Attendance.deleteMany();
        await Leave.deleteMany();
        await Salary.deleteMany();
        await Task.deleteMany();
        await Notification.deleteMany();
        console.log('Cleared existing database entries.');

        // 2. Create Users (with password hashing handled in pre-save)
        const userDocs = [
            { name: 'Sarah Connor', email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
            { name: 'Alex Mercer', email: 'admin2@smtbms.com', password: 'admin123', role: 'Admin' },
            { name: 'Carol White', email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
            { name: 'David Miller', email: 'hr2@smtbms.com', password: 'hr123', role: 'HR' },
            { name: 'Alice Johnson', email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
            { name: 'Frank Castillo', email: 'manager2@smtbms.com', password: 'manager123', role: 'Manager' },
            { name: 'Bob Smith', email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' },
            { name: 'Grace Hopper', email: 'sales2@smtbms.com', password: 'sales123', role: 'Sales' },
            { name: 'David Brown', email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
            { name: 'Elena Rostova', email: 'employee2@smtbms.com', password: 'employee123', role: 'Employee' }
        ];

        const createdUsers = [];
        for (const u of userDocs) {
            const user = await User.create(u);
            createdUsers.push(user);
        }
        console.log(`Seeded ${createdUsers.length} Users.`);

        const adminUser = createdUsers.find(u => u.role === 'Admin');
        const hrUser = createdUsers.find(u => u.role === 'HR');
        const managerUser = createdUsers.find(u => u.role === 'Manager');
        const salesUser = createdUsers.find(u => u.role === 'Sales');
        const employeeUser = createdUsers.find(u => u.role === 'Employee');

        // 3. Create Employees (linked to their respective Users)
        const employeeDocs = [
            { userId: managerUser._id, employeeId: 'EMP001', firstName: 'Alice', lastName: 'Johnson', department: 'Production', designation: 'Production Manager', salary: 5500, contact: '555-0101', address: '123 Steel Rd, Factory City' },
            { userId: salesUser._id, employeeId: 'EMP002', firstName: 'Bob', lastName: 'Smith', department: 'Sales', designation: 'Sales Representative', salary: 4000, contact: '555-0102', address: '456 Deal Ave, Business District' },
            { userId: hrUser._id, employeeId: 'EMP003', firstName: 'Carol', lastName: 'White', department: 'HR', designation: 'HR Lead', salary: 4800, contact: '555-0103', address: '789 Talent Dr, People Ville' },
            { userId: employeeUser._id, employeeId: 'EMP004', firstName: 'David', lastName: 'Brown', department: 'Warehouse', designation: 'Stock Controller', salary: 3200, contact: '555-0104', address: '101 Cargo St, Logistics Zone' }
        ];

        const createdEmployees = await Employee.insertMany(employeeDocs);
        console.log(`Seeded ${createdEmployees.length} Employees linked to Users.`);

        // 4. Create Materials
        const materialDocs = [
            { name: 'Steel Rods (10mm)', sku: 'ST-001', category: 'Raw Metal', quantity: 240, lowStockThreshold: 50, unit: 'kg', price: 45, status: 'In Stock' },
            { name: 'Aluminum Sheets (2mm)', sku: 'AL-002', category: 'Raw Metal', quantity: 8, lowStockThreshold: 15, unit: 'pcs', price: 120, status: 'Low Stock' },
            { name: 'Copper Wires (5A)', sku: 'CP-003', category: 'Wiring', quantity: 800, lowStockThreshold: 100, unit: 'm', price: 12, status: 'In Stock' },
            { name: 'Iron Beams (H-Shape)', sku: 'IR-004', category: 'Raw Metal', quantity: 45, lowStockThreshold: 10, unit: 'pcs', price: 280, status: 'In Stock' },
            { name: 'Brass Pipes (0.5")', sku: 'BR-005', category: 'Plumbing', quantity: 3, lowStockThreshold: 20, unit: 'm', price: 35, status: 'Low Stock' },
            { name: 'Zinc Plates (A4)', sku: 'ZN-006', category: 'Plates', quantity: 15, lowStockThreshold: 10, unit: 'pcs', price: 55, status: 'In Stock' },
            { name: 'Nickel Coils (Premium)', sku: 'NK-007', category: 'Raw Metal', quantity: 0, lowStockThreshold: 5, unit: 'kg', price: 190, status: 'Out of Stock' },
            { name: 'Solder Reels (60/40)', sku: 'SD-008', category: 'Wiring', quantity: 120, lowStockThreshold: 30, unit: 'pcs', price: 25, status: 'In Stock' }
        ];

        const createdMaterials = await Material.insertMany(materialDocs);
        console.log(`Seeded ${createdMaterials.length} Materials.`);

        // 5. Create Vendors
        const vendorDocs = [
            { name: 'MetalCo Suppliers', contactPerson: 'John Metal', email: 'john@metalco.com', phone: '555-2001', address: '1 Outer Beltway, Heavy Ind Park', category: 'Raw Metals' },
            { name: 'Apex Alloys', contactPerson: 'Sarah Steel', email: 'orders@apexalloys.com', phone: '555-2002', address: '78 Alloy Plaza, Foundry City', category: 'Alloys' },
            { name: 'WireTech Wholesale', contactPerson: 'Edward Cable', email: 'info@wiretech.com', phone: '555-2003', address: '12 Filament Way, Copper Junction', category: 'Wiring' },
            { name: 'BrassCraft Industries', contactPerson: 'Liam Pipe', email: 'sales@brasscraft.com', phone: '555-2004', address: '33 Valve Lane, Pipe Town', category: 'Plumbing' }
        ];

        const createdVendors = await Vendor.insertMany(vendorDocs);
        console.log(`Seeded ${createdVendors.length} Vendors.`);

        // 6. Create Customers
        const customerDocs = [
            { name: 'BuildCorp Ltd', email: 'contact@buildcorp.com', phone: '555-3001', company: 'BuildCorp Ltd', address: '100 Construction Way, Metro City', industry: 'Real Estate', website: 'buildcorp.com', status: 'Active', createdBy: salesUser._id },
            { name: 'TechManufacture Corp', email: 'info@techman.com', phone: '555-3002', company: 'TechManufacture Corp', address: '44 Silicon Dr, Innovation Hub', industry: 'Electronics', website: 'techman.com', status: 'Active', createdBy: salesUser._id },
            { name: 'Nexus Construction', email: 'nexus@const.com', phone: '555-3003', company: 'Nexus Infrastructure', address: '88 Bridge St, Riverdale', industry: 'Infrastructure', website: 'nexusbuilds.com', status: 'Active', createdBy: salesUser._id },
            { name: 'Prime Industries', email: 'admin@primeind.com', phone: '555-3004', company: 'Prime Industries', address: '12 Factory Blvd, Port Area', industry: 'Aerospace', website: 'primeind.com', status: 'Active', createdBy: salesUser._id },
            { name: 'Global Infrastructure', email: 'info@globalinfra.com', phone: '555-3005', company: 'Global Infra', address: '22 Highway Route, Transit City', industry: 'Government Contracts', website: 'globalinfra.gov', status: 'Pending Review', createdBy: salesUser._id }
        ];

        const createdCustomers = await Customer.insertMany(customerDocs);
        console.log(`Seeded ${createdCustomers.length} Customers.`);

        // 7. Create Leads
        const leadDocs = [
            { name: 'Global Solutions Group', source: 'Web', phone: '555-8001', email: 'sales@globalsol.com', status: 'Awaiting Review', assignedTo: salesUser._id, estimatedValue: 12000, notes: 'Interested in buying bulk copper wires.' },
            { name: 'NextGen Systems', source: 'Referral', phone: '555-8002', email: 'hello@nextgen.io', status: 'Initial Contact', assignedTo: salesUser._id, estimatedValue: 8500, notes: 'Referral from BuildCorp. Wants steel rods.' },
            { name: 'Prime Industries (Aero Div)', source: 'LinkedIn', phone: '555-8003', email: 'ceo@primeind.com', status: 'Qualified Lead', assignedTo: salesUser._id, estimatedValue: 35000, notes: 'Needs top grade aluminum sheets and copper cables.' },
            { name: 'Vertex Builders', source: 'Cold Call', phone: '555-8004', email: 'bid@vertex.com', status: 'Negotiation', assignedTo: salesUser._id, estimatedValue: 48000, notes: 'Finalizing pricing structure for Steel Beams.' },
            { name: 'Star Forge', source: 'Web', phone: '555-8005', email: 'orders@starforge.com', status: 'Closing Deal', assignedTo: salesUser._id, estimatedValue: 15000, notes: 'Contract draft sent. Waiting for signature.' },
            { name: 'Omega Logistics', source: 'LinkedIn', phone: '555-8006', email: 'contact@omega.com', status: 'Lost', assignedTo: salesUser._id, estimatedValue: 5000, notes: 'Decided to go with a local vendor due to transport costs.' }
        ];

        const createdLeads = await Lead.insertMany(leadDocs);
        console.log(`Seeded ${createdLeads.length} CRM Leads.`);

        // 8. Create Orders (Sales and Purchase Orders)
        const orderDocs = [
            {
                orderNumber: 'SO-2026-001',
                customer: createdCustomers[0]._id,
                items: [
                    { material: createdMaterials[0]._id, quantity: 50, price: 45 }, // Steel Rods
                    { material: createdMaterials[2]._id, quantity: 200, price: 12 } // Copper Wires
                ],
                totalAmount: (50 * 45) + (200 * 12),
                status: 'Confirmed',
                type: 'Sales',
                createdBy: salesUser._id
            },
            {
                orderNumber: 'SO-2026-002',
                customer: createdCustomers[1]._id,
                items: [
                    { material: createdMaterials[1]._id, quantity: 5, price: 120 }, // Aluminum sheets
                    { material: createdMaterials[7]._id, quantity: 40, price: 25 }  // Solder Reels
                ],
                totalAmount: (5 * 120) + (40 * 25),
                status: 'Shipped',
                type: 'Sales',
                createdBy: salesUser._id
            },
            {
                orderNumber: 'SO-2026-003',
                customer: createdCustomers[2]._id,
                items: [
                    { material: createdMaterials[3]._id, quantity: 15, price: 280 } // Iron Beams
                ],
                totalAmount: (15 * 280),
                status: 'Pending',
                type: 'Sales',
                createdBy: salesUser._id
            },
            {
                orderNumber: 'PO-2026-001',
                vendor: createdVendors[0]._id,
                items: [
                    { material: createdMaterials[0]._id, quantity: 100, price: 38 } // Purchase steel rods cheaper
                ],
                totalAmount: (100 * 38),
                status: 'Delivered',
                type: 'Purchase',
                createdBy: managerUser._id
            },
            {
                orderNumber: 'PO-2026-002',
                vendor: createdVendors[1]._id,
                items: [
                    { material: createdMaterials[6]._id, quantity: 20, price: 150 } // Nickel Coils
                ],
                totalAmount: (20 * 150),
                status: 'Awaiting Approval',
                type: 'Purchase',
                createdBy: managerUser._id
            },
            {
                orderNumber: 'PO-2026-003',
                vendor: createdVendors[3]._id,
                items: [
                    { material: createdMaterials[4]._id, quantity: 30, price: 28 } // Brass Pipes
                ],
                totalAmount: (30 * 28),
                status: 'Approved',
                type: 'Purchase',
                createdBy: managerUser._id
            }
        ];

        const createdOrders = await Order.insertMany(orderDocs);
        console.log(`Seeded ${createdOrders.length} Sales & Purchase Orders.`);

        // 9. Create Attendance
        const today = new Date();
        const attendanceDocs = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            for (const emp of createdEmployees) {
                // Alice on leave on day 2
                if (emp.firstName === 'Alice' && i === 2) {
                    attendanceDocs.push({ employee: emp._id, date, status: 'Leave' });
                    continue;
                }

                // Bob absent on day 4
                if (emp.firstName === 'Bob' && i === 4) {
                    attendanceDocs.push({ employee: emp._id, date, status: 'Absent' });
                    continue;
                }

                // Normal attendance
                const isLate = Math.random() > 0.85;
                attendanceDocs.push({
                    employee: emp._id,
                    date,
                    status: isLate ? 'Late' : 'Present',
                    checkIn: isLate ? '09:45 AM' : '08:58 AM',
                    checkOut: '05:30 PM'
                });
            }
        }

        const seededAttendance = await Attendance.insertMany(attendanceDocs);
        console.log(`Seeded ${seededAttendance.length} Attendance log entries.`);

        // 10. Create Leaves
        const leaveDocs = [
            {
                employee: createdEmployees[0]._id, // Alice
                type: 'Sick',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                reason: 'Severe food poisoning',
                status: 'Approved',
                reviewedBy: hrUser._id,
                reviewNote: 'Approved based on doctor certificate.'
            },
            {
                employee: createdEmployees[3]._id, // David
                type: 'Annual',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
                reason: 'Family trip out of town',
                status: 'Pending'
            },
            {
                employee: createdEmployees[1]._id, // Bob
                type: 'Casual',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
                reason: 'Car breakdown & repairs',
                status: 'Approved',
                reviewedBy: hrUser._id,
                reviewNote: 'Self-certified casual leave.'
            },
            {
                employee: createdEmployees[2]._id, // Carol
                type: 'Sick',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                reason: 'Dentist appointment',
                status: 'Approved',
                reviewedBy: adminUser._id,
                reviewNote: 'Permitted.'
            }
        ];

        const createdLeaves = await Leave.insertMany(leaveDocs);
        console.log(`Seeded ${createdLeaves.length} Leave Management Requests.`);

        // 11. Create Salaries
        const salaryDocs = [
            // April 2026 Salaries
            { employee: createdEmployees[0]._id, month: 'April 2026', basicSalary: 5500, allowances: 500, deductions: 200, netSalary: 5800, status: 'Paid', paymentDate: new Date('2026-05-01T10:00:00.000Z'), transactionId: 'TXN-APR-001' },
            { employee: createdEmployees[1]._id, month: 'April 2026', basicSalary: 4000, allowances: 800, deductions: 100, netSalary: 4700, status: 'Paid', paymentDate: new Date('2026-05-01T10:05:00.000Z'), transactionId: 'TXN-APR-002' },
            { employee: createdEmployees[2]._id, month: 'April 2026', basicSalary: 4800, allowances: 300, deductions: 150, netSalary: 4950, status: 'Paid', paymentDate: new Date('2026-05-01T10:10:00.000Z'), transactionId: 'TXN-APR-003' },
            { employee: createdEmployees[3]._id, month: 'April 2026', basicSalary: 3200, allowances: 200, deductions: 50, netSalary: 3350, status: 'Paid', paymentDate: new Date('2026-05-01T10:15:00.000Z'), transactionId: 'TXN-APR-004' },

            // May 2026 Salaries (Awaiting Approval / Pending)
            { employee: createdEmployees[0]._id, month: 'May 2026', basicSalary: 5500, allowances: 500, deductions: 100, netSalary: 5900, status: 'Awaiting Approval' },
            { employee: createdEmployees[1]._id, month: 'May 2026', basicSalary: 4000, allowances: 600, deductions: 150, netSalary: 4450, status: 'Pending' },
            { employee: createdEmployees[2]._id, month: 'May 2026', basicSalary: 4800, allowances: 400, deductions: 100, netSalary: 5100, status: 'Awaiting Approval' },
            { employee: createdEmployees[3]._id, month: 'May 2026', basicSalary: 3200, allowances: 200, deductions: 50, netSalary: 3350, status: 'Pending' }
        ];

        const createdSalaries = await Salary.insertMany(salaryDocs);
        console.log(`Seeded ${createdSalaries.length} Salary payroll slips.`);

        // 12. Create Tasks
        const taskDocs = [
            {
                title: 'Review Warehouse Layout',
                description: 'Organize warehouse shelves to make room for heavy iron beams arriving next week.',
                assignedTo: [employeeUser._id],
                assignedBy: managerUser._id,
                completions: [{ user: employeeUser._id, status: 'In Progress' }],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                isBroadcast: false
            },
            {
                title: 'Follow up on Star Forge Lead',
                description: 'Star Forge lead requested sample contract revisions. Follow up and close deal.',
                assignedTo: [salesUser._id],
                assignedBy: managerUser._id,
                completions: [{ user: salesUser._id, status: 'Pending' }],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                isBroadcast: false
            },
            {
                title: 'Conduct Monthly Fire Safety Drill',
                description: 'All factory staff must participate in the emergency drill at 10 AM on Monday.',
                assignedTo: [managerUser._id, employeeUser._id, salesUser._id, hrUser._id],
                assignedBy: adminUser._id,
                completions: [
                    { user: managerUser._id, status: 'Completed' },
                    { user: employeeUser._id, status: 'Completed' },
                    { user: salesUser._id, status: 'Completed' },
                    { user: hrUser._id, status: 'Completed' }
                ],
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                isBroadcast: true
            },
            {
                title: 'Audit Low Stock Materials',
                description: 'Conduct manual physical count check for Brass Pipes and Aluminum Sheets.',
                assignedTo: [employeeUser._id],
                assignedBy: managerUser._id,
                completions: [{ user: employeeUser._id, status: 'Completed' }],
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
                isBroadcast: false
            },
            {
                title: 'Submit May Work Reports',
                description: 'Submit departmental monthly summaries to the Administrator.',
                assignedTo: [managerUser._id, hrUser._id, salesUser._id],
                assignedBy: adminUser._id,
                completions: [
                    { user: managerUser._id, status: 'Pending' },
                    { user: hrUser._id, status: 'In Progress' },
                    { user: salesUser._id, status: 'Pending' }
                ],
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                isBroadcast: false
            }
        ];

        const createdTasks = await Task.insertMany(taskDocs);
        console.log(`Seeded ${createdTasks.length} Operations Tasks.`);

        // 13. Create System Notifications
        const notificationDocs = [
            {
                user: null, // Admin/Global
                title: 'Low Stock Alert',
                message: 'Aluminum Sheets (2mm) quantity has dropped to 8 units. Threshold is 15.',
                type: 'warning',
                category: 'stock',
                isRead: false,
                link: '/materials'
            },
            {
                user: null, // Admin/Global
                title: 'Critical Out-Of-Stock Alert',
                message: 'Nickel Coils (Premium) is out of stock (0 kg remaining). Urgent order needed.',
                type: 'error',
                category: 'stock',
                isRead: false,
                link: '/materials'
            },
            {
                user: adminUser._id,
                title: 'Leave Awaiting Approval',
                message: 'David Brown has requested leave for 5 days starting next week.',
                type: 'info',
                category: 'hr',
                isRead: false,
                link: '/hrms'
            },
            {
                user: adminUser._id,
                title: 'Payroll Pending Signoff',
                message: 'Payroll slips for May 2026 have been generated and are awaiting admin signoff.',
                type: 'info',
                category: 'hr',
                isRead: false,
                link: '/payroll'
            },
            {
                user: managerUser._id,
                title: 'Purchase Order Delivered',
                message: 'PO-2026-001 (100 Steel Rods) has been successfully verified and added to inventory.',
                type: 'success',
                category: 'order',
                isRead: false,
                link: '/erp'
            }
        ];

        const seededNotifications = await Notification.insertMany(notificationDocs);
        console.log(`Seeded ${seededNotifications.length} System Notifications.`);

        console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding process failed:', error);
        process.exit(1);
    }
};

seedData();
