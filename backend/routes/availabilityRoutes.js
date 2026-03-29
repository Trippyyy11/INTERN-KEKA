import express from 'express';
import { getAvailability, upsertAvailability, exportAvailability } from '../controllers/availabilityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAvailability);
router.put('/', upsertAvailability);
router.get('/export', exportAvailability);

export default router;
