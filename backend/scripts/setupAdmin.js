import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const setupAdmin = async () => {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'System Admin';

    if (!email || !password) {
        console.error('Usage: node setupAdmin.js <email> <password> [name]');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists. Promoting to Super Admin and updating password...');
            existingUser.password = password;
            existingUser.role = 'Super Admin';
            existingUser.isApproved = true;
            existingUser.isVerified = true;
            await existingUser.save();
            console.log('Admin updated successfully!');
        } else {
            console.log('Creating new Super Admin user...');
            await User.create({
                name,
                email,
                password,
                role: 'Super Admin',
                isApproved: true,
                isVerified: true
            });
            console.log('Admin created successfully!');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error setting up admin:', error.message);
        process.exit(1);
    }
};

setupAdmin();
