import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['Leave Application', 'Work From Home', 'Half Day'],
            required: true
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        message: { type: String },
        recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actionDate: { type: Date }
    },
    { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);
export default Request;
