require('dotenv').config();
const sequelize = require('./src/config/sequelize');
const { processChatMessage } = require('./src/services/aiService');
const User = require('./src/models/User').sequelizeModel;
const associations = require('./src/models/associations');

async function run() {
    try {
        await sequelize.authenticate();
        associations();
        
        let user = await User.findOne({ where: { role: 'Admin' } });
        if (!user) {
            user = await User.create({ name: 'Admin Test', email: 'admin@test.com', role: 'Admin' });
        }

        console.log("Testing Intent: ATTENDANCE");
        let result = await processChatMessage(user, "Show today's attendance", null);
        console.log("Response:", JSON.stringify(result, null, 2));

        console.log("\nTesting Intent: SALES");
        result = await processChatMessage(user, "Sales this month", null);
        console.log("Response:", JSON.stringify(result, null, 2));
        
        console.log("\nTesting Intent: INVENTORY");
        result = await processChatMessage(user, "Inventory status", null);
        console.log("Response:", JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

run();
