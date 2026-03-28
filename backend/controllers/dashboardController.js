import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import OrgConfig from '../models/OrgConfig.js';
import Notification from '../models/Notification.js';
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

        const myDept = req.user.department;

        // 2. On Leave Today (Team only)
        const leavesToday = await Leave.find({
            status: 'Approved',
            startDate: { $lte: today.toDate() },
            endDate: { $gte: today.toDate() }
        }).populate({
            path: 'user',
            match: myDept ? { department: myDept } : {},
            select: 'name department avatar profilePicture gender place bloodGroup dob welcomeProfile designation phoneNumber'
        });

        // Filter out leaves where user didn't match the department filter
        const teamLeavesToday = leavesToday.filter(l => l.user !== null);

        // 3. Working Remotely (WFH - Team only)
        const workingRemotely = await Attendance.find({
            date: today.toDate(),
            status: 'WFH'
        }).populate({
            path: 'user',
            match: myDept ? { department: myDept } : {},
            select: 'name department avatar profilePicture gender place bloodGroup dob welcomeProfile designation phoneNumber'
        });

        // Filter out records where user didn't match the department filter
        const teamWorkingRemotely = workingRemotely.filter(w => w.user !== null);

        // 4. New Joinees (Last 7 days)
        const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');
        const endOfToday = moment().endOf('day');
        const newJoinees = await User.find({
            $or: [
                { joiningDate: { $gte: sevenDaysAgo.toDate(), $lte: endOfToday.toDate() } },
                { joiningDate: { $eq: null }, createdAt: { $gte: sevenDaysAgo.toDate(), $lte: endOfToday.toDate() } },
                { joiningDate: { $exists: false }, createdAt: { $gte: sevenDaysAgo.toDate(), $lte: endOfToday.toDate() } }
            ],
            isDeleted: { $ne: true }
        }).select('name joiningDate createdAt department avatar profilePicture gender place bloodGroup dob welcomeProfile designation phoneNumber');

        // 5. Team Activity Stats (Today)
        const teamMembers = await User.find({ department: myDept }).select('name designation workingSchedule');
        const teamAttendance = await Attendance.find({
            date: today.toDate(),
            user: { $in: teamMembers.map(u => u._id) }
        });

        const loggedInUserIds = teamAttendance.map(a => a.user.toString());
        const notInYet = teamMembers.filter(m => !loggedInUserIds.includes(m._id.toString()));

        let onTimeCount = 0;
        let lateCount = 0;
        let wfhCount = 0;
        let remoteCount = 0;

        teamAttendance.forEach(att => {
            if (att.status === 'WFH') wfhCount++;
            if (att.workingMode === 'Remote') remoteCount++;

            const user = teamMembers.find(m => m._id.toString() === att.user.toString());
            if (user && user.workingSchedule && att.clockInTime) {
                const shiftStart = moment(user.workingSchedule.shiftStart, 'HH:mm');
                const clockIn = moment(att.clockInTime);
                if (clockIn.isBefore(shiftStart.add(15, 'minutes'))) { // 15 mins buffer
                    onTimeCount++;
                } else {
                    lateCount++;
                }
            }
        });

        // 6. Announcements
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('author', 'name');

        // 7. Upcoming Holidays
        const holidays = await OrgConfig.find({
            type: 'Holiday',
            date: { $gte: today.toDate() }
        }).sort({ date: 1 }).limit(3);

        res.status(200).json({
            birthdays: {
                today: birthdaysToday,
                upcoming: upcomingBirthdays
            },
            leaves: teamLeavesToday,
            workingRemotely: teamWorkingRemotely,
            notInYet,
            activityStats: {
                onTimeCount,
                lateCount,
                wfhCount,
                remoteCount
            },
            teamAttendance,
            newJoinees,
            announcements,
            holidays
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly calendar stats for team
// @route   GET /api/dashboard/team-calendar
// @access  Private
export const getTeamCalendarStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        // Use provided month/year or default to current
        const m = parseInt(month) || (moment().month() + 1);
        const y = parseInt(year) || moment().year();

        // Use moment.utc or specify format strictly to avoid issues
        const targetDate = moment(`${y}-${String(m).padStart(2, '0')}-01`, 'YYYY-MM-DD');
        const startOfMonth = targetDate.clone().startOf('month');
        const endOfMonth = targetDate.clone().endOf('month');

        const myDept = req.user.department;
        const query = { isActive: true, isDeleted: { $ne: true } };
        if (myDept) {
            query.department = { $regex: `^${myDept.trim()}$`, $options: 'i' };
        } else {
            query._id = req.user._id;
        }

        const teamMembers = await User.find(query).select('name designation avatar workingSchedule');

        if (teamMembers.length === 0) {
            return res.status(200).json({
                teamMembers: [],
                attendance: [],
                leaves: [],
                holidays: [],
                month: targetDate.format('MMMM'),
                year: targetDate.format('YYYY'),
                daysInMonth: targetDate.daysInMonth()
            });
        }

        // Fetch all data for the month
        const attendance = await Attendance.find({
            date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
            user: { $in: teamMembers.map(u => u._id) }
        });

        const leaves = await Leave.find({
            status: 'Approved',
            $or: [
                { startDate: { $lte: endOfMonth.toDate() }, endDate: { $gte: startOfMonth.toDate() } }
            ],
            user: { $in: teamMembers.map(u => u._id) }
        }).populate('user', 'name');

        const holidays = await OrgConfig.find({
            type: 'Holiday',
            date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
        });

        res.status(200).json({
            teamMembers,
            attendance,
            leaves,
            holidays,
            month: targetDate.format('MMMM'),
            year: targetDate.format('YYYY'),
            daysInMonth: targetDate.daysInMonth()
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

        // --- Push Notification Logic ---
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('_id');
        const notifications = allUsers.map(u => ({
            user: u._id,
            type: 'announcement',
            title: 'New Announcement: ' + title,
            message: content.length > 50 ? content.substring(0, 47) + '...' : content,
            relatedId: announcement._id,
            relatedModel: 'Announcement'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all holidays
// @route   GET /api/dashboard/holidays
// @access  Private
export const getAllHolidays = async (req, res) => {
    try {
        const holidays = await OrgConfig.find({ type: 'Holiday' }).sort({ date: 1 });
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
