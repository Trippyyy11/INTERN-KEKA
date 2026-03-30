import express from 'express';
import { getDashboardStats, createAnnouncement, getTeamCalendarStats, getAllHolidays } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/debug', getDashboardStats); // TEMPORARY DEBUG ROUTE
router.get('/team-calendar', protect, getTeamCalendarStats);
router.post('/announcements', protect, createAnnouncement);
router.get('/holidays', protect, getAllHolidays);

export default router;
