import express from 'express';
import { requestLeave, getMyLeaves, updateLeaveStatus } from '../controllers/leaveController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, requestLeave).get(protect, getMyLeaves);
router.route('/:id/status').put(protect, adminOnly, updateLeaveStatus);

export default router;
