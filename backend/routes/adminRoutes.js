import express from 'express';
import { getUsers, assignManager, getSettings, updateSettings } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/users').get(protect, adminOnly, getUsers);
router.route('/users/:id/manager').put(protect, adminOnly, assignManager);
router.route('/settings')
    .get(protect, adminOnly, getSettings)
    .put(protect, adminOnly, updateSettings);

export default router;
