import express from 'express';
import { getMyPayslips, getAllPayslips, createPayslip } from '../controllers/payslipController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyPayslips);
router.get('/all', protect, authorize(['Super Admin']), getAllPayslips);
router.post('/', protect, authorize(['Super Admin']), createPayslip);

export default router;

