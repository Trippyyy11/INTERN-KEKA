import mongoose from 'mongoose';
import Payslip from '../backend/models/Payslip.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');
        const res = await Payslip.updateMany(
            { month: { $in: ['February', 'March'] }, year: 2026 },
            { $set: { status: 'Unpaid', paidAt: null } }
        );
        console.log(`Updated ${res.modifiedCount} payslips to Unpaid.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reset();
