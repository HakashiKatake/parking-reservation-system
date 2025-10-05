import express from 'express';
import { getParkingLots } from '../controllers/parkingLotController.js';

const router = express.Router();

// Search parking lots - reuse the main parking lots controller with search functionality
router.get('/parking-lots', getParkingLots);

// Placeholder for Google Places API integration
router.get('/places', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google Places search endpoint - Coming soon',
    data: []
  });
});

export default router;