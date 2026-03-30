import express from 'express';
import {
    getUsers,
    approveUser,
    denyUser,
    deleteUser,
    updateUserDetails,
    getOrgConfigs,
    createOrgConfig,
    deleteOrgConfig,
    assignManager,
    getSettings,
    updateSettings,
    createUser,
    updateUserPermissions
} from '../controllers/adminController.js';
import { protect, authorize, hasPermission } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are restricted to Admin or Super Admin context
router.use(protect);
router.get('/settings', getSettings);
router.get('/org-users', getUsers); // Accessible to all authenticated users for org tree

// Users with canCreateUsers permission OR Reporting Manager OR Super Admin can access GET /users
router.get('/users', (req, res, next) => {
    const role = req.user?.role?.toLowerCase().replace(/\s/g, '');
    if (role === 'superadmin' || role === 'reportingmanager' || role === 'reportingofficer' || req.user?.permissions?.canCreateUsers) {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized for this route' });
}, getUsers);

// Only specific roles or permissions can create users
router.post('/users', hasPermission('canCreateUsers'), createUser);

// Only Super Admins can update permissions
router.patch('/users/:id/permissions', authorize(['Super Admin']), updateUserPermissions);

router.use(authorize(['Reporting Manager', 'Super Admin']));
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/deny', denyUser);
router.put('/users/:id/details', updateUserDetails);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/manager', assignManager);

// Configuration Management
router.get('/configs', getOrgConfigs);
router.post('/configs', createOrgConfig);
router.delete('/configs/:id', deleteOrgConfig);

// System Settings
router.put('/settings', updateSettings);

export default router;
