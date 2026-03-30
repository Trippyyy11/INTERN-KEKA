import express from 'express';
import { getMyPayslips, getAllPayslips, createPayslip, updatePayslipStatus } from '../controllers/payslipController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyPayslips);
router.get('/all', protect, authorize(['Super Admin', 'Reporting Manager']), getAllPayslips);
router.post('/', protect, authorize(['Super Admin', 'Reporting Manager']), createPayslip);
router.put('/:id', protect, authorize(['Super Admin', 'Reporting Manager']), updatePayslipStatus);

export default router;

