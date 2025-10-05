import React, { useState } from 'react';
import { 
  XMarkIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services';
import { useAuthStore, useVendorStore } from '../../store';

const AddParkingLotModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { addVendorParkingLot } = useVendorStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    totalSpots: '',
    pricePerHour: '',
    vehicleTypes: ['car'],
    amenities: [],
    operatingHours: {
      monday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      tuesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      wednesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      thursday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      friday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      saturday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      sunday: { isOpen: true, openTime: '00:00', closeTime: '23:59' }
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Default to Delhi coordinates
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableAmenities = [
    'CCTV Surveillance',
    '24/7 Security', 
    'Covered Parking',
    'Electric Vehicle Charging',
    'Disabled Access',
    'Car Wash',
    'Valet Service',
    'Restrooms',
    'Waiting Area'
  ];

  // Map frontend amenity names to backend enum values
  const amenityMapping = {
    'CCTV Surveillance': 'security_camera',
    '24/7 Security': '24_7_access',
    'Covered Parking': 'covered_parking', 
    'Electric Vehicle Charging': 'ev_charging',
    'Disabled Access': 'disabled_access',
    'Car Wash': 'wash_service',
    'Valet Service': 'valet_parking',
    'Restrooms': 'restrooms',
    'Waiting Area': 'waiting_area'
  };

  const vehicleTypeOptions = [
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike/Motorcycle' },
    { value: 'truck', label: 'Truck' },
    { value: 'bus', label: 'Bus' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'amenities') {
        setFormData(prev => ({
          ...prev,
          amenities: checked 
            ? [...prev.amenities, value]
            : prev.amenities.filter(amenity => amenity !== value)
        }));
      } else if (name === 'vehicleTypes') {
        setFormData(prev => ({
          ...prev,
          vehicleTypes: checked 
            ? [...prev.vehicleTypes, value]
            : prev.vehicleTypes.filter(type => type !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.totalSpots || !formData.pricePerHour) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.vehicleTypes.length === 0) {
        throw new Error('Please select at least one vehicle type');
      }

      // Parse address string into components
      const addressParts = formData.address.split(',').map(part => part.trim());
      const totalSpots = parseInt(formData.totalSpots);
      
      // Prepare the data for submission in the backend expected format
      const submitData = {
        name: formData.name,
        description: formData.description,
        address: {
          street: addressParts[0] || formData.address,
          city: addressParts[1] || 'Mumbai',
          state: addressParts[2] || 'Maharashtra',
          pincode: addressParts[3] || '400001',
          coordinates: formData.location
        },
        contactInfo: {
        phone: user?.phoneNumber || '',
        email: user?.email || ''
      },
        capacity: {
          twoWheeler: formData.vehicleTypes.includes('bike') ? Math.floor(totalSpots * 0.3) : 0,
          fourWheeler: formData.vehicleTypes.includes('car') ? Math.floor(totalSpots * 0.6) : totalSpots,
          heavyVehicle: formData.vehicleTypes.includes('truck') ? Math.floor(totalSpots * 0.1) : 0
        },
        pricing: {
          twoWheeler: {
            hourly: parseFloat(formData.pricePerHour) * 0.5,
            daily: parseFloat(formData.pricePerHour) * 8,
            monthly: parseFloat(formData.pricePerHour) * 200
          },
          fourWheeler: {
            hourly: parseFloat(formData.pricePerHour),
            daily: parseFloat(formData.pricePerHour) * 10,
            monthly: parseFloat(formData.pricePerHour) * 250
          },
          heavyVehicle: {
            hourly: parseFloat(formData.pricePerHour) * 2,
            daily: parseFloat(formData.pricePerHour) * 20,
            monthly: parseFloat(formData.pricePerHour) * 500
          }
        },
        amenities: formData.amenities.map(amenity => amenityMapping[amenity]).filter(Boolean),
        operatingHours: formData.operatingHours
      };

      console.log('Submitting parking lot data:', submitData);

      const response = await api.parking.createParkingLot(submitData);
      
      if (response.success) {
        // Update the vendor store with the new parking lot
        addVendorParkingLot(response.data.parkingLot);
        
        onSuccess(response.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          address: '',
          description: '',
          totalSpots: '',
          pricePerHour: '',
          vehicleTypes: ['car'],
          amenities: [],
          operatingHours: {
            monday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            tuesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            wednesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            thursday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            friday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            saturday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
            sunday: { isOpen: true, openTime: '00:00', closeTime: '23:59' }
          },
          location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          }
        });
      }
    } catch (err) {
      console.error('Failed to create parking lot:', err);
      setError(err.message || 'Failed to create parking lot');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Parking Lot</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking Lot Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter parking lot name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Parking Spots *
              </label>
              <input
                type="number"
                name="totalSpots"
                value={formData.totalSpots}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter full address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe your parking lot..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Hour (₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* Vehicle Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Supported Vehicle Types *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicleTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="vehicleTypes"
                    value={option.value}
                    checked={formData.vehicleTypes.includes(option.value)}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Parking Lot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParkingLotModal;