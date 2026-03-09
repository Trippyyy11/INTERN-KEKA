import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, checkClockInReminder } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.get('/check-clockin', protect, checkClockInReminder);
router.put('/:id/read', protect, markAsRead);

export default router;
