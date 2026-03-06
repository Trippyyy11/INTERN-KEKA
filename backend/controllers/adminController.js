import User from '../models/User.js';
import Settings from '../models/Settings.js';

// @desc    Get all users (Interns & Admins)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('reportingManager', 'name email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign Reporting Manager
// @route   PUT /api/admin/users/:id/manager
// @access  Private/Admin
export const assignManager = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { managerId } = req.body;

        if (user) {
            user.reportingManager = managerId;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update global settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings.workingHoursPerDay = req.body.workingHoursPerDay || settings.workingHoursPerDay;
            settings.defaultLeaveQuota = req.body.defaultLeaveQuota || settings.defaultLeaveQuota;
            settings.companyName = req.body.companyName || settings.companyName;
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

