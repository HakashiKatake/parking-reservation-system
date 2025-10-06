import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import ParkingLot from '../models/ParkingLot.js';
import { asyncHandler } from '../middleware/errorHandler.js';


export const createReview = asyncHandler(async (req, res) => {
  const { reservationId, rating, review, aspects } = req.body;

 
  const reservation = await Reservation.findById(reservationId);
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  if (reservation.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only review your own reservations'
    });
  }

  // Check if reservation is completed
  if (reservation.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'You can only review completed reservations'
    });
  }

  // Check if review already exists for this reservation
  const existingReview = await Review.findOne({ reservation: reservationId });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this reservation'
    });
  }

  // Create review
  const newReview = await Review.create({
    user: req.user._id,
    parkingLot: reservation.parkingLot,
    reservation: reservationId,
    rating,
    review,
    aspects
  });

  await newReview.populate([
    { path: 'user', select: 'name' },
    { path: 'parkingLot', select: 'name address' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: newReview
  });
});

// @desc    Get reviews for a parking lot
// @route   GET /api/reviews/parking-lot/:id
// @access  Public
export const getParkingLotReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating } = req.query;
  const parkingLotId = req.params.id;

  // Build query
  const query = { parkingLot: parkingLotId };
  if (rating) {
    query.rating = parseInt(rating);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find(query)
    .populate('user', 'name')
    .populate('reservation', 'startTime endTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalReviews = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  // Get rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { parkingLot: mongoose.Types.ObjectId(parkingLotId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Get average rating and aspects
  const averageStats = await Review.aggregate([
    { $match: { parkingLot: mongoose.Types.ObjectId(parkingLotId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        averageCleanliness: { $avg: '$aspects.cleanliness' },
        averageSecurity: { $avg: '$aspects.security' },
        averageAccessibility: { $avg: '$aspects.accessibility' },
        averageValueForMoney: { $avg: '$aspects.valueForMoney' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasMore: parseInt(page) < totalPages
      },
      stats: {
        ratingDistribution: ratingStats,
        averageStats: averageStats[0] || {}
      }
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ user: req.user._id })
    .populate('parkingLot', 'name address')
    .populate('reservation', 'startTime endTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalReviews = await Review.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews
      }
    }
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, review, aspects } = req.body;

  const existingReview = await Review.findById(req.params.id);
  
  if (!existingReview) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (existingReview.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own reviews'
    });
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, review, aspects },
    { new: true, runValidators: true }
  ).populate([
    { path: 'user', select: 'name' },
    { path: 'parkingLot', select: 'name address' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: updatedReview
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own reviews'
    });
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get reviews for vendor's parking lots
// @route   GET /api/reviews/vendor-reviews
// @access  Private (Vendor only)
export const getVendorReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating, parkingLotId } = req.query;
  
  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ vendor: req.user._id }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);

  // Build query
  const query = { parkingLot: { $in: parkingLotIds } };
  if (rating) {
    query.rating = parseInt(rating);
  }
  if (parkingLotId) {
    query.parkingLot = parkingLotId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find(query)
    .populate('user', 'name')
    .populate('parkingLot', 'name address')
    .populate('reservation', 'startTime endTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalReviews = await Review.countDocuments(query);
  const totalPages = Math.ceil(totalReviews / parseInt(limit));

  // Get overall stats for vendor
  const overallStats = await Review.aggregate([
    { $match: { parkingLot: { $in: parkingLotIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        averageCleanliness: { $avg: '$aspects.cleanliness' },
        averageSecurity: { $avg: '$aspects.security' },
        averageAccessibility: { $avg: '$aspects.accessibility' },
        averageValueForMoney: { $avg: '$aspects.valueForMoney' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews
      },
      stats: overallStats[0] || {}
    }
  });
});

export const respondToReview = asyncHandler(async (req, res) => {
  const { response } = req.body;
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId).populate('parkingLot');
  
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  
  if (review.parkingLot.vendor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only respond to reviews for your parking lots'
    });
  }

  review.vendorResponse = {
    message: response,
    respondedAt: new Date()
  };

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    data: review
  });
});

export default {
  createReview,
  getParkingLotReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getVendorReviews,
  respondToReview
};