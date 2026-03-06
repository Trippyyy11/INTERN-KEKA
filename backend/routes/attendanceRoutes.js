import express from 'express';
import { clockIn, clockOut, getLogs } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/logs', protect, getLogs);

export default router;
