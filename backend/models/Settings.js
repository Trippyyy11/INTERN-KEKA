import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        // Define settings the admin can change dynamically
        workingHoursPerDay: { type: Number, default: 8 },
        defaultLeaveQuota: { type: Number, default: 12 },
        companyName: { type: String, default: 'Teaching Pariksha' }
    },
    { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
