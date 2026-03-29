import express from 'express';
import { getAuditLogs, exportAuditLogs } from '../controllers/auditController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize(['Super Admin']));

router.get('/', getAuditLogs);
router.post('/export', exportAuditLogs);

export default router;
