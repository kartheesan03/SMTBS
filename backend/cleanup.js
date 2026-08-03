const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const Lead = require('./src/models/Lead');
const Vendor = require('./src/models/Vendor');

dotenv.config();

const runCleanup = async () => {
    try {
        await connectDB();
        console.log('Connected to DB for cleanup');

        
        const leads = await Lead.find({});
        for (let lead of leads) {
            let updated = false;
            let currentStatus = lead.status || '';

            if (currentStatus.toUpperCase().includes('VENDOR')) {
                lead.status = 'Converted To Customer';
                updated = true;
            }
            
            if (currentStatus.toUpperCase().includes('FROM_LEAD') || currentStatus.toUpperCase().includes('FROM LEAD')) {
                lead.status = 'Converted To Customer';
                updated = true;
            }

            if (['New Lead', 'Lost', 'NEW LEAD', 'LOST'].includes(currentStatus)) {
                lead.status = 'Initial Contact';
                updated = true;
            }

            if (updated) {
                await lead.save();
                console.log(`Updated lead ${lead._id} to ${lead.status}`);
            }
        }
        
        console.log('Cleanup complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runCleanup();
