import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getUserReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  checkinReservation,
  checkoutReservation,
  verifyQRCode,
  checkReservationConflicts
} from '../controllers/reservationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user reservations and create new reservation
router.route('/')
  .get(getUserReservations)
  .post(createReservation);

// Single reservation operations
router.route('/:id')
  .get(getReservation)
  .put(updateReservation);

// Reservation actions
router.put('/:id/cancel', cancelReservation);
router.post('/:id/checkin', checkinReservation);
router.post('/:id/checkout', checkoutReservation);

// QR Code verification (vendor only)
router.post('/verify-qr', restrictTo('vendor'), verifyQRCode);

// Check for reservation conflicts
router.post('/check-conflicts', checkReservationConflicts);

export default router;