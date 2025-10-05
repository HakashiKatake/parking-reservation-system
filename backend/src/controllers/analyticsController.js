import Reservation from '../models/Reservation.js';
import ParkingLot from '../models/ParkingLot.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';


export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const { timeframe = '30' } = req.query; // days
  
  console.log('Analytics request for vendor:', vendorId, 'timeframe:', timeframe);
  

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(timeframe));
  

  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  console.log('Found parking lots:', parkingLotIds.length, parkingLotIds);
  
  if (parkingLotIds.length === 0) {
    console.log('No parking lots found for vendor:', vendorId);
    return res.status(200).json({
      success: true,
      message: 'No parking lots found',
      data: {
        totalRevenue: 0,
        totalBookings: 0,
        averageRating: 0,
        occupancyRate: 0,
        revenueGrowth: 0,
        bookingsGrowth: 0,
        customerSegments: { vip: 0, regular: 0, new: 0 },
        monthlyRevenue: [],
        topParkingLots: [],
        recentActivity: []
      }
    });
  }
  

  const currentReservations = await Reservation.find({
    parkingLot: { $in: parkingLotIds },
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('parkingLot', 'name address').populate('user', 'name phoneNumber');
  

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - parseInt(timeframe));
  const previousEndDate = new Date(startDate);
  
  const previousReservations = await Reservation.find({
    parkingLot: { $in: parkingLotIds },
    createdAt: { $gte: previousStartDate, $lt: previousEndDate }
  });
  
  // Calculate current metrics using same logic as vendor dashboard
  const totalBookingsResult = await Reservation.countDocuments({ 
    parkingLot: { $in: parkingLotIds } 
  });
  
  const totalBookings = totalBookingsResult;
  
  
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
  
  const totalRevenue = earningsResult.length > 0 ? earningsResult[0].total : 0;
  
  console.log('Total bookings:', totalBookings, 'Total revenue:', totalRevenue);

  
  const previousEarningsResult = await Reservation.aggregate([
    { 
      $match: { 
        parkingLot: { $in: parkingLotIds },
        'paymentInfo.paymentStatus': 'completed',
        createdAt: { $gte: previousStartDate, $lt: previousEndDate }
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$pricing.totalAmount' } 
      } 
    }
  ]);
  
  const previousRevenue = previousEarningsResult.length > 0 ? previousEarningsResult[0].total : 0;
  const previousBookings = previousReservations.length;
  
  
  const revenueGrowth = previousRevenue > 0 ? 
    ((totalRevenue - previousRevenue) / previousRevenue * 100) : 0;
  const bookingsGrowth = previousBookings > 0 ? 
    ((totalBookings - previousBookings) / previousBookings * 100) : 0;
  
 
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
  
  
  const totalCapacity = await ParkingLot.aggregate([
    { $match: { vendor: vendorId } },
    { 
      $project: { 
        totalCapacity: { 
          $add: [
            "$capacity.twoWheeler", 
            "$capacity.fourWheeler", 
            "$capacity.heavyVehicle"
          ] 
        } 
      } 
    },
    { $group: { _id: null, totalCapacity: { $sum: "$totalCapacity" } } }
  ]);
  
  const occupancyRate = totalCapacity.length > 0 && totalCapacity[0].totalCapacity > 0 ?
    (totalBookings / totalCapacity[0].totalCapacity * 100) : 0;
  
  
  const uniqueUsers = [...new Set(currentReservations.map(r => r.user._id.toString()))];
  const customerSegments = {
    new: uniqueUsers.length,
    regular: Math.floor(uniqueUsers.length * 0.6),
    vip: Math.floor(uniqueUsers.length * 0.2)
  };
  
  
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i, 1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);
    
   
    const monthRevenueResult = await Reservation.aggregate([
      { 
        $match: { 
          parkingLot: { $in: parkingLotIds },
          'paymentInfo.paymentStatus': 'completed',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$pricing.totalAmount' },
          totalBookings: { $sum: 1 }
        } 
      }
    ]);
    
    const monthRevenue = monthRevenueResult.length > 0 ? monthRevenueResult[0].totalRevenue : 0;
    const monthBookings = monthRevenueResult.length > 0 ? monthRevenueResult[0].totalBookings : 0;
    
    monthlyRevenue.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthRevenue,
      bookings: monthBookings,
      avgPrice: monthBookings > 0 ? monthRevenue / monthBookings : 0
    });
  }
  
  
  const topParkingLots = await Reservation.aggregate([
    {
      $match: {
        parkingLot: { $in: parkingLotIds },
        'paymentInfo.paymentStatus': 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$parkingLot",
        bookings: { $sum: 1 },
        revenue: { $sum: "$pricing.totalAmount" },
        avgRating: { $avg: "$rating" }
      }
    },
    {
      $lookup: {
        from: "parkinglots",
        localField: "_id",
        foreignField: "_id",
        as: "lotInfo"
      }
    },
    {
      $unwind: "$lotInfo"
    },
    {
      $project: {
        name: "$lotInfo.name",
        bookings: 1,
        revenue: 1,
        rating: { $ifNull: ["$avgRating", 0] },
        occupancy: { $multiply: [{ $divide: ["$bookings", 30] }, 100] } 
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: 4
    }
  ]);
  

  const recentReservations = await Reservation.find({
    parkingLot: { $in: parkingLotIds }
  })
  .populate('user', 'name')
  .populate('parkingLot', 'name')
  .sort({ createdAt: -1 })
  .limit(10);
  
  const recentActivity = recentReservations.map(reservation => {
    const timeDiff = Date.now() - reservation.createdAt.getTime();
    const minutesAgo = Math.floor(timeDiff / (1000 * 60));
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
    
    let timeString;
    if (minutesAgo < 60) {
      timeString = `${minutesAgo} minutes ago`;
    } else if (hoursAgo < 24) {
      timeString = `${hoursAgo} hours ago`;
    } else {
      timeString = `${daysAgo} days ago`;
    }
    
    return {
      type: 'booking',
      message: `${reservation.user?.name || 'User'} booked ${reservation.parkingLot?.name || 'parking spot'}`,
      time: timeString,
      priority: reservation.pricing?.totalAmount > 200 ? 'high' : 'medium'
    };
  });
  
  res.status(200).json({
    success: true,
    message: 'Vendor analytics retrieved successfully',
    data: {
      totalRevenue,
      totalBookings,
      averageRating: Math.round(averageRating * 10) / 10,
      occupancyRate: Math.round(occupancyRate),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      bookingsGrowth: Math.round(bookingsGrowth * 10) / 10,
      customerSegments,
      monthlyRevenue,
      topParkingLots,
      recentActivity
    }
  });
});


