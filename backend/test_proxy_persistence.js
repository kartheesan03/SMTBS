const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

async function test() {
    try {
        // 1. Get user via findById (simulate authMiddleware)
        const user = await User.findById(4); // assuming ID 4 is an employee
        if (!user) {
            console.log("User not found");
            process.exit(0);
        }
        console.log("1. User from DB:", user.name);

        // 2. Modify through proxy (simulate authController)
        user.name = "Updated Name " + Date.now();
        
        // Let's check if Sequelize tracks the change
        console.log("2. Is changed?", user.changed());
        
        // 3. Save
        await user.save();
        console.log("3. Saved.");

        // 4. Fetch again to verify
        const verifyUser = await User.findById(4);
        console.log("4. Verified name from DB:", verifyUser.name);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
