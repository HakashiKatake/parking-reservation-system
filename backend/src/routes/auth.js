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

const router = express.Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', sendOTP);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

export default router;