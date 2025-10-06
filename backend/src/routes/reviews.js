import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  createReview,
  getParkingLotReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getVendorReviews,
  respondToReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/parking-lot/:id', getParkingLotReviews);

// Protected routes (require authentication)
router.use(protect);

// User review routes
router.post('/', createReview);
router.get('/my-reviews', getUserReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// Vendor routes
router.get('/vendor-reviews', restrictTo('vendor'), getVendorReviews);
router.put('/:id/respond', restrictTo('vendor'), respondToReview);

export default router;