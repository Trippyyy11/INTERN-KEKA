import FutureAvailability from '../models/FutureAvailability.js';
import User from '../models/User.js';
import { getVisibilityQuery } from '../utils/userHelper.js';
import { createAuditLog } from './auditController.js';

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

        const visibilityQuery = getVisibilityQuery(req.user);
        
        // Merge department filter if present
        if (department) {
            visibilityQuery.department = { $regex: `^${department.trim()}$`, $options: 'i' };
        }

        const users = await User.find(visibilityQuery).select('_id name email department designation').sort({ name: 1 });
        const userIds = users.map(u => u._id);

        const availability = await FutureAvailability.find({
            user: { $in: userIds },
            date: { $gte: start, $lte: end }
        }).populate('user', 'name email department designation')
          .populate('updatedBy', 'name')
          .sort({ date: 1 });

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

        const normalizedRole = req.user.role?.toLowerCase().replace(/\s/g, '');
        
        // Validate permissions: ONLY self-edit allowed for everyone
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
        if (results.length > 0) {
            await createAuditLog(req.user._id, 'AVAILABILITY_UPDATED', `Updated ${results.length} availability entries for ${results[0].user}`, { targetModel: 'FutureAvailability', ipAddress: req.ip });
        }
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

        const visibilityQuery = getVisibilityQuery(req.user);
        const usersToExport = await User.find(visibilityQuery).select('_id');
        const userIds = usersToExport.map(u => u._id);

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
