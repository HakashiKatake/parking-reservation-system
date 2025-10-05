import Reservation from '../models/Reservation.js';
import ParkingLot from '../models/ParkingLot.js';

/**
 * Availability Algorithm using efficient data structures
 * Uses segment trees and interval scheduling for optimal performance
 */

class AvailabilityManager {
  /**
   * Check if a parking lot has available slots for the requested time period
   * @param {String} parkingLotId - MongoDB ObjectId of parking lot
   * @param {Date} startTime - Reservation start time
   * @param {Date} endTime - Reservation end time
   * @param {String} vehicleType - 'twoWheeler', 'fourWheeler', 'heavyVehicle'
   * @param {Number} quantity - Number of slots required
   * @returns {Object} Availability result with available slots
   */
  static async checkAvailability(parkingLotId, startTime, endTime, vehicleType, quantity = 1) {
    try {
      // Get parking lot details
      const parkingLot = await ParkingLot.findById(parkingLotId);
      if (!parkingLot || !parkingLot.isActive) {
        return { available: false, message: 'Parking lot not available' };
      }

      // Check operating hours
      const dayOfWeek = this.getDayOfWeek(startTime);
      const operatingHours = parkingLot.operatingHours[dayOfWeek];
      
      if (!operatingHours.isOpen) {
        return { available: false, message: 'Parking lot closed on this day' };
      }

      // Get overlapping reservations using efficient query
      const overlappingReservations = await Reservation.findOverlapping(
        parkingLotId,
        startTime,
        endTime
      ).select('vehicleInfo.type timeSlot');

      // Calculate occupied slots using interval scheduling algorithm
      const occupiedSlots = this.calculateOccupiedSlots(
        overlappingReservations,
        startTime,
        endTime,
        vehicleType
      );

      const totalCapacity = parkingLot.capacity[vehicleType];
      const availableSlots = totalCapacity - occupiedSlots;

      if (availableSlots >= quantity) {
        return {
          available: true,
          availableSlots,
          totalCapacity,
          occupiedSlots,
          message: 'Slots available'
        };
      } else {
        return {
          available: false,
          availableSlots,
          totalCapacity,
          occupiedSlots,
          message: 'Insufficient slots available'
        };
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: false, message: 'Error checking availability' };
    }
  }

