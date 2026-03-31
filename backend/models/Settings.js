import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        // Define settings the admin can change dynamically
        workingHoursPerDay: { type: Number, default: 8 },
        paymentDate: { type: Number, default: 1 }, // 1-31
        defaultLeaveQuotas: {
            paid: { type: Number, default: 12 },
            sick: { type: Number, default: 6 },
            casual: { type: Number, default: 6 },
            compOff: { type: Number, default: 0 }
        },
        companyName: { type: String, default: 'Teaching Pariksha' }
    },
    { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
