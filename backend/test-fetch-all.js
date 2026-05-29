const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

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
const FollowUp = require('./src/models/FollowUp');
const Ticket = require('./src/models/Ticket');

dotenv.config();

const testFetchAll = async () => {
    try {
        console.log('Initializing database connection...');
        const success = await connectDB();
        if (!success) {
            console.error('Database connection failed. Aborting fetch test.');
            process.exit(1);
        }
        console.log('Database connected successfully.\n');

        const models = [
            { name: 'User', model: User },
            { name: 'Material', model: Material },
            { name: 'Employee', model: Employee },
            { name: 'Customer', model: Customer },
            { name: 'Lead', model: Lead },
            { name: 'Vendor', model: Vendor },
            { name: 'Order', model: Order },
            { name: 'Attendance', model: Attendance },
            { name: 'Leave', model: Leave },
            { name: 'Salary', model: Salary },
            { name: 'Task', model: Task },
            { name: 'Notification', model: Notification },
            { name: 'FollowUp', model: FollowUp },
            { name: 'Ticket', model: Ticket }
        ];

        console.log('===================================================');
        console.log('    FETCHING ALL DATA VIA MONGOOSE BRIDGE MODELS   ');
        console.log('===================================================\n');

        for (const item of models) {
            try {
                const records = await item.model.find({});
                console.log(`✓ ${item.name.padEnd(15)}: Found ${records.length} records.`);
                if (records.length > 0) {
                    // Show a sample key set or first record
                    const sample = records[0];
                    console.log(`   Sample keys: ${Object.keys(sample._doc || sample).join(', ')}`);
                }
            } catch (err) {
                console.error(`✗ Error fetching ${item.name}:`, err.message);
            }
            console.log('---------------------------------------------------');
        }

        // Test populate logic specifically on Tickets
        console.log('\n===================================================');
        console.log('    TESTING POPULATE ON TICKETS                    ');
        console.log('===================================================\n');
        try {
            const tickets = await Ticket.find({})
                .populate('customer', 'name email company')
                .populate('assignedTo', 'name role');
            
            console.log(`✓ Fetched ${tickets.length} tickets with populated relations.`);
            if (tickets.length > 0) {
                const sampleTicket = tickets[0];
                console.log(`Sample Ticket #${sampleTicket.ticketNumber}:`);
                console.log(`  Subject:     ${sampleTicket.subject}`);
                console.log(`  Priority:    ${sampleTicket.priority}`);
                console.log(`  Status:      ${sampleTicket.status}`);
                console.log(`  Customer:    `, sampleTicket.customer ? {
                    id: sampleTicket.customer._id || sampleTicket.customer.id,
                    name: sampleTicket.customer.name,
                    email: sampleTicket.customer.email
                } : 'NULL');
                console.log(`  Assigned To: `, sampleTicket.assignedTo ? {
                    id: sampleTicket.assignedTo._id || sampleTicket.assignedTo.id,
                    name: sampleTicket.assignedTo.name,
                    role: sampleTicket.assignedTo.role
                } : 'NULL');
            }
        } catch (err) {
            console.error('✗ Populate test error:', err.message);
        }

        console.log('\n===================================================');
        console.log('    TEST COMPLETED SUCCESSFULLY                    ');
        console.log('===================================================');

        process.exit(0);
    } catch (error) {
        console.error('Fetch test failed:', error);
        process.exit(1);
    }
};

testFetchAll();
