import User from '../models/User.js';

// @desc    Get all birthdays
// @route   GET /api/attendance/birthdays
// @access  Private
export const getBirthdays = async (req, res) => {
    try {
        const users = await User.find({ dob: { $ne: null } }).select('name dob department avatar');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
