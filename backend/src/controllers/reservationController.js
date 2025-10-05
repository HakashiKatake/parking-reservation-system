import Reservation from '../models/Reservation.js';
import ParkingLot from '../models/ParkingLot.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
export const getUserReservations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'startTime',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { user: req.user._id };
  
  if (status) {
    query.status = status;
  }

  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Get reservations with populated parking lot data
  const reservations = await Reservation.find(query)
    .populate({
      path: 'parkingLot',
      select: 'name address location pricing amenities'
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalReservations = await Reservation.countDocuments(query);
  const totalPages = Math.ceil(totalReservations / parseInt(limit));

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

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate({
    path: 'parkingLot',
    select: 'name address location pricing amenities vendor'
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  res.status(200).json({
    success: true,
    data: reservation
  });
});

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  // Debug: Log the incoming request data
  console.log('Backend - Received reservation request:');
  console.log('User exists:', !!req.user);
  console.log('User ID:', req.user?._id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Available fields in body:', Object.keys(req.body));

  const {
    parkingLotId,
    startTime,
    endTime,
    vehicleNumber,
    vehicleType = 'car',
    totalAmount,
    paymentIntentId
  } = req.body;

  // Validate required fields
  if (!parkingLotId || !startTime || !endTime || !vehicleNumber || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if parking lot exists
  const parkingLot = await ParkingLot.findById(parkingLotId);
  if (!parkingLot) {
    return res.status(404).json({
      success: false,
      message: 'Parking lot not found'
    });
  }

  // Validate time slots
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);

  if (startDateTime >= endDateTime) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  if (startDateTime < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Start time must be in the future'
    });
  }

  // Check for existing reservation conflicts
  const conflictingReservation = await Reservation.findOne({
    parkingLot: parkingLotId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startTime: { $lt: endDateTime }, endTime: { $gt: startDateTime } }
    ]
  });

  if (conflictingReservation) {
    return res.status(409).json({
      success: false,
      message: 'Time slot not available - conflicts with existing reservation'
    });
  }

  // Calculate duration
  const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
  
  // Calculate pricing
  const hourlyRate = parkingLot.pricing?.fourWheeler?.hourly || 50;
  const basePrice = Math.round(hourlyRate * durationHours);
  const taxes = Math.round(basePrice * 0.18);

  // Create reservation with correct nested structure
  const reservation = await Reservation.create({
    user: req.user._id,
    parkingLot: parkingLotId,
    vehicleInfo: {
      type: vehicleType === 'car' ? 'fourWheeler' : vehicleType,
      numberPlate: vehicleNumber.toUpperCase()
    },
    timeSlot: {
      startTime: startDateTime,
      endTime: endDateTime,
      duration: durationHours
    },
    pricing: {
      basePrice: basePrice,
      taxes: taxes,
      totalAmount: totalAmount
    },
    paymentInfo: {
      paymentIntentId,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      amount: totalAmount,
      paidAt: new Date()
    },
    status: 'confirmed'
  });

  // Populate parking lot data for response
  await reservation.populate({
    path: 'parkingLot',
    select: 'name address location pricing amenities'
  });

  res.status(201).json({
    success: true,
    message: 'Reservation created successfully',
    data: reservation
  });
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id
// @access  Private
export const updateReservation = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;

  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Update status if provided
  if (status) {
    reservation.status = status;
  }

  // Update payment status if provided
  if (paymentStatus && reservation.paymentInfo) {
    reservation.paymentInfo.status = paymentStatus;
    
    // If payment is completed, confirm the reservation
    if (paymentStatus === 'completed' && reservation.status === 'pending') {
      reservation.status = 'confirmed';
    }
  }

  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Reservation updated successfully',
    data: reservation
  });
});

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
export const cancelReservation = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Check if reservation can be cancelled
  if (!['pending', 'confirmed'].includes(reservation.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel reservation in current status'
    });
  }

  // Update reservation status
  reservation.status = 'cancelled';
  reservation.cancellation = {
    reason: reason || 'User cancelled',
    cancelledAt: new Date(),
    cancelledBy: req.user._id
  };

  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Reservation cancelled successfully',
    data: reservation
  });
});

// @desc    Check-in to reservation
// @route   POST /api/reservations/:id/checkin
// @access  Private
export const checkinReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Check if reservation is confirmed
  if (reservation.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Can only check-in to confirmed reservations'
    });
  }

  // Check if check-in time is appropriate
  const now = new Date();
  const startTime = new Date(reservation.startTime);
  const timeDiff = Math.abs(now - startTime) / (1000 * 60); // difference in minutes

  if (timeDiff > 30) { // Allow check-in 30 minutes before/after start time
    return res.status(400).json({
      success: false,
      message: 'Check-in time window has expired'
    });
  }

  // Update reservation status and check-in time
  reservation.status = 'active';
  reservation.actualStartTime = now;

  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Checked in successfully',
    data: reservation
  });
});

// @desc    Check-out from reservation
// @route   POST /api/reservations/:id/checkout
// @access  Private
export const checkoutReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Check if reservation is active
  if (reservation.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Can only check-out from active reservations'
    });
  }

  const now = new Date();
  
  // Update reservation status and check-out time
  reservation.status = 'completed';
  reservation.actualEndTime = now;

  // Calculate actual duration if needed
  if (reservation.actualStartTime) {
    const actualDurationMs = now - new Date(reservation.actualStartTime);
    reservation.actualDuration = Math.ceil(actualDurationMs / (1000 * 60 * 60));
  }

  await reservation.save();

  res.status(200).json({
    success: true,
    message: 'Checked out successfully',
    data: reservation
  });
});