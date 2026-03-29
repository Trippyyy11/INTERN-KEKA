import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import { createAuditLog } from './auditController.js';
import { autoCloseStaleSessions } from '../utils/attendanceHelper.js';

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
export const clockIn = async (req, res) => {
    try {
        await autoCloseStaleSessions(req.user._id); // Lazy validation

        const { workingMode, message } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        let record = await Attendance.findOne({ user: req.user._id, date: today });

        if (record && record.clockInTime) {
            return res.status(400).json({ message: 'Already clocked in today.' });
        }

        if (workingMode === 'Remote') {
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const approvedWfh = await Request.findOne({
                user: req.user._id,
                type: 'Work From Home',
                status: 'Approved',
                startDate: { $lte: endOfDay },
                endDate: { $gte: today }
            });

            if (!approvedWfh) {
                return res.status(403).json({ message: 'You cannot clock in remotely without an approved Work From Home request for today.' });
            }
        }

        if (!record) {
            record = await Attendance.create({
                user: req.user._id,
                date: today,
                clockInTime: new Date(),
                clockInMessage: message || '',
                status: workingMode === 'Remote' ? 'WFH' : 'Present',
                workingMode: workingMode || 'On-site'
            });
        } else {
            record.clockInTime = new Date();
            record.clockInMessage = message || '';
            record.workingMode = workingMode || 'On-site';
            record.status = workingMode === 'Remote' ? 'WFH' : 'Present';
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
        await autoCloseStaleSessions(req.user._id); // Lazy validation
        
        const { message } = req.body;
        // Find the latest active session (clocked in but not clocked out)
        let record = await Attendance.findOne({
            user: req.user._id,
            clockOutTime: { $exists: false }
        }).sort({ clockInTime: -1 });

        if (!record) {
            // Fallback for null check
            record = await Attendance.findOne({
                user: req.user._id,
                clockOutTime: null
            }).sort({ clockInTime: -1 });
        }

        if (!record) {
            return res.status(400).json({ message: 'No active session found. Please clock in first.' });
        }

        const clockOutTime = new Date();
        record.clockOutTime = clockOutTime;
        record.clockOutMessage = message || '';

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
        await autoCloseStaleSessions(req.user._id); // Lazy validation
        const logs = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Today's Status for all employees
// @route   GET /api/attendance/status/today
// @access  Private
export const getTodayStatus = async (req, res) => {
    try {
        await autoCloseStaleSessions(); // Lazy validation for everyone globally before fetching status
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({ date: today }).populate('user', 'name avatar department');
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Team aggregate stats
// @route   GET /api/attendance/team-stats
// @access  Private
export const getTeamStats = async (req, res) => {
    try {
        const { period } = req.query; // 'week' or 'month'
        const days = period === 'month' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const myDept = req.user.department;
        if (!myDept) return res.status(200).json({ avgHours: 0, onTimePercentage: 0 });

        // Find all users in same department
        const teammateIds = (await User.find({ department: myDept }).select('_id')).map(u => u._id);

        const logs = await Attendance.find({
            user: { $in: teammateIds },
            date: { $gte: startDate }
        }).populate('user', 'workingSchedule');

        if (logs.length === 0) {
            return res.status(200).json({ avgHours: 0, onTimePercentage: 0 });
        }

        let totalHours = 0;
        let onTimeCount = 0;

        logs.forEach(log => {
            totalHours += Number(log.totalHours || 0);

            if (log.clockInTime) {
                const clockIn = new Date(log.clockInTime);
                const hours = clockIn.getHours();
                const mins = clockIn.getMinutes();
                const totalMins = hours * 60 + mins;

                const [shiftH, shiftM] = (log.user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                const shiftStartMins = shiftH * 60 + shiftM;

                if (totalMins <= shiftStartMins + 60) {
                    onTimeCount++;
                }
            }
        });

        res.status(200).json({
            avgHours: (totalHours / logs.length).toFixed(2),
            onTimePercentage: Math.round((onTimeCount / logs.length) * 100)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get individual stats for each teammate
// @route   GET /api/attendance/teammates-stats
// @access  Private
export const getTeammateIndividualStats = async (req, res) => {
    try {
        const { period } = req.query; // 'week' or 'month'
        const days = period === 'month' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const myDept = req.user.department;
        if (!myDept) return res.status(200).json([]);

        // Find all teammates (excluding me)
        const teammates = await User.find({
            department: myDept,
            _id: { $ne: req.user._id },
            isActive: true
        }).select('name avatar workingSchedule');

        const teammateIds = teammates.map(u => u._id);

        const logs = await Attendance.find({
            user: { $in: teammateIds },
            date: { $gte: startDate }
        });

        const stats = teammates.map(t => {
            const userLogs = logs.filter(l => l.user.toString() === t._id.toString());

            if (userLogs.length === 0) {
                return {
                    _id: t._id,
                    name: t.name,
                    avgHours: 0,
                    onTimePercentage: 0
                };
            }

            let totalHours = 0;
            let onTimeCount = 0;

            userLogs.forEach(log => {
                totalHours += Number(log.totalHours || 0);

                if (log.clockInTime) {
                    const clockIn = new Date(log.clockInTime);
                    const totalMins = clockIn.getHours() * 60 + clockIn.getMinutes();

                    const [shiftH, shiftM] = (t.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                    const shiftStartMins = shiftH * 60 + shiftM;

                    if (totalMins <= shiftStartMins + 60) {
                        onTimeCount++;
                    }
                }
            });

            return {
                _id: t._id,
                name: t.name,
                avgHours: (totalHours / userLogs.length).toFixed(2),
                onTimePercentage: Math.round((onTimeCount / userLogs.length) * 100)
            };
        });

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance Logs for a specific user (Admin only)
// @route   GET /api/attendance/logs/:userId
// @access  Private/Admin
export const getUserLogs = async (req, res) => {
    try {
        const logs = await Attendance.find({ user: req.params.userId }).sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Attendance Logs (Admin only)
// @route   GET /api/attendance/all
// @access  Private/Admin
export const getAllLogs = async (req, res) => {
    try {
        const logs = await Attendance.find({}).populate('user', 'name email department').sort({ date: -1 }).limit(100);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update Attendance Log (Admin only)
// @route   PUT /api/attendance/logs/:logId
// @access  Private/Admin
export const updateAttendance = async (req, res) => {
    try {
        const { clockInTime, clockOutTime, status } = req.body;
        const log = await Attendance.findById(req.params.logId);

        if (!log) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        if (clockInTime) log.clockInTime = new Date(clockInTime);
        if (clockOutTime) log.clockOutTime = new Date(clockOutTime);
        if (status) log.status = status;

        if (log.clockInTime && log.clockOutTime) {
            const diffMs = log.clockOutTime - log.clockInTime;
            const diffHrs = diffMs > 0 ? (diffMs / (1000 * 60 * 60)) : 0;
            log.totalHours = diffHrs.toFixed(2);
        } else if (log.clockOutTime === null) {
            log.totalHours = 0;
        }

        const updatedLog = await log.save();

        // Audit log: attendance edited
        await createAuditLog(req.user._id, 'ATTENDANCE_EDITED', `Edited attendance for log ${log._id} (user: ${log.user})`, { targetModel: 'Attendance', targetId: log._id, ipAddress: req.ip });

        res.status(200).json(updatedLog);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

