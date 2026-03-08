import Request from '../models/Request.js';
import User from '../models/User.js';
import Leave from '../models/Leave.js';

// @desc    Create a new request (Leave/WFH/Half Day)
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
    try {
        const { type, leaveType, startDate, endDate, message, recipients, associatedLeave, cancelDates } = req.body;

        if (!type || !startDate || !endDate || !recipients || recipients.length === 0) {
            return res.status(400).json({ message: 'Type, dates, and at least one recipient are required.' });
        }

        const request = await Request.create({
            user: req.user._id,
            type,
            leaveType,
            startDate,
            endDate,
            associatedLeave,
            cancelDates,
            message,
            recipients,
            status: 'Pending'
        });

        const populated = await Request.findById(request._id)
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email');

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
            .populate('actionBy', 'name');

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get requests addressed to me (as a recipient)
// @route   GET /api/requests/inbox
// @access  Private
export const getInboxRequests = async (req, res) => {
    try {
        const requests = await Request.find({ recipients: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email')
            .populate('actionBy', 'name');

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

        // Check if the current user is one of the recipients
        const isRecipient = request.recipients.some(r => r.toString() === req.user._id.toString());
        if (!isRecipient && req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Not authorized to update this request.' });
        }

        request.status = status;
        request.actionBy = req.user._id;
        request.actionDate = new Date();
        if (actionNote) {
            request.actionNote = actionNote;
        }
        const updated = await request.save();

        if (status === 'Approved' && (updated.type === 'Leave Application' || updated.type === 'Comp Off')) {
            await Leave.create({
                user: updated.user,
                type: updated.type === 'Comp Off' ? 'Comp Off' : (updated.leaveType || 'Casual'),
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

        const populated = await Request.findById(updated._id)
            .populate('user', 'name email designation department')
            .populate('recipients', 'name email')
            .populate('actionBy', 'name');

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
            isApproved: true
        })
            .select('name email designation department')
            .limit(10);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
