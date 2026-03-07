import express from 'express';
import { clockIn, clockOut, getLogs, getTodayStatus, getTeamStats, getTeammateIndividualStats } from '../controllers/attendanceController.js';
import { getBirthdays, getTeammates } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/logs', protect, getLogs);
router.get('/status/today', protect, getTodayStatus);
router.get('/birthdays', protect, getBirthdays);
router.get('/teammates', protect, getTeammates);
router.get('/team-stats', protect, getTeamStats);
router.get('/teammates-stats', protect, getTeammateIndividualStats);

export default router;
