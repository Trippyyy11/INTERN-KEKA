import cron from 'node-cron';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Schedule: 1st day of every month at midnight — Export and email audit logs, then delete
cron.schedule('0 0 1 * *', async () => {
    console.log('[CRON] Running Monthly Audit Log Export Job...');
    try {
        const logs = await AuditLog.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        if (logs.length === 0) {
            console.log('[CRON] No audit logs to export.');
            return;
        }

        // Generate CSV
        const csvHeader = 'Date,Time,User,Email,Action,Details,Target Model,IP Address\n';
        const csvRows = logs.map(log => {
            const date = new Date(log.createdAt);
            return `"${date.toLocaleDateString()}","${date.toLocaleTimeString()}","${log.user?.name || 'System'}","${log.user?.email || 'N/A'}","${log.action}","${(log.details || '').replace(/"/g, '""')}","${log.targetModel || 'N/A'}","${log.ipAddress || 'N/A'}"`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;

        // Get all Super Admin emails
        const superAdmins = await User.find({ role: 'Super Admin', isActive: true }).select('email');
        if (superAdmins.length === 0) {
            console.log('[CRON] No Super Admin users found to email.');
            return;
        }

        const recipients = superAdmins.map(sa => sa.email);

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
            subject: `Monthly Audit Logs - ${monthYear}`,
            text: `Automated monthly audit log export.\nTotal entries: ${logs.length}`,
            html: `<h2>Monthly Audit Log Report</h2><p>Total entries: <strong>${logs.length}</strong></p><p>This is an automated report sent on the 1st of every month.</p>`,
            attachments: [
                {
                    filename: `audit_logs_monthly_${new Date().toISOString().split('T')[0]}.csv`,
                    content: csvContent,
                    contentType: 'text/csv'
                }
            ]
        });

        // Delete exported logs
        await AuditLog.deleteMany({ _id: { $in: logs.map(l => l._id) } });

        console.log(`[CRON] Monthly Audit Export: Emailed ${logs.length} logs to ${recipients.join(', ')} and deleted from DB.`);
    } catch (error) {
        console.error('[CRON] Error during Monthly Audit Export:', error);
    }
});
