import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, internId: String }));

        // 1. Clean up IDs for non-interns (Managers, Admins)
        console.log('Removing Intern IDs from Non-Intern roles...');
        const cleanupResult = await User.updateMany(
            { role: { $ne: 'Intern' } },
            { $unset: { internId: "" } }
        );
        console.log(`Removed from ${cleanupResult.modifiedCount} non-intern accounts.`);

        // 2. Fetch all Interns without an ID, sorted by creation date
        const interns = await User.find({ role: 'Intern', internId: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`Found ${interns.length} Interns mapping for IDs...`);

        // 3. Find the starting suffix
        const lastUser = await User.findOne({ internId: /^TPINT/ }).sort({ internId: -1 });
        let nextId = 101;
        if (lastUser && lastUser.internId) {
            const lastIdMatch = lastUser.internId.match(/TPINT(\d+)/);
            if (lastIdMatch) {
                nextId = parseInt(lastIdMatch[1]) + 1;
            }
        }

        // 4. Assign IDs sequentially
        for (let user of interns) {
            const newInternId = `TPINT${nextId}`;
            await User.updateOne({ _id: user._id }, { $set: { internId: newInternId } });
            console.log(`Assigned ${newInternId} to ${user.email} (Role: ${user.role})`);
            nextId++;
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
