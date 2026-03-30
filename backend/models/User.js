import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // Made optional for initial OTP stage
        role: { type: String, enum: ['Super Admin', 'Reporting Manager', 'Reporting Officer', 'Intern'], default: 'Intern' },
        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        department: { type: String },
        designation: { type: String },
        joiningDate: { type: Date },
        dob: { type: Date },
        place: { type: String },
        phoneNumber: { type: String },
        bloodGroup: { type: String },
        gender: { type: String },
        isVerified: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        otp: { type: String },
        otpExpiry: { type: Date },
        salary: {
            basic: { type: Number, default: 0 },
            allowance: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            deductions: { type: Number, default: 0 }
        },
        salaryDetails: {
            type: { type: String, enum: ['Fixed', 'Variable'], default: 'Fixed' },
            monthlyAmount: { type: Number, default: 0 }
        },
        workingSchedule: {
            shiftStart: { type: String, default: '11:00' }, // HH:mm
            shiftEnd: { type: String, default: '18:00' },   // HH:mm
            minHours: { type: Number, default: 7 },         // Daily requirement
            weekOffs: [{ type: String, default: 'Sunday' }]
        },
        leaveQuotas: {
            paid: { type: Number, default: 12 },
            sick: { type: Number, default: 6 },
            casual: { type: Number, default: 6 },
            compOff: { type: Number, default: 0 }
        },
        isActive: { type: Boolean, default: true },
        welcomeProfile: {
            about: { type: String, default: '' },
            loveJob: { type: String, default: '' },
            interests: { type: String, default: '' }
        },
        bankDetails: {
            accountHolderName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            bankName: { type: String, default: '' },
            branchName: { type: String, default: '' },
            upiId: { type: String, default: '' }
        },
        isDeleted: { type: Boolean, default: false },
        profilePicture: { type: String, default: '' },
        slackBotToken: { type: String, default: '' }
    },
    { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password function
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
