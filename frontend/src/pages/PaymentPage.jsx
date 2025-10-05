import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store';
import { api } from '../services';
import ReservationQRCode from '../components/common/ReservationQRCode';

// Load Stripe (use test public key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51234567890abcdef');

const PaymentSummary = ({ bookingDetails, parkingLot }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
    
    <div className="space-y-3 mb-6">
      <div className="flex justify-between">
        <span className="text-gray-600">Parking Lot:</span>
        <span className="font-medium">{parkingLot.name}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Date & Time:</span>
        <span className="font-medium">
          {new Date(bookingDetails.startDateTime).toLocaleDateString()} 
          <br />
          <span className="text-sm">
            {new Date(bookingDetails.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
            {new Date(bookingDetails.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Duration:</span>
        <span className="font-medium">{bookingDetails.duration} hours</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-gray-600">Vehicle:</span>
        <span className="font-medium">{bookingDetails.vehicleNumber} ({bookingDetails.vehicleType})</span>
      </div>
      
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between text-sm">
          <span>Base Amount:</span>
          <span>₹{(parkingLot.pricing?.fourWheeler?.hourly || parkingLot.pricePerHour || 50) * bookingDetails.duration}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>GST (18%):</span>
          <span>₹{Math.round((parkingLot.pricing?.fourWheeler?.hourly || parkingLot.pricePerHour || 50) * bookingDetails.duration * 0.18)}</span>
        </div>
        
        <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200">
          <span>Total Amount:</span>
          <span className="text-indigo-600">₹{bookingDetails.totalAmount}</span>
        </div>
      </div>
    </div>
  </div>
);

const PaymentForm = ({ bookingDetails, parkingLot, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setError('You must be logged in to make a reservation');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create payment intent on backend
      const { data } = await api.payments.createPaymentIntent({
        amount: bookingDetails.totalAmount * 100, // Convert to paise
        currency: 'inr',
        bookingDetails,
        parkingLotId: parkingLot._id
      });
      
      const cardElement = elements.getElement(CardElement);
      
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || ''
            }
          }
        }
      );
      
      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Create booking after successful payment with correct data structure
        const vehicleTypeMapping = {
          'car': 'fourWheeler',
          'bike': 'twoWheeler', 
          'motorcycle': 'twoWheeler',
          'truck': 'heavyVehicle',
          'fourWheeler': 'fourWheeler',
          'twoWheeler': 'twoWheeler',
          'heavyVehicle': 'heavyVehicle'
        };
        
        const reservationData = {
          parkingLot: parkingLot._id,
          vehicleInfo: {
            type: vehicleTypeMapping[bookingDetails.vehicleType] || 'fourWheeler',
            numberPlate: bookingDetails.vehicleNumber
          },
          timeSlot: {
            startTime: bookingDetails.startDateTime,
            endTime: bookingDetails.endDateTime,
            duration: bookingDetails.duration
          },
          pricing: {
            basePrice: Math.round((parkingLot.pricing?.fourWheeler?.hourly || parkingLot.pricePerHour || 50) * bookingDetails.duration),
            taxes: Math.round((parkingLot.pricing?.fourWheeler?.hourly || parkingLot.pricePerHour || 50) * bookingDetails.duration * 0.18),
            totalAmount: bookingDetails.totalAmount
          },
          paymentInfo: {
            paymentId: paymentIntent.id,
            paymentMethod: 'card',
            paymentStatus: 'completed',
            transactionId: paymentIntent.id,
            paidAt: new Date()
          },
          status: 'confirmed'
        };

        // Debug: Log the reservation data being sent
        console.log('Frontend - Creating reservation with data:', JSON.stringify(reservationData, null, 2));
        console.log('Frontend - User from auth store:', user);
        console.log('Frontend - Auth token exists:', !!localStorage.getItem('auth-storage'));

        // Use simplified data format that backend expects
        const simplifiedReservationData = {
          parkingLotId: parkingLot._id,
          startTime: bookingDetails.startDateTime,
          endTime: bookingDetails.endDateTime,
          vehicleNumber: bookingDetails.vehicleNumber,
          vehicleType: bookingDetails.vehicleType,
          totalAmount: bookingDetails.totalAmount,
          paymentIntentId: paymentIntent.id
        };
        
        console.log('Frontend - Using simplified reservation data:', JSON.stringify(simplifiedReservationData, null, 2));
        
        const booking = await api.reservations.createReservation(simplifiedReservationData);        onPaymentSuccess(booking.data);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <LockClosedIcon className="h-5 w-5 mr-2 text-green-600" />
        Secure Payment
      </h3>

      {/* Payment Methods */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border-2 rounded-lg flex items-center justify-center ${
              paymentMethod === 'card'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCardIcon className="h-6 w-6 mr-2" />
            <span>Card Payment</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`p-4 border-2 rounded-lg flex items-center justify-center ${
              paymentMethod === 'upi'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            disabled
          >
            <span className="text-gray-400">UPI (Coming Soon)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {paymentMethod === 'card' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your payment information is secure and encrypted.
            </p>
          </div>
        )}

        {/* Test Card Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Test Mode - Use Test Cards</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
            <p><strong>CVV:</strong> Any 3-digit number</p>
            <p><strong>Expiry:</strong> Any future date</p>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <label className="flex items-start">
            <input type="checkbox" className="mt-1 mr-3" required />
            <span className="text-sm text-gray-600">
              I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms & Conditions</a> and 
              <a href="#" className="text-indigo-600 hover:underline ml-1">Cancellation Policy</a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <LockClosedIcon className="h-5 w-5 mr-2" />
          )}
          {loading ? 'Processing Payment...' : `Pay ₹${bookingDetails.totalAmount}`}
        </button>

        <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
          <LockClosedIcon className="h-4 w-4 mr-1" />
          <span>Secured by Stripe • Your data is protected</span>
        </div>
      </form>
    </div>
  );
};

const PaymentSuccess = ({ booking, onContinue }) => (
  <div className="text-center py-12">
    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
    <p className="text-gray-600 mb-6">
      Your parking spot has been booked successfully.
      <br />
      Booking ID: <span className="font-mono text-indigo-600">{booking?.id || booking?._id}</span>
    </p>

    {/* QR Code Section */}
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 mb-6 max-w-sm mx-auto">
      <div className="flex items-center justify-center text-indigo-800 mb-4">
        <QrCodeIcon className="h-6 w-6 mr-2" />
        <span className="font-semibold text-lg">Reservation QR Code</span>
      </div>
      
      {booking && (
        <ReservationQRCode 
          reservation={booking} 
          size={180}
        />
      )}
      
      <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100">
        <p className="text-sm text-indigo-700 font-medium mb-2">
          📱 Show this QR code to the vendor
        </p>
        <p className="text-xs text-indigo-600">
          The parking vendor will scan this code to verify your reservation and mark your spot as occupied.
        </p>
      </div>
    </div>
    
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
      <div className="flex items-center text-green-800 mb-2">
        <ClockIcon className="h-5 w-5 mr-2" />
        <span className="font-medium">What's Next?</span>
      </div>
      <ul className="text-sm text-green-700 text-left space-y-1">
        <li>• Save or screenshot the QR code above</li>
        <li>• Arrive 15 minutes before your booking time</li>
        <li>• Show the QR code to the parking vendor</li>
        <li>• Check your email for booking confirmation</li>
        <li>• Contact support if you need any assistance</li>
      </ul>
    </div>
    
    <div className="space-y-3">
      <button
        onClick={() => onContinue('dashboard')}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
      >
        Go to Dashboard
      </button>
      <button
        onClick={() => onContinue('search')}
        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300"
      >
        Book Another Spot
      </button>
    </div>
  </div>
);

const PaymentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  
  // Get booking details from navigation state
  const { bookingDetails, parkingLot } = location.state || {};

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/user/login');
      return;
    }
    
    // Redirect if no booking details
    if (!bookingDetails || !parkingLot) {
      navigate('/search');
    }
  }, [user, bookingDetails, parkingLot, navigate]);

  const handlePaymentSuccess = (booking) => {
    setCompletedBooking(booking);
    setPaymentComplete(true);
  };

  const handleContinue = (destination) => {
    if (destination === 'dashboard') {
      navigate('/user/dashboard');
    } else if (destination === 'search') {
      navigate('/search');
    }
  };

  if (!bookingDetails || !parkingLot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Session</h2>
          <p className="text-gray-600 mb-4">Please start the booking process again.</p>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {!paymentComplete && (
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center"
            >
              ← Back to Booking
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600 mt-2">
              Secure your parking spot with our encrypted payment system
            </p>
          </div>
        )}

        {paymentComplete ? (
          <PaymentSuccess 
            booking={completedBooking}
            onContinue={handleContinue}
          />
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentSummary 
              bookingDetails={bookingDetails}
              parkingLot={parkingLot}
            />
            
            <PaymentForm
              bookingDetails={bookingDetails}
              parkingLot={parkingLot}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;