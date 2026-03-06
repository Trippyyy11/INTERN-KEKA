import Attendance from '../models/Attendance.js';

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
export const clockIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        let record = await Attendance.findOne({ user: req.user._id, date: today });

        if (record && record.clockInTime) {
            return res.status(400).json({ message: 'Already clocked in today.' });
        }

        if (!record) {
            record = await Attendance.create({
                user: req.user._id,
                date: today,
                clockInTime: new Date(),
                status: 'Present',
            });
        } else {
            record.clockInTime = new Date();
            await record.save();
        }

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private
export const clockOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let record = await Attendance.findOne({ user: req.user._id, date: today });

        if (!record || !record.clockInTime) {
            return res.status(400).json({ message: 'Cannot clock out without clocking in first.' });
        }

        const clockOutTime = new Date();
        record.clockOutTime = clockOutTime;

        // Calculate total hours
        const diffMs = clockOutTime - record.clockInTime;
        const diffHrs = diffMs / (1000 * 60 * 60);

        record.totalHours = diffHrs.toFixed(2);
        await record.save();

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance Logs
// @route   GET /api/attendance/logs
// @access  Private
export const getLogs = async (req, res) => {
    try {
        const logs = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
