import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        action: {
            type: String,
            enum: [
                'USER_REGISTERED', 'USER_APPROVED', 'USER_DENIED', 'USER_DELETED',
                'USER_UPDATED', 'ROLE_CHANGED', 'MANAGER_ASSIGNED',
                'ATTENDANCE_EDITED', 'CLOCK_IN', 'CLOCK_OUT',
                'LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED',
                'REQUEST_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED',
                'CONFIG_ADDED', 'CONFIG_DELETED',
                'SETTINGS_UPDATED',
                'ANNOUNCEMENT_POSTED',
                'AVAILABILITY_UPDATED'
            ],
            required: true
        },
        targetModel: { type: String }, // 'User', 'Attendance', 'Leave', 'Request', etc.
        targetId: { type: mongoose.Schema.Types.ObjectId },
        details: { type: String, required: true }, // Human-readable description
        ipAddress: { type: String },
        previousValues: { type: mongoose.Schema.Types.Mixed },
        newValues: { type: mongoose.Schema.Types.Mixed }
    },
    { timestamps: true }
);

// Index for efficient querying and cleanup
auditLogSchema.index({ createdAt: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ user: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
