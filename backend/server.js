const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
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
const trainingRoutes = require('./src/routes/trainingRoutes');
const holidayRoutes  = require('./src/routes/holidayRoutes');
const recruitmentRoutes = require('./src/routes/recruitmentRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const ocrRoutes = require('./src/routes/ocrRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const ocrDocumentRoutes = require('./src/routes/ocrDocumentRoutes');
const socialRoutes = require('./src/routes/socialRoutes');
const feedRoutes = require('./src/routes/feedRoutes');

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin} is not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
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
app.use('/api/training', trainingRoutes);
app.use('/api/holidays',    holidayRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ocr-documents', ocrDocumentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/feed', feedRoutes);

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

const { autoMarkAbsent } = require('./src/controllers/attendancecontroller');

const startServer = async () => {
    try {
        await connectDB();
        const gpsSimulator = require('./src/services/gpsSimulator');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            
            try {
                gpsSimulator.start();
            } catch (gpsErr) {
                console.error('GPS Simulator failed to start:', gpsErr);
            }

            const cron = require('node-cron');
            cron.schedule('0 18 * * *', () => {
                console.log('Running autoMarkAbsent cron job');
                if (typeof autoMarkAbsent === 'function') autoMarkAbsent();
            }, {
                scheduled: true,
                timezone: "Asia/Kolkata"
            });
        });
    } catch (error) {
        console.error(`Failed to start server normally: ${error.message}`);
        // Fallback to ensure Railway port binds even if DB completely fails
        app.get('*', (req, res) => res.status(500).send(`Startup Error: ${error.message}`));
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Fallback server running on port ${PORT}`);
        });
    }
};

process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
