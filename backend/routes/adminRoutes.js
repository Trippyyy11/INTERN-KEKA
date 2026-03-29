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
    updateSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are restricted to Admin or Super Admin
router.use(protect);
router.get('/settings', getSettings);
router.get('/org-users', getUsers); // Accessible to all authenticated users for org tree

router.use(authorize(['Reporting Manager', 'Super Admin']));

router.get('/users', getUsers);
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
