import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        month: { type: String, required: true }, // e.g., 'August'
        year: { type: Number, required: true }, // e.g., 2026
        earnings: {
            basicSalary: { type: Number, required: true },
            hra: { type: Number, default: 0 },
            specialAllowance: { type: Number, default: 0 },
            bonus: { type: Number, default: 0 }
        },
        deductions: {
            pf: { type: Number, default: 0 },
            tax: { type: Number, default: 0 },
            professionalTax: { type: Number, default: 0 }
        },
        netPay: { type: Number, required: true },
        pdfUrl: { type: String } // Optional: S3 link or local path to downloaded PDF
    },
    { timestamps: true }
);

const Payslip = mongoose.model('Payslip', payslipSchema);
export default Payslip;
