import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, useVendorStore } from '../store';
import { api } from '../services';
import AddParkingLotModal from '../components/vendor/AddParkingLotModal';

const VendorStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-full">
          <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.totalParkingLots}</p>
          <p className="text-gray-600">Parking Lots</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-green-100 rounded-full">
          <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">₹{stats.totalEarnings}</p>
          <p className="text-gray-600">Total Earnings</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-purple-100 rounded-full">
          <UserGroupIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
          <p className="text-gray-600">Total Bookings</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className="p-3 bg-yellow-100 rounded-full">
          <StarIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{stats.averageRating}</p>
          <p className="text-gray-600">Avg Rating</p>
        </div>
      </div>
    </div>
  </div>
);

const QuickActions = ({ onAddParkingLot }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button 
        onClick={onAddParkingLot}
        className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      >
        <PlusIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-indigo-600">Add Parking Lot</span>
      </button>
      
      <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
        <ChartBarIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-green-600">View Analytics</span>
      </button>
      
      <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
        <UserGroupIcon className="h-6 w-6 text-gray-400 mr-3" />
        <span className="text-gray-600 hover:text-purple-600">Manage Bookings</span>
      </button>
    </div>
  </div>
);

const ParkingLotsList = ({ parkingLots, onEdit, onDelete, onView, onAddParkingLot }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Your Parking Lots</h3>
      <button 
        onClick={onAddParkingLot}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add New Lot
      </button>
    </div>
    
    {parkingLots.length === 0 ? (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No parking lots yet</p>
        <p className="text-sm text-gray-500 mt-2">Add your first parking lot to start earning</p>
        <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Add Parking Lot
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkingLots.map((lot) => (
          <div key={lot._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">{lot.name}</h4>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {lot.address?.street}, {lot.address?.city}, {lot.address?.state}
                </p>
              </div>
              <div className="flex space-x-1 ml-2">
                <button 
                  onClick={() => onView(lot)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onEdit(lot)}
                  className="p-1 text-gray-400 hover:text-green-600"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onDelete(lot)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Total Spots</p>
                <p className="font-semibold text-gray-900">
                  {(lot.capacity?.twoWheeler || 0) + (lot.capacity?.fourWheeler || 0) + (lot.capacity?.heavyVehicle || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Available</p>
                <p className="font-semibold text-green-600">
                  {(lot.currentAvailability?.twoWheeler || 0) + (lot.currentAvailability?.fourWheeler || 0) + (lot.currentAvailability?.heavyVehicle || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Price/Hour</p>
                <p className="font-semibold text-indigo-600">₹{lot.pricing?.fourWheeler?.hourly || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Rating</p>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900 ml-1">{lot.ratings?.average || '0.0'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {(lot.amenities || []).slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {(lot.amenities || []).length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{(lot.amenities || []).length - 3}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className={`px-2 py-1 text-xs rounded-full ${
                lot.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {lot.isActive ? 'Active' : 'Inactive'}
              </span>
              <p className="text-xs text-gray-500">
                Updated {new Date(lot.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecentBookings = ({ bookings }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
    
    {bookings.length === 0 ? (
      <div className="text-center py-8">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No recent bookings</p>
      </div>
    ) : (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {bookings.map((booking) => (
          <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{booking.user.name}</h4>
                <p className="text-sm text-gray-600">{booking.user.phone}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : booking.status === 'active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{booking.parkingLot.name}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Time Slot</p>
                <p className="font-medium">
                  {new Date(booking.startTime).toLocaleString()} - 
                  {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-green-600">₹{booking.totalAmount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const VendorDashboard = () => {
  const { user } = useAuthStore();
  const { vendorParkingLots, setVendorParkingLots, vendorAnalytics, setVendorAnalytics } = useVendorStore();
  const [stats, setStats] = useState({
    totalParkingLots: 0,
    totalEarnings: 0,
    totalBookings: 0,
    averageRating: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update stats when vendorParkingLots changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalParkingLots: vendorParkingLots.length
    }));
  }, [vendorParkingLots]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dashboard stats
      const dashboardResponse = await api.vendors.getDashboard();
      console.log('Dashboard data:', dashboardResponse);
      
      if (dashboardResponse.success) {
        setStats({
          ...dashboardResponse.data.stats,
          totalParkingLots: dashboardResponse.data.stats.totalParkingLots || 0
        });
      }

      // Fetch parking lots
      const parkingLotsResponse = await api.vendors.getParkingLots({ limit: 10 });
      console.log('Parking lots data:', parkingLotsResponse);
      
      if (parkingLotsResponse.success) {
        setVendorParkingLots(parkingLotsResponse.data.parkingLots || []);
      }

      // Fetch recent reservations
      const reservationsResponse = await api.vendors.getReservations({ limit: 5 });
      console.log('Reservations data:', reservationsResponse);
      
      if (reservationsResponse.success) {
        setRecentBookings(reservationsResponse.data.reservations || []);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLot = (lot) => {
    console.log('View lot:', lot);
    // Navigate to lot details
  };

  const handleEditLot = (lot) => {
    console.log('Edit lot:', lot);
    // Navigate to edit form
  };

  const handleDeleteLot = async (lot) => {
    if (window.confirm(`Are you sure you want to delete "${lot.name}"?`)) {
      try {
        await api.parking.deleteParkingLot(lot._id);
        setParkingLots(prev => prev.filter(pl => pl._id !== lot._id));
        // Update stats
        setStats(prev => ({
          ...prev,
          totalParkingLots: prev.totalParkingLots - 1
        }));
      } catch (error) {
        console.error('Failed to delete parking lot:', error);
        alert('Failed to delete parking lot. Please try again.');
      }
    }
  };

  const handleAddParkingLot = () => {
    setShowAddModal(true);
  };

  const handleParkingLotAdded = (newLot) => {
    setParkingLots(prev => [newLot, ...prev]);
    // Update stats
    setStats(prev => ({
      ...prev,
      totalParkingLots: prev.totalParkingLots + 1
    }));
    // Refresh dashboard data
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-medium">Error loading dashboard</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.businessName || user?.name || 'Vendor'}! Manage your parking lots and track your business.
          </p>
        </div>

        {/* Stats */}
        <VendorStats stats={stats} />

        {/* Quick Actions */}
        <QuickActions onAddParkingLot={() => setShowAddModal(true)} />

        {/* Parking Lots */}
        <ParkingLotsList 
          parkingLots={vendorParkingLots}
          onView={handleViewLot}
          onEdit={handleEditLot}
          onDelete={handleDeleteLot}
          onAddParkingLot={() => setShowAddModal(true)}
        />

        {/* Recent Bookings */}
        <RecentBookings bookings={recentBookings} />
      </div>

      {/* Add Parking Lot Modal */}
      <AddParkingLotModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchDashboardData(); // Refresh data after adding
        }}
      />
    </div>
  );
};

export default VendorDashboard;