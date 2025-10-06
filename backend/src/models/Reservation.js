import mongoose from 'mongoose';
import crypto from 'crypto';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  parkingLot: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot is required']
  },
  vehicleInfo: {
    type: {
      type: String,
      enum: ['twoWheeler', 'fourWheeler', 'heavyVehicle'],
      required: [true, 'Vehicle type is required']
    },
    numberPlate: {
      type: String,
      required: [true, 'Vehicle number plate is required'],
      uppercase: true,
      match: [/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$|^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/, 'Please enter a valid Indian vehicle number']
    },
    model: String,
    color: String
  },
  timeSlot: {
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    duration: {
      type: Number, // in hours
      required: true
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required']
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  paymentInfo: {
    paymentId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  checkIn: {
    time: Date,
    method: {
      type: String,
      enum: ['qr_code', 'manual', 'auto']
    },
    location: {
      lat: Number,
      lng: Number
    }
  },
  checkOut: {
    time: Date,
    method: {
      type: String,
      enum: ['qr_code', 'manual', 'auto']
    },
    location: {
      lat: Number,
      lng: Number
    },
    overstayCharges: {
      type: Number,
      default: 0
    }
  },
  qrCode: {
    type: String,
    unique: true
  },
  vehicleTimeHash: {
    type: String,
    unique: true,
    index: true
  },
  specialRequests: {
    type: String,
    maxlength: [200, 'Special requests cannot be more than 200 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot be more than 10'],
    default: null
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  ratedAt: {
    type: Date
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ parkingLot: 1, 'timeSlot.startTime': 1, 'timeSlot.endTime': 1 });
reservationSchema.index({ status: 1, 'timeSlot.startTime': 1 });
reservationSchema.index({ qrCode: 1 });
reservationSchema.index({ 'paymentInfo.paymentId': 1 });
reservationSchema.index({ vehicleTimeHash: 1 });
reservationSchema.index({ 'vehicleInfo.numberPlate': 1, 'timeSlot.startTime': 1 });
reservationSchema.index({ 'vehicleInfo.numberPlate': 1, parkingLot: 1, status: 1 });

// Virtual for checking if reservation is active
reservationSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.timeSlot.startTime <= now && 
         this.timeSlot.endTime >= now;
});

// Virtual for checking if reservation can be cancelled
reservationSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const hoursUntilStart = (this.timeSlot.startTime - now) / (1000 * 60 * 60);
  return hoursUntilStart > 1 && ['pending', 'confirmed'].includes(this.status);
});

// Pre-save middleware to calculate duration, generate QR code, and create hash
reservationSchema.pre('save', function(next) {
  // Calculate duration
  if (this.timeSlot.startTime && this.timeSlot.endTime) {
    const durationMs = this.timeSlot.endTime - this.timeSlot.startTime;
    this.timeSlot.duration = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to hours
  }
  
  // Generate QR code if not exists
  if (!this.qrCode) {
    this.qrCode = `PRS_${this._id}_${Date.now()}`;
  }
  
  // Generate vehicle-time hash to prevent duplicate reservations
  if (this.vehicleInfo.numberPlate && this.timeSlot.startTime && this.timeSlot.endTime) {
    const hashData = `${this.vehicleInfo.numberPlate.toUpperCase()}_${this.timeSlot.startTime.getTime()}_${this.timeSlot.endTime.getTime()}_${this.parkingLot}`;
    this.vehicleTimeHash = crypto.createHash('sha256').update(hashData).digest('hex');
  }
  
  next();
});

// Static method to find overlapping reservations (for availability checking)
reservationSchema.statics.findOverlapping = function(parkingLotId, startTime, endTime, excludeId = null) {
  const query = {
    parkingLot: parkingLotId,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or: [
      {
        'timeSlot.startTime': { $lt: endTime },
        'timeSlot.endTime': { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

// Static method to check for duplicate vehicle reservations
reservationSchema.statics.checkDuplicateVehicle = async function(numberPlate, startTime, endTime, parkingLotId, excludeId = null) {
  const query = {
    'vehicleInfo.numberPlate': numberPlate.toUpperCase(),
    parkingLot: parkingLotId,
    status: { $in: ['confirmed', 'active', 'pending'] },
    $or: [
      {
        // Overlapping time slots
        'timeSlot.startTime': { $lt: endTime },
        'timeSlot.endTime': { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingReservation = await this.findOne(query);
  return existingReservation;
};

// Static method to generate hash for duplicate checking
reservationSchema.statics.generateVehicleTimeHash = function(numberPlate, startTime, endTime, parkingLotId) {
  const hashData = `${numberPlate.toUpperCase()}_${new Date(startTime).getTime()}_${new Date(endTime).getTime()}_${parkingLotId}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
};

// Method to calculate refund amount based on cancellation policy
reservationSchema.methods.calculateRefund = function() {
  const now = new Date();
  const hoursUntilStart = (this.timeSlot.startTime - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilStart > 24) {
    refundPercentage = 100; // Full refund
  } else if (hoursUntilStart > 12) {
    refundPercentage = 75; // 75% refund
  } else if (hoursUntilStart > 2) {
    refundPercentage = 50; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }
  
  return (this.pricing.totalAmount * refundPercentage) / 100;
};

export default mongoose.model('Reservation', reservationSchema);