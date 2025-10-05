import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, useVendorStore } from '../store';
import { api } from '../services';
import AddParkingLotModal from '../components/vendor/AddParkingLotModal';

const ParkingLotCard = ({ lot, onView, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="h-48 bg-gray-200 relative">
      {lot.images && lot.images.length > 0 ? (
        <img 
          src={lot.images[0]} 
          alt={lot.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <PhotoIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <div className="absolute top-4 right-4 flex space-x-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          lot.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {lot.isActive ? 'Active' : 'Inactive'}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          lot.isVerified 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {lot.isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>
    </div>
    
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{lot.name}</h3>
        <div className="flex items-center text-yellow-500">
          <StarIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{lot.ratings?.average || '0.0'}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span className="text-sm truncate">
            {lot.address?.street}, {lot.address?.city}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {(lot.capacity?.twoWheeler || 0) + (lot.capacity?.fourWheeler || 0) + (lot.capacity?.heavyVehicle || 0)} spots
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
          <span className="text-sm">
            ₹{lot.pricing?.fourWheeler?.hourly || 0}/hr
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(lot)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(lot)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(lot)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          Created {new Date(lot.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  </div>
);

const ParkingLotManagement = () => {
  const { user } = useAuthStore();
  const { vendorParkingLots, setVendorParkingLots, removeVendorParkingLot } = useVendorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const response = await api.vendors.getParkingLots();
      
      if (response.success) {
        setVendorParkingLots(response.data.parkingLots || []);
      } else {
        setError(response.message || 'Failed to fetch parking lots');
      }
    } catch (err) {
      console.error('Error fetching parking lots:', err);
      setError('Failed to fetch parking lots');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (lot) => {
    // TODO: Implement view modal or navigate to detail page
    console.log('View lot:', lot);
  };

  const handleEdit = (lot) => {
    // TODO: Implement edit modal
    console.log('Edit lot:', lot);
  };

  const handleDelete = async (lot) => {
    if (window.confirm(`Are you sure you want to delete "${lot.name}"?`)) {
      try {
        const response = await api.parking.deleteParkingLot(lot._id);
        
        if (response.success) {
          // Remove from vendor store
          removeVendorParkingLot(lot._id);
        } else {
          setError(response.message || 'Failed to delete parking lot');
        }
      } catch (err) {
        console.error('Error deleting parking lot:', err);
        setError('Failed to delete parking lot');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parking lots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parking Lots</h1>
            <p className="text-gray-600 mt-2">
              Manage your parking lots and track their performance
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Lot
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{vendorParkingLots.length}</p>
                <p className="text-gray-600">Total Lots</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {vendorParkingLots.filter(lot => lot.isActive).length}
                </p>
                <p className="text-gray-600">Active Lots</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {vendorParkingLots.filter(lot => lot.isVerified).length}
                </p>
                <p className="text-gray-600">Verified Lots</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {vendorParkingLots.length > 0 
                    ? (vendorParkingLots.reduce((sum, lot) => sum + (lot.ratings?.average || 0), 0) / vendorParkingLots.length).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parking Lots Grid */}
        {vendorParkingLots.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parking lots yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first parking lot to start managing your business
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Parking Lot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorParkingLots.map((lot) => (
              <ParkingLotCard
                key={lot._id}
                lot={lot}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Add Parking Lot Modal */}
        <AddParkingLotModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // No need to fetch again as the vendor store is already updated by the modal
          }}
        />
      </div>
    </div>
  );
};

export default ParkingLotManagement;