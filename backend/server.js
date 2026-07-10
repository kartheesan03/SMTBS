const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const salaryRoutes = require('./src/routes/salaryRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const erpRoutes = require('./src/routes/erpRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');
const auditRoutes = require('./src/routes/auditRoutes');
const stockRequestRoutes = require('./src/routes/stockRequestRoutes');
const backupRoutes = require('./src/routes/backupRoutes');
const systemRoutes = require('./src/routes/systemRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const quotationRoutes = require('./src/routes/quotationRoutes');
const salesGoalRoutes = require('./src/routes/salesGoalRoutes');
const locationRoutes = require('./src/routes/locationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stock-requests', stockRequestRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sales-goals', salesGoalRoutes);

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const { autoMarkAbsent } = require('./src/controllers/attendanceController');

const startServer = async () => {
    try {
        await connectDB();
        const gpsSimulator = require('./src/services/gpsSimulator');
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            
            // Start GPS Simulation engine
            gpsSimulator.start();

            // Start the background job for marking absentees at 6:00 PM IST
            const cron = require('node-cron');
            cron.schedule('0 18 * * *', () => {
                console.log('Running autoMarkAbsent cron job');
                autoMarkAbsent();
            }, {
                scheduled: true,
                timezone: "Asia/Kolkata"
            });
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
