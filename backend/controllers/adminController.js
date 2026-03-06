import User from '../models/User.js';
import Settings from '../models/Settings.js';
import OrgConfig from '../models/OrgConfig.js';

// @desc    Get all users (with approval status)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('reportingManager', 'name email');
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Approve/Action a user
export const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = true;
            await user.save();
            res.json({ message: 'User approved successfully' });
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update user specific data (Salary, Designation etc by Admin)
export const updateUserDetails = async (req, res) => {
    try {
        const { salary, role, department, designation, isActive } = req.body;
        const user = await User.findById(req.params.id);
        if (user) {
            if (salary) user.salary = { ...user.salary, ...salary };
            if (role) user.role = role;
            if (department) user.department = department;
            if (designation) user.designation = designation;
            if (typeof isActive !== 'undefined') user.isActive = isActive;

            await user.save();
            res.json(user);
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Org Config Management
export const getOrgConfigs = async (req, res) => {
    try {
        const configs = await OrgConfig.find({});
        res.json(configs);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createOrgConfig = async (req, res) => {
    try {
        const config = await OrgConfig.create(req.body);
        res.status(201).json(config);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteOrgConfig = async (req, res) => {
    try {
        await OrgConfig.findByIdAndDelete(req.params.id);
        res.json({ message: 'Config deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const assignManager = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.reportingManager = req.body.managerId;
            await user.save();
            res.json(user);
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne() || await Settings.create({});
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne() || await Settings.create(req.body);
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
