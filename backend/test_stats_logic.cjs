const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Mock Models
const UserSchema = new mongoose.Schema({ name: String, role: String, department: String, workingSchedule: Object, isActive: Boolean, isDeleted: Boolean });
const AttendanceSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, date: Date, status: String, clockInTime: Date });
const OrgConfigSchema = new mongoose.Schema({ type: String, date: Date, name: String });

const User = mongoose.model('User', UserSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const OrgConfig = mongoose.model('OrgConfig', OrgConfigSchema);

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');

        const today = moment().startOf('day');
        const startOfToday = today.toDate();
        const endOfToday = moment().endOf('day').toDate();
        const todayName = today.format('dddd');

        // Mock a Super Admin user
        const superAdmin = { role: 'Super Admin', name: 'Admin' };
        
        // --- LOGIC FROM CONTROLLER ---
        const teamQuery = { role: 'Intern', isDeleted: { $ne: true }, isActive: true }; // Simplified for Super Admin
        const teamMembers = await User.find(teamQuery);
        const teamMemberIds = teamMembers.map(u => u._id.toString());

        const teamAttendance = await Attendance.find({
            date: { $gte: startOfToday, $lte: endOfToday },
            user: { $in: teamMemberIds.map(id => new mongoose.Types.ObjectId(id)) }
        });

        const holidaysAll = await OrgConfig.find({ type: 'Holiday' });
        const isHolidayToday = holidaysAll.some(h => moment(h.date).isSame(today, 'day'));

        const loggedInUserIds = teamAttendance.map(a => (a.user?._id || a.user).toString());
        const onLeaveUserIds = []; // Simplified

        console.log(`Today: ${todayName}, isHolidayToday: ${isHolidayToday}`);
        console.log(`Team Members found: ${teamMembers.length}`);
        console.log(`Team Attendance records found: ${teamAttendance.length}`);
        console.log(`loggedInUserIds: ${JSON.stringify(loggedInUserIds)}`);

        const notInYet = isHolidayToday ? [] : teamMembers.filter(m => {
            const isClockedIn = loggedInUserIds.includes(m._id.toString());
            const isOnLeave = onLeaveUserIds.includes(m._id.toString());
            const weekOffs = m.workingSchedule?.weekOffs || ['Sunday'];
            const isWeekOff = weekOffs.includes(todayName);
            
            const result = !isClockedIn && !isOnLeave && !isWeekOff;
            if (result) console.log(` >> NOT IN: ${m.name} (isClockedIn: ${isClockedIn}, isWeekOff: ${isWeekOff})`);
            return result;
        });

        console.log(`Final notInYet count: ${notInYet.length}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testStats();
