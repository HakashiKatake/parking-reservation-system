import express from 'express';
import {
  getParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  checkAvailability,
  searchVendorLotsByLocation,
  verifyAllParkingLots,
  createParkingLotValidation
} from '../controllers/parkingLotController.js';
import { protect, restrictTo, requireVendorVerification } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', getParkingLots);
router.get('/search-vendors', searchVendorLotsByLocation);
router.get('/:id', getParkingLot);
router.post('/:id/check-availability', checkAvailability);

// Temporary route to verify all existing parking lots
router.patch('/verify-all', verifyAllParkingLots);

// Protected routes
router.use(protect); // All routes below require authentication

// Vendor only routes
router.post(
  '/',
  restrictTo('vendor'),
  // requireVendorVerification, // Temporarily disabled for testing
  createParkingLotValidation,
  handleValidationErrors,
  createParkingLot
);

router.put(
  '/:id',
  restrictTo('vendor'),
  // requireVendorVerification, // Temporarily disabled for testing
  updateParkingLot
);

router.delete(
  '/:id',
  restrictTo('vendor'),
  // requireVendorVerification, // Temporarily disabled for testing
  deleteParkingLot
);

export default router;