import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

dotenv.config();

connectDB();
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET, 'Length:', process.env.JWT_SECRET?.length);

import './cron/attendanceJobs.js'; // Initialize cron jobs

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payslipRoutes from './routes/payslipRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import slackRoutes from './routes/slackRoutes.js';

// Testing Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/slack', slackRoutes);

// Default Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
