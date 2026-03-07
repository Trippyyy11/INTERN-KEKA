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

// @desc    Get teammates (same department)
// @route   GET /api/auth/teammates
// @access  Private
export const getTeammates = async (req, res) => {
    try {
        const myDept = req.user.department;
        if (!myDept) {
            return res.status(200).json([]);
        }
        const teammates = await User.find({
            department: myDept,
            _id: { $ne: req.user._id },
            isActive: true
        }).select('name email designation department joiningDate dob avatar welcomeProfile');

        res.status(200).json(teammates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