export const getRFMAnalysis = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  

  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  if (parkingLotIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }
  
  const rfmAnalysis = await Reservation.aggregate([
    // Match reservations for vendor's parking lots
    {
      $match: {
        parkingLot: { $in: parkingLotIds }
      }
    },
    // Group by user to calculate RFM metrics
    {
      $group: {
        _id: "$user",
        lastBooking: { $max: "$createdAt" },
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: "$pricing.totalAmount" }
      }
    },
    // Calculate days since last booking
    {
      $addFields: {
        daysSinceLastBooking: {
          $divide: [
            { $subtract: [new Date(), "$lastBooking"] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    // Calculate RFM scores
    {
      $addFields: {
        recencyScore: {
          $switch: {
            branches: [
              { case: { $lte: ["$daysSinceLastBooking", 7] }, then: 5 },
              { case: { $lte: ["$daysSinceLastBooking", 30] }, then: 4 },
              { case: { $lte: ["$daysSinceLastBooking", 60] }, then: 3 },
              { case: { $lte: ["$daysSinceLastBooking", 120] }, then: 2 }
            ],
            default: 1
          }
        },
        frequencyScore: {
          $switch: {
            branches: [
              { case: { $gte: ["$totalBookings", 10] }, then: 5 },
              { case: { $gte: ["$totalBookings", 5] }, then: 4 },
              { case: { $gte: ["$totalBookings", 3] }, then: 3 },
              { case: { $gte: ["$totalBookings", 2] }, then: 2 }
            ],
            default: 1
          }
        },
        monetaryScore: {
          $switch: {
            branches: [
              { case: { $gte: ["$totalSpent", 2000] }, then: 5 },
              { case: { $gte: ["$totalSpent", 1000] }, then: 4 },
              { case: { $gte: ["$totalSpent", 500] }, then: 3 },
              { case: { $gte: ["$totalSpent", 200] }, then: 2 }
            ],
            default: 1
          }
        }
      }
    },
    // Create customer segments
    {
      $addFields: {
        rfmSegment: {
          $switch: {
            branches: [
              {
                case: { 
                  $and: [
                    { $gte: ["$recencyScore", 4] },
                    { $gte: ["$frequencyScore", 4] },
                    { $gte: ["$monetaryScore", 4] }
                  ]
                },
                then: "Champions"
              },
              {
                case: { 
                  $and: [
                    { $gte: ["$recencyScore", 3] },
                    { $gte: ["$frequencyScore", 3] },
                    { $gte: ["$monetaryScore", 3] }
                  ]
                },
                then: "Loyal Customers"
              },
              {
                case: { 
                  $and: [
                    { $gte: ["$recencyScore", 4] },
                    { $lte: ["$frequencyScore", 2] }
                  ]
                },
                then: "Potential Loyalists"
              },
              {
                case: { 
                  $and: [
                    { $lte: ["$recencyScore", 2] },
                    { $gte: ["$frequencyScore", 3] }
                  ]
                },
                then: "At Risk"
              },
              {
                case: { 
                  $and: [
                    { $lte: ["$recencyScore", 2] },
                    { $gte: ["$monetaryScore", 4] }
                  ]
                },
                then: "Cannot Lose Them"
              }
            ],
            default: "New Customers"
          }
        }
      }
    },
    // Group by segment
    {
      $group: {
        _id: "$rfmSegment",
        count: { $sum: 1 },
        avgRevenue: { $avg: "$totalSpent" },
        totalRevenue: { $sum: "$totalSpent" }
      }
    },
    {
      $project: {
        segment: "$_id",
        count: 1,
        avgRevenue: { $round: ["$avgRevenue", 0] },
        totalRevenue: { $round: ["$totalRevenue", 0] },
        description: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", "Champions"] }, then: "Best customers" },
              { case: { $eq: ["$_id", "Loyal Customers"] }, then: "Regular users" },
              { case: { $eq: ["$_id", "Potential Loyalists"] }, then: "High potential" },
              { case: { $eq: ["$_id", "At Risk"] }, then: "Need attention" },
              { case: { $eq: ["$_id", "Cannot Lose Them"] }, then: "VIP customers" }
            ],
            default: "New users"
          }
        }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'RFM analysis retrieved successfully',
    data: rfmAnalysis
  });
});

// Get Customer Lifetime Value Analysis
export const getCLVAnalysis = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  
  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  if (parkingLotIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }
  
  const clvAnalysis = await Reservation.aggregate([
    {
      $match: {
        parkingLot: { $in: parkingLotIds }
      }
    },
    {
      $group: {
        _id: "$user",
        firstBooking: { $min: "$createdAt" },
        lastBooking: { $max: "$createdAt" },
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: "$pricing.totalAmount" },
        avgOrderValue: { $avg: "$pricing.totalAmount" }
      }
    },
    {
      $addFields: {
        customerLifespanDays: {
          $divide: [
            { $subtract: ["$lastBooking", "$firstBooking"] },
            1000 * 60 * 60 * 24
          ]
        },
        purchaseFrequency: {
          $cond: {
            if: { $eq: ["$totalBookings", 1] },
            then: 1,
            else: {
              $divide: [
                "$totalBookings",
                { 
                  $divide: [
                    { $subtract: ["$lastBooking", "$firstBooking"] },
                    1000 * 60 * 60 * 24 * 30
                  ]
                }
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        predictedLifespanMonths: {
          $cond: {
            if: { $lt: ["$customerLifespanDays", 30] },
            then: 12,
            else: { $multiply: ["$customerLifespanDays", 0.033] }
          }
        }
      }
    },
    {
      $addFields: {
        clv: {
          $multiply: [
            "$avgOrderValue",
            "$purchaseFrequency",
            "$predictedLifespanMonths"
          ]
        }
      }
    },
    {
      $addFields: {
        clvSegment: {
          $switch: {
            branches: [
              { case: { $gte: ["$clv", 3000] }, then: "High Value" },
              { case: { $gte: ["$clv", 1000] }, then: "Medium Value" }
            ],
            default: "Low Value"
          }
        },
        retentionRate: {
          $cond: {
            if: { $gte: ["$totalBookings", 3] },
            then: {
              $multiply: [
                { $divide: ["$totalBookings", { $add: ["$totalBookings", 2] }] },
                100
              ]
            },
            else: 45
          }
        }
      }
    },
    {
      $group: {
        _id: "$clvSegment",
        count: { $sum: 1 },
        avgCLV: { $avg: "$clv" },
        avgRetention: { $avg: "$retentionRate" }
      }
    },
    {
      $project: {
        segment: "$_id",
        count: 1,
        avgCLV: { $round: ["$avgCLV", 0] },
        retention: { $round: ["$avgRetention", 0] }
      }
    },
    {
      $sort: { avgCLV: -1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'CLV analysis retrieved successfully',
    data: clvAnalysis
  });
});

// Get NPS Score
export const getNPSScore = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  
  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  if (parkingLotIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        npsScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0
      }
    });
  }
  
  // Get reservations with ratings
  const ratingsData = await Reservation.aggregate([
    {
      $match: {
        parkingLot: { $in: parkingLotIds },
        rating: { $exists: true, $ne: null, $gt: 0 }
      }
    },
    {
      $addFields: {
        npsCategory: {
          $switch: {
            branches: [
              { case: { $gte: ["$rating", 9] }, then: "promoter" },
              { case: { $gte: ["$rating", 7] }, then: "passive" }
            ],
            default: "detractor"
          }
        }
      }
    },
    {
      $group: {
        _id: "$npsCategory",
        count: { $sum: 1 }
      }
    }
  ]);
  
  const promoters = ratingsData.find(r => r._id === 'promoter')?.count || 0;
  const passives = ratingsData.find(r => r._id === 'passive')?.count || 0;
  const detractors = ratingsData.find(r => r._id === 'detractor')?.count || 0;
  
  const totalResponses = promoters + passives + detractors;
  
  const npsScore = totalResponses > 0 ? 
    Math.round(((promoters - detractors) / totalResponses) * 100) : 0;
  
  res.status(200).json({
    success: true,
    message: 'NPS score retrieved successfully',
    data: {
      npsScore,
      npsBreakdown: {
        promoters,
        passives,
        detractors
      }
    }
  });
});

