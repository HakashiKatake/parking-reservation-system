import { body } from 'express-validator';
import ParkingLot from '../models/ParkingLot.js';
import AvailabilityManager from '../utils/availabilityManager.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateCoordinates } from '../utils/validators.js';


export const getParkingLots = asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    location, // Added location text search
    radius = 5000, // 5km default radius
    vehicleType,
    startTime,
    endTime,
    minRating,
    maxPrice,
    amenities,
    page = 1,
    limit = 20,
    sortBy = 'distance'
  } = req.query;

  let query = { isActive: true }; // Removed isVerified requirement for testing
  let aggregatePipeline = [];

  // Add location text search if provided
  if (req.query.location) {
    const locationRegex = new RegExp(req.query.location, 'i'); // case-insensitive search
    query = { 
      isActive: true, // Keep active requirement
      $or: [
        { 'address.street': locationRegex },
        { 'address.city': locationRegex },
        { 'address.state': locationRegex },
        { name: locationRegex }
      ]
    };
  }

  // Geospatial query if coordinates provided
  if (lat && lng) {
    const coordinates = validateCoordinates(parseFloat(lat), parseFloat(lng));
    if (!coordinates.isValid) {
      return res.status(400).json({
        success: false,
        message: coordinates.message
      });
    }

    aggregatePipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates.coordinates
        },
        distanceField: 'distance',
        maxDistance: parseInt(radius),
        spherical: true,
        query
      }
    });
  } else {
    aggregatePipeline.push({ $match: query });
  }

  // Filter by rating
  if (minRating) {
    aggregatePipeline.push({
      $match: {
        'ratings.average': { $gte: parseFloat(minRating) }
      }
    });
  }

  // Filter by amenities
  if (amenities) {
    const amenityArray = amenities.split(',');
    aggregatePipeline.push({
      $match: {
        amenities: { $in: amenityArray }
      }
    });
  }

  // Filter by price
  if (maxPrice && vehicleType) {
    aggregatePipeline.push({
      $match: {
        [`pricing.${vehicleType}.hourly`]: { $lte: parseFloat(maxPrice) }
      }
    });
  }

  // Add availability check if time range provided
  if (startTime && endTime && vehicleType) {
    // This would be handled by a separate availability check
    // For now, we'll add it to the response processing
  }

  // Populate vendor information
  aggregatePipeline.push({
    $lookup: {
      from: 'users',
      localField: 'vendor',
      foreignField: '_id',
      as: 'vendorInfo',
      pipeline: [
        {
          $project: {
            name: 1,
            businessName: 1,
            'ratings.average': 1,
            isVerified: 1
          }
        }
      ]
    }
  });

  aggregatePipeline.push({
    $unwind: '$vendorInfo'
  });

  // Sorting
  let sortStage = {};
  switch (sortBy) {
    case 'rating':
      sortStage = { 'ratings.average': -1 };
      break;
    case 'price':
      if (vehicleType) {
        sortStage[`pricing.${vehicleType}.hourly`] = 1;
      } else {
        sortStage = { 'pricing.twoWheeler.hourly': 1 };
      }
      break;
    case 'distance':
      if (lat && lng) {
        sortStage = { distance: 1 };
      } else {
        sortStage = { 'ratings.average': -1 };
      }
      break;
    default:
      sortStage = { createdAt: -1 };
  }

  aggregatePipeline.push({ $sort: sortStage });

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  aggregatePipeline.push({ $skip: skip });
  aggregatePipeline.push({ $limit: parseInt(limit) });

  // Execute aggregation
  const parkingLots = await ParkingLot.aggregate(aggregatePipeline);

  // Check availability for each parking lot if time range provided
  if (startTime && endTime && vehicleType) {
    const availabilityPromises = parkingLots.map(async (lot) => {
      const availability = await AvailabilityManager.checkAvailability(
        lot._id,
        new Date(startTime),
        new Date(endTime),
        vehicleType
      );
      return {
        ...lot,
        availability
      };
    });

    const lotsWithAvailability = await Promise.all(availabilityPromises);
    
    // Filter only available lots
    const availableLots = lotsWithAvailability.filter(lot => lot.availability.available);

    return res.status(200).json({
      success: true,
      message: 'Parking lots retrieved successfully',
      data: {
        parkingLots: availableLots,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: availableLots.length
        },
        filters: {
          timeSlot: { startTime, endTime },
          vehicleType,
          availableOnly: true
        }
      }
    });
  }

  // Get total count for pagination
  const totalQuery = lat && lng 
    ? [{ $geoNear: { near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, distanceField: 'distance', maxDistance: parseInt(radius), spherical: true, query } }]
    : [{ $match: query }];
  
  const totalCount = await ParkingLot.aggregate([...totalQuery, { $count: 'total' }]);
  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  res.status(200).json({
    success: true,
    message: 'Parking lots retrieved successfully',
    data: {
      parkingLots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @desc    Get single parking lot by ID
 * @route   GET /api/parking-lots/:id
 * @access  Public
 */
export const getParkingLot = asyncHandler(async (req, res) => {
  const parkingLot = await ParkingLot.findById(req.params.id)
    .populate('vendor', 'name businessName contactInfo.phone isVerified');

  if (!parkingLot) {
    return res.status(404).json({
      success: false,
      message: 'Parking lot not found'
    });
  }

  // Get today's availability
  const today = new Date();
  const availability = await AvailabilityManager.getHourlyAvailability(
    parkingLot._id,
    today,
    'twoWheeler'
  );

  res.status(200).json({
    success: true,
    message: 'Parking lot retrieved successfully',
    data: {
      parkingLot,
      todayAvailability: availability
    }
  });
});

/**
 * @desc    Create new parking lot
 * @route   POST /api/parking-lots
 * @access  Private (Vendor only)
 */
export const createParkingLot = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    address,
    contactInfo,
    capacity,
    pricing,
    amenities,
    operatingHours,
    images
  } = req.body;

  // Validate coordinates
  const coordinatesValidation = validateCoordinates(
    address.coordinates.coordinates[1], // latitude
    address.coordinates.coordinates[0]  // longitude
  );

  if (!coordinatesValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: coordinatesValidation.message
    });
  }

  // Create parking lot
  const parkingLot = await ParkingLot.create({
    name,
    description,
    vendor: req.user._id,
    address: {
      ...address,
      coordinates: {
        type: 'Point',
        coordinates: coordinatesValidation.coordinates
      }
    },
    contactInfo,
    capacity,
    pricing,
    amenities,
    operatingHours,
    images,
    isVerified: true, // Auto-verify new parking lots
    isActive: true    // Auto-activate new parking lots
  });

  res.status(201).json({
    success: true,
    message: 'Parking lot created successfully',
    data: { parkingLot }
  });
});

