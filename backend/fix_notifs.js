require('dotenv').config();
const Notification = require('./src/models/Notification');
const sequelize = require('./src/config/sequelize');

async function fix() {
    await sequelize.authenticate();
    
    // bridged model find returns objects we can mutate and .save()
    const notifs = await Notification.find({ module: 'Attendance' });
    let updated = 0;
    
    for (const n of notifs) {
        if (n.message && n.message.includes('checked in at')) {
            n.message = n.message.replace(/checked in at .*?\. Status:/, 'checked in. Status:');
            await n.save();
            updated++;
        } else if (n.message && n.message.includes('checked out at')) {
            n.message = n.message.replace(/checked out at .*\./, 'checked out.');
            await n.save();
            updated++;
        }
    }
    
    console.log(`Updated ${updated} notifications`);
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
