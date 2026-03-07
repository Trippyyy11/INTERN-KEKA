import express from 'express';
import { getActivities, createActivity, votePoll, deleteActivity } from '../controllers/socialController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getActivities)
    .post(protect, createActivity);

router.post('/:id/vote', protect, votePoll);
router.delete('/:id', protect, deleteActivity);

export default router;
