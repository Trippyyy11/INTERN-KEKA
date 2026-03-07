import express from 'express';
import { requestLeave, getMyLeaves, updateLeaveStatus, getLeaveStats } from '../controllers/leaveController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, requestLeave).get(protect, getMyLeaves);
router.route('/stats').get(protect, getLeaveStats);
router.route('/:id/status').put(protect, authorize(['Admin', 'Super Admin']), updateLeaveStatus);

export default router;

