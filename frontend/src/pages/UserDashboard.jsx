import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  CreditCardIcon,
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, useParkingStore } from '../store';
import { api } from '../services';

const QuickStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-full">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
          <p className="text-gray-600">Total Bookings</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-green-100 rounded-full">
          <ClockIcon className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings}</p>
          <p className="text-gray-600">Active Bookings</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-yellow-100 rounded-full">
          <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">₹{stats.totalSpent}</p>
          <p className="text-gray-600">Total Spent</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 rounded-full">
          <StarIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.favoriteSpots}</p>
          <p className="text-gray-600">Favorite Spots</p>
        </div>
      </div>
    </div>
  </div>
);

const QuickActions = () => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a
        href="/search"
        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      >
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-indigo-600">Find Parking</span>
      </a>
      
      <a
        href="/user/reservations"
        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
      >
        <ClockIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-green-600">My Bookings</span>
      </a>
      
      <a
        href="/user/profile"
        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
      >
        <CreditCardIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-purple-600">Profile</span>
      </a>
    </div>
  </div>
);

const RecentReservations = ({ reservations }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
    
    {reservations.length === 0 ? (
      <div className="text-center py-8">
        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No recent reservations</p>
        <p className="text-sm text-gray-500 mt-2">Start by finding parking spots near you</p>
      </div>
    ) : (
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div key={reservation._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{reservation.parkingLot.name}</h4>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {reservation.parkingLot.address}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                reservation.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : reservation.status === 'active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {reservation.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(reservation.startTime).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">
                  {new Date(reservation.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(reservation.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">{reservation.duration} hours</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-indigo-600">₹{reservation.totalAmount}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              {reservation.status === 'confirmed' && (
                <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  View Details
                </button>
              )}
              {reservation.status === 'active' && (
                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Check Out
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const UserDashboard = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
    favoriteSpots: 0
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserDashboard - useEffect running');
    console.log('UserDashboard - isAuthenticated:', isAuthenticated);
    console.log('UserDashboard - user:', user);
    console.log('UserDashboard - token:', !!token);
    
    if (!isAuthenticated || !user) {
      console.log('UserDashboard - User not authenticated, redirecting to login');
      // Don't fetch data if not authenticated
      setLoading(false);
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('UserDashboard - Fetching dashboard data...');
      console.log('UserDashboard - User:', user);
      console.log('UserDashboard - Auth token in localStorage:', !!localStorage.getItem('auth-storage'));
      
      // Fetch real dashboard data from API
      const dashboardData = await api.users.getDashboard();
      
      console.log('UserDashboard - API Response:', dashboardData);
      
      // Safely set stats with fallbacks
      setStats({
        totalBookings: dashboardData.stats?.totalBookings || 0,
        activeBookings: dashboardData.stats?.activeBookings || 0,
        totalSpent: dashboardData.stats?.totalSpent || 0,
        favoriteSpots: dashboardData.stats?.favoriteSpots || 0
      });
      setReservations(dashboardData.recentReservations || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Fallback to empty data on error
      setStats({
        totalBookings: 0,
        activeBookings: 0,
        totalSpent: 0,
        favoriteSpots: 0
      });
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your dashboard.</p>
          <a 
            href="/user/login" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your parking reservations and find new spots
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats stats={stats} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Reservations */}
        <RecentReservations reservations={reservations} />
      </div>
    </div>
  );
};

export default UserDashboard;