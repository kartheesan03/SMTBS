const sequelize = require('./src/config/sequelize');
const Attendance = require('./src/models/Attendance');

async function checkModels() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        const att = await Attendance.find();
        console.log("Attendance fields:", att.length ? Object.keys(att[0].dataValues) : "empty");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
checkModels();
