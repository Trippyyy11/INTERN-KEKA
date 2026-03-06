import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // Made optional for initial OTP stage
        role: { type: String, enum: ['Super Admin', 'Admin', 'Employee'], default: 'Employee' },
        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        department: { type: String },
        designation: { type: String },
        joiningDate: { type: Date },
        dob: { type: Date },
        place: { type: String },
        phoneNumber: { type: String },
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
        isActive: { type: Boolean, default: true },
        welcomeProfile: {
            about: { type: String, default: '' },
            loveJob: { type: String, default: '' },
            interests: { type: String, default: '' }
        }
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
