import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['Leave Application', 'Work From Home', 'Half Day', 'Comp Off', 'Leave Cancellation', 'Attendance Regularization'],
            required: true
        },
        leaveType: {
            type: String,
            enum: ['Paid', 'Sick', 'Casual', 'Unpaid']
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        associatedLeave: { type: mongoose.Schema.Types.ObjectId, ref: 'Leave' },
        associatedAttendance: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
        cancelDates: [{ type: Date }],
        message: { type: String },
        recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actionDate: { type: Date },
        actionNote: { type: String }
    },
    { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);
export default Request;
