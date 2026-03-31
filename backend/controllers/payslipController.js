import Payslip from '../models/Payslip.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

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

// @desc    Get Payroll Preview for all users
// @route   POST /api/payslips/preview
// @access  Private/Admin
export const getPayrollPreview = async (req, res) => {
    try {
        const { month, year, paymentDay, customStartDate, customEndDate } = req.body;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = months.indexOf(month);

        // Cycle Calculation
        let startDate, endDate;

        if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            endDate = new Date(year, monthIndex, paymentDay - 1, 23, 59, 59);
            startDate = new Date(year, monthIndex - 1, paymentDay, 0, 0, 0);
            if (paymentDay === 1) {
                startDate = new Date(year, monthIndex, 1, 0, 0, 0);
                endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
            }
        }

        const totalDaysInCycle = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        const users = await User.find({ role: { $ne: 'Super Admin' }, status: { $ne: 'Pending' }, isDeleted: false });
        const existingPayslips = await Payslip.find({ month, year: parseInt(year) });

        const previews = await Promise.all(users.map(async (u) => {
            const hasPayslip = existingPayslips.find(p => p.user.toString() === u._id.toString());
            const monthlyAmount = u.salaryDetails?.monthlyAmount || 0;
            const perDayWage = monthlyAmount / totalDaysInCycle;

            // Fetch Approved Leaves in cycle
            const leaves = await Leave.find({
                user: u._id,
                status: 'Approved',
                $or: [
                    { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
                ]
            });

            const leaveCounts = { sick: 0, paid: 0, casual: 0, compOff: 0, unpaid: 0, halfDay: 0 };
            leaves.forEach(l => {
                const start = l.startDate < startDate ? startDate : l.startDate;
                const end = l.endDate > endDate ? endDate : l.endDate;
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                if (l.type === 'Sick') leaveCounts.sick += days;
                else if (l.type === 'Paid') leaveCounts.paid += days;
                else if (l.type === 'Casual') leaveCounts.casual += days;
                else if (l.type === 'Comp Off') leaveCounts.compOff += days;
                else if (l.type === 'Unpaid') leaveCounts.unpaid += days;
                else if (l.type === 'Half Day') leaveCounts.halfDay += days;
            });

            // Attendance (Present Days)
            const attendance = await Attendance.find({
                user: u._id,
                date: { $gte: startDate, $lte: endDate },
                status: { $in: ['Present', 'WFH'] }
            });

            // Joining Date Pro-rata
            let proRataAdjustment = 0;
            if (u.joiningDate && u.joiningDate > startDate && u.joiningDate <= endDate) {
                const missedMs = u.joiningDate - startDate;
                const missedDays = Math.floor(missedMs / (1000 * 60 * 60 * 24));
                proRataAdjustment = Math.round(missedDays * perDayWage);
            }

            const unpaidDeduction = Math.round((leaveCounts.unpaid * perDayWage) + (leaveCounts.halfDay * 0.5 * perDayWage));
            const netPay = Math.max(0, Math.round(monthlyAmount - proRataAdjustment - unpaidDeduction));

            return {
                user: u,
                hasPayslip: !!hasPayslip,
                stipend: monthlyAmount,
                netPay,
                proRataAdjustment,
                unpaidDeduction,
                startDate,
                endDate,
                totalDaysInCycle,
                presentDays: attendance.length,
                leaveCounts
            };
        }));

        res.status(200).json(previews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Create Payslips
// @route   POST /api/payslips/bulk
// @access  Private/Admin
export const bulkCreatePayslips = async (req, res) => {
    try {
        const { payslips } = req.body;
        const created = await Payslip.insertMany(payslips);
        res.status(201).json(created);
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
