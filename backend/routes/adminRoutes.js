import express from 'express';
import {
    getUsers,
    approveUser,
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
router.use(authorize(['Admin', 'Super Admin']));

router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/details', updateUserDetails);
router.put('/users/:id/manager', assignManager);

// Configuration Management
router.get('/configs', getOrgConfigs);
router.post('/configs', createOrgConfig);
router.delete('/configs/:id', deleteOrgConfig);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
