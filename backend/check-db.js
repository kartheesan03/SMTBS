require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: { connectTimeout: 60000 },
    define: { freezeTableName: true }
});

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING }
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");
        const user = await User.findOne({ where: { email: 'admin@smtbms.com' }});
        console.log("User:", user ? user.toJSON() : null);
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
run();
