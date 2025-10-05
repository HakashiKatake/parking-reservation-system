import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function(v) {
            return v.length === 2;
          },
          message: 'Coordinates must have exactly 2 values [longitude, latitude]'
        }
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
    },
    email: String,
    website: String
  },
  capacity: {
    twoWheeler: {
      type: Number,
      required: [true, 'Two wheeler capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    fourWheeler: {
      type: Number,
      required: [true, 'Four wheeler capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    heavyVehicle: {
      type: Number,
      default: 0,
      min: [0, 'Capacity cannot be negative']
    }
  },
  pricing: {
    twoWheeler: {
      hourly: {
        type: Number,
        required: [true, 'Two wheeler hourly rate is required'],
        min: [0, 'Price cannot be negative']
      },
      daily: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      monthly: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    },
    fourWheeler: {
      hourly: {
        type: Number,
        required: [true, 'Four wheeler hourly rate is required'],
        min: [0, 'Price cannot be negative']
      },
      daily: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      monthly: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    },
    heavyVehicle: {
      hourly: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
      },
      daily: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
      }
    }
  },
  amenities: [{
    type: String,
    enum: [
      'security_camera',
      'security_guard',
      'covered_parking',
      'ev_charging',
      'wash_service',
      'valet_parking',
      'disabled_access',
      '24_7_access',
      'restrooms',
      'waiting_area'
    ]
  }],
  operatingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    },
    sunday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '00:00' },
      closeTime: { type: String, default: '23:59' }
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Real-time availability tracking
  currentOccupancy: {
    twoWheeler: {
      type: Number,
      default: 0,
      min: 0
    },
    fourWheeler: {
      type: Number,
      default: 0,
      min: 0
    },
    heavyVehicle: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  // Availability slots for efficient querying (BST implementation)
  availabilitySlots: {
    type: Map,
    of: {
      twoWheeler: Number,
      fourWheeler: Number,
      heavyVehicle: Number
    },
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
parkingLotSchema.index({ 'address.coordinates': '2dsphere' });
parkingLotSchema.index({ vendor: 1 });
parkingLotSchema.index({ 'ratings.average': -1 });
parkingLotSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for available slots
parkingLotSchema.virtual('availableSlots').get(function() {
  return {
    twoWheeler: this.capacity.twoWheeler - this.currentOccupancy.twoWheeler,
    fourWheeler: this.capacity.fourWheeler - this.currentOccupancy.fourWheeler,
    heavyVehicle: this.capacity.heavyVehicle - this.currentOccupancy.heavyVehicle
  };
});

// Method to check availability for a time range
parkingLotSchema.methods.checkAvailability = function(startTime, endTime, vehicleType, quantity = 1) {
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours();
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const slotKey = hour.toString();
    const slot = this.availabilitySlots.get(slotKey) || {
      twoWheeler: this.capacity.twoWheeler,
      fourWheeler: this.capacity.fourWheeler,
      heavyVehicle: this.capacity.heavyVehicle
    };
    
    if (slot[vehicleType] < quantity) {
      return false;
    }
  }
  return true;
};

// Method to reserve slots
parkingLotSchema.methods.reserveSlots = function(startTime, endTime, vehicleType, quantity = 1) {
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours();
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const slotKey = hour.toString();
    const slot = this.availabilitySlots.get(slotKey) || {
      twoWheeler: this.capacity.twoWheeler,
      fourWheeler: this.capacity.fourWheeler,
      heavyVehicle: this.capacity.heavyVehicle
    };
    
    slot[vehicleType] -= quantity;
    this.availabilitySlots.set(slotKey, slot);
  }
  
  this.markModified('availabilitySlots');
};

export default mongoose.model('ParkingLot', parkingLotSchema);