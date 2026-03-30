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

        const today = moment().startOf('day');
        const startOfToday = today.toDate();
        const endOfToday = moment().endOf('day').toDate();
        const todayName = moment().format('dddd');

        console.log(`Today is: ${todayName}`);

        const interns = await User.find({ role: 'Intern', isActive: true, isDeleted: { $ne: true } }).toArray();
        for (const m of interns) {
            const att = await Attendance.findOne({
                user: m._id,
                date: { $gte: startOfToday, $lte: endOfToday }
            });
            
            const isClockedIn = !!att;
            const isOnLeave = false; 
            const weekOffs = m.workingSchedule?.weekOffs || ['Sunday'];
            const isWeekOff = weekOffs.includes(todayName);
            
            console.log(`User: ${m.name}`);
            console.log(` - isClockedIn: ${isClockedIn}`);
            console.log(` - isWeekOff: ${isWeekOff} (WeekOffs: ${JSON.stringify(weekOffs)})`);
            console.log(` - SHOULD BE IN notInYet: ${!isClockedIn && !isOnLeave && !isWeekOff}`);
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Debug script error:', err);
        process.exit(1);
    }
}

debug();
