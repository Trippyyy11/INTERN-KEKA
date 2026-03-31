import express from 'express';
import { 
    getMyPayslips, 
    getAllPayslips, 
    createPayslip, 
    updatePayslipStatus,
    getPayrollPreview,
    bulkCreatePayslips
} from '../controllers/payslipController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyPayslips);
router.get('/all', protect, authorize(['Super Admin', 'Reporting Manager', 'SuperAdmin']), getAllPayslips);
router.post('/', protect, authorize(['Super Admin', 'Reporting Manager', 'SuperAdmin']), createPayslip);
router.post('/preview', protect, authorize(['Super Admin', 'Reporting Manager', 'SuperAdmin']), getPayrollPreview);
router.post('/bulk', protect, authorize(['Super Admin', 'Reporting Manager', 'SuperAdmin']), bulkCreatePayslips);
router.put('/:id', protect, authorize(['Super Admin', 'Reporting Manager', 'SuperAdmin']), updatePayslipStatus);

export default router;

