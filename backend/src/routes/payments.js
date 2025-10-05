import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import Reservation from '../models/Reservation.js';
import ParkingLot from '../models/ParkingLot.js';

const router = express.Router();
console.log('Initializing Stripe with key:', process.env.STRIPE_SECRET_KEY ? 'Key loaded' : 'No key found');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    console.log('Creating payment intent with body:', req.body);
    
    // Reinitialize Stripe with the environment variable (which is loaded after dotenv.config())
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY ? 'Key available' : 'No key found');
    
    const { amount, currency = 'inr', bookingDetails, parkingLotId } = req.body;
    
    // Validate required fields
    if (!amount || !bookingDetails || !parkingLotId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, bookingDetails, or parkingLotId'
      });
    }

    // Validate parking lot exists and has availability
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Check availability for the requested time slot
    const startTime = new Date(bookingDetails.startDateTime);
    const endTime = new Date(bookingDetails.endDateTime);
    
    // Temporarily skip availability check for debugging
    // const isAvailable = await parkingLot.checkAvailability(
    //   startTime,
    //   endTime,
    //   bookingDetails.vehicleType
    // );

    // if (!isAvailable) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Selected time slot is not available'
    //   });
    // }

    // Create payment intent with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount, // Amount in paise (smallest currency unit)
      currency,
      metadata: {
        userId: req.user.id,
        parkingLotId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        vehicleNumber: bookingDetails.vehicleNumber,
        vehicleType: bookingDetails.vehicleType
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Confirm payment and create reservation
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Extract metadata from payment intent
    const {
      userId,
      parkingLotId,
      startTime,
      endTime,
      vehicleNumber,
      vehicleType
    } = paymentIntent.metadata;

    // Verify user matches
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment confirmation'
      });
    }

    // Create reservation
    const reservation = new Reservation({
      user: userId,
      parkingLot: parkingLotId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      vehicleNumber,
      vehicleType,
      totalAmount: paymentIntent.amount / 100, // Convert from paise to rupees
      paymentIntentId,
      paymentStatus: 'completed',
      status: 'confirmed'
    });

    await reservation.save();

    // Update parking lot availability
    const parkingLot = await ParkingLot.findById(parkingLotId);
    await parkingLot.updateAvailability(reservation);

    // Populate reservation with parking lot details
    await reservation.populate('parkingLot', 'name address');

    res.status(201).json({
      success: true,
      data: reservation
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Find all reservations with payment information for the user
    const payments = await Reservation.find({
      user: req.user.id,
      paymentStatus: 'completed'
    })
    .populate('parkingLot', 'name address')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

    const total = await Reservation.countDocuments({
      user: req.user.id,
      paymentStatus: 'completed'
    });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// @desc    Handle Stripe webhooks
// @route   POST /api/payments/webhook
// @access  Public (but verified by Stripe)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update reservation status if needed
      try {
        await Reservation.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { paymentStatus: 'completed' }
        );
      } catch (error) {
        console.error('Failed to update reservation:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update reservation status
      try {
        await Reservation.findOneAndUpdate(
          { paymentIntentId: failedPayment.id },
          { paymentStatus: 'failed', status: 'cancelled' }
        );
      } catch (error) {
        console.error('Failed to update failed reservation:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Routes
// Routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;