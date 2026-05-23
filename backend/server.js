const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const leadRoutes = require('./routes/leadRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();
connectDB();

const app = express();

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
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handling Middleware
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

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
