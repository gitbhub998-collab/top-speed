import express from 'express';
import { login, register, verifyOTP, resendOTP, createAdmin, updateEmail, getCurrentUser, updateProfile, changePassword, uploadAvatar, logout } from '../controllers/authController.js';
import { authMiddleware, adminBootstrapMiddleware } from '../middleware/auth.js';
import { adminBootstrapRateLimit, authRateLimit, otpRateLimit, registrationRateLimit, rateLimit } from '../middleware/security.js';

const router = express.Router();

router.post('/login', authRateLimit, login);
router.post('/register', registrationRateLimit, register);
router.post('/verify-otp', otpRateLimit, verifyOTP);
router.post('/resend-otp', otpRateLimit, resendOTP);
router.post('/create-admin', adminBootstrapRateLimit, adminBootstrapMiddleware, createAdmin);
router.post('/update-email', authMiddleware, updateEmail);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/me', authMiddleware, rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), updateProfile);
router.post('/me/avatar', authMiddleware, rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), uploadAvatar);
router.post('/change-password', authMiddleware, rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), changePassword);
router.post('/logout', authMiddleware, logout);

export default router;
