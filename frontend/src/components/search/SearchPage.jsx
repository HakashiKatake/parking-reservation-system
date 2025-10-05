import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  LockClosedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useParkingStore, useAuthStore } from '../../store';
import { api } from '../../services';

const SearchForm = () => {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const { 
    searchResults, 
    setSearchResults, 
    setSelectedParkingLot,
    filters,
    setFilters 
  } = useParkingStore();

  // Google Places Autocomplete
  const handleLocationChange = async (value) => {
    setLocation(value);
    
    if (value.length > 2) {
      // This would use Google Places API in production
      // For now, we'll use mock suggestions
      const mockSuggestions = [
        { place_id: '1', description: 'Connaught Place, New Delhi, Delhi, India' },
        { place_id: '2', description: 'CP Metro Station, New Delhi, Delhi, India' },
        { place_id: '3', description: 'Janpath, Connaught Place, New Delhi, Delhi, India' }
      ];
      setSuggestions(mockSuggestions.filter(s => 
        s.description.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setSuggestions([]);
    }
  };

  const handlePlaceSelect = (place) => {
    setLocation(place.description);
    setSelectedPlace(place);
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      // Mock search results - in production this would call the API
      const mockResults = {
        vendorLots: [
          {
            _id: '1',
            name: 'CP Central Parking',
            address: 'Block A, Connaught Place, New Delhi',
            pricePerHour: 50,
            rating: 4.5,
            totalReviews: 230,
            distance: 0.2,
            availableSpots: 15,
            totalSpots: 50,
            amenities: ['CCTV', 'Security', '24/7'],
            coordinates: { lat: 28.6315, lng: 77.2167 }
          },
          {
            _id: '2',
            name: 'Metro Plaza Parking',
            address: 'Rajiv Chowk Metro Station, New Delhi',
            pricePerHour: 40,
            rating: 4.2,
            totalReviews: 180,
            distance: 0.3,
            availableSpots: 8,
            totalSpots: 30,
            amenities: ['Covered', 'CCTV'],
            coordinates: { lat: 28.6328, lng: 77.2197 }
          }
        ],
        nearbyLots: [
          {
            _id: '3',
            name: 'Janpath Parking',
            address: 'Janpath Road, New Delhi',
            pricePerHour: 30,
            rating: 4.0,
            totalReviews: 120,
            distance: 0.5,
            availableSpots: 20,
            totalSpots: 40,
            amenities: ['Open Air', 'CCTV'],
            coordinates: { lat: 28.6289, lng: 77.2065 }
          }
        ]
      };

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Location Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter location (e.g., Connaught Place, Delhi)"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePlaceSelect(suggestion)}
                >
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{suggestion.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.vehicleType}
              onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            >
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="4">4 Hours</option>
              <option value="8">8 Hours</option>
              <option value="24">Full Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price (₹/hour)
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            >
              <option value="">Any Price</option>
              <option value="30">Under ₹30</option>
              <option value="50">Under ₹50</option>
              <option value="100">Under ₹100</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading || !location}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          )}
          {loading ? 'Searching...' : 'Search Parking'}
        </button>
      </div>
    </div>
  );
};

const SearchResults = () => {
  const { searchResults, setSelectedParkingLot } = useParkingStore();
  const { user } = useAuthStore();

  // Determine user plan - for now, assume all users are on free plan
  // In production, this would come from user.subscriptionPlan or similar
  const userPlan = user?.subscriptionPlan || 'free';
  const isFreeUser = userPlan === 'free';
  const freeResultLimit = 3;

  if (!searchResults) return null;

  const handleSelectLot = (lot, isBlocked = false) => {
    if (isBlocked) {
      // Show upgrade modal or redirect to pricing
      return;
    }
    setSelectedParkingLot(lot);
  };

  const renderUpgradeOverlay = (totalResults, visibleResults) => (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg border max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <SparklesIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Unlock All Results
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            You're seeing {visibleResults} of {totalResults} parking spots. 
            Upgrade to view all available options with better rates and locations.
          </p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <LockClosedIcon className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );

  const renderParkingLot = (lot, index, isBlocked = false) => (
    <div
      key={lot._id}
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 transition-shadow cursor-pointer relative ${
        isBlocked 
          ? 'opacity-50 blur-sm pointer-events-none' 
          : 'hover:shadow-lg'
      }`}
      onClick={() => handleSelectLot(lot, isBlocked)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{lot.name}</h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {lot.address}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-yellow-500 mb-1">
            <StarIcon className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-900 ml-1">
              {lot.rating}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({lot.totalReviews})
            </span>
          </div>
          <p className="text-xs text-gray-500">{lot.distance} km away</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium">
            {lot.availableSpots} of {lot.totalSpots} spots available
          </span>
        </div>
        <div className="flex items-center text-indigo-600 font-semibold">
          <CurrencyRupeeIcon className="h-4 w-4" />
          <span>{lot.pricePerHour}/hour</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lot.amenities.map((amenity, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );

  // Combine all results for free user limitation
  const allResults = [
    ...(searchResults.vendorLots || []),
    ...(searchResults.nearbyLots || [])
  ];

  const visibleResults = isFreeUser ? allResults.slice(0, freeResultLimit) : allResults;
  const blockedResults = isFreeUser ? allResults.slice(freeResultLimit) : [];
  const hasBlockedResults = isFreeUser && blockedResults.length > 0;

  return (
    <div className="space-y-6">
      {/* Free User Plan Indicator */}
      {isFreeUser && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">
                  Free Plan - Limited Results
                </h3>
                <p className="text-xs text-indigo-600">
                  Showing first {Math.min(freeResultLimit, allResults.length)} of {allResults.length} results
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {searchResults.vendorLots && searchResults.vendorLots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Featured Parking Lots
            {isFreeUser && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Premium spots available
              </span>
            )}
          </h2>
          <div className="space-y-4 relative">
            {searchResults.vendorLots.map((lot, index) => {
              const globalIndex = index;
              const isBlocked = isFreeUser && globalIndex >= freeResultLimit;
              return renderParkingLot(lot, index, isBlocked);
            })}
          </div>
        </div>
      )}

      {searchResults.nearbyLots && searchResults.nearbyLots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
            Nearby Parking Lots
          </h2>
          <div className="space-y-4 relative">
            {searchResults.nearbyLots.map((lot, index) => {
              const globalIndex = (searchResults.vendorLots?.length || 0) + index;
              const isBlocked = isFreeUser && globalIndex >= freeResultLimit;
              return renderParkingLot(lot, index, isBlocked);
            })}
            
            {/* Upgrade overlay for blocked results */}
            {hasBlockedResults && (
              <div className="mt-4">
                {renderUpgradeOverlay(allResults.length, visibleResults.length)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Parking</h1>
          <p className="text-gray-600 mt-2">
            Search for parking spaces near your location
          </p>
        </div>
        
        <SearchForm />
        <SearchResults />
      </div>
    </div>
  );
};

export default SearchPage;