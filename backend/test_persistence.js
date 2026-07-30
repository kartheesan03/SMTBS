const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

async function test() {
    try {
        const user = await User.findOne({ email: 'employee@smtbms.com' });
        console.log("Current name in DB:", user.name);

        user.name = "Persistent Name Test";
        await user.save();
        
        console.log("Saved.");

        const user2 = await User.findOne({ email: 'employee@smtbms.com' });
        console.log("Name in DB after save:", user2.name);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
