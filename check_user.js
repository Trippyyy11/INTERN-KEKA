import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, internId: String }));
        const users = await User.find({ email: /ruhi/i });
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
