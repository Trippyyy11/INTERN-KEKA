import Leave from '../models/Leave.js';

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
            res.json(updatedLeave);
        } else {
            res.status(404).json({ message: 'Leave request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
