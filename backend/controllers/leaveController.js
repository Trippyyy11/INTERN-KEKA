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
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                if (summary[leave.type]) {
                    summary[leave.type].consumed += days;
                }

                // Monthly distribution
                monthlyStats[start.getMonth()] += days;

                // Weekly distribution (simplified: use start date)
                let day = start.getDay(); // 0 is Sun
                let kekaDayIndex = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
                weeklyPattern[kekaDayIndex] += days;
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
