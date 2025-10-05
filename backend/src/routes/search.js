import express from 'express';
import { searchLimiter } from '../middleware/rateLimiting.js';
import { getParkingLots } from '../controllers/parkingLotController.js';

const router = express.Router();

// Search parking lots - reuse the main parking lots controller with search functionality
router.get('/parking-lots', searchLimiter, getParkingLots);

// Placeholder for Google Places API integration
router.get('/places', searchLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google Places search endpoint - Coming soon',
    data: []
  });
});

export default router;