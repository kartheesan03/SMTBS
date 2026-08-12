require('dotenv').config();
const sequelize = require('./src/config/sequelize');
const Ticket = require('./src/models/Ticket');

async function testFind() {
    try {
        const tickets = await Ticket.find({}).populate('submittedBy', 'name email role picture').sort({ createdAt: -1 });
        console.log("Tickets found:", tickets.length);
        if (tickets.length > 0) {
            console.log("First ticket:", JSON.stringify(tickets[0], null, 2));
        }
    } catch (err) {
        console.error('Error in Ticket.find:', err);
    } finally {
        process.exit(0);
    }
}

testFind();
