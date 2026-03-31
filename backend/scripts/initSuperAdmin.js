import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const initSuperAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database.');

        const userCount = await User.countDocuments();

        if (userCount > 0) {
            console.log(`Safety Abort: There are already ${userCount} users in the database.`);
            console.log('This script is only meant for initializing a blank database.');
            process.exit(0);
        }

        const adminEmail = process.env.SUPERADMIN_EMAIL;
        const adminPassword = process.env.SUPERADMIN_PASSWORD;

        console.log(`Creating Super Admin with Email: ${adminEmail}`);

        const superAdmin = new User({
            name: 'Super Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'Super Admin',
            isApproved: true,
            isVerified: true,
            permissions: {
                canCreateUsers: true,
                canViewUsersTab: true,
                canViewAttendanceTab: true,
                canViewConfigsTab: true,
                canViewSettingsTab: true,
                canViewBankTab: true,
                canViewPayrollTab: true,
                canViewPermissionsTab: true,
                canViewAuditTab: true
            }
        });

        await superAdmin.save();

        console.log('--------------------------------------------------');
        console.log('SUCCESS: Super Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('Please log in and change your password immediately.');
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('ERROR during initialization:', error.message);
        process.exit(1);
    }
};

initSuperAdmin();