// Get Revenue Projections
export const getRevenueProjections = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  
  // Get vendor's parking lots
  const vendorParkingLots = await ParkingLot.find({ vendor: vendorId }).select('_id');
  const parkingLotIds = vendorParkingLots.map(lot => lot._id);
  
  if (parkingLotIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        nextMonthRevenue: 0,
        nextMonthBookings: 0,
        growthRate: 0,
        seasonalTrends: []
      }
    });
  }
  
  // Get last 6 months data for projection
  const projectionData = await Reservation.aggregate([
    {
      $match: {
        parkingLot: { $in: parkingLotIds },
        createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        monthlyRevenue: { $sum: "$pricing.totalAmount" },
        monthlyBookings: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);
  
  if (projectionData.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        nextMonthRevenue: 0,
        nextMonthBookings: 0,
        growthRate: 0,
        seasonalTrends: []
      }
    });
  }
  
  // Calculate average growth rate
  let totalGrowth = 0;
  let growthCount = 0;
  
  for (let i = 1; i < projectionData.length; i++) {
    const currentRevenue = projectionData[i].monthlyRevenue;
    const previousRevenue = projectionData[i - 1].monthlyRevenue;
    
    if (previousRevenue > 0) {
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      totalGrowth += growth;
      growthCount++;
    }
  }
  
  const avgGrowthRate = growthCount > 0 ? totalGrowth / growthCount : 5; // Default 5% growth
  const lastMonthData = projectionData[projectionData.length - 1];
  
  // Project next month
  const nextMonthRevenue = Math.round(lastMonthData.monthlyRevenue * (1 + avgGrowthRate / 100));
  const nextMonthBookings = Math.round(lastMonthData.monthlyBookings * (1 + avgGrowthRate / 100));
  
  // Project next 4 quarters
  const seasonalTrends = [];
  let baseRevenue = lastMonthData.monthlyRevenue * 3; // Quarterly base
  
  for (let i = 1; i <= 4; i++) {
    const confidence = Math.max(50, 90 - (i * 5)); // Decreasing confidence
    const seasonalMultiplier = [1.1, 1.15, 1.05, 1.2][i - 1]; // Seasonal variations
    const projected = Math.round(baseRevenue * seasonalMultiplier * Math.pow(1 + avgGrowthRate / 100, i));
    
    seasonalTrends.push({
      period: `Q${i}`,
      projected,
      confidence
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Revenue projections retrieved successfully',
    data: {
      nextMonthRevenue,
      nextMonthBookings,
      growthRate: Math.round(avgGrowthRate * 10) / 10,
      seasonalTrends
    }
  });
});