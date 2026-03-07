import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true }, // Store the day of attendance (e.g. 2026-03-06)
        clockInTime: { type: Date },
        clockOutTime: { type: Date },
        status: { type: String, enum: ['Present', 'Absent', 'WFH', 'Leave', 'Holiday'], default: 'Present' },
        workingMode: { type: String, enum: ['On-site', 'Remote'], default: 'On-site' },
        totalHours: { type: Number, default: 0 },
        isLate: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
