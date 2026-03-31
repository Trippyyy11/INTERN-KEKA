import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: false }, // Made optional for initial OTP stage
        role: { type: String, enum: ['Super Admin', 'Reporting Manager', 'Intern'], default: 'Intern' },
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
        isApproved: { type: Boolean, default: true },
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
        permissions: {
            canCreateUsers: { type: Boolean, default: false },
            canViewUsersTab: { type: Boolean, default: false },
            canViewAttendanceTab: { type: Boolean, default: false },
            canViewConfigsTab: { type: Boolean, default: false },
            canViewSettingsTab: { type: Boolean, default: false },
            canViewBankTab: { type: Boolean, default: false },
            canViewPayrollTab: { type: Boolean, default: false },
            canViewPermissionsTab: { type: Boolean, default: false },
            canViewAuditTab: { type: Boolean, default: false }
        },
        slackBotToken: { type: String, default: '' },
        internId: { type: String, unique: true, sparse: true } // Sparse allows multiple nulls for non-interns
    },
    { timestamps: true }
);

// Encrypt password AND auto-generate Intern ID
userSchema.pre('save', async function () {
    // 1. Handle password encryption
    if (this.password && this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // 2. Handle auto-generation of Intern ID (Only for Intern role)
    if (this.role === 'Intern') {
        if (!this.internId) {
            try {
                const User = mongoose.model('User');
                // Find the user with the highest numeric internId suffix
                // We look for IDs starting with TPINT
                const lastUser = await User.findOne({ internId: /^TPINT/ }).sort({ internId: -1 });
                
                let nextId = 101;
                if (lastUser && lastUser.internId) {
                    const lastIdMatch = lastUser.internId.match(/TPINT(\d+)/);
                    if (lastIdMatch) {
                        nextId = parseInt(lastIdMatch[1]) + 1;
                    }
                }
                
                this.internId = `TPINT${nextId}`;
            } catch (error) {
                throw error;
            }
        }
    } else {
        // Clear internId if not an Intern
        this.internId = undefined;
    }
});

// Compare password function
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
