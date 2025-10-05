import ParkingLot from '../models/ParkingLot.js';
import Reservation from '../models/Reservation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;

  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  const totalParkingLots = vendorParkingLots.length;

  // Calculate total bookings for vendor's parking lots
  const totalBookings = await Reservation.countDocuments({ 
    parkingLot: { $in: parkingLotIds } 
  });

  // Calculate total earnings from completed payments
  const earningsResult = await Reservation.aggregate([
    { 
      $match: { 
        parkingLot: { $in: parkingLotIds },
        'paymentInfo.paymentStatus': 'completed'
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$pricing.totalAmount' } 
      } 
    }
  ]);
  
  const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

  // Get average rating across all vendor's parking lots
  const ratingResult = await ParkingLot.aggregate([
    { $match: { vendor: vendorId } },
    { 
      $group: { 
        _id: null, 
        avgRating: { $avg: '$ratings.average' },
        totalReviews: { $sum: '$ratings.totalReviews' }
      } 
    }
  ]);
  
  const averageRating = ratingResult.length > 0 ? ratingResult[0].avgRating || 0 : 0;

  // Calculate today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayRevenueResult = await Reservation.aggregate([
    { 
      $match: { 
        parkingLot: { $in: parkingLotIds },
        'paymentInfo.paymentStatus': 'completed',
        'paymentInfo.paidAt': { $gte: today, $lt: tomorrow }
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$pricing.totalAmount' } 
      } 
    }
  ]);
  
  const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

  // Count pending bookings
  const pendingBookings = await Reservation.countDocuments({ 
    parkingLot: { $in: parkingLotIds },
    status: 'pending'
  });

  const stats = {
    totalParkingLots,
    totalEarnings,
    totalBookings,
    averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
  };

  const summary = {
    activeLots: totalParkingLots,
    pendingBookings,
    todayRevenue
  };

  res.status(200).json({
    success: true,
    data: { stats, summary }
  });
});

export const getVendorParkingLots = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const vendorId = req.user._id;

  const parkingLots = await ParkingLot.find({ vendor: vendorId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ParkingLot.countDocuments({ vendor: vendorId });

  res.status(200).json({
    success: true,
    data: {
      parkingLots,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    }
  });
});

export const getVendorReservations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ 
    vendor: req.user._id 
  }).select('_id');
  
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);

  // Build query for reservations in vendor's parking lots
  let query = { 
    parkingLot: { $in: parkingLotIds }
  };
  
  if (status) {
    query.status = status;
  }

  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Get reservations with populated data
  const reservations = await Reservation.find(query)
    .populate({
      path: 'user',
      select: 'name phoneNumber'
    })
    .populate({
      path: 'parkingLot',
      select: 'name address'
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalReservations = await Reservation.countDocuments(query);
  const totalPages = Math.ceil(totalReservations / parseInt(limit));

  console.log('Vendor reservations - Found:', reservations.length, 'Total:', totalReservations);

  res.status(200).json({
    success: true,
    data: {
      reservations,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReservations,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

export const getDashboard = getVendorDashboard;

export const getAnalytics = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      period: '30d',
      revenueAnalytics: [],
      statusDistribution: [],
      vehicleTypeDistribution: []
    }
  });
});
