import express from 'express';
import { getMyPayslips, getAllPayslips, createPayslip, updatePayslipStatus } from '../controllers/payslipController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyPayslips);
router.get('/all', protect, authorize(['Super Admin', 'Admin']), getAllPayslips);
router.post('/', protect, authorize(['Super Admin', 'Admin']), createPayslip);
router.put('/:id', protect, authorize(['Super Admin', 'Admin']), updatePayslipStatus);

export default router;

