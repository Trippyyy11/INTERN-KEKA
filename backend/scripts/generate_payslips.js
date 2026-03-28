import mongoose from 'mongoose';
import User from '../models/User.js';
import Payslip from '../models/Payslip.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const generate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database.');

        const users = await User.find({ isDeleted: { $ne: true }, isApproved: true });
        console.log(`Found ${users.length} active approved users.`);

        const months = ['February', 'March'];
        const year = 2026;

        for (const user of users) {
            for (const month of months) {
                const existing = await Payslip.findOne({ user: user._id, month, year });
                if (!existing) {
                    const basic = user.salary?.basic || 0;
                    const hra = user.salary?.hra || 0;
                    const allowance = user.salary?.allowance || 0;
                    const deductions = user.salary?.deductions || 0;
                    
                    // Use salaryDetails.monthlyAmount if available as a fallback or base
                    const totalMonthly = user.salaryDetails?.monthlyAmount || (basic + hra + allowance);
                    
                    // If breakdown is zero but monthlyAmount exists, we might want to distribute it
                    // But for now, we follow the salary object fields as they are the source of truth for breakdown.
                    
                    const netPay = (basic + hra + allowance) - deductions;

                    await Payslip.create({
                        user: user._id,
                        month,
                        year,
                        earnings: {
                            basicSalary: basic,
                            hra,
                            specialAllowance: allowance,
                            bonus: 0
                        },
                        deductions: {
                            pf: 0,
                            tax: 0,
                            professionalTax: deductions
                        },
                        netPay,
                        status: 'Unpaid',
                        paidAt: null,
                        paymentMethod: 'Bank Transfer',
                        pdfUrl: '' // No PDF generated for this bulk script
                    });
                    console.log(`✅ Payslip generated for ${user.name} - ${month} ${year} (Net: ${netPay})`);
                } else {
                    console.log(`ℹ️ Payslip already exists for ${user.name} - ${month} ${year}`);
                }
            }
        }

        console.log('Bulk generation complete.');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL Error generating payslips:', error);
        process.exit(1);
    }
};

generate();
