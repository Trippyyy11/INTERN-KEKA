import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OrgConfig from '../models/OrgConfig.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import { createAuditLog } from './auditController.js';

import Settings from '../models/Settings.js';

const sendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    };

    res.cookie('token', token, cookieOptions);

    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        place: user.place,
        reportingManager: user.reportingManager,
        welcomeProfile: user.welcomeProfile,
        internId: user.internId,
        profilePicture: user.profilePicture
    });
};

// @desc    Step 1: Register Name & Email, Send OTP
// @route   POST /api/auth/register
export const registerInit = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and Email are required' });

        const userExists = await User.findOne({ email, isDeleted: { $ne: true } });
        if (userExists && userExists.isVerified && userExists.password) {
            return res.status(400).json({ message: 'User already exists and is verified.' });
        }

        const otp = '123456'; // Default for dev bypass
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        let user = await User.findOne({ email });
        if (user) {
            user.name = name;
            user.isVerified = true; // Auto-verify
            await user.save();
        } else {
            user = await User.create({ name, email, isVerified: true }); // Auto-verify
        }

        // Email sending disabled for improvement period
        /*
        try {
            await sendEmail({...});
        } catch (err) { ... }
        */

        console.log('OTP Bypass enabled for production-readiness testing');
        res.status(200).json({ message: 'Success: User verified.' });
    } catch (error) {
        console.error('Registration Step 1 CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Step 2: Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified. Please complete your profile.' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'New Verification Code - Teaching Pariksha',
                message: `Your new verification code is: ${otp}`,
                html: `<p>Your new verification code is: <strong>${otp}</strong></p>`
            });
            res.status(200).json({ message: 'New OTP sent to your email.' });
        } catch (err) { res.status(500).json({ message: 'Failed to send email.' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Step 3: Complete Profile & Set Password
// @route   POST /api/auth/complete-registration
export const completeRegistration = async (req, res) => {
    try {
        const { email, password, designation, department, joiningDate, dob, place, phoneNumber, bloodGroup, gender } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) return res.status(400).json({ message: 'Please verify email first.' });

        user.password = password;
        user.designation = designation;
        user.department = department;
        user.joiningDate = joiningDate;
        user.dob = dob;
        user.place = place;
        user.phoneNumber = phoneNumber;
        user.bloodGroup = bloodGroup;
        user.gender = gender;
        user.isApproved = false; // Always require admin approval for production safety
        user.role = 'Intern';

        // Fetch system settings for default leave quotas
        const settings = await Settings.findOne();
        if (settings && settings.defaultLeaveQuotas) {
            user.leaveQuotas = { ...settings.defaultLeaveQuotas };
        }

        await user.save();

        // Audit log: user registered
        await createAuditLog(user._id, 'USER_REGISTERED', `New user registered: ${user.name} (${user.email})`, { targetModel: 'User', targetId: user._id });

        res.status(200).json({
            message: 'Account created! Pending Admin approval.',
            requiresApproval: true
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update own profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, dob, joiningDate, phoneNumber, bloodGroup, gender, place, department, designation } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (dob) updateData.dob = dob;
        if (joiningDate) updateData.joiningDate = joiningDate;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (bloodGroup) updateData.bloodGroup = bloodGroup;
        if (gender) updateData.gender = gender;
        if (place) updateData.place = place;
        if (department) updateData.department = department;
        if (designation) updateData.designation = designation;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout User / Clear Cookie
// @route   GET /api/auth/logout
export const logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Login
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase();
        const { password } = req.body;
        const user = await User.findOne({ email, isDeleted: { $ne: true } }).populate('reportingManager', 'name email');

        if (user) {
            if (!user.password) {
                return res.status(401).json({ message: 'Account incomplete: No password set. Please contact admin.' });
            }
            if (await user.matchPassword(password)) {
                if (!user.isApproved) return res.status(401).json({ message: 'Account pending approval from Admin.' });

                return sendToken(user, 200, res);
            }
        }
        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Org Config Options (Depts/Desigs) for dropdowns
// @route   GET /api/auth/options
export const getOrgOptions = async (req, res) => {
    try {
        const depts = await OrgConfig.find({ type: 'Department' });
        const desigs = await OrgConfig.find({ type: 'Designation' });
        res.json({ departments: depts, designations: desigs });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req, res) => { res.status(200).json(req.user); };

export const promoteToSuperAdmin = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = 'Super Admin';
    await user.save();
    res.json({ message: 'Promoted' });
};

// @desc    Update Welcome Profile responses
// @route   PUT /api/auth/welcome-profile
export const updateWelcomeProfile = async (req, res) => {
    try {
        const { about, loveJob, interests } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.welcomeProfile = {
            about: about !== undefined ? about : user.welcomeProfile.about,
            loveJob: loveJob !== undefined ? loveJob : user.welcomeProfile.loveJob,
            interests: interests !== undefined ? interests : user.welcomeProfile.interests
        };

        await user.save();
        res.status(200).json(user.welcomeProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user bank details
// @route   PUT /api/auth/bank-details
export const updateBankDetails = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.bankDetails = {
            accountHolderName: accountHolderName || user.bankDetails.accountHolderName,
            accountNumber: accountNumber || user.bankDetails.accountNumber,
            ifscCode: ifscCode || user.bankDetails.ifscCode,
            bankName: bankName || user.bankDetails.bankName,
            branchName: branchName || user.bankDetails.branchName,
            upiId: upiId !== undefined ? upiId : user.bankDetails.upiId
        };

        await user.save();
        res.status(200).json(user.bankDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile picture
// @route   PUT /api/auth/profile-picture
export const updateProfilePicture = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;

        await user.save();
        res.status(200).json({ profilePicture: user.profilePicture });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
