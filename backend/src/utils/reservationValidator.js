import crypto from 'crypto';
import Reservation from '../models/Reservation.js';

/**
 * Reservation validation utilities
 */

/**
 * Generate a unique hash for vehicle and time slot combination
 * @param {string} numberPlate - Vehicle number plate
 * @param {Date} startTime - Reservation start time
 * @param {Date} endTime - Reservation end time
 * @param {string} parkingLotId - Parking lot ID
 * @returns {string} - SHA256 hash
 */
export const generateReservationHash = (numberPlate, startTime, endTime, parkingLotId) => {
  const normalizedPlate = numberPlate.toUpperCase().replace(/\s+/g, '');
  const hashData = `${normalizedPlate}_${new Date(startTime).getTime()}_${new Date(endTime).getTime()}_${parkingLotId}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
};

/**
 * Check for duplicate vehicle reservations with comprehensive validation
 * @param {string} numberPlate - Vehicle number plate
 * @param {Date} startTime - Reservation start time
 * @param {Date} endTime - Reservation end time
 * @param {string} parkingLotId - Parking lot ID
 * @param {string} userId - User ID making the reservation
 * @param {string} excludeId - Reservation ID to exclude from check (for updates)
 * @returns {Object} - Validation result
 */
export const validateReservationUniqueness = async (numberPlate, startTime, endTime, parkingLotId, userId, excludeId = null) => {
  const normalizedPlate = numberPlate.toUpperCase().replace(/\s+/g, '');
  
  // Check for exact duplicate (same vehicle, same time, same parking lot)
  const exactDuplicate = await Reservation.findOne({
    'vehicleInfo.numberPlate': normalizedPlate,
    'timeSlot.startTime': new Date(startTime),
    'timeSlot.endTime': new Date(endTime),
    parkingLot: parkingLotId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    ...(excludeId && { _id: { $ne: excludeId } })
  });

  if (exactDuplicate) {
    return {
      isValid: false,
      type: 'EXACT_DUPLICATE',
      message: `Duplicate reservation detected for vehicle ${normalizedPlate}`,
      conflictingReservation: exactDuplicate
    };
  }

  // Check for overlapping reservations (same vehicle, overlapping time)
  const overlappingReservation = await Reservation.findOne({
    'vehicleInfo.numberPlate': normalizedPlate,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        'timeSlot.startTime': { $lt: new Date(endTime) },
        'timeSlot.endTime': { $gt: new Date(startTime) }
      }
    ],
    ...(excludeId && { _id: { $ne: excludeId } })
  });

  if (overlappingReservation) {
    return {
      isValid: false,
      type: 'TIME_OVERLAP',
      message: `Vehicle ${normalizedPlate} already has a reservation during this time period`,
      conflictingReservation: overlappingReservation
    };
  }

  // Check for same user booking multiple times for same slot (prevent user error)
  const userDuplicate = await Reservation.findOne({
    user: userId,
    parkingLot: parkingLotId,
    'timeSlot.startTime': { $lte: new Date(endTime) },
    'timeSlot.endTime': { $gte: new Date(startTime) },
    status: { $in: ['pending', 'confirmed', 'active'] },
    ...(excludeId && { _id: { $ne: excludeId } })
  });

  if (userDuplicate) {
    return {
      isValid: false,
      type: 'USER_DUPLICATE',
      message: 'You already have a reservation for this time period at this parking lot',
      conflictingReservation: userDuplicate
    };
  }

  return {
    isValid: true,
    message: 'Reservation is unique and valid'
  };
};

/**
 * Normalize vehicle number plate
 * @param {string} numberPlate - Raw number plate
 * @returns {string} - Normalized number plate
 */
export const normalizeNumberPlate = (numberPlate) => {
  return numberPlate.toUpperCase().replace(/\s+/g, '');
};

/**
 * Check if two time slots overlap
 * @param {Date} start1 - First slot start time
 * @param {Date} end1 - First slot end time
 * @param {Date} start2 - Second slot start time
 * @param {Date} end2 - Second slot end time
 * @returns {boolean} - Whether slots overlap
 */
export const checkTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

/**
 * Get all conflicting reservations for a vehicle
 * @param {string} numberPlate - Vehicle number plate
 * @param {Date} startTime - Reservation start time
 * @param {Date} endTime - Reservation end time
 * @param {string} excludeId - Reservation ID to exclude
 * @returns {Array} - Array of conflicting reservations
 */
export const getConflictingReservations = async (numberPlate, startTime, endTime, excludeId = null) => {
  const normalizedPlate = normalizeNumberPlate(numberPlate);
  
  const query = {
    'vehicleInfo.numberPlate': normalizedPlate,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      {
        'timeSlot.startTime': { $lt: new Date(endTime) },
        'timeSlot.endTime': { $gt: new Date(startTime) }
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Reservation.find(query)
    .populate('parkingLot', 'name address')
    .sort({ 'timeSlot.startTime': 1 });
};

export default {
  generateReservationHash,
  validateReservationUniqueness,
  normalizeNumberPlate,
  checkTimeOverlap,
  getConflictingReservations
};