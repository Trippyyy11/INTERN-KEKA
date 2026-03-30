import express from 'express';
import { clockIn, clockOut, getLogs, getTodayStatus, getTeamStats, getTeammateIndividualStats, getUserLogs, updateAttendance, getAllLogs } from '../controllers/attendanceController.js';
import { getBirthdays, getTeammates } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/logs', protect, getLogs);
router.get('/status/today', protect, getTodayStatus);
router.get('/birthdays', protect, getBirthdays);
router.get('/teammates', protect, getTeammates);
router.get('/team-stats', protect, getTeamStats);
router.get('/teammates-stats', protect, getTeammateIndividualStats);
router.get('/all', protect, authorize(['Reporting Manager', 'Super Admin']), getAllLogs);
router.get('/logs/:userId', protect, authorize(['Reporting Manager', 'Super Admin']), getUserLogs);
router.put('/logs/:logId', protect, authorize(['Reporting Manager', 'Super Admin']), updateAttendance);

export default router;
