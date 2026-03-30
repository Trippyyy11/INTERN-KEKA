import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { createAuditLog } from './auditController.js';

// @desc    Request a Leave
// @route   POST /api/leaves
// @access  Private
export const requestLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        if (!type || !startDate || !endDate) {
            return res.status(400).json({ message: 'Type, Start Date, and End Date are required.' });
        }

        const leave = await Leave.create({
            user: req.user._id,
            type,
            startDate,
            endDate,
            reason,
            status: 'Pending'
        });

        res.status(201).json(leave);

        res.status(201).json(leave);
        
        // Audit log: leave applied
        await createAuditLog(req.user._id, 'LEAVE_APPLIED', `Applied for ${type} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, { targetModel: 'Leave', targetId: leave._id, userName: req.user.name });

        // Notify admins about new leave request
        const admins = await User.find({ role: { $in: ['Reporting Manager', 'Super Admin'] } }).select('_id');
        for (const admin of admins) {
            await createNotification(
                admin._id,
                'leave_applied',
                'New Leave Request',
                `${req.user.name} has applied for ${type} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
                leave._id,
                'Leave'
            );
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Leaves
// @route   GET /api/leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Leave Status (Admin/Manager)
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (leave) {
            leave.status = status;
            leave.approvedBy = req.user._id;
            const updatedLeave = await leave.save();

            // Audit log
            const auditAction = status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
            const targetUser = await User.findById(leave.user).select('name');
            await createAuditLog(req.user._id, auditAction, `${status} ${leave.type} leave for ${targetUser?.name || leave.user}`, { targetModel: 'Leave', targetId: leave._id, userName: req.user.name });
            
            res.json(updatedLeave);

            // Notify the leave applicant about status change
            const notifType = status === 'Approved' ? 'leave_approved' : 'leave_rejected';
            await createNotification(
                leave.user,
                notifType,
                `Leave ${status}`,
                `Your ${leave.type} leave request has been ${status.toLowerCase()} by ${req.user.name}.`,
                leave._id,
                'Leave'
            );
        } else {
            res.status(404).json({ message: 'Leave request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get Detailed Leave Stats
// @route   GET /api/leaves/stats
// @access  Private
export const getLeaveStats = async (req, res) => {
    try {
        const user = req.user;
        const leaves = await Leave.find({ user: user._id }).sort({ startDate: -1 }).populate('approvedBy', 'name');

        const quotas = user.leaveQuotas || { paid: 12, sick: 6, casual: 6, compOff: 0 };

        const summary = {
            'Paid': { total: quotas.paid, consumed: 0 },
            'Sick': { total: quotas.sick, consumed: 0 },
            'Casual': { total: quotas.casual, consumed: 0 },
            'Comp Off': { total: quotas.compOff, consumed: 0 },
            'Unpaid': { total: Infinity, consumed: 0 }
        };

        const monthlyStats = Array(12).fill(0);
        const weeklyPattern = Array(7).fill(0); // Mon-Sun

        leaves.forEach(leave => {
            if (leave.status === 'Approved') {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);

                let leaveDays = 0;
                let currentDate = new Date(start);

                while (currentDate <= end) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    const isCancelled = leave.cancelledDates && leave.cancelledDates.some(d => new Date(d).toISOString().split('T')[0] === dateStr);

                    if (!isCancelled) {
                        leaveDays++;

                        // Monthly distribution
                        monthlyStats[currentDate.getMonth()] += 1;

                        // Weekly distribution
                        let day = currentDate.getDay(); // 0 is Sun
                        let kekaDayIndex = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
                        weeklyPattern[kekaDayIndex] += 1;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                if (summary[leave.type]) {
                    summary[leave.type].consumed += leaveDays;
                }
            }
        });

        res.status(200).json({
            balances: summary,
            history: leaves,
            monthlyStats,
            weeklyPattern
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
