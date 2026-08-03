const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('../src/models/Notification');
const Order = require('../src/models/Order');

dotenv.config({ path: '.env' });

const cleanNotifications = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smtbs';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected');
        
        const sequelize = require('../src/config/sequelize');
        await sequelize.authenticate();
        await sequelize.models.Notification.sync({ alter: true });
        console.log('Sequelize Connected & Synced');

        const notifications = await Notification.find({ category: 'order' });
        console.log(`Found ${notifications.length} order notifications.`);

        let deletedCount = 0;
        for (const notif of notifications) {
            let shouldDelete = false;

            if (!notif.payload || !notif.payload.order_id) {
                shouldDelete = true;
            } else {
                try {
                    const orderExists = await Order.findById(notif.payload.order_id);
                    if (!orderExists) {
                        shouldDelete = true;
                    }
                } catch (e) {
                    shouldDelete = true;
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
