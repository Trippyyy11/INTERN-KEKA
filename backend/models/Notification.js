import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['leave_applied', 'leave_approved', 'leave_rejected', 'clock_in_reminder', 'request_received', 'request_approved', 'request_rejected', 'announcement', 'general'],
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        relatedId: { type: mongoose.Schema.Types.ObjectId },  // ID of related leave/request/etc.
        relatedModel: { type: String }  // 'Leave', 'Request', etc.
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
