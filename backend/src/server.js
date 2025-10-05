import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import utilities and middleware
import connectDB from './utils/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import parkingLotRoutes from './routes/parkingLots.js';
import reservationRoutes from './routes/reservations.js';
import searchRoutes from './routes/search.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendors.js';
import reviewRoutes from './routes/reviews.js';
import paymentRoutes from './routes/payments.js';
import analyticsRoutes from './routes/analytics.js';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL ? 'Running on Vercel' : 'Local development');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Key loaded successfully' : 'No Stripe key found');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'MongoDB URI loaded' : 'No MongoDB URI found');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://parking-reservation-frontend.vercel.app',
      'https://parkplot.vercel.app' // ParkPlot production frontend URL
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Additional CORS headers middleware (for Vercel compatibility)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://parking-reservation-frontend.vercel.app',
    'https://parkplot.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
  console.log('CORS test endpoint hit');
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  
  res.status(200).json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint
app.post('/test-post', (req, res) => {
  console.log('Test POST endpoint hit');
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);
  
  res.status(200).json({
    success: true,
    message: 'POST test successful',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/parking-lots', parkingLotRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Parking Reservation System API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Parking Reservation System API Server Started!
🌍 Environment: ${process.env.NODE_ENV}
🚪 Port: ${PORT}
📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Configuration needed'}
⏰ Started at: ${new Date().toLocaleString()}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;