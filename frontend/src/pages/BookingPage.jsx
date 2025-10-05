import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  CalendarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useParkingStore, useAuthStore } from '../store';
import { api } from '../services';

const ParkingLotDetails = ({ parkingLot }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{parkingLot.name}</h2>
    
    <div className="flex items-start space-x-4 mb-4">
      <div className="flex-1">
        <p className="text-gray-600 flex items-center mb-2">
          <MapPinIcon className="h-5 w-5 mr-2" />
          {parkingLot.address}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-current mr-1" />
            <span>{parkingLot.rating}</span>
            <span className="ml-1">({parkingLot.totalReviews} reviews)</span>
          </div>
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            <span>{parkingLot.availableSpots} spots available</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-2xl font-bold text-indigo-600">₹{parkingLot.pricePerHour}/hour</p>
        <p className="text-sm text-gray-500">Base price</p>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {parkingLot.amenities.map((amenity, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
        >
          {amenity}
        </span>
      ))}
    </div>
  </div>
);

const BookingForm = ({ parkingLot, onBookingSubmit }) => {
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    vehicleType: 'car',
    vehicleNumber: '',
    duration: 1
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    calculateTotalAmount();
  }, [bookingData.duration, parkingLot.pricePerHour]);

  const calculateTotalAmount = () => {
    const baseAmount = parkingLot.pricePerHour * bookingData.duration;
    const tax = baseAmount * 0.18; // 18% GST
    const total = baseAmount + tax;
    setTotalAmount(Math.round(total));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate duration if start/end time changes
    if (name === 'startTime' || name === 'endTime') {
      const updatedData = { ...bookingData, [name]: value };
      if (updatedData.startTime && updatedData.endTime) {
        const start = new Date(`${updatedData.date}T${updatedData.startTime}`);
        const end = new Date(`${updatedData.date}T${updatedData.endTime}`);
        const diffHours = (end - start) / (1000 * 60 * 60);
        
        if (diffHours > 0) {
          setBookingData(prev => ({ ...prev, duration: diffHours }));
        }
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingData.date) newErrors.date = 'Date is required';
    if (!bookingData.startTime) newErrors.startTime = 'Start time is required';
    if (!bookingData.endTime) newErrors.endTime = 'End time is required';
    if (!bookingData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    
    // Validate Indian vehicle number format
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    if (bookingData.vehicleNumber && !vehicleRegex.test(bookingData.vehicleNumber.replace(/\s/g, ''))) {
      newErrors.vehicleNumber = 'Invalid vehicle number format (e.g., DL01AB1234)';
    }
    
    // Check if end time is after start time
    if (bookingData.startTime && bookingData.endTime) {
      const start = new Date(`${bookingData.date}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.date}T${bookingData.endTime}`);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
      
      if (start < new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const bookingDetails = {
        ...bookingData,
        parkingLotId: parkingLot._id,
        totalAmount,
        startDateTime: new Date(`${bookingData.date}T${bookingData.startTime}`),
        endDateTime: new Date(`${bookingData.date}T${bookingData.endTime}`)
      };
      
      onBookingSubmit(bookingDetails);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Book Your Spot</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            name="date"
            value={bookingData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={bookingData.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={bookingData.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              name="vehicleType"
              value={bookingData.vehicleType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={bookingData.vehicleNumber}
              onChange={handleInputChange}
              placeholder="DL01AB1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.vehicleNumber && <p className="text-red-600 text-sm mt-1">{errors.vehicleNumber}</p>}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{bookingData.duration} hours</span>
            </div>
            <div className="flex justify-between">
              <span>Base Amount:</span>
              <span>₹{parkingLot.pricePerHour * bookingData.duration}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{Math.round(parkingLot.pricePerHour * bookingData.duration * 0.18)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
              <span>Total Amount:</span>
              <span className="text-indigo-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
          )}
          {loading ? 'Processing...' : `Pay ₹${totalAmount} & Book Now`}
        </button>
      </form>
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedParkingLot } = useParkingStore();
  const [parkingLot, setParkingLot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedParkingLot) {
      setParkingLot(selectedParkingLot);
      setLoading(false);
    } else if (id) {
      fetchParkingLot(id);
    } else {
      navigate('/search');
    }
  }, [id, selectedParkingLot, navigate]);

  const fetchParkingLot = async (lotId) => {
    try {
      setLoading(true);
      const response = await api.parking.getParkingLot(lotId);
      const lotData = response.data?.parkingLot || response.parkingLot || response;
      
      // Transform the API response to match the component's expected format
      const transformedLot = {
        ...lotData,
        address: typeof lotData.address === 'string' 
          ? lotData.address 
          : `${lotData.address?.street || ''}, ${lotData.address?.city || ''}, ${lotData.address?.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
        pricePerHour: lotData.pricing?.fourWheeler?.hourly || lotData.pricing?.twoWheeler?.hourly || 50,
        rating: lotData.ratings?.average || 4.0,
        totalReviews: lotData.ratings?.totalReviews || 0,
        availableSpots: lotData.availableSlots?.fourWheeler || Math.floor(Math.random() * 20) + 5,
        totalSpots: lotData.capacity?.fourWheeler + lotData.capacity?.twoWheeler || 50,
        amenities: lotData.amenities || ['Parking'],
        coordinates: lotData.address?.coordinates ? {
          lat: lotData.address.coordinates.coordinates[1],
          lng: lotData.address.coordinates.coordinates[0]
        } : { lat: 19.0760, lng: 72.8777 }
      };
      
      setParkingLot(transformedLot);
    } catch (error) {
      console.error('Failed to fetch parking lot:', error);
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (bookingDetails) => {
    // Navigate to payment page with booking details
    navigate(`/payment/${parkingLot._id}`, { 
      state: { bookingDetails, parkingLot } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!parkingLot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Parking Lot Not Found</h2>
          <p className="text-gray-600 mb-4">The parking lot you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center"
          >
            ← Back to Search
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Parking Spot</h1>
          <p className="text-gray-600 mt-2">
            Complete your booking details to secure your parking spot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Parking Lot Details */}
          <div>
            <ParkingLotDetails parkingLot={parkingLot} />
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <BookingForm 
              parkingLot={parkingLot} 
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;