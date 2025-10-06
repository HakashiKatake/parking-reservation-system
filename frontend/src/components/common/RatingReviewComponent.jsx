import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const RatingReviewComponent = ({ 
  reservation, 
  onSubmitReview, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [aspects, setAspects] = useState({
    cleanliness: 0,
    security: 0,
    accessibility: 0,
    valueForMoney: 0
  });

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleAspectRating = (aspect, value) => {
    setAspects(prev => ({
      ...prev,
      [aspect]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    const reviewData = {
      reservationId: reservation._id,
      rating,
      review: reviewText.trim() || undefined,
      aspects: Object.values(aspects).some(val => val > 0) ? aspects : undefined
    };

    onSubmitReview(reviewData);
  };

  const StarRating = ({ 
    currentRating, 
    onRatingChange, 
    onHover = () => {}, 
    onLeave = () => {},
    size = 'h-8 w-8' 
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          className={`${size} focus:outline-none transition-colors`}
        >
          {star <= (hoverRating || currentRating) ? (
            <StarIcon className="text-yellow-400" />
          ) : (
            <StarOutlineIcon className="text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );

  const aspectLabels = {
    cleanliness: 'Cleanliness',
    security: 'Security',
    accessibility: 'Accessibility',
    valueForMoney: 'Value for Money'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Rate Your Experience
        </h3>
        <p className="text-gray-600">
          How was your parking experience at <strong>{reservation.parkingLot?.name}</strong>?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-4">
            <StarRating
              currentRating={rating}
              onRatingChange={handleStarClick}
              onHover={setHoverRating}
              onLeave={() => setHoverRating(0)}
            />
            <span className="text-sm text-gray-600">
              {hoverRating || rating > 0 ? (
                <span>
                  {hoverRating || rating} out of 5 stars
                </span>
              ) : (
                'Click to rate'
              )}
            </span>
          </div>
        </div>

        {/* Detailed Aspects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate Specific Aspects (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(aspectLabels).map(([aspect, label]) => (
              <div key={aspect} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <StarRating
                  currentRating={aspects[aspect]}
                  onRatingChange={(rating) => handleAspectRating(aspect, rating)}
                  size="h-5 w-5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Written Review */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Write a Review (Optional)
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience to help other users..."
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {reviewText.length}/500 characters
          </p>
        </div>

        {/* Reservation Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Reservation Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Parking Lot:</span>
              <br />
              {reservation.parkingLot?.name}
            </div>
            <div>
              <span className="font-medium">Date:</span>
              <br />
              {reservation.timeSlot?.date ? 
                new Date(reservation.timeSlot.date).toLocaleDateString() : 
                'N/A'
              }
            </div>
            <div>
              <span className="font-medium">Time:</span>
              <br />
              {reservation.timeSlot?.startTime} - {reservation.timeSlot?.endTime}
            </div>
            <div>
              <span className="font-medium">Amount Paid:</span>
              <br />
              ₹{reservation.pricing?.totalAmount || reservation.amount || 0}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingReviewComponent;