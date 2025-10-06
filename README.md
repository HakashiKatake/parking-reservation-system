# ParkPlot - Smart Parking Reservation System 🚗

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **sophisticated, enterprise-grade parking reservation system** built with advanced **Data Structures & Algorithms**, comprehensive **CRM features**, and **business intelligence**. Designed specifically for the Indian market with **QR-based verification**, **real-time analytics**, and **AI-powered insights**.

## 🎯 Project Vision

ParkPlot transforms urban parking challenges into intelligent solutions by implementing cutting-edge algorithms, machine learning insights, and modern web technologies. Our system addresses India's growing urbanization needs with a scalable, profitable, and user-centric approach.

## 🏆 Key Achievements & Innovations

### Advanced Algorithm Implementation
- **Priority Queue System**: Binary heap implementation for premium user prioritization
- **Cryptographic Hashing**: Prevents duplicate bookings and ensures data integrity  
- **Geospatial Algorithms**: Efficient location-based search with MongoDB geospatial queries
- **Real-time Analytics**: MongoDB aggregation pipelines for instant business insights

### Business Intelligence Features
- **RFM Analysis**: Customer segmentation based on Recency, Frequency, Monetary value
- **Customer Lifetime Value (CLV)**: Predictive analytics for revenue forecasting
- **Net Promoter Score (NPS)**: Automated customer satisfaction tracking
- **Revenue Analytics**: AI-powered trend analysis and growth projections

## 🚀 Core Features & Capabilities

### 🔐 Advanced Security & Authentication
- **OTP-based Authentication**: Secure phone number verification
- **JWT Token Management**: Stateless authentication with refresh tokens
- **Cryptographic Hashing**: SHA-256 hashing for duplicate prevention
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data sanitization

### 🎯 Smart Booking System
- **QR Code Integration**: Contactless verification system
- **Real-time Availability**: Live parking spot status updates
- **Priority Queue Algorithm**: Premium user prioritization (O(log n) complexity)
- **Conflict Prevention**: Duplicate booking detection with hashing
- **Automated Scheduling**: Time-based reservation management

### 📊 Business Intelligence & Analytics
- **RFM Customer Segmentation**: Advanced customer categorization
  - **Recency**: Last booking analysis
  - **Frequency**: Booking pattern recognition  
  - **Monetary**: Revenue contribution tracking
- **Customer Lifetime Value (CLV)**: Predictive revenue analytics
- **Net Promoter Score (NPS)**: Automated satisfaction measurement
- **Revenue Forecasting**: AI-powered growth projections
- **Vendor Performance Metrics**: Comprehensive business dashboards

### 💳 Monetization & Revenue Model
- **Freemium Strategy**: 
  - **Free Plan**: Basic booking (limited)
  - **Go Plan**: ₹199/month - Priority booking + extended features  
  - **Zap Plan**: ₹499/month - Premium features + analytics access
- **Commission-based Revenue**: Vendor transaction fees
- **Dynamic Pricing**: Algorithm-based pricing optimization

### 🗺️ Location Intelligence
- **Google Maps Integration**: Real-time location services
- **Geospatial Queries**: MongoDB 2dsphere indexing for proximity search
- **Route Optimization**: Shortest path to parking spots
- **Location Autocomplete**: Google Places API integration

## 🛠 Technology Architecture

### Backend Infrastructure
```typescript
Technology Stack:
├── Runtime Environment: Node.js v18+
├── Web Framework: Express.js v4.x
├── Database: MongoDB v6+ with Mongoose ODM
├── Authentication: JWT + OTP verification
├── Payment Processing: Stripe API integration
├── External APIs: Google Maps, Places, Geocoding
├── Security: Helmet, CORS, Input validation
├── File Handling: Multer for image uploads
└── Deployment: Render.com (Production)
```

### Frontend Architecture
```typescript
Frontend Stack:
├── Framework: React v18+ with Hooks
├── Build Tool: Vite for fast development
├── Styling: Tailwind CSS + responsive design
├── State Management: Zustand (lightweight)
├── Maps Integration: Google Maps React
├── HTTP Client: Axios with interceptors
├── Icons: Heroicons library
├── QR Codes: react-qr-code + qr-scanner
└── Deployment: Vercel (Production)
```

### 🔥 Advanced DSA Implementation

#### 1. **Priority Queue (Binary Heap)**
```javascript
// Location: backend/src/algorithm/priorityQueue.js
- Implementation: Min-Heap for premium user prioritization
- Time Complexity: O(log n) insert, O(log n) extract
- Use Case: Premium users get priority in booking conflicts
- Algorithm: Binary tree structure with parent-child relationships
```

