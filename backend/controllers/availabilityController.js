import FutureAvailability from '../models/FutureAvailability.js';
import User from '../models/User.js';

// @desc    Get future availability
// @route   GET /api/availability
// @access  Private (role-filtered)
export const getAvailability = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;
        const userRole = req.user.role;

        // Build date filter (default: next 5 days)
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        if (!endDate) {
            end.setDate(end.getDate() + 4); // 5 days including today
        }
        end.setHours(23, 59, 59, 999);

        let userIds;

        if (userRole === 'Super Admin') {
            // Super Admin: all users, optionally filtered by department
            const userFilter = { isActive: true, isDeleted: { $ne: true } };
            if (department) userFilter.department = department;
            const users = await User.find(userFilter).select('_id');
            userIds = users.map(u => u._id);
        } else if (userRole === 'Reporting Manager') {
            // Reporting Officer: team members (users who report to them) + self
            const teamMembers = await User.find({
                reportingManager: req.user._id,
                isActive: true,
                isDeleted: { $ne: true }
            }).select('_id');
            userIds = [req.user._id, ...teamMembers.map(u => u._id)];
        } else {
            // Intern: only self
            userIds = [req.user._id];
        }

        const availability = await FutureAvailability.find({
            user: { $in: userIds },
            date: { $gte: start, $lte: end }
        }).populate('user', 'name email department designation')
          .populate('updatedBy', 'name')
          .sort({ date: 1 });

        // Also return the user list for the grid
        const users = await User.find({ _id: { $in: userIds } })
            .select('name email department designation')
            .sort({ name: 1 });

        res.status(200).json({ availability, users, startDate: start, endDate: end });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upsert (create/update) availability entries
// @route   PUT /api/availability
// @access  Private (role-based editing)
export const upsertAvailability = async (req, res) => {
    try {
        const { entries } = req.body; // Array of { userId, date, status, note }
        const userRole = req.user.role;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ message: 'No entries provided.' });
        }

        // Validate permissions
        for (const entry of entries) {
            if (entry.userId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Users can only edit their own availability.' });
            }
        }

        const results = [];
        for (const entry of entries) {
            const dateObj = new Date(entry.date);
            dateObj.setHours(0, 0, 0, 0);

            const result = await FutureAvailability.findOneAndUpdate(
                { user: entry.userId, date: dateObj },
                {
                    user: entry.userId,
                    date: dateObj,
                    status: entry.status,
                    note: entry.note || '',
                    updatedBy: req.user._id
                },
                { upsert: true, new: true }
            );
            results.push(result);
        }

        res.status(200).json({ message: `${results.length} entries updated.`, results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export availability as CSV download
// @route   GET /api/availability/export
// @access  Private
export const exportAvailability = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;
        const userRole = req.user.role;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date();
        if (!endDate) end.setDate(end.getDate() + 4);
        end.setHours(23, 59, 59, 999);

        let userIds;
        if (userRole === 'Super Admin') {
            const userFilter = { isActive: true, isDeleted: { $ne: true } };
            if (department) userFilter.department = department;
            const users = await User.find(userFilter).select('_id');
            userIds = users.map(u => u._id);
        } else if (userRole === 'Reporting Manager') {
            const teamMembers = await User.find({
                reportingManager: req.user._id,
                isActive: true,
                isDeleted: { $ne: true }
            }).select('_id');
            userIds = [req.user._id, ...teamMembers.map(u => u._id)];
        } else {
            userIds = [req.user._id];
        }

        const availability = await FutureAvailability.find({
            user: { $in: userIds },
            date: { $gte: start, $lte: end }
        }).populate('user', 'name email department').sort({ date: 1, 'user.name': 1 });

        const csvHeader = 'Employee,Email,Department,Date,Status,Note\n';
        const csvRows = availability.map(a => {
            return `"${a.user?.name || 'N/A'}","${a.user?.email || 'N/A'}","${a.user?.department || 'N/A'}","${new Date(a.date).toLocaleDateString()}","${a.status}","${(a.note || '').replace(/"/g, '""')}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=availability_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvHeader + csvRows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
