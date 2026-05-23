const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error details:');
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code}`);
        console.error(`Stack: ${error.stack}`);
        process.exit(1);
    }
};

module.exports = connectDB;