#### 2. **Cryptographic Hashing**
```javascript
// Location: backend/src/models/Reservation.js  
- Algorithm: SHA-256 + vehicle number + time slot
- Purpose: Prevent duplicate reservations
- Implementation: crypto.createHash('sha256')
- Collision Handling: Compound unique indexing
```

#### 3. **Geospatial Algorithms**
```javascript
// MongoDB 2dsphere indexing for location queries
- Haversine formula for distance calculations
- Proximity search with radius-based filtering
- Real-time location updates with WebSocket potential
```

#### 4. **Aggregation Pipelines**
```javascript
// Complex MongoDB aggregations for business intelligence
- RFM Analysis: Multi-stage pipeline operations
- Revenue Analytics: Time-series data processing
- Customer Segmentation: Statistical calculations
```

## 🗄️ Database Schemas & Data Models

### 1. **User Schema** (Multi-role Architecture)
```javascript
// Collection: users
{
  _id: ObjectId,
  name: String,                    // Full name
  phoneNumber: String,             // Primary authentication (unique)
  password: String,                // Hashed password
  email: String,                   // Optional email
  userType: Enum['customer', 'vendor'], // Role-based access
  isPhoneVerified: Boolean,        // OTP verification status
  
  // Vendor-specific fields
  businessName: String,            // Vendor business name
  businessLicense: String,         // License number
  
  // Customer analytics fields
  plan: Enum['free', 'go', 'zap'], // Subscription plan
  planExpiry: Date,                // Plan expiration
  totalBookings: Number,           // Lifetime booking count
  totalSpent: Number,              // Total revenue generated
  lastBookingAt: Date,             // For RFM analysis
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  profile: {
    avatar: String,
    preferences: Object
  }
}

// Indexes:
- phoneNumber: unique
- email: sparse unique
- userType: compound with isActive
- compound: { phoneNumber: 1, userType: 1 }
```

### 2. **ParkingLot Schema** (Geospatial + Business Logic)
```javascript
// Collection: parkinglots
{
  _id: ObjectId,
  vendor: ObjectId,                // Reference to User (vendor)
  name: String,                    // Parking lot name
  description: String,             // Detailed description
  
  // Geospatial location data
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: "Point",               // GeoJSON Point
      coordinates: [longitude, latitude] // [77.2090, 28.6139]
    }
  },
  
  // Capacity and availability
  totalSpots: Number,
  spots: [{
    spotNumber: String,
    isAvailable: Boolean,
    vehicleType: Enum['car', 'bike', 'truck'],
    currentReservation: ObjectId   // Reference to active reservation
  }],
  
  // Pricing strategy
  pricing: {
    basePrice: Number,             // Per hour base price
    currency: String,              // INR
    dynamicPricing: Boolean,       // Enable surge pricing
    peakHourMultiplier: Number     // Peak hour pricing
  },
  
  // Operational hours
  operatingHours: [{
    day: Enum['monday', 'tuesday', ...],
    openTime: String,              // "09:00"
    closeTime: String,             // "21:00"
    isOpen: Boolean
  }],
  
  // Facilities and amenities
  amenities: [String],             // ['security', 'cctv', 'washroom']
  images: [String],                // Array of image URLs
  
  // Business intelligence
  ratings: {
    average: Number,               // Calculated from reviews
    totalReviews: Number
  },
  
  // Status and verification
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- location: 2dsphere (geospatial queries)
- vendor: compound with isActive
- compound: { "address.city": 1, isActive: 1, isVerified: 1 }
```

### 3. **Reservation Schema** (Complex Business Logic)
```javascript
// Collection: reservations  
{
  _id: ObjectId,
  user: ObjectId,                  // Reference to User (customer)
  parkingLot: ObjectId,            // Reference to ParkingLot
  
  // Vehicle information
  vehicleInfo: {
    licensePlate: String,
    vehicleType: Enum['car', 'bike', 'truck'],
    vehicleModel: String
  },
  
  // Time slot management
  timeSlot: {
    date: Date,                    // Booking date
    startTime: String,             // "14:00"
    endTime: String,               // "16:00"
    duration: Number               // Hours
  },
  
  // Spot allocation
  spotNumber: String,
  
  // Pricing and payment
  pricing: {
    basePrice: Number,
    taxes: Number,
    discount: Number,
    totalAmount: Number
  },
  
  // Payment tracking
  paymentInfo: {
    paymentId: String,             // Stripe payment ID
    method: String,                // 'card', 'upi', 'wallet'
    status: Enum['pending', 'completed', 'failed'],
    paidAt: Date
  },
  
  // QR Code and verification
  qrCode: String,                  // Generated QR code data
  
  // Reservation lifecycle
  status: Enum[
    'pending',       // Just created
    'confirmed',     // Payment successful  
    'active',        // User checked in
    'completed',     // User checked out
    'cancelled',     // Cancelled by user
    'expired'        // Time expired
  ],
  
  // Timestamps for analytics
  actualStartTime: Date,           // When user actually arrived
  actualEndTime: Date,             // When user actually left
  
  // Anti-fraud hashing
  vehicleTimeHash: String,         // SHA-256 hash for duplicate prevention
  
  // Business intelligence
  rating: ObjectId,                // Reference to Review (if rated)
  
  // Lifecycle tracking
  createdAt: Date,
  updatedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}

// Indexes:
- user: compound with status
- parkingLot: compound with timeSlot.date
- vehicleTimeHash: unique (prevents duplicates)
- compound: { user: 1, status: 1, createdAt: -1 }
- compound: { parkingLot: 1, "timeSlot.date": 1, status: 1 }
```

