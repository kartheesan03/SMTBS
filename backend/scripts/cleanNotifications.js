const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('../src/models/Notification');
const Order = require('../src/models/Order');

dotenv.config({ path: '.env' }); // Load env variables

const cleanNotifications = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smtbs';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');
        
        const sequelize = require('../src/config/sequelize');
        await sequelize.authenticate();
        await sequelize.models.Notification.sync({ alter: true });
        console.log('Sequelize Connected & Synced');

        // Fetch all order notifications
        const notifications = await Notification.find({ category: 'order' });
        console.log(`Found ${notifications.length} order notifications.`);

        let deletedCount = 0;
        for (const notif of notifications) {
            let shouldDelete = false;

            // Delete if no payload or no order_id in payload
            if (!notif.payload || !notif.payload.order_id) {
                shouldDelete = true;
            } else {
                // Delete if the order no longer exists in DB
                try {
                    const orderExists = await Order.findById(notif.payload.order_id);
                    if (!orderExists) {
                        shouldDelete = true;
                    }
                } catch (e) {
                    shouldDelete = true; // Invalid order ID format
                }
            }

            if (shouldDelete) {
                await Notification.findByIdAndDelete(notif._id);
                deletedCount++;
            }
        }

        console.log(`Deleted ${deletedCount} invalid or orphaned order notifications.`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning notifications:', error);
        process.exit(1);
    }
};

cleanNotifications();
