import express from 'express';
import { getDashboardStats, createAnnouncement, getTeamCalendarStats } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/team-calendar', protect, getTeamCalendarStats);
router.post('/announcements', protect, createAnnouncement);

export default router;
