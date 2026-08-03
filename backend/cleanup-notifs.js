const mongoose = require('mongoose');
const sequelize = require('./src/config/sequelize');
const Notification = require('./src/models/Notification');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const notifs = await Notification.find();
        console.log('Total notifications:', notifs.length);

        let duplicates = 0;
        const seen = new Set();
        const toDelete = [];

        notifs.sort((a, b) => b.id - a.id);

        for (const n of notifs) {
            const sig = `${n.title}|${n.message}|${n.userId}`;
            if (seen.has(sig)) {
                duplicates++;
                toDelete.push(n.id);
            } else {
                seen.add(sig);
            }
        }

        console.log('Found duplicates:', duplicates);

        if (toDelete.length > 0) {
            for (const id of toDelete) {
                await Notification.deleteOne({ id });
            }
            console.log(`Successfully deleted ${toDelete.length} duplicate notifications.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
})();
