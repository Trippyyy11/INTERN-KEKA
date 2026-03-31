import express from 'express';
import { registerInit, verifyOTP, completeRegistration, loginUser, logoutUser, getMe, promoteToSuperAdmin, getOrgOptions, resendOTP, updateWelcomeProfile, updateProfile, updateBankDetails, updateProfilePicture } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerInit); // Step 1
router.post('/verify-otp', verifyOTP); // Step 2
router.post('/complete-registration', completeRegistration); // Step 3
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/options', getOrgOptions); // For registration dropdowns

// Forgot Password Flow
router.post('/forgot-password', (req, res, next) => import('../controllers/authController.js').then(m => m.forgotPassword(req, res, next))); 
router.post('/verify-reset-otp', (req, res, next) => import('../controllers/authController.js').then(m => m.verifyResetOTP(req, res, next)));
router.post('/reset-password', (req, res, next) => import('../controllers/authController.js').then(m => m.resetPassword(req, res, next)));

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/welcome-profile', protect, updateWelcomeProfile);
router.put('/bank-details', protect, updateBankDetails);
router.put('/profile-picture', protect, updateProfilePicture);
router.put('/promote/:id', protect, authorize(['Super Admin']), promoteToSuperAdmin);

export default router;
