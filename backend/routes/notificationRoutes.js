import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, checkClockInReminder, deleteNotification, deleteAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.get('/check-clockin', protect, checkClockInReminder);
router.put('/:id/read', protect, markAsRead);
router.delete('/all', protect, deleteAllNotifications);
router.delete('/:id', protect, deleteNotification);

export default router;
