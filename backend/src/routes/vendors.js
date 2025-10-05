import express from 'express';
import { protect, restrictTo, requireVendorVerification } from '../middleware/auth.js';
import User from '../models/User.js';
import {
  getDashboard,
  getVendorParkingLots,
  getVendorReservations,
  getAnalytics
} from '../controllers/vendorController.js';

const router = express.Router();

// All routes are protected and vendor-only
router.use(protect);
router.use(restrictTo('vendor'));

// Vendor verification (for testing - remove in production)
router.post('/verify', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isVerified: true });
    res.json({
      success: true,
      message: 'Vendor verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying vendor'
    });
  }
});

// Apply vendor verification requirement for protected routes
// router.use(requireVendorVerification); // Temporarily disabled for testing

// Vendor-specific routes  
router.get('/dashboard', getDashboard);
router.get('/parking-lots', getVendorParkingLots);
router.get('/reservations', getVendorReservations);
router.get('/analytics', getAnalytics);

export default router;