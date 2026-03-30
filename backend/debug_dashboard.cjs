const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

dotenv.config();

async function debug() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.connection.db.collection('users');
        const Attendance = mongoose.connection.db.collection('attendances');
        const OrgConfig = mongoose.connection.db.collection('orgconfigs');

        const today = moment().startOf('day');
        const startOfToday = today.toDate();
        const endOfToday = moment().endOf('day').toDate();

        console.log(`Current Server Time: ${moment().format()}`);
        console.log(`Today Start: ${startOfToday.toISOString()}`);
        console.log(`Today End: ${endOfToday.toISOString()}`);

        const interns = await User.find({ role: 'Intern', isActive: true, isDeleted: { $ne: true } }).toArray();
        console.log(`Total Interns Found: ${interns.length}`);
        interns.forEach(i => console.log(`- ${i.name} (${i._id})` ));

        const attendance = await Attendance.find({
            date: { $gte: startOfToday, $lte: endOfToday }
        }).toArray();
        console.log(`Total Attendance Records Today: ${attendance.length}`);
        attendance.forEach(a => console.log(`- User ID: ${a.user}, Status: ${a.status}`));

        const holidays = await OrgConfig.find({ type: 'Holiday' }).toArray();
        const holidayToday = holidays.find(h => moment(h.date).isSame(today, 'day'));
        console.log(`Holiday Today Identified: ${holidayToday ? holidayToday.name : 'None'}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Debug script error:', err);
        process.exit(1);
    }
}

debug();