/**
 * @desc    Update parking lot
 * @route   PUT /api/parking-lots/:id
 * @access  Private (Vendor only - own parking lot)
 */
export const updateParkingLot = asyncHandler(async (req, res) => {
  let parkingLot = await ParkingLot.findById(req.params.id);

  if (!parkingLot) {
    return res.status(404).json({
      success: false,
      message: 'Parking lot not found'
    });
  }

  // Check if user is the vendor of this parking lot
  if (parkingLot.vendor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this parking lot'
    });
  }

  // Validate coordinates if being updated
  if (req.body.address?.coordinates?.coordinates) {
    const coordinatesValidation = validateCoordinates(
      req.body.address.coordinates.coordinates[1], // latitude
      req.body.address.coordinates.coordinates[0]  // longitude
    );

    if (!coordinatesValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: coordinatesValidation.message
      });
    }

    req.body.address.coordinates.coordinates = coordinatesValidation.coordinates;
  }

  parkingLot = await ParkingLot.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Parking lot updated successfully',
    data: { parkingLot }
  });
});

/**
 * @desc    Delete parking lot
 * @route   DELETE /api/parking-lots/:id
 * @access  Private (Vendor only - own parking lot)
 */
export const deleteParkingLot = asyncHandler(async (req, res) => {
  const parkingLot = await ParkingLot.findById(req.params.id);

  if (!parkingLot) {
    return res.status(404).json({
      success: false,
      message: 'Parking lot not found'
    });
  }

  // Check if user is the vendor of this parking lot
  if (parkingLot.vendor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this parking lot'
    });
  }

  await parkingLot.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Parking lot deleted successfully'
  });
});

