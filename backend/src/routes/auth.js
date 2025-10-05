import express from 'express';
import {
  register,
  login,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  registerValidation,
  loginValidation
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidation, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', otpLimiter, sendOTP);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

export default router;