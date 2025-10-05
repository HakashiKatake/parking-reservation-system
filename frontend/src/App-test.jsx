import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';

// Import auth pages
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';

// Placeholder components - will be implemented
const UserDashboard = () => <div className="p-8 text-center">User Dashboard</div>;
const VendorDashboard = () => <div className="p-8 text-center">Vendor Dashboard</div>;
const BookingPage = () => <div className="p-8 text-center">Booking Page</div>;
const PaymentPage = () => <div className="p-8 text-center">Payment Page</div>;
const ProfilePage = () => <div className="p-8 text-center">Profile Page</div>;
const ReservationsPage = () => <div className="p-8 text-center">Reservations Page</div>;
const ParkingLotManagement = () => <div className="p-8 text-center">Parking Lot Management</div>;
const VendorAnalytics = () => <div className="p-8 text-center">Vendor Analytics</div>;

// Simple search page without maps for testing
const SearchPage = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Parking</h1>
      <p className="text-gray-600">Search functionality coming soon!</p>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a 
        href="/" 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Auth Routes */}
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/register" element={<VendorRegister />} />
            
            {/* User Routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<ProfilePage />} />
            <Route path="/user/reservations" element={<ReservationsPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/parking-lots" element={<ParkingLotManagement />} />
            <Route path="/vendor/analytics" element={<VendorAnalytics />} />
            <Route path="/vendor/reservations" element={<ReservationsPage />} />
            
            {/* Redirects for backward compatibility */}
            <Route path="/login" element={<Navigate to="/user/login" replace />} />
            <Route path="/register" element={<Navigate to="/user/register" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;