import mongoose from 'mongoose';
import User from './backend/models/User.js';
import Leave from './backend/models/Leave.js';
import Attendance from './backend/models/Attendance.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const internCount = await User.countDocuments({ role: 'Intern' });
        console.log(`Total Interns: ${internCount}`);

        const interns = await User.find({ role: 'Intern' }).select('name role');
        console.log('Interns:', interns);

        const leaveCount = await Leave.countDocuments({});
        console.log(`Total Leaves: ${leaveCount}`);

        const approvedLeavesToday = await Leave.countDocuments({
            status: 'Approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        console.log(`Approved Leaves Today: ${approvedLeavesToday}`);

        const attendanceCountToday = await Attendance.countDocuments({
            date: { $gte: new Date().setHours(0, 0, 0, 0) }
        });
        console.log(`Attendance Records Today: ${attendanceCountToday}`);

        const marchAttendance = await Attendance.countDocuments({
            date: { $gte: new Date('2026-03-01'), $lte: new Date('2026-03-31') }
        });
        console.log(`Attendance Records March 2026: ${marchAttendance}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