### 4. **Review Schema** (Rating & Feedback System)
```javascript
// Collection: reviews
{
  _id: ObjectId,
  user: ObjectId,                  // Reference to User (reviewer)
  parkingLot: ObjectId,            // Reference to ParkingLot
  reservation: ObjectId,           // Reference to Reservation (unique)
  
  // Rating system
  rating: Number,                  // Overall rating (1-5)
  review: String,                  // Written feedback (max 500 chars)
  
  // Detailed aspect ratings
  aspects: {
    cleanliness: Number,           // 1-5 stars
    security: Number,              // 1-5 stars  
    accessibility: Number,         // 1-5 stars
    valueForMoney: Number          // 1-5 stars
  },
  
  // Media attachments
  images: [{
    url: String,
    caption: String
  }],
  
  // Verification and moderation
  isVerified: Boolean,             // Verified booking review
  helpfulVotes: Number,            // Community upvotes
  
  // Vendor interaction
  vendorResponse: {
    message: String,
    respondedAt: Date
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
- reservation: unique (one review per reservation)
- parkingLot: compound with rating
- compound: { parkingLot: 1, createdAt: -1 }
- compound: { user: 1, createdAt: -1 }
```

### 5. **OTP Schema** (Security & Verification)
```javascript
// Collection: otps
{
  _id: ObjectId,
  phoneNumber: String,             // Target phone number
  otp: String,                     // 6-digit OTP
  purpose: Enum[
    'registration',                // Account creation
    'login',                      // Login verification
    'password_reset',             // Password recovery
    'phone_verification'          // Phone number verification
  ],
  expiresAt: Date,                // TTL index for auto-deletion
  verified: Boolean,              // Verification status
  attempts: Number,               // Failed verification attempts
  createdAt: Date
}

// Indexes:
- expiresAt: TTL index (auto-delete after expiry)
- compound: { phoneNumber: 1, purpose: 1, verified: 1 }
```

### 🔗 **Data Relationships & Integrity**

```mermaid
graph TD
    A[User] -->|1:Many| B[ParkingLot]
    A -->|1:Many| C[Reservation] 
    B -->|1:Many| C
    C -->|1:1| D[Review]
    A -->|1:Many| E[OTP]
    A -->|1:Many| D
    B -->|1:Many| D
```

### 📊 **Business Intelligence Queries**

#### RFM Analysis Pipeline:
```javascript
// Recency, Frequency, Monetary customer segmentation
[
  {$match: {status: "completed"}},
  {$group: {
    _id: "$user",
    recency: {$max: "$createdAt"},
    frequency: {$sum: 1},
    monetary: {$sum: "$pricing.totalAmount"}
  }},
  {$addFields: {
    recency_score: {$switch: {branches: [...], default: 1}},
    frequency_score: {$switch: {branches: [...], default: 1}},
    monetary_score: {$switch: {branches: [...], default: 1}}
  }}
]
```

## 📁 Project Structure

```
parking-reservation-system/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 algorithm/          # DSA implementations
│   │   │   ├── priorityQueue.js   # Binary heap implementation
│   │   │   └── conflictResolver.js
│   │   ├── 📁 controllers/        # Business logic
│   │   │   ├── authController.js
│   │   │   ├── reservationController.js
│   │   │   ├── parkingLotController.js
│   │   │   ├── reviewController.js
│   │   │   └── analyticsController.js
│   │   ├── 📁 models/            # Database schemas
│   │   │   ├── User.js
│   │   │   ├── ParkingLot.js
│   │   │   ├── Reservation.js
│   │   │   ├── Review.js
│   │   │   └── OTP.js
│   │   ├── 📁 routes/            # API endpoints
│   │   ├── 📁 middleware/        # Authentication & validation
│   │   ├── 📁 utils/            # Helper functions
│   │   └── 🚀 server.js         # Application entry point
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── 📁 common/        # Shared components
│   │   │   └── 📁 vendor/        # Vendor-specific components
│   │   ├── 📁 pages/            # Route components
│   │   ├── 📁 store/            # Zustand state management
│   │   ├── 📁 services/         # API integration
│   │   └── 🎯 App.jsx           # Main application component
└── 📄 Documentation/
    ├── DSA_Implementation_Guide.md
    ├── API_Documentation.md
    └── Business_Intelligence_Guide.md
```

