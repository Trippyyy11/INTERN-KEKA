import Request from '../models/Request.js';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import { createNotification } from './notificationController.js';
import { getVisibilityQuery } from '../utils/userHelper.js';
import { createAuditLog } from './auditController.js';

// @desc    Create a new request (Leave/WFH/Half Day)
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
    try {
        const { type, leaveType, startDate, endDate, expectedClockIn, expectedClockOut, message, recipients, associatedLeave, associatedAttendance, cancelDates } = req.body;

        // Determine requested duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        let requestedDuration = 0;

        if (type === 'Leave Application' || type === 'Comp Off') {
            requestedDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Quota Validation
        if (['Leave Application', 'Comp Off'].includes(type)) {
            const targetLeaveType = type === 'Comp Off' ? 'Comp Off' : (leaveType || 'Casual');
            
            // Skip validation for Unpaid or if leaveType is missing for Half Day (though we should enforce it)
            if (targetLeaveType !== 'Unpaid') {
                const user = await User.findById(req.user._id);
                const approvedLeaves = await Leave.find({ 
                    user: req.user._id, 
                    type: targetLeaveType, 
                    status: 'Approved' 
                });

                let totalConsumed = 0;
                approvedLeaves.forEach(leave => {
                    let currentDate = new Date(leave.startDate);
                    const leaveEnd = new Date(leave.endDate);
                    while (currentDate <= leaveEnd) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        const isCancelled = leave.cancelledDates?.some(d => new Date(d).toISOString().split('T')[0] === dateStr);
                        if (!isCancelled) {
                            totalConsumed += (leave.type === 'Half Day' ? 0.5 : 1);
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });

                const quotaKey = targetLeaveType === 'Comp Off' ? 'compOff' : targetLeaveType.toLowerCase();
                const totalQuota = user.leaveQuotas[quotaKey] || 0;
                const availableBalance = totalQuota - totalConsumed;

                if (requestedDuration > availableBalance) {
                    return res.status(400).json({ 
                        message: `Insufficient balance for ${targetLeaveType}. Available: ${availableBalance} days, Requested: ${requestedDuration} days.` 
                    });
                }
            }
        }

        if (type !== 'Leave Cancellation' && type !== 'Attendance Regularization') {
            const startCheck = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            startCheck.setHours(0, 0, 0, 0);

            const diffTime = startCheck.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                return res.status(400).json({ message: "Requests cannot be made for today or tomorrow. Please apply at least 2 days in advance, or submit a backdated request for urgent leaves." });
            }
        }

        // Auto-include all Super Admins as recipients
        const superAdmins = await User.find({ role: 'Super Admin' }).select('_id');
        let finalRecipients = (recipients || []).filter(r => !!r);

        superAdmins.forEach(admin => {
            const adminIdStr = admin._id.toString();
            if (!finalRecipients.map(r => r.toString()).includes(adminIdStr)) {
                finalRecipients.push(admin._id);
            }
        });

        const request = await Request.create({
            user: req.user._id,
            type,
            leaveType,
            startDate,
            endDate,
            associatedLeave,
            associatedAttendance,
            cancelDates,
            expectedClockIn,
            expectedClockOut,
            message,
            recipients: finalRecipients,
            status: 'Pending'
        });

        const populated = await Request.findById(request._id)
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email')
            .populate('associatedAttendance');

        // Create notification for recipients
        for (const recipientId of (recipients || []).filter(r => !!r)) {
            await createNotification(
                recipientId,
                'leave_request',
                'New Request',
                `${populated.user?.name || 'Someone'} submitted a ${type} request for ${new Date(startDate).toLocaleDateString()}.`,
                request._id,
                'Request'
            );
        }

        await createAuditLog(req.user._id, 'REQUEST_CREATED', `Created new ${type} request`, { targetModel: 'Request', targetId: request._id, ipAddress: req.ip });

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('recipients', 'name email')
            .populate('actionBy', 'name')
            .populate('associatedAttendance');

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get requests addressed to me (as a recipient) or for my visible subordinates
// @route   GET /api/requests/inbox
// @access  Private
export const getInboxRequests = async (req, res) => {
    try {
        const normalizedRole = req.user.role?.toLowerCase().replace(/\s/g, '');
        if (normalizedRole === 'intern') {
            return res.status(200).json([]);
        }

        const visibilityQuery = getVisibilityQuery(req.user);
        const visibleInternIds = await User.find(visibilityQuery).distinct('_id');

        const requests = await Request.find({ 
            $or: [
                { user: { $in: visibleInternIds } },
                { recipients: req.user._id }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email')
            .populate('actionBy', 'name')
            .populate('associatedAttendance');

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Approve/Reject) - only recipients can act
// @route   PUT /api/requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res) => {
    try {
        const { status, actionNote } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Check if the current user is one of the recipients OR a Super Admin OR their Reporting Manager
        const normalizedRole = req.user.role?.toLowerCase().replace(/\s/g, '');
        const isRecipient = request.recipients.some(r => r && r.toString() === req.user._id.toString());
        const isSuperAdmin = normalizedRole === 'superadmin';
        let isManagerOfUser = false;

        if (normalizedRole === 'reportingmanager' || normalizedRole === 'reportingofficer') {
            const requestUser = await User.findById(request.user);
            if (requestUser && requestUser.reportingManager?.toString() === req.user._id.toString()) {
                isManagerOfUser = true;
            }
        }

        if (!isRecipient && !isSuperAdmin && !isManagerOfUser) {
            return res.status(403).json({ message: 'Not authorized to update this request. Only direct managers, explicit recipients, and Super Admins can perform this action.' });
        }

        request.status = status;
        request.actionBy = req.user._id;
        request.actionDate = new Date();
        if (actionNote) {
            request.actionNote = actionNote;
        }
        const updated = await request.save();

        if (status === 'Approved' && (updated.type === 'Leave Application' || updated.type === 'Comp Off' || updated.type === 'Half Day')) {
            await Leave.create({
                user: updated.user,
                type: updated.type === 'Comp Off' ? 'Comp Off' : (updated.type === 'Half Day' ? 'Half Day' : (updated.leaveType || 'Casual')),
                startDate: updated.startDate,
                endDate: updated.endDate,
                reason: updated.message || '',
                status: 'Approved',
                approvedBy: req.user._id
            });
        }

        if (status === 'Approved' && updated.type === 'Leave Cancellation' && updated.associatedLeave) {
            const leave = await Leave.findById(updated.associatedLeave);
            if (leave) {
                // Determine which dates to cancel
                const datesToCancel = updated.cancelDates && updated.cancelDates.length > 0
                    ? updated.cancelDates
                    : [];

                // If no specific dates provided, we might assume full cancellation? 
                // Let's rely on cancelDates array for specific or full.
                if (datesToCancel.length > 0) {
                    if (!leave.cancelledDates) {
                        leave.cancelledDates = [];
                    }
                    leave.cancelledDates.push(...datesToCancel);
                    await leave.save();
                }
            }
        }

        if (status === 'Approved' && updated.type === 'Attendance Regularization' && updated.associatedAttendance) {
            import('../models/Attendance.js').then(async ({ default: Attendance }) => {
                const attendance = await Attendance.findById(updated.associatedAttendance);
                if (attendance) {
                    const clockInToApply = req.body.overrideClockIn || updated.expectedClockIn;
                    const clockOutToApply = req.body.overrideClockOut || updated.expectedClockOut;

                    // Store original times if not already stored
                    if (attendance.clockInTime && !attendance.originalClockInTime) {
                        attendance.originalClockInTime = attendance.clockInTime;
                    }
                    if (attendance.clockOutTime && !attendance.originalClockOutTime) {
                        attendance.originalClockOutTime = attendance.clockOutTime;
                    }

                    if (clockInToApply) attendance.clockInTime = new Date(clockInToApply);
                    if (clockOutToApply) attendance.clockOutTime = new Date(clockOutToApply);
                    
                    attendance.autoClockOut = false;

                    let breakMs = 0;
                    if (attendance.breaks && attendance.breaks.length > 0) {
                        attendance.breaks.forEach(b => {
                            if (b.startTime && b.endTime) {
                                breakMs += (new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
                            }
                        });
                    }
                    if (attendance.clockInTime && attendance.clockOutTime) {
                        const diffMs = new Date(attendance.clockOutTime).getTime() - new Date(attendance.clockInTime).getTime() - breakMs;
                        const diffHrs = diffMs > 0 ? (diffMs / (1000 * 60 * 60)) : 0;
                        attendance.totalHours = diffHrs.toFixed(2);
                    }
                    
                    await attendance.save();
                }
            });
        }

        const populated = await Request.findById(updated._id)
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email')
            .populate('actionBy', 'name')
            .populate('associatedAttendance');

        // Notification to the requester that their request was acted upon
        const requesterId = populated.user?._id || updated.user;
        if (requesterId) {
            await createNotification(
                requesterId,
                'leave_request_update',
                `Request ${status}`,
                `Your ${updated.type} request was ${status.toLowerCase()} by ${req.user.name}. ${actionNote ? `Note: ${actionNote}` : ''}`,
                updated._id,
                'Request'
            );
        }

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users for recipient auto-suggestions
// @route   GET /api/requests/search-users?q=name
// @access  Private
export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q || '';
        const users = await User.find({
            name: { $regex: query, $options: 'i' },
            _id: { $ne: req.user._id },
            isActive: true,
            isApproved: true,
            $or: [
                { role: 'Super Admin' },
                { _id: req.user.reportingManager }
            ]
        })
            .select('name email designation department role')
            .limit(10);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
