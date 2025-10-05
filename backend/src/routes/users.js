import express from 'express';
import { protect } from '../middleware/auth.js';
import Reservation from '../models/Reservation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// User-specific routes
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile endpoint - Coming soon'
  });
});

router.get('/reservations', protect, asyncHandler(async (req, res) => {
  const { status, limit = 10, page = 1, sortBy = 'createdAt' } = req.query;
  
  // Build query
  const query = { user: req.user._id };
  if (status) {
    query.status = status;
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Sort options
  const sortOptions = {};
  if (sortBy === 'date') {
    sortOptions['timeSlot.startTime'] = -1;
  } else {
    sortOptions[sortBy] = -1;
  }
  
  // Fetch reservations with parking lot details
  const reservations = await Reservation.find(query)
    .populate({
      path: 'parkingLot',
      select: 'name address contactInfo ratings'
    })
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip);
  
  // Get total count for pagination
  const total = await Reservation.countDocuments(query);
  
  res.status(200).json({
    success: true,
    message: 'User reservations retrieved successfully',
    data: {
      reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get user dashboard statistics
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get various statistics
  const [
    totalBookings,
    activeBookings,
    completedBookings,
    totalSpentResult,
    recentReservations
  ] = await Promise.all([
    Reservation.countDocuments({ user: userId }),
    Reservation.countDocuments({ 
      user: userId, 
      status: { $in: ['confirmed', 'active'] }
    }),
    Reservation.countDocuments({ 
      user: userId, 
      status: 'completed' 
    }),
    Reservation.aggregate([
      { $match: { user: userId, 'paymentInfo.paymentStatus': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]),
    Reservation.find({ user: userId })
      .populate('parkingLot', 'name address')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);
  
  const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;
  
  // Calculate favorite spots (most frequently booked parking lots)
  const favoriteSpots = await Reservation.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$parkingLot', count: { $sum: 1 } } },
    { $lookup: { from: 'parkinglots', localField: '_id', foreignField: '_id', as: 'parkingLot' } },
    { $unwind: '$parkingLot' },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { name: '$parkingLot.name', address: '$parkingLot.address', bookingCount: '$count' } }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'User dashboard data retrieved successfully',
    data: {
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent,
        favoriteSpots: favoriteSpots.length
      },
      recentReservations,
      favoriteSpots
    }
  });
}));

router.get('/favorites', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User favorites endpoint - Coming soon',
    data: []
  });
});

export default router;