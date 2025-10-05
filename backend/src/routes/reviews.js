import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Review routes
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Reviews endpoint - Coming soon',
    data: []
  });
});

router.post('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Create review endpoint - Coming soon'
  });
});

export default router;