/**
 * @desc    Search vendor parking lots by location name only
 * @route   GET /api/parking-lots/search-vendors
 * @access  Public
 */
export const searchVendorLotsByLocation = asyncHandler(async (req, res) => {
  const { location, vehicleType, maxPrice } = req.query;

  if (!location) {
    return res.status(400).json({
      success: false,
      message: 'Location parameter is required'
    });
  }

  // Simple text-based search query
  let query = {
    isActive: true,
    isVerified: true,
    $or: [
      { 'address.street': { $regex: location, $options: 'i' } },
      { 'address.city': { $regex: location, $options: 'i' } },
      { 'address.state': { $regex: location, $options: 'i' } },
      { 'name': { $regex: location, $options: 'i' } }
    ]
  };

  // Apply vehicle type and price filters if provided
  let aggregatePipeline = [
    { $match: query }
  ];

  // Filter by price if specified
  if (maxPrice && vehicleType) {
    aggregatePipeline.push({
      $match: {
        [`pricing.${vehicleType}.hourly`]: { $lte: parseFloat(maxPrice) }
      }
    });
  }

  // Populate vendor information
  aggregatePipeline.push({
    $lookup: {
      from: 'users',
      localField: 'vendor',
      foreignField: '_id',
      as: 'vendorInfo',
      pipeline: [
        {
          $project: {
            name: 1,
            businessName: 1,
            'ratings.average': 1,
            isVerified: 1
          }
        }
      ]
    }
  });

  aggregatePipeline.push({
    $unwind: '$vendorInfo'
  });

  // Sort by rating and then by creation date
  aggregatePipeline.push({ 
    $sort: { 
      'ratings.average': -1, 
      createdAt: -1 
    } 
  });

  // Execute aggregation
  const vendorLots = await ParkingLot.aggregate(aggregatePipeline);

  res.status(200).json({
    success: true,
    message: 'Vendor parking lots retrieved successfully',
    data: {
      parkingLots: vendorLots,
      total: vendorLots.length
    }
  });
});

/**
 * @desc    Check availability for specific time slot
 * @route   POST /api/parking-lots/:id/check-availability
 * @access  Public
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const { startTime, endTime, vehicleType, quantity = 1 } = req.body;

  const availability = await AvailabilityManager.checkAvailability(
    req.params.id,
    new Date(startTime),
    new Date(endTime),
    vehicleType,
    parseInt(quantity)
  );

  res.status(200).json({
    success: true,
    message: 'Availability checked successfully',
    data: { availability }
  });
});

/**
 * @desc    Bulk verify all parking lots (temporary endpoint)
 * @route   PATCH /api/parking-lots/verify-all
 * @access  Public (temporary - for fixing existing data)
 */
export const verifyAllParkingLots = asyncHandler(async (req, res) => {
  const result = await ParkingLot.updateMany(
    { isVerified: false },
    { $set: { isVerified: true } }
  );

  res.status(200).json({
    success: true,
    message: 'All parking lots verified successfully',
    data: { 
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount 
    }
  });
});

// Validation rules
export const createParkingLotValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Parking lot name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  
  body('address.coordinates.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('contactInfo.phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian mobile number'),
  
  body('capacity.twoWheeler')
    .isInt({ min: 0 })
    .withMessage('Two wheeler capacity must be a positive number'),
  
  body('capacity.fourWheeler')
    .isInt({ min: 0 })
    .withMessage('Four wheeler capacity must be a positive number'),
  
  body('pricing.twoWheeler.hourly')
    .isFloat({ min: 0 })
    .withMessage('Two wheeler hourly rate must be a positive number'),
  
  body('pricing.fourWheeler.hourly')
    .isFloat({ min: 0 })
    .withMessage('Four wheeler hourly rate must be a positive number')
];