  /**
   * Get real-time availability for multiple time slots
   * @param {String} parkingLotId - MongoDB ObjectId of parking lot
   * @param {Date} date - Date for which to get availability
   * @param {String} vehicleType - Vehicle type
   * @returns {Array} Hourly availability slots
   */
  static async getHourlyAvailability(parkingLotId, date, vehicleType) {
    try {
      const parkingLot = await ParkingLot.findById(parkingLotId);
      if (!parkingLot) return [];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all reservations for the day
      const reservations = await Reservation.find({
        parkingLot: parkingLotId,
        status: { $in: ['confirmed', 'active', 'pending'] },
        'timeSlot.startTime': { $lt: endOfDay },
        'timeSlot.endTime': { $gt: startOfDay },
        'vehicleInfo.type': vehicleType
      }).select('timeSlot');

      // Create hourly availability map
      const hourlyAvailability = [];
      const totalCapacity = parkingLot.capacity[vehicleType];

      for (let hour = 0; hour < 24; hour++) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(startOfDay);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const occupiedSlots = this.calculateOccupiedSlots(
          reservations,
          slotStart,
          slotEnd,
          vehicleType
        );

        hourlyAvailability.push({
          hour,
          available: totalCapacity - occupiedSlots,
          occupied: occupiedSlots,
          total: totalCapacity
        });
      }

      return hourlyAvailability;
    } catch (error) {
      console.error('Error getting hourly availability:', error);
      return [];
    }
  }

  /**
   * Find optimal parking slots based on multiple criteria
   * @param {Array} parkingLots - Array of parking lot IDs
   * @param {Date} startTime - Reservation start time
   * @param {Date} endTime - Reservation end time
   * @param {String} vehicleType - Vehicle type
   * @param {Object} preferences - User preferences (price, distance, rating)
   * @returns {Array} Sorted available parking lots
   */
  static async findOptimalSlots(parkingLots, startTime, endTime, vehicleType, preferences = {}) {
    try {
      const availabilityPromises = parkingLots.map(async (lotId) => {
        const availability = await this.checkAvailability(lotId, startTime, endTime, vehicleType);
        
        if (availability.available) {
          const lot = await ParkingLot.findById(lotId)
            .select('name pricing ratings address amenities');
          
          return {
            parkingLot: lot,
            availability,
            score: this.calculateScore(lot, preferences)
          };
        }
        return null;
      });

      const results = await Promise.all(availabilityPromises);
      const availableLots = results.filter(result => result !== null);

      // Sort by score (higher is better)
      availableLots.sort((a, b) => b.score - a.score);

      return availableLots;
    } catch (error) {
      console.error('Error finding optimal slots:', error);
      return [];
    }
  }

  /**
   * Calculate occupied slots using interval scheduling algorithm
   * Time Complexity: O(n log n) where n is number of reservations
   */
  static calculateOccupiedSlots(reservations, startTime, endTime, vehicleType) {
    // Filter reservations by vehicle type and create intervals
    const intervals = reservations
      .filter(reservation => reservation.vehicleInfo.type === vehicleType)
      .map(reservation => ({
        start: reservation.timeSlot.startTime,
        end: reservation.timeSlot.endTime
      }))
      .filter(interval => interval.start < endTime && interval.end > startTime);

    if (intervals.length === 0) return 0;

    // Sort intervals by start time
    intervals.sort((a, b) => a.start - b.start);

    // Use sweep line algorithm to find maximum overlapping intervals
    const events = [];
    
    intervals.forEach(interval => {
      // Only consider the overlapping portion with our query time range
      const overlapStart = new Date(Math.max(interval.start, startTime));
      const overlapEnd = new Date(Math.min(interval.end, endTime));
      
      events.push({ time: overlapStart, type: 'start' });
      events.push({ time: overlapEnd, type: 'end' });
    });

    // Sort events by time, with end events before start events at the same time
    events.sort((a, b) => {
      if (a.time.getTime() === b.time.getTime()) {
        return a.type === 'end' ? -1 : 1;
      }
      return a.time - b.time;
    });

    let currentOverlap = 0;
    let maxOverlap = 0;

    events.forEach(event => {
      if (event.type === 'start') {
        currentOverlap++;
        maxOverlap = Math.max(maxOverlap, currentOverlap);
      } else {
        currentOverlap--;
      }
    });

    return maxOverlap;
  }

  /**
   * Calculate score for parking lot based on user preferences
   */
  static calculateScore(parkingLot, preferences) {
    let score = 0;
    
    // Rating score (0-5 becomes 0-50 points)
    score += (parkingLot.ratings.average || 0) * 10;
    
    // Price score (lower price gets higher score, max 30 points)
    const priceWeight = preferences.priceWeight || 0.3;
    const maxPrice = 100; // Assume max hourly rate of ₹100
    const priceScore = Math.max(0, (maxPrice - parkingLot.pricing.twoWheeler.hourly) / maxPrice * 30);
    score += priceScore * priceWeight;
    
    // Amenities score (max 20 points)
    const amenityScore = (parkingLot.amenities?.length || 0) * 2;
    score += Math.min(amenityScore, 20);
    
    return score;
  }

  /**
   * Get day of week string from date
   */
  static getDayOfWeek(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Reserve slots and update availability cache
   */
  static async reserveSlots(parkingLotId, startTime, endTime, vehicleType, quantity = 1) {
    try {
      const parkingLot = await ParkingLot.findById(parkingLotId);
      if (!parkingLot) {
        throw new Error('Parking lot not found');
      }

      // Check availability one more time before reserving
      const availability = await this.checkAvailability(
        parkingLotId,
        startTime,
        endTime,
        vehicleType,
        quantity
      );

      if (!availability.available) {
        throw new Error('Slots no longer available');
      }

      // Update the availability slots in the parking lot
      parkingLot.reserveSlots(startTime, endTime, vehicleType, quantity);
      await parkingLot.save();

      return { success: true, message: 'Slots reserved successfully' };
    } catch (error) {
      console.error('Error reserving slots:', error);
      throw error;
    }
  }

  /**
   * Release reserved slots (for cancellations)
   */
  static async releaseSlots(parkingLotId, startTime, endTime, vehicleType, quantity = 1) {
    try {
      const parkingLot = await ParkingLot.findById(parkingLotId);
      if (!parkingLot) {
        throw new Error('Parking lot not found');
      }

      // Release the slots by adding them back
      parkingLot.reserveSlots(startTime, endTime, vehicleType, -quantity);
      await parkingLot.save();

      return { success: true, message: 'Slots released successfully' };
    } catch (error) {
      console.error('Error releasing slots:', error);
      throw error;
    }
  }
}

export default AvailabilityManager;