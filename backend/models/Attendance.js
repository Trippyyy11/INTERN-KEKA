import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true }, // Store the day of attendance (e.g. 2026-03-06)
        clockInTime: { type: Date },
        clockInMessage: { type: String, default: '' },
        clockOutTime: { type: Date },
        clockOutMessage: { type: String, default: '' },
        clockInLocation: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String }
        },
        clockOutLocation: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String }
        },
        status: { type: String, enum: ['Present', 'Absent', 'WFH', 'Leave', 'On Leave', 'Holiday'], default: 'Present' },
        workingMode: { type: String, enum: ['On-site', 'Remote'], default: 'On-site' },
        totalHours: { type: Number, default: 0 },
        isLate: { type: Boolean, default: false },
        breaks: [
            {
                startTime: { type: Date, required: true },
                endTime: { type: Date }
            }
        ],
        autoClockOut: { type: Boolean, default: false },
        originalClockInTime: { type: Date },
        originalClockOutTime: { type: Date }
    },
    { timestamps: true }
);

// Create index to optimize lookups
attendanceSchema.index({ user: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
