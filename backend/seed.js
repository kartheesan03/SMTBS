const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Import all models
const User = require('./src/models/User');
const Material = require('./src/models/Material');
const Employee = require('./src/models/Employee');
const Customer = require('./src/models/Customer');
const Vendor = require('./src/models/Vendor');
const Order = require('./src/models/Order');
const Attendance = require('./src/models/Attendance');
const Leave = require('./src/models/Leave');
const Salary = require('./src/models/Salary');
const Task = require('./src/models/Task');
const Notification = require('./src/models/Notification');
const Ticket = require('./src/models/Ticket');
const CommunicationLog = require('./src/models/CommunicationLog');
const MaterialMovement = require('./src/models/MaterialMovement');
const AuditLog = require('./src/models/AuditLog');

dotenv.config();

const seedData = async () => {
    try {
        const success = await connectDB();
        if (!success) {
            console.error('MySQL database connection failed. Aborting seed process.');
            process.exit(1);
        }
        console.log('MySQL connected for seeding...');

        const today = new Date();
        const getPastDate = (monthsAgo, dayOfMonth) => {
            const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, dayOfMonth || 15);
            return date;
        };
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const thisMonthName = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
        
        const lastMonthDate = new Date(today);
        lastMonthDate.setMonth(today.getMonth() - 1);
        const lastMonthName = `${monthNames[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;

        // 1. Clear all existing collections
        const sequelize = require('./src/config/sequelize');
        await sequelize.query('PRAGMA foreign_keys = OFF');
        await sequelize.drop();
        await sequelize.sync();
        await sequelize.query('PRAGMA foreign_keys = ON');
        console.log('Dropped and recreated all database tables.');

        // ===================================================================
        // 2. USERS — Tamil Nadu based names
        // ===================================================================
        const userDocs = [
            { name: 'Karthikeyan Rajan', email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
            { name: 'Meena Sundar', email: 'admin2@smtbms.com', password: 'admin123', role: 'Admin' },
            { name: 'Priya Devi', email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
            { name: 'Lakshmi Narayanan', email: 'hr2@smtbms.com', password: 'hr123', role: 'HR' },
            { name: 'Murugan Selvam', email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
            { name: 'Anitha Bala', email: 'manager2@smtbms.com', password: 'manager123', role: 'Manager' },
            { name: 'Senthil Kumar', email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' },
            { name: 'Kavitha Ramesh', email: 'sales2@smtbms.com', password: 'sales123', role: 'Sales' },
            { name: 'Rajesh Kannan', email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
            { name: 'Divya Prakash', email: 'employee2@smtbms.com', password: 'employee123', role: 'Employee' },
            { name: 'Venkatesh Iyer', email: 'employee3@smtbms.com', password: 'employee123', role: 'Employee' },
            { name: 'Saranya Mohan', email: 'employee4@smtbms.com', password: 'employee123', role: 'Employee' }
        ];

        const createdUsers = [];
        for (const u of userDocs) {
            const user = await User.create(u);
            createdUsers.push(user);
        }
        console.log(`Seeded ${createdUsers.length} Users.`);

        const adminUser = createdUsers.find(u => u.email === 'admin@smtbms.com');
        const hrUser = createdUsers.find(u => u.email === 'hr@smtbms.com');
        const hrUser2 = createdUsers.find(u => u.email === 'hr2@smtbms.com');
        const managerUser = createdUsers.find(u => u.email === 'manager@smtbms.com');
        const managerUser2 = createdUsers.find(u => u.email === 'manager2@smtbms.com');
        const salesUser = createdUsers.find(u => u.email === 'sales@smtbms.com');
        const salesUser2 = createdUsers.find(u => u.email === 'sales2@smtbms.com');
        const empUser1 = createdUsers.find(u => u.email === 'employee@smtbms.com');
        const empUser2 = createdUsers.find(u => u.email === 'employee2@smtbms.com');
        const empUser3 = createdUsers.find(u => u.email === 'employee3@smtbms.com');
        const empUser4 = createdUsers.find(u => u.email === 'employee4@smtbms.com');

        // ===================================================================
        // 3. EMPLOYEES — Tamil Nadu cities and departments
        // ===================================================================
        const employeeDocs = [
            { userId: adminUser._id, employeeId: 'EMP001', firstName: 'System', lastName: 'Admin', department: 'Admin', designation: 'Administrator', salary: 75000, contact: '9876543200', address: '1, Admin Block, Coimbatore, Tamil Nadu 641001', joinDate: getPastDate(12, 1) },
            { userId: hrUser._id, employeeId: 'EMP002', firstName: 'Priya', lastName: 'Devi', department: 'HR', designation: 'HR Manager', salary: 48000, contact: '9876543214', address: '56, RS Puram, Coimbatore, Tamil Nadu 641002', joinDate: getPastDate(5, 1) },
            { userId: managerUser._id, employeeId: 'EMP003', firstName: 'Murugan', lastName: 'Selvam', department: 'Manager', designation: 'Operations Manager', salary: 55000, contact: '9876543210', address: '12, Anna Nagar, Coimbatore, Tamil Nadu 641001', joinDate: getPastDate(6, 1) },
            { userId: empUser1._id, employeeId: 'EMP004', firstName: 'Rajesh', lastName: 'Kannan', department: 'Employee', designation: 'Staff', salary: 28000, contact: '9876543216', address: '34, Singanallur, Coimbatore, Tamil Nadu 641005', joinDate: getPastDate(2, 5) },
            { userId: salesUser._id, employeeId: 'EMP005', firstName: 'Senthil', lastName: 'Kumar', department: 'Sales', designation: 'Senior Sales Executive', salary: 42000, contact: '9876543212', address: '78, T. Nagar, Chennai, Tamil Nadu 600017', joinDate: getPastDate(4, 15) }
        ];

        const createdEmployees = await Employee.insertMany(employeeDocs);
        console.log(`Seeded ${createdEmployees.length} Employees.`);

        // ===================================================================
        // 4. MATERIALS — Industrial materials with INR pricing
        // ===================================================================
        const materialDocs = [
            { name: 'TMT Steel Bars (12mm)', sku: 'TMT-001', category: 'Construction Steel', quantity: 500, lowStockThreshold: 100, unit: 'kg', price: 62, status: 'In Stock', warehouse: 'Warehouse A', shelf: 'Shelf 1', location: 'Warehouse A / Shelf 1' },
            { name: 'MS Angle (50x50x6)', sku: 'MSA-002', category: 'Structural Steel', quantity: 12, lowStockThreshold: 20, unit: 'pcs', price: 850, status: 'Low Stock', warehouse: 'Warehouse A', shelf: 'Shelf 2', location: 'Warehouse A / Shelf 2' },
            { name: 'Copper Wire (2.5 sqmm)', sku: 'CW-003', category: 'Electrical', quantity: 2000, lowStockThreshold: 500, unit: 'm', price: 18, status: 'In Stock', warehouse: 'Warehouse A', shelf: 'Shelf 3', location: 'Warehouse A / Shelf 3' },
            { name: 'GI Pipes (1 inch)', sku: 'GIP-004', category: 'Plumbing', quantity: 150, lowStockThreshold: 30, unit: 'pcs', price: 420, status: 'In Stock', warehouse: 'Warehouse A', shelf: 'Shelf 4', location: 'Warehouse A / Shelf 4' },
            { name: 'Aluminum Sheet (1mm)', sku: 'ALS-005', category: 'Sheet Metal', quantity: 5, lowStockThreshold: 10, unit: 'pcs', price: 1800, status: 'Low Stock', warehouse: 'Warehouse A', shelf: 'Shelf 5', location: 'Warehouse A / Shelf 5' },
            { name: 'PVC Conduit Pipe (25mm)', sku: 'PVC-006', category: 'Electrical', quantity: 300, lowStockThreshold: 50, unit: 'pcs', price: 45, status: 'In Stock', warehouse: 'Warehouse B', shelf: 'Shelf 1', location: 'Warehouse B / Shelf 1' },
            { name: 'Welding Rod (E6013)', sku: 'WR-007', category: 'Consumables', quantity: 0, lowStockThreshold: 50, unit: 'pcs', price: 5, status: 'Out of Stock', warehouse: 'Warehouse B', shelf: 'Shelf 2', location: 'Warehouse B / Shelf 2' },
            { name: 'Cement (OPC 53 Grade)', sku: 'CEM-008', category: 'Construction', quantity: 200, lowStockThreshold: 50, unit: 'bags', price: 380, status: 'In Stock', warehouse: 'Warehouse B', shelf: 'Shelf 3', location: 'Warehouse B / Shelf 3' },
            { name: 'Sand (River Sand)', sku: 'SND-009', category: 'Construction', quantity: 40, lowStockThreshold: 20, unit: 'cubic ft', price: 65, status: 'In Stock', warehouse: 'Warehouse B', shelf: 'Shelf 4', location: 'Warehouse B / Shelf 4' },
            { name: 'Brass Fittings (0.5 inch)', sku: 'BRF-010', category: 'Plumbing', quantity: 7, lowStockThreshold: 15, unit: 'pcs', price: 120, status: 'Low Stock', warehouse: 'Warehouse B', shelf: 'Shelf 5', location: 'Warehouse B / Shelf 5' },
            { name: 'SS Sheet (304 Grade)', sku: 'SS-011', category: 'Sheet Metal', quantity: 25, lowStockThreshold: 5, unit: 'pcs', price: 3500, status: 'In Stock', warehouse: 'Warehouse A', shelf: 'Shelf 1', location: 'Warehouse A / Shelf 1' },
            { name: 'MCB Switch (32A)', sku: 'MCB-012', category: 'Electrical', quantity: 80, lowStockThreshold: 20, unit: 'pcs', price: 250, status: 'In Stock', warehouse: 'Warehouse A', shelf: 'Shelf 2', location: 'Warehouse A / Shelf 2' }
        ];

        const createdMaterials = await Material.insertMany(materialDocs);
        console.log(`Seeded ${createdMaterials.length} Materials.`);

        // ===================================================================
        // 5. VENDORS — Tamil Nadu based suppliers
        // ===================================================================
        const vendorDocs = [
            { name: 'Sri Lakshmi Steel Traders', contactPerson: 'Ravi Shankar', email: 'ravi@srilakshmisteel.in', phone: '9865432100', address: 'SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021', category: 'Steel & Metals' },
            { name: 'Kumaran Electricals', contactPerson: 'Kumaran M', email: 'kumaran@kumaranelec.in', phone: '9865432101', address: '32, Mettupalayam Road, Coimbatore, Tamil Nadu 641043', category: 'Electrical' },
            { name: 'Thirumurugan Pipes & Fittings', contactPerson: 'Thirumurugan P', email: 'info@tmpipes.co.in', phone: '9865432102', address: '15, Avinashi Road, Tirupur, Tamil Nadu 641602', category: 'Plumbing' },
            { name: 'Madurai Cement Depot', contactPerson: 'Pandian S', email: 'pandian@maduraicement.in', phone: '9865432103', address: '78, Bypass Road, Madurai, Tamil Nadu 625016', category: 'Construction' },
            { name: 'Coimbatore Sheet Metal Works', contactPerson: 'Balamurugan K', email: 'bala@cbesheetmetal.in', phone: '9865432104', address: '5, Ganapathy, Coimbatore, Tamil Nadu 641006', category: 'Sheet Metal' },
            { name: 'Erode Welding Supplies', contactPerson: 'Saravanan R', email: 'saravanan@erodeweld.in', phone: '9865432105', address: '21, Perundurai Road, Erode, Tamil Nadu 638052', category: 'Consumables' }
        ];

        const createdVendors = await Vendor.insertMany(vendorDocs);
        console.log(`Seeded ${createdVendors.length} Vendors.`);

        // ===================================================================
        // 6. CUSTOMERS — Tamil Nadu based companies
        // ===================================================================
        const customerDocs = [
            { name: 'Kovai Builders Pvt Ltd', email: 'info@kovaibuilders.in', phone: '9843210001', company: 'Kovai Builders Pvt Ltd', address: 'Race Course Road, Coimbatore, Tamil Nadu 641018', industry: 'Real Estate', website: 'kovaibuilders.in', status: 'Active', createdBy: salesUser._id },
            { name: 'Madurai Manufacturing Corp', email: 'orders@maduraimfg.co.in', phone: '9843210002', company: 'Madurai Manufacturing Corp', address: '45, Industrial Area, Kappalur, Madurai, Tamil Nadu 625008', industry: 'Manufacturing', website: 'maduraimfg.co.in', status: 'Active', createdBy: salesUser._id },
            { name: 'Trichy Engineering Works', email: 'contact@trichyengg.in', phone: '9843210003', company: 'Trichy Engineering Works', address: '12, BHEL Township, Tiruchirappalli, Tamil Nadu 620014', industry: 'Heavy Engineering', website: 'trichyengg.in', status: 'Active', createdBy: salesUser._id },
            { name: 'Salem Steel Fabricators', email: 'admin@salemsteel.in', phone: '9843210004', company: 'Salem Steel Fabricators', address: '88, Five Roads, Salem, Tamil Nadu 636004', industry: 'Steel Fabrication', website: 'salemsteel.in', status: 'Active', createdBy: salesUser2._id },
            { name: 'Tirupur Textiles & Infra', email: 'info@tirupurtextiles.in', phone: '9843210005', company: 'Tirupur Textiles & Infra', address: 'Kangeyam Road, Tirupur, Tamil Nadu 641604', industry: 'Textile & Construction', website: 'tirupurtextiles.in', status: 'Active', createdBy: salesUser2._id },
            { name: 'Nellai Construction Company', email: 'nellai@nellaicc.in', phone: '9843210006', company: 'Nellai Construction Co', address: '34, South Bypass, Tirunelveli, Tamil Nadu 627001', industry: 'Construction', website: 'nellaicc.in', status: 'Pending Review', createdBy: salesUser._id },
            { name: 'Thanjavur Heritage Builders', email: 'heritage@thanjavurbuild.in', phone: '9843210007', company: 'Thanjavur Heritage Builders', address: '5, Temple Street, Thanjavur, Tamil Nadu 613001', industry: 'Heritage Construction', website: 'thanjavurbuild.in', status: 'Active', createdBy: salesUser2._id },
            { name: 'Vellore Tech Solutions', email: 'tech@velloretech.in', phone: '9843210008', company: 'Vellore Tech Solutions', address: '22, Katpadi Road, Vellore, Tamil Nadu 632007', industry: 'IT Infrastructure', website: 'velloretech.in', status: 'Active', createdBy: salesUser._id }
        ];

        const createdCustomers = await Customer.insertMany(customerDocs);
        console.log(`Seeded ${createdCustomers.length} Customers.`);
        // Removed Lead seeding

        // ===================================================================
        // 8. ORDERS — Sales & Purchase Orders with INR amounts
        // ===================================================================
        const orderDocs = [
            {
                orderNumber: `SO-${today.getFullYear()}-001`,
                customer: createdCustomers[0]._id, // Kovai Builders
                items: [
                    { material: createdMaterials[0]._id, quantity: 200, price: 62 },  // TMT Steel Bars
                    { material: createdMaterials[7]._id, quantity: 100, price: 380 }  // Cement
                ],
                totalAmount: (200 * 62) + (100 * 380),
                status: 'Confirmed',
                orderType: 'sales',
                createdBy: salesUser._id,
                createdAt: getPastDate(3, 10)
            },
            {
                orderNumber: `SO-${today.getFullYear()}-002`,
                customer: createdCustomers[1]._id, // Madurai Mfg
                items: [
                    { material: createdMaterials[10]._id, quantity: 10, price: 3500 }, // SS Sheet
                    { material: createdMaterials[2]._id, quantity: 500, price: 18 }    // Copper Wire
                ],
                totalAmount: (10 * 3500) + (500 * 18),
                status: 'Shipped',
                orderType: 'sales',
                createdBy: salesUser._id,
                createdAt: getPastDate(2, 5)
            },
            {
                orderNumber: `SO-${today.getFullYear()}-003`,
                customer: createdCustomers[2]._id, // Trichy Engineering
                items: [
                    { material: createdMaterials[1]._id, quantity: 30, price: 850 }  // MS Angle
                ],
                totalAmount: (30 * 850),
                status: 'Pending',
                orderType: 'sales',
                createdBy: salesUser2._id,
                createdAt: getPastDate(2, 20)
            },
            {
                orderNumber: `SO-${today.getFullYear()}-004`,
                customer: createdCustomers[3]._id, // Salem Steel
                items: [
                    { material: createdMaterials[0]._id, quantity: 100, price: 62 },  // TMT Steel
                    { material: createdMaterials[6]._id, quantity: 200, price: 5 }    // Welding Rod
                ],
                totalAmount: (100 * 62) + (200 * 5),
                status: 'Confirmed',
                orderType: 'sales',
                createdBy: salesUser2._id,
                createdAt: getPastDate(1, 8)
            },
            {
                orderNumber: `SO-${today.getFullYear()}-005`,
                customer: createdCustomers[4]._id, // Tirupur Textiles
                items: [
                    { material: createdMaterials[3]._id, quantity: 50, price: 420 },  // GI Pipes
                    { material: createdMaterials[5]._id, quantity: 100, price: 45 }   // PVC Conduit
                ],
                totalAmount: (50 * 420) + (100 * 45),
                status: 'Delivered',
                orderType: 'sales',
                createdBy: salesUser._id,
                createdAt: getPastDate(1, 18)
            },
            {
                orderNumber: `PO-${today.getFullYear()}-001`,
                vendor: createdVendors[0]._id, // Sri Lakshmi Steel
                items: [
                    { material: createdMaterials[0]._id, quantity: 500, price: 55 },  // TMT Steel wholesale
                    { material: createdMaterials[1]._id, quantity: 50, price: 720 }   // MS Angle wholesale
                ],
                totalAmount: (500 * 55) + (50 * 720),
                status: 'Delivered',
                orderType: 'purchase',
                createdBy: managerUser._id,
                createdAt: getPastDate(0, 5)
            },
            {
                orderNumber: `PO-${today.getFullYear()}-002`,
                vendor: createdVendors[1]._id, // Kumaran Electricals
                items: [
                    { material: createdMaterials[2]._id, quantity: 1000, price: 15 }, // Copper Wire
                    { material: createdMaterials[11]._id, quantity: 50, price: 200 }  // MCB Switch
                ],
                totalAmount: (1000 * 15) + (50 * 200),
                status: 'Confirmed',
                orderType: 'purchase',
                createdBy: managerUser._id,
                createdAt: getPastDate(0, 12)
            },
            {
                orderNumber: `PO-${today.getFullYear()}-003`,
                vendor: createdVendors[3]._id, // Madurai Cement
                items: [
                    { material: createdMaterials[7]._id, quantity: 200, price: 340 }  // Cement bulk
                ],
                totalAmount: (200 * 340),
                status: 'Awaiting Approval',
                orderType: 'purchase',
                createdBy: managerUser2._id,
                createdAt: getPastDate(0, 18)
            },
            {
                orderNumber: `PO-${today.getFullYear()}-004`,
                vendor: createdVendors[5]._id, // Erode Welding
                items: [
                    { material: createdMaterials[6]._id, quantity: 500, price: 3.5 }  // Welding Rod
                ],
                totalAmount: (500 * 3.5),
                status: 'Approved',
                orderType: 'purchase',
                createdBy: managerUser._id,
                createdAt: getPastDate(0, 22)
            }
        ];

        const createdOrders = await Order.insertMany(orderDocs);
        console.log(`Seeded ${createdOrders.length} Sales & Purchase Orders.`);

        // ===================================================================
        // 9. ATTENDANCE — Last 10 working days
        // ===================================================================
        const attendanceDocs = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            for (const emp of createdEmployees) {
                // Simulate some realistic variations
                if (emp.firstName === 'Murugan' && i === 3) {
                    attendanceDocs.push({ userId: emp.userId || emp.userIdField, employee: emp._id, date, status: 'Leave' });
                    continue;
                }
                if (emp.firstName === 'Senthil' && i === 5) {
                    attendanceDocs.push({ userId: emp.userId || emp.userIdField, employee: emp._id, date, status: 'Absent' });
                    continue;
                }
                if (emp.firstName === 'Rajesh' && i === 7) {
                    attendanceDocs.push({ userId: emp.userId || emp.userIdField, employee: emp._id, date, status: 'Leave' });
                    continue;
                }
                if (emp.firstName === 'Saranya' && i === 2) {
                    attendanceDocs.push({ userId: emp.userId || emp.userIdField, employee: emp._id, date, status: 'Absent' });
                    continue;
                }

                const isLate = Math.random() > 0.85;
                attendanceDocs.push({
                    userId: emp.userId || emp.userIdField,
                    employee: emp._id,
                    date,
                    status: isLate ? 'Late' : 'Present',
                    checkIn: isLate ? '10:15 AM' : '09:00 AM',
                    checkOut: '06:00 PM'
                });
            }
        }

        const seededAttendance = await Attendance.insertMany(attendanceDocs);
        console.log(`Seeded ${seededAttendance.length} Attendance log entries.`);

        // ===================================================================
        // 10. LEAVES
        // ===================================================================
        const leaveDocs = [
            {
                employee: createdEmployees[0]._id, // Admin
                type: 'Sick',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
                reason: 'Fever and body pain',
                status: 'Approved',
                reviewedBy: hrUser._id,
                reviewNote: 'Approved. Medical certificate received.'
            },
            {
                employee: createdEmployees[1]._id, // HR
                type: 'Casual',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
                reason: 'Family function at Thanjavur',
                status: 'Approved',
                reviewedBy: hrUser._id,
                reviewNote: 'Permitted.'
            },
            {
                employee: createdEmployees[2]._id, // Manager
                type: 'Annual',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
                reason: 'Family vacation to Kerala',
                status: 'Pending'
            },
            {
                employee: createdEmployees[3]._id, // Employee
                type: 'Sick',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                reason: 'Dental appointment at KG Hospital, Coimbatore',
                status: 'Approved',
                reviewedBy: adminUser._id,
                reviewNote: 'Half-day approved.'
            },
            {
                employee: createdEmployees[4]._id, // Sales
                type: 'Casual',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                reason: 'Personal work - vehicle registration at RTO',
                status: 'Pending'
            },
            {
                employee: createdEmployees[0]._id, // Admin
                type: 'Unpaid',
                startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
                endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20),
                reason: 'Village temple festival at Kumbakonam',
                status: 'Pending'
            }
        ];

        const createdLeaves = await Leave.insertMany(leaveDocs);
        console.log(`Seeded ${createdLeaves.length} Leave requests.`);

        // ===================================================================
        // 11. SALARIES — Indian payroll with INR amounts
        // ===================================================================
        const salaryDocs = [];
        // Last month salaries — realistic mix of statuses
        for (let i = 0; i < createdEmployees.length; i++) {
            const emp = createdEmployees[i];
            const isPaid = i < 6;       // First 6 employees were paid last month
            const isApproved = i >= 6 && i < 8;  // Next 2 are approved but not yet paid
            // Remaining (9-10) are still awaiting approval

            salaryDocs.push({
                employee: emp._id,
                month: lastMonthName,
                basicSalary: emp.salary,
                allowances: Math.round(emp.salary * 0.15),
                deductions: Math.round(emp.salary * 0.05),
                netSalary: emp.salary + Math.round(emp.salary * 0.15) - Math.round(emp.salary * 0.05),
                status: isPaid ? 'Paid' : isApproved ? 'Approved' : 'Awaiting Approval',
                paymentDate: isPaid ? getPastDate(0, 1) : null,
                transactionId: isPaid ? `TXN-${monthNames[lastMonthDate.getMonth()].toUpperCase()}-${emp.employeeId}` : null
            });
        }
        // This month — all awaiting approval (payroll not yet processed)
        for (let i = 0; i < createdEmployees.length; i++) {
            const emp = createdEmployees[i];
            salaryDocs.push({
                employee: emp._id,
                month: thisMonthName,
                basicSalary: emp.salary,
                allowances: Math.round(emp.salary * 0.15),
                deductions: Math.round(emp.salary * 0.04),
                netSalary: emp.salary + Math.round(emp.salary * 0.15) - Math.round(emp.salary * 0.04),
                status: 'Awaiting Approval'
            });
        }

        const createdSalaries = await Salary.insertMany(salaryDocs);
        console.log(`Seeded ${createdSalaries.length} Salary payroll slips.`);

        // ===================================================================
        // 12. TASKS
        // ===================================================================
        const taskDocs = [
            {
                title: 'Organize Warehouse for TMT Steel Delivery',
                description: 'Clear section B in the Singanallur warehouse to accommodate 500 kg TMT steel rods arriving from Sri Lakshmi Steel Traders.',
                assignedTo: [empUser1._id],
                assignedBy: managerUser._id,
                completions: [{ user: empUser1._id, status: 'In Progress' }],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                isBroadcast: false
            },
            {
                title: 'Follow up with Hosur Auto Components',
                description: 'Hosur Auto requested revised quotation for SS Sheets and Copper Wires. Prepare and send updated pricing.',
                assignedTo: [salesUser._id],
                assignedBy: managerUser._id,
                completions: [{ user: salesUser._id, status: 'Pending' }],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                isBroadcast: false
            },
            {
                title: 'Conduct Monthly Safety Drill - Coimbatore Factory',
                description: 'All factory employees must participate in the fire safety drill at 10:00 AM on Monday at the Singanallur factory premises.',
                assignedTo: createdUsers.filter(u => ['Employee', 'Manager'].includes(u.role)).map(u => u._id),
                assignedBy: adminUser._id,
                completions: createdUsers.filter(u => ['Employee', 'Manager'].includes(u.role)).map(u => ({ user: u._id, status: 'Completed' })),
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
                isBroadcast: true
            },
            {
                title: 'Physical Stock Audit - Low Stock Items',
                description: 'Conduct physical count verification for MS Angle, Aluminum Sheet, and Brass Fittings which are below threshold.',
                assignedTo: [empUser1._id, empUser2._id],
                assignedBy: managerUser._id,
                completions: [
                    { user: empUser1._id, status: 'Completed' },
                    { user: empUser2._id, status: 'In Progress' }
                ],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                isBroadcast: false
            },
            {
                title: `Submit ${thisMonthName} Departmental Reports`,
                description: 'All department heads must submit monthly performance summaries to the admin office by end of this week.',
                assignedTo: [managerUser._id, managerUser2._id, hrUser._id, salesUser._id],
                assignedBy: adminUser._id,
                completions: [
                    { user: managerUser._id, status: 'Pending' },
                    { user: managerUser2._id, status: 'In Progress' },
                    { user: hrUser._id, status: 'Completed' },
                    { user: salesUser._id, status: 'Pending' }
                ],
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
                isBroadcast: false
            },
            {
                title: 'Prepare Quotation for Nellai Construction',
                description: 'Nellai Construction Company has requested bulk quotation for TMT bars, cement, and sand. Prepare and send within 2 days.',
                assignedTo: [salesUser2._id],
                assignedBy: managerUser._id,
                completions: [{ user: salesUser2._id, status: 'Pending' }],
                priority: 'Medium',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                isBroadcast: false
            },
            {
                title: 'Update Employee Contact Records',
                description: 'Verify and update all employee phone numbers and emergency contacts in the HRMS system.',
                assignedTo: [hrUser._id, hrUser2._id],
                assignedBy: adminUser._id,
                completions: [
                    { user: hrUser._id, status: 'In Progress' },
                    { user: hrUser2._id, status: 'Pending' }
                ],
                priority: 'Low',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
                isBroadcast: false
            },
            {
                title: 'Dispatch Coordination - Salem Steel Order',
                description: `Coordinate with logistics partner for SO-${today.getFullYear()}-004 delivery to Salem Steel Fabricators. Confirm dispatch date and tracking.`,
                assignedTo: [empUser3._id],
                assignedBy: managerUser2._id,
                completions: [{ user: empUser3._id, status: 'In Progress' }],
                priority: 'High',
                dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                isBroadcast: false
            }
        ];

        const createdTasks = await Task.insertMany(taskDocs);
        console.log(`Seeded ${createdTasks.length} Operations Tasks.`);

        // ===================================================================
        // 13. NOTIFICATIONS
        // ===================================================================
        const notificationDocs = [
            {
                user: null,
                title: 'Low Stock Alert - MS Angle',
                message: 'MS Angle (50x50x6) stock is at 12 pcs, below the threshold of 20. Place a purchase order immediately.',
                type: 'warning',
                module: 'stock',
                isRead: false,
                link: '/materials'
            },
            {
                user: null,
                title: 'Out of Stock - Welding Rod',
                message: 'Welding Rod (E6013) is completely out of stock. Production line may be affected.',
                type: 'error',
                module: 'stock',
                isRead: false,
                link: '/materials'
            },
            {
                user: null,
                title: 'Low Stock Alert - Aluminum Sheet',
                message: 'Aluminum Sheet (1mm) stock is at 5 pcs, below the threshold of 10.',
                type: 'warning',
                module: 'stock',
                isRead: false,
                link: '/materials'
            },
            {
                user: adminUser._id,
                title: 'Leave Request Pending',
                message: 'Divya Prakash has requested 7 days of annual leave starting next week. Review required.',
                type: 'info',
                module: 'hr',
                isRead: false,
                link: '/leave-management'
            },
            {
                user: adminUser._id,
                title: `${thisMonthName} Payroll Ready for Approval`,
                message: `10 salary slips for ${thisMonthName} have been generated and are pending admin approval.`,
                type: 'info',
                module: 'hr',
                isRead: false,
                link: '/payroll'
            },
            {
                user: managerUser._id,
                title: 'Purchase Order Delivered',
                message: `PO-${today.getFullYear()}-001 from Sri Lakshmi Steel Traders has been delivered and verified. 500 kg TMT Steel added to inventory.`,
                type: 'success',
                module: 'order',
                isRead: false,
                link: '/erp'
            },
            {
                user: salesUser._id,
                title: 'New Lead Assigned',
                message: 'New lead "Ramanathapuram Fisheries" has been assigned to you. Estimated deal value: Rs.4,10,000.',
                type: 'info',
                module: 'general',
                isRead: false,
                link: '/crm'
            },
            {
                user: null,
                title: 'System Maintenance Notice',
                message: 'SMTBMS will undergo scheduled maintenance on Sunday 12:00 AM - 4:00 AM IST. Plan your work accordingly.',
                type: 'info',
                module: 'system',
                isRead: false
            }
        ];

        const seededNotifications = await Notification.insertMany(notificationDocs);
        console.log(`Seeded ${seededNotifications.length} System Notifications.`);

        // Removed FollowUp

        // ===================================================================
        // 15. CUSTOMER SUPPORT TICKETS
        // ===================================================================
        const ticketDocs = [
            { ticketNumber: 'TIC-203512', customer: createdCustomers[0]._id, subject: 'Delayed cement delivery', description: 'Order SO-2026-001 has cement bags which have not arrived at Coimbatore warehouse yet.', priority: 'High', status: 'Open', assignedTo: adminUser._id },
            { ticketNumber: 'TIC-948123', customer: createdCustomers[1]._id, subject: 'Wrong SKU invoice quantity', description: 'Invoice total counts 12 SS Sheets, but only 10 were delivered. Adjust credit ledger.', priority: 'Medium', status: 'In Progress', assignedTo: managerUser._id },
            { ticketNumber: 'TIC-731054', customer: createdCustomers[2]._id, subject: 'Assistance with vendor details', description: 'Require complete contact person portfolio for Sri Lakshmi Steel Traders.', priority: 'Low', status: 'Resolved', assignedTo: hrUser._id }
        ];
        const seededTickets = await Ticket.insertMany(ticketDocs);
        console.log(`Seeded ${seededTickets.length} Customer Support Tickets.`);

        // ===================================================================
        // 16. COMMUNICATION LOGS
        // ===================================================================
        const commDocs = [
            { customerId: createdCustomers[0]._id, userId: salesUser._id, type: 'Call', direction: 'Outbound', status: 'Completed', subject: 'Requirement Gathering', notes: 'Discussed monthly requirement of TMT bars.', date: new Date() },
            { customerId: createdCustomers[1]._id, userId: hrUser._id, type: 'Email', direction: 'Outbound', status: 'Completed', subject: 'Invoice Followup', notes: 'Sent invoice for the recent order.', date: new Date() }
        ];
        const seededComms = await CommunicationLog.insertMany(commDocs);
        console.log(`Seeded ${seededComms.length} Communication Logs.`);

        // ===================================================================
        // 17. MATERIAL MOVEMENTS
        // ===================================================================
        const movementDocs = [
            { materialId: createdMaterials[0]._id, type: 'In', quantity: 50, previousQuantity: 200, newQuantity: 250, reason: 'Initial Stock Audit', performedBy: adminUser._id },
            { materialId: createdMaterials[1]._id, type: 'Out', quantity: 10, previousQuantity: 100, newQuantity: 90, reason: 'Sales Order SO-2026-001', performedBy: salesUser._id }
        ];
        const seededMovements = await MaterialMovement.insertMany(movementDocs);
        console.log(`Seeded ${seededMovements.length} Material Movements.`);

        // ===================================================================
        // 18. AUDIT LOGS
        // ===================================================================
        const auditDocs = [
            { user: adminUser._id, action: 'CREATE', module: 'System', targetId: adminUser._id, description: 'System initialized and seeded data.', ipAddress: '127.0.0.1' }
        ];
        const seededAudits = await AuditLog.insertMany(auditDocs);
        console.log(`Seeded ${seededAudits.length} Audit Logs.`);

        console.log('\n========================================');
        console.log('  DATABASE SEEDING COMPLETED SUCCESSFULLY');
        console.log('========================================');
        console.log('\nLogin Credentials:');
        console.log('  Admin:    admin@smtbms.com / admin123');
        console.log('  HR:       hr@smtbms.com / hr123');
        console.log('  Manager:  manager@smtbms.com / manager123');
        console.log('  Sales:    sales@smtbms.com / sales123');
        console.log('  Employee: employee@smtbms.com / employee123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding process failed:', error);
        process.exit(1);
    }
};

seedData();
