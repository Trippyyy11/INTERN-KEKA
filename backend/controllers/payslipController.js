import Payslip from '../models/Payslip.js';

// @desc    Get my payslips
// @route   GET /api/payslips
// @access  Private
export const getMyPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.find({ user: req.user._id }).sort({ year: -1, month: -1 });
        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payslips (Admin/Super Admin only)
// @route   GET /api/payslips/all
// @access  Private/Admin
export const getAllPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.find({}).populate('user', 'name email department designation').sort({ year: -1, month: -1 });
        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Payslip Status (Admin)
// @route   PUT /api/payslips/:id
// @access  Private/Admin
export const updatePayslipStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payslip = await Payslip.findById(req.params.id);
        
        if (!payslip) {
            return res.status(404).json({ message: 'Payslip not found' });
        }

        payslip.status = status;
        if (status === 'Paid') {
            payslip.paidAt = new Date();
        } else {
            payslip.paidAt = null;
        }

        await payslip.save();
        res.status(200).json(payslip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Create Payslip (Admin)
// @route   POST /api/payslips
// @access  Private/Admin
export const createPayslip = async (req, res) => {
    try {
        const payslip = await Payslip.create(req.body);
        res.status(201).json(payslip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
