import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getInternUpdates, saveSlackToken, getTokenStatus } from '../controllers/slackController.js';

const router = express.Router();

// All routes require Admin or Super Admin
router.use(protect, authorize(['Reporting Officer', 'Super Admin']));

router.get('/intern-updates', getInternUpdates);
router.put('/token', saveSlackToken);
router.get('/token-status', getTokenStatus);

export default router;
