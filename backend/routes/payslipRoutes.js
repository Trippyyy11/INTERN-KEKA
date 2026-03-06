import express from 'express';
import { getMyPayslips, createPayslip } from '../controllers/payslipController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getMyPayslips).post(protect, adminOnly, createPayslip);

export default router;
