import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  reservation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Reservation',
    required: [true, 'Reservation is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  aspects: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    security: {
      type: Number,
      min: 1,
      max: 5
    },
    accessibility: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  vendorResponse: {
    message: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ parkingLot: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ reservation: 1 }, { unique: true }); // One review per reservation

// Update parking lot average rating after review save/update
reviewSchema.post('save', async function() {
  await this.updateParkingLotRating();
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await doc.updateParkingLotRating();
  }
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.updateParkingLotRating();
  }
});

// Method to update parking lot average rating
reviewSchema.methods.updateParkingLotRating = async function() {
  const stats = await this.constructor.aggregate([
    {
      $match: { parkingLot: this.parkingLot }
    },
    {
      $group: {
        _id: '$parkingLot',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const ParkingLot = mongoose.model('ParkingLot');
  
  if (stats.length > 0) {
    await ParkingLot.findByIdAndUpdate(this.parkingLot, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.totalReviews': stats[0].totalReviews
    });
  } else {
    await ParkingLot.findByIdAndUpdate(this.parkingLot, {
      'ratings.average': 0,
      'ratings.totalReviews': 0
    });
  }
};

export default mongoose.model('Review', reviewSchema);