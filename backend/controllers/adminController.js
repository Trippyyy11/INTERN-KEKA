import User from '../models/User.js';
import Settings from '../models/Settings.js';
import OrgConfig from '../models/OrgConfig.js';
import Notification from '../models/Notification.js';
import { createAuditLog } from './auditController.js';
import { getVisibilityQuery } from '../utils/userHelper.js';

// @desc    Get all users (with approval status)
export const getUsers = async (req, res) => {
    try {
        const { scope } = req.query;
        let filter = { isDeleted: { $ne: true } };
        
        if (scope !== 'org') {
            const visibilityFilter = getVisibilityQuery(req.user);
            filter = { ...filter, ...visibilityFilter };
        }
        
        const users = await User.find(filter).populate('reportingManager', 'name email');
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
            await createAuditLog(req.user._id, 'USER_APPROVED', `Approved user: ${user.name} (${user.email})`, { targetModel: 'User', targetId: user._id, ipAddress: req.ip });
            res.json({ message: 'User approved successfully' });
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Deny/Reject a user
export const denyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isDeleted = true;
            user.isActive = false;
            user.email = `${user.email}_deleted_${Date.now()}`;
            await user.save();
            await createAuditLog(req.user._id, 'USER_DENIED', `Denied user: ${user.name}`, { targetModel: 'User', targetId: user._id, ipAddress: req.ip });
            res.json({ message: 'User denied and removed successfully (Soft Deleted)' });
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Permanently delete a user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isDeleted = true;
            user.isActive = false;
            user.email = `${user.email}_deleted_${Date.now()}`;
            await user.save();
            await createAuditLog(req.user._id, 'USER_DELETED', `Deleted user: ${user.name}`, { targetModel: 'User', targetId: user._id, ipAddress: req.ip });
            res.json({ message: 'User permanently deleted successfully (Soft Deleted)' });
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update user specific data (Salary, Designation etc by Admin)
export const updateUserDetails = async (req, res) => {
    try {
        const { name, salary, role, department, designation, isActive, workingSchedule, leaveQuotas, salaryDetails, dob, joiningDate, phoneNumber, bloodGroup, gender, place } = req.body;
        const user = await User.findById(req.params.id);
        if (user) {
            if (name) user.name = name;
            if (salary) user.salary = { ...user.salary, ...salary };
            if (workingSchedule) user.workingSchedule = { ...user.workingSchedule, ...workingSchedule };
            if (leaveQuotas) user.leaveQuotas = { ...user.leaveQuotas, ...leaveQuotas };
            if (salaryDetails) user.salaryDetails = { ...user.salaryDetails, ...salaryDetails };
            if (role) user.role = role;
            if (department) user.department = department;
            if (designation) user.designation = designation;
            if (typeof isActive !== 'undefined') user.isActive = isActive;

            if (dob) user.dob = dob;
            if (joiningDate) user.joiningDate = joiningDate;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (bloodGroup) user.bloodGroup = bloodGroup;
            if (gender) user.gender = gender;
            if (place) user.place = place;

            await user.save();
            await createAuditLog(req.user._id, 'USER_UPDATED', `Updated details for: ${user.name}`, { targetModel: 'User', targetId: user._id, ipAddress: req.ip });
            res.json(user);
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create a new user directly
export const createUser = async (req, res) => {
    try {
        const { name, role, department, designation, reportingManager, phoneNumber } = req.body;
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({
            name,
            email,
            password,
            role,
            department,
            designation,
            reportingManager,
            phoneNumber,
            isVerified: true,
            isApproved: true,
            isActive: true
        });

        await newUser.save();
        await createAuditLog(req.user._id, 'USER_CREATED', `Created new user: ${name} (${email})`, { targetModel: 'User', targetId: newUser._id, ipAddress: req.ip });
        
        res.status(201).json(newUser);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update user permissions
export const updateUserPermissions = async (req, res) => {
    try {
        const { canCreateUsers } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.permissions = {
            ...user.permissions,
            canCreateUsers: !!canCreateUsers
        };
        
        await user.save();
        await createAuditLog(req.user._id, 'PERMISSIONS_UPDATED', `Updated permissions for: ${user.name}`, { targetModel: 'User', targetId: user._id, ipAddress: req.ip });
        res.json({ message: 'Permissions updated successfully', permissions: user.permissions });
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

        // --- Push Notification Logic ---
        // Exclude the user who created it (if req.user is available - wait, admin paths usually have req.user from protect middleware)
        const creatorId = req.user ? req.user._id : null;
        let query = {};
        if (creatorId) {
            query._id = { $ne: creatorId };
        }
        const allUsers = await User.find(query).select('_id');

        let notifTitle = 'New ' + config.type + ' Added';
        let notifMessage = config.name;
        if (config.type === 'Holiday') {
            notifMessage = `Holiday added: ${config.name}`;
        }

        const notifications = allUsers.map(u => ({
            user: u._id,
            type: 'config',
            title: notifTitle,
            message: notifMessage,
            relatedId: config._id,
            relatedModel: 'OrgConfig'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        await createAuditLog(req.user._id, 'CONFIG_ADDED', `Added ${config.type}: ${config.name}`, { targetModel: 'OrgConfig', targetId: config._id, ipAddress: req.ip });
        res.status(201).json(config);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteOrgConfig = async (req, res) => {
    try {
        const config = await OrgConfig.findByIdAndDelete(req.params.id);
        await createAuditLog(req.user._id, 'CONFIG_DELETED', `Deleted config: ${config?.name || req.params.id}`, { targetModel: 'OrgConfig', targetId: req.params.id, ipAddress: req.ip });
        res.json({ message: 'Config deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const assignManager = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { managerId } = req.body;

        if (managerId) {
            const manager = await User.findById(managerId);
            if (!manager) {
                return res.status(404).json({ message: 'Manager not found' });
            }

            // Define role weights
            const roleWeights = {
                'Super Admin': 3,
                'Reporting Manager': 2,
                'Intern': 1
            };

            const userWeight = roleWeights[user.role] || 0;
            const managerWeight = roleWeights[manager.role] || 0;

            // Rules:
            // 1. Admins and Super Admins can't be under Employee
            // 2. Super Admins can't be under Admin
            // General Rule: managerWeight must be >= userWeight
            if (managerWeight < userWeight) {
                return res.status(400).json({
                    message: `Invalid hierarchy: A ${user.role} cannot report to a ${manager.role}.`
                });
            }
        }

        user.reportingManager = managerId || null;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne() || await Settings.create({});
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        const oldQuotas = settings?.defaultLeaveQuotas;

        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }

        // If leave quotas were updated, propagate to all users
        if (req.body.defaultLeaveQuotas) {
            const newQuotas = req.body.defaultLeaveQuotas;

            // Logic: Update all users to the new defaults.
            // If we wanted to be smarter, we'd only update those who match the old defaults.
            // But usually 'generalized' means everyone follows the new policy unless specifically changed.
            await User.updateMany(
                {}, // Update all users
                { $set: { leaveQuotas: newQuotas } }
            );
        }

        await createAuditLog(req.user._id, 'SETTINGS_UPDATED', `Updated system settings`, { targetModel: 'Settings', ipAddress: req.ip });
        res.json(settings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
