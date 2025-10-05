import express from 'express';
import {
  getVendorAnalytics,
  getRFMAnalysis,
  getCLVAnalysis,
  getNPSScore,
  getRevenueProjections
} from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and vendor role
router.use(protect);
router.use(restrictTo('vendor'));

// Vendor analytics dashboard overview
router.get('/overview', getVendorAnalytics);

// RFM Analysis (Recency, Frequency, Monetary)
router.get('/rfm', getRFMAnalysis);

// Customer Lifetime Value analysis
router.get('/clv', getCLVAnalysis);

// Net Promoter Score
router.get('/nps', getNPSScore);

// Revenue projections
router.get('/projections', getRevenueProjections);

export default router;