# ParkPlot - Smart Parking Reservation System

A comprehensive, enterprise-grade parking reservation system built with Node.js, Express, MongoDB, React, and Google Maps API, specifically designed for the Indian market with advanced CRM features and business intelligence.

## 🚀 Project Overview

ParkPlot revolutionizes urban parking management in India by connecting parking seekers with parking providers through a sophisticated digital platform. The system incorporates advanced algorithms, business intelligence, and freemium monetization strategies to create a sustainable parking ecosystem.

## ✨ Key Features

### Core System
- **Dual User Ecosystem**: Customers and Vendors (parking lot owners)
- **Real-time Availability Engine**: Advanced algorithms with priority queue implementation
- **Google Maps Integration**: Smart location search and nearby parking discovery
- **Phone Authentication**: OTP-based secure authentication system
- **Payment Integration**: Stripe-powered secure transactions
- **Mobile-First Design**: Responsive UI optimized for Indian users

### CRM & Business Intelligence
- **Advanced Analytics Dashboard**: MongoDB aggregation pipelines for real-time insights
- **RFM Customer Segmentation**: Recency, Frequency, Monetary analysis
- **Customer Lifetime Value (CLV)**: Predictive analytics for customer value
- **Net Promoter Score (NPS)**: Customer satisfaction tracking
- **Revenue Projections**: AI-powered business forecasting
- **Priority Queue Algorithm**: Premium user prioritization system

### Monetization Strategy
- **Freemium Model**: Free, Go (₹199/month), and Zap (₹499/month) plans
- **Usage Limitations**: Strategic feature restrictions to drive upgrades
- **Premium Features**: Priority bookings, unlimited searches, advanced analytics

## 🛠 Tech Stack

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with OTP verification
- **APIs**: Google Maps API, Google Places API, Stripe Payment API
- **Security**: Rate limiting, input validation, CORS protection
- **Analytics**: Custom MongoDB aggregation pipelines
- **Algorithms**: Binary heap priority queue implementation

### Frontend Architecture  
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS with mobile-first design
- **State Management**: Zustand for efficient state handling
- **Maps**: Google Maps React integration
- **UI/UX**: Heroicons, responsive components
- **API Integration**: Axios with interceptors for error handling

### Advanced Features
- **Priority Queue**: O(log n) complexity binary heap for premium user prioritization
- **Business Intelligence**: Real-time dashboards with MongoDB aggregations
- **Customer Analytics**: RFM segmentation, CLV calculations, NPS scoring
- **Revenue Analytics**: Trend analysis, growth projections, seasonal insights

## Project Structure

```
parking-reservation-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   ├── utils/
    │   └── App.jsx
    └── package.json
```

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Update environment variables in `.env`
5. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in backend `.env` file
3. The database will be automatically seeded with initial data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user/vendor
- `POST /api/auth/login` - Login with phone/password
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout user

### Parking Lots
- `GET /api/parking-lots` - Get all parking lots
- `POST /api/parking-lots` - Create new parking lot (vendor only)
- `PUT /api/parking-lots/:id` - Update parking lot (vendor only)
- `DELETE /api/parking-lots/:id` - Delete parking lot (vendor only)

### Reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations` - Get user reservations
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Search
- `GET /api/search/parking-lots` - Search nearby parking lots
- `GET /api/search/places` - Google Places API integration

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