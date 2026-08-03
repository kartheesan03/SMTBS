const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

async function test() {
    try {
        const user = await User.findById(4);
        if (!user) {
            console.log("User not found");
            process.exit(0);
        }
        console.log("1. User from DB:", user.name);

        user.name = "Updated Name " + Date.now();
        
        console.log("2. Is changed?", user.changed());
        
        await user.save();
        console.log("3. Saved.");

        const verifyUser = await User.findById(4);
        console.log("4. Verified name from DB:", verifyUser.name);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
