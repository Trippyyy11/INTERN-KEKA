import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Helper: Create an audit log entry (called from other controllers)
export const createAuditLog = async (userId, action, details, options = {}) => {
    try {
        let nameToLog = options.userName;

        if (!nameToLog) {
            const user = await User.findById(userId).select('name');
            nameToLog = user ? user.name : 'System';
        }

        await AuditLog.create({
            user: userId,
            action,
            details,
            userName: nameToLog,
            targetModel: options.targetModel || null,
            targetId: options.targetId || null,
            ipAddress: options.ipAddress || '',
            previousValues: options.previousValues || null,
            newValues: options.newValues || null
        });
    } catch (error) {
        console.error('Failed to create audit log:', error.message);
    }
};

// @desc    Get audit logs (paginated, filterable)
// @route   GET /api/audit
// @access  Super Admin only
export const getAuditLogs = async (req, res) => {
    try {
        const { action, startDate, endDate, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await AuditLog.countDocuments(filter);
        const logs = await AuditLog.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            logs,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export audit logs as CSV to email, then delete from DB
// @route   POST /api/audit/export
// @access  Super Admin only
export const exportAuditLogs = async (req, res) => {
    try {
        const { additionalEmail } = req.body;

        const logs = await AuditLog.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        if (logs.length === 0) {
            return res.status(400).json({ message: 'No audit logs to export.' });
        }

        // Generate CSV
        const csvHeader = 'Date,Time,User,Email,Action,Details,Target Model,IP Address\n';
        const csvRows = logs.map(log => {
            const date = new Date(log.createdAt);
            const performerName = log.userName || log.user?.name || 'System';
            const performerEmail = log.user?.email || 'N/A';
            return `"${date.toLocaleDateString()}","${date.toLocaleTimeString()}","${performerName}","${performerEmail}","${log.action}","${(log.details || '').replace(/"/g, '""')}","${log.targetModel || 'N/A'}","${log.ipAddress || 'N/A'}"`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;

        // Get superadmin email
        const superAdminEmail = req.user.email;
        const recipients = [superAdminEmail];
        if (additionalEmail && additionalEmail !== superAdminEmail) {
            recipients.push(additionalEmail);
        }

        // Send email with CSV as attachment
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        await transporter.sendMail({
            from: `Teaching Pariksha <${process.env.SMTP_FROM_EMAIL}>`,
            to: recipients.join(', '),
            subject: `Audit Logs Export - ${monthYear}`,
            text: `Please find attached the audit logs export for ${monthYear}.\n\nTotal entries: ${logs.length}`,
            html: `<p>Please find attached the audit logs export for <strong>${monthYear}</strong>.</p><p>Total entries: <strong>${logs.length}</strong></p>`,
            attachments: [
                {
                    filename: `audit_logs_${new Date().toISOString().split('T')[0]}.csv`,
                    content: csvContent,
                    contentType: 'text/csv'
                }
            ]
        });

        // Delete the exported logs from DB
        await AuditLog.deleteMany({ _id: { $in: logs.map(l => l._id) } });

        res.status(200).json({
            message: `Audit logs exported and emailed to ${recipients.join(', ')}. ${logs.length} logs deleted from database.`,
            count: logs.length
        });
    } catch (error) {
        console.error('Audit export error:', error);
        res.status(500).json({ message: error.message });
    }
};
