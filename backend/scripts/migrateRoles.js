import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function migrateRoles() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Migrate Admin → Reporting Officer
        const adminResult = await usersCollection.updateMany(
            { role: 'Admin' },
            { $set: { role: 'Reporting Officer' } }
        );
        console.log(`Migrated ${adminResult.modifiedCount} users from 'Admin' to 'Reporting Officer'`);

        // Migrate Employee → Intern
        const employeeResult = await usersCollection.updateMany(
            { role: 'Employee' },
            { $set: { role: 'Intern' } }
        );
        console.log(`Migrated ${employeeResult.modifiedCount} users from 'Employee' to 'Intern'`);

        console.log('Role migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateRoles();
