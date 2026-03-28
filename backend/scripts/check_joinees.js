import mongoose from 'mongoose';
import dotenv from 'dotenv';
import moment from 'moment';
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function run() {
    const today = moment().startOf('day');
    const sevenDaysAgo = moment().subtract(7, 'days').startOf('day');
    
    console.log("Today:", today.toDate());
    console.log("Seven Days Ago:", sevenDaysAgo.toDate());
    
    const users = await User.find({ isDeleted: { $ne: true } }).select('name joiningDate createdAt');
    console.log(`\nTotal Active Users: ${users.length}\n`);
    
    users.forEach(u => {
        const isNew = moment(u.joiningDate || u.createdAt).isSameOrAfter(sevenDaysAgo);
        const joining = u.joiningDate ? moment(u.joiningDate).format('YYYY-MM-DD') : 'null';
        const created = u.createdAt ? moment(u.createdAt).format('YYYY-MM-DD') : 'null';
        console.log(`- ${u.name} | Joining: ${joining} | Created: ${created} | isNew: ${isNew}`);
    });
    
    process.exit(0);
}
run();
