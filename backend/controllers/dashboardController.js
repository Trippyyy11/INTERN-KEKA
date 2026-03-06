import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import OrgConfig from '../models/OrgConfig.js';
import Attendance from '../models/Attendance.js';
import moment from 'moment';

// @desc    Get dashboard statistics and real-time alerts
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const today = moment().startOf('day');
        const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day');

        // 1. Birthdays (Today & Upcoming)
        const allUsersWithDob = await User.find({ dob: { $ne: null } }).select('name dob department');
        const birthdaysToday = allUsersWithDob.filter(u => {
            const dob = moment(u.dob);
            return dob.date() === today.date() && dob.month() === today.month();
        });

        const upcomingBirthdays = allUsersWithDob.filter(u => {
            const dob = moment(u.dob).year(today.year());
            if (dob.isBefore(today)) dob.add(1, 'year');
            return dob.isAfter(today) && dob.isSameOrBefore(moment(today).add(30, 'days'));
        }).sort((a, b) => {
            const dobA = moment(a.dob).year(today.year());
            if (dobA.isBefore(today)) dobA.add(1, 'year');
            const dobB = moment(b.dob).year(today.year());
            if (dobB.isBefore(today)) dobB.add(1, 'year');
            return dobA - dobB;
        });

        // 2. On Leave Today
        const leavesToday = await Leave.find({
            status: 'Approved',
            startDate: { $lte: today.toDate() },
            endDate: { $gte: today.toDate() }
        }).populate('user', 'name department');

        // 3. Working Remotely (WFH)
        const workingRemotely = await Attendance.find({
            date: today.toDate(),
            status: 'WFH'
        }).populate('user', 'name department');

        // 4. New Joinees (Last 30 days)
        const newJoinees = await User.find({
            joiningDate: { $gte: thirtyDaysAgo.toDate() }
        }).select('name joiningDate department');

        // 5. Announcements
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'name');

        // 6. Upcoming Holidays
        const holidays = await OrgConfig.find({
            type: 'Holiday',
            date: { $gte: today.toDate() }
        }).sort({ date: 1 }).limit(3);

        res.status(200).json({
            birthdays: {
                today: birthdaysToday,
                upcoming: upcomingBirthdays
            },
            leaves: leavesToday,
            workingRemotely,
            newJoinees,
            announcements,
            holidays
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new announcement
// @route   POST /api/dashboard/announcements
// @access  Private (Admin)
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, priority } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        const announcement = await Announcement.create({
            title,
            content,
            priority: priority || 'Low',
            author: req.user._id
        });

        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
