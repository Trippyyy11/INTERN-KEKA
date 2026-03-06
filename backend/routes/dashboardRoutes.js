import express from 'express';
import { getDashboardStats, createAnnouncement } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.post('/announcements', protect, createAnnouncement);

export default router;
