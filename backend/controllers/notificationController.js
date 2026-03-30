import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import moment from 'moment';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
        res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications/all
// @access  Private
export const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate clock-in reminder notifications
// @route   GET /api/notifications/check-clockin
// @access  Private
export const checkClockInReminder = async (req, res) => {
    try {
        const user = req.user;
        const today = moment().startOf('day');
        const now = moment();

        // Check if user has a shift start time
        const shiftStart = user.workingSchedule?.shiftStart || '11:00';
        const shiftMoment = moment(shiftStart, 'HH:mm');

        // Only check if current time is past shift start + 15 min buffer
        if (now.isBefore(shiftMoment.add(15, 'minutes'))) {
            return res.status(200).json({ reminder: false });
        }

        // Check if user already clocked in today
        const todayAttendance = await Attendance.findOne({
            user: user._id,
            date: today.toDate()
        });

        if (todayAttendance) {
            return res.status(200).json({ reminder: false });
        }

        // Check if user is on approved leave today
        const Leave = (await import('../models/Leave.js')).default;
        const onLeave = await Leave.findOne({
            user: user._id,
            status: 'Approved',
            startDate: { $lte: today.toDate() },
            endDate: { $gte: today.toDate() }
        });

        if (onLeave) {
            return res.status(200).json({ reminder: false });
        }

        // Check if weekend (user's weekly offs)
        const weekOffs = user.workingSchedule?.weekOffs || ['Sunday'];
        const todayDay = now.format('dddd');
        if (weekOffs.includes(todayDay)) {
            return res.status(200).json({ reminder: false });
        }

        // Check if we already sent a reminder today
        const existingReminder = await Notification.findOne({
            user: user._id,
            type: 'clock_in_reminder',
            createdAt: { $gte: today.toDate() }
        });

        if (!existingReminder) {
            await Notification.create({
                user: user._id,
                type: 'clock_in_reminder',
                title: 'Clock-In Reminder',
                message: `You haven't clocked in yet today. Your shift started at ${shiftStart}.`
            });
        }

        res.status(200).json({ reminder: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Create a notification (used by other controllers)
export const createNotification = async (userId, type, title, message, relatedId = null, relatedModel = null) => {
    try {
        if (!userId) {
            console.warn('Skipping notification creation: userId is missing.');
            return;
        }

        await Notification.create({
            user: userId,
            type,
            title,
            message,
            relatedId,
            relatedModel
        });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};