## 🚀 Quick Start Guide

### Prerequisites
```bash
- Node.js v18+ installed
- MongoDB v6+ (local or Atlas)
- Google Maps API key
- Stripe API keys (test/production)
- Git for version control
```

### 🔧 Backend Setup
```bash
# 1. Clone and navigate
git clone https://github.com/HakashiKatake/parking-reservation-system.git
cd parking-reservation-system/backend

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Edit .env with your API keys and database URL

# 4. Database setup (if using local MongoDB)
mongod --dbpath /path/to/your/db

# 5. Start development server
npm run dev
# Server runs on: http://localhost:5001
```

### 🎨 Frontend Setup
```bash
# 1. Navigate to frontend
cd ../frontend

# 2. Install dependencies  
npm install

# 3. Environment configuration
cp .env.example .env
# Add your Google Maps API key and backend URL

# 4. Start development server
npm run dev
# Frontend runs on: http://localhost:5173
```

### 🗄️ Database Configuration

#### Local MongoDB:
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community  # macOS
# OR follow official MongoDB installation guide

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### MongoDB Atlas (Recommended for Production):
```bash
# 1. Create account at https://mongodb.com/atlas
# 2. Create cluster and get connection string
# 3. Update MONGODB_URI in .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parkplot?retryWrites=true&w=majority
```

## 📡 API Documentation

### 🔐 Authentication Endpoints
```javascript
POST   /api/auth/register        // Register new user/vendor
POST   /api/auth/login           // Login with phone + password  
POST   /api/auth/send-otp        // Send OTP for verification
POST   /api/auth/verify-otp      // Verify OTP code
GET    /api/auth/profile         // Get user profile (Protected)
PUT    /api/auth/profile         // Update profile (Protected)
POST   /api/auth/logout          // Logout user (Protected)
```

### 🅿️ Parking Lot Management
```javascript
GET    /api/parking-lots         // Get all parking lots (Public)
GET    /api/parking-lots/:id     // Get specific parking lot (Public)
POST   /api/parking-lots         // Create parking lot (Vendor only)
PUT    /api/parking-lots/:id     // Update parking lot (Vendor only)
DELETE /api/parking-lots/:id     // Delete parking lot (Vendor only)
POST   /api/parking-lots/:id/check-availability  // Check real-time availability
```

### 🎫 Reservation System
```javascript
GET    /api/reservations         // Get user reservations (Protected)
POST   /api/reservations         // Create new reservation (Protected)
GET    /api/reservations/:id     // Get specific reservation (Protected)
PUT    /api/reservations/:id     // Update reservation (Protected)
PUT    /api/reservations/:id/cancel  // Cancel reservation (Protected)
POST   /api/reservations/verify-qr   // QR code verification (Vendor only)
POST   /api/reservations/check-conflicts  // Check booking conflicts
```

### ⭐ Review & Rating System  
```javascript
POST   /api/reviews              // Create review (Protected)
GET    /api/reviews/parking-lot/:id  // Get parking lot reviews (Public)
GET    /api/reviews/my-reviews   // Get user's reviews (Protected)
GET    /api/reviews/vendor-reviews   // Get vendor's reviews (Vendor only)
PUT    /api/reviews/:id          // Update review (Protected)
DELETE /api/reviews/:id          // Delete review (Protected)
PUT    /api/reviews/:id/respond  // Respond to review (Vendor only)
```

### 🔍 Search & Discovery
```javascript
GET    /api/search/parking-lots  // Search nearby parking lots
GET    /api/search/places        // Google Places integration
```

### 📊 Analytics & Business Intelligence
```javascript
GET    /api/analytics/vendor-dashboard     // Vendor analytics (Vendor only)
GET    /api/analytics/customer-segments    // RFM analysis (Admin)
GET    /api/analytics/revenue-forecast     // Revenue projections (Admin)
GET    /api/analytics/nps-scores          // NPS analytics (Admin)
```

### 👥 User Management
```javascript
GET    /api/users/dashboard       // User dashboard data (Protected)
GET    /api/users/reservations   // User reservation history (Protected)
GET    /api/users/profile        // User profile details (Protected)
PUT    /api/users/profile        // Update user profile (Protected)
```

### 🏢 Vendor Operations
```javascript
GET    /api/vendors/dashboard     // Vendor dashboard (Vendor only)
GET    /api/vendors/parking-lots // Vendor's parking lots (Vendor only)
GET    /api/vendors/reservations // Vendor's reservations (Vendor only)
GET    /api/vendors/analytics    // Vendor analytics (Vendor only)
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/parking-reservation
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.