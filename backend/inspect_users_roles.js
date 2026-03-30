import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const findUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}).select('name role department');
        console.log('--- User Roles & Departments ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Role: ${u.role}, Dept: ${u.department}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findUsers();
