import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, internId: String }));
        
        console.log('Attempting to drop existing internId index...');
        try {
            await User.collection.dropIndex('internId_1');
            console.log('Index dropped successfully.');
        } catch (e) {
            console.log('No index named internId_1 found (or already dropped).');
        }

        console.log('Creating new sparse unique index for internId...');
        await User.collection.createIndex({ internId: 1 }, { unique: true, sparse: true });
        console.log('Sparse unique index created successfully!');
        
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

fixIndex();
