import express from 'express';
import { registerInit, verifyOTP, completeRegistration, loginUser, getMe, promoteToSuperAdmin, getOrgOptions, resendOTP, updateWelcomeProfile, updateProfile, updateBankDetails, updateProfilePicture } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerInit); // Step 1
router.post('/verify-otp', verifyOTP); // Step 2
router.post('/complete-registration', completeRegistration); // Step 3
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.get('/options', getOrgOptions); // For registration dropdowns

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/welcome-profile', protect, updateWelcomeProfile);
router.put('/bank-details', protect, updateBankDetails);
router.put('/profile-picture', protect, updateProfilePicture);
router.put('/promote/:id', protect, authorize(['Super Admin']), promoteToSuperAdmin);

export default router;
