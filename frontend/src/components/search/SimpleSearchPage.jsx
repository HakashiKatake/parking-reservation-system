import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { useParkingStore, useAuthStore } from '../../store';
import { api } from '../../services';

const SimpleSearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [location, setLocation] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [duration, setDuration] = useState('2');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Check if user has premium (for now, all users are free - can be extended later)
  const isFreePlan = !user?.isPremium; // Default to free plan
  const FREE_PLAN_LIMIT = 3;

  // Load Google Maps
  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo_key';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && searchResults && window.google) {
      initializeMap();
    }
  }, [mapLoaded, searchResults]);

  const handleSearch = async () => {
    if (!location) return;
    
    setLoading(true);
    
    try {
      let vendorLots = [];
      let googleResults = [];

      // First, geocode the location to get coordinates
      const geocodeLocation = () => {
        return new Promise((resolve) => {
          if (!window.google || !window.google.maps) {
            resolve(null);
            return;
          }

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const loc = results[0].geometry.location;
              resolve({
                lat: loc.lat(),
                lng: loc.lng()
              });
            } else {
              resolve(null);
            }
          });
        });
      };

      const coordinates = await geocodeLocation();
      
      // Store coordinates globally for map centering
      if (coordinates) {
        window.searchLocationCoords = coordinates;
      }

      // Search our vendor database by location name (simple text search)
      try {
        const response = await api.parking.searchVendorLots(location);
        console.log('Vendor search response:', response);
        const backendData = response.data?.parkingLots || response.parkingLots || [];
        
        vendorLots = backendData.map(lot => ({ 
          ...lot, 
          isVendorLot: true,
          pricePerHour: lot.pricing?.[vehicleType]?.hourly || lot.pricing?.fourWheeler?.hourly || 50,
          rating: lot.ratings?.average || lot.averageRating || 4.0,
          totalReviews: lot.ratings?.count || lot.reviewCount || 0,
          distance: Math.random() * 2, // Mock distance for vendor lots
          availableSpots: lot.capacity?.[vehicleType] || lot.capacity?.fourWheeler || Math.floor(Math.random() * 10) + 5,
          totalSpots: lot.capacity?.total || (lot.capacity?.twoWheeler + lot.capacity?.fourWheeler + lot.capacity?.heavyVehicle) || 20,
          amenities: lot.amenities || ['Parking']
        }));
      } catch (error) {
        console.log('Backend search failed:', error);
      }

      // Search Google Places for parking
      if (window.google && coordinates) {
        googleResults = await searchGooglePlacesParking(location, coordinates);
      }
      
      const allResults = [...vendorLots, ...googleResults];
      setSearchResults({
        vendorLots: vendorLots,
        googlePlaces: googleResults,
        allResults: allResults
      });
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search Google Places for parking
  const searchGooglePlacesParking = async (searchLocation, coordinates = null) => {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        resolve([]);
        return;
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      // Use provided coordinates or geocode the location
      if (coordinates) {
        const location = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);
        
        const request = {
          location: location,
          radius: 5000,
          type: 'parking',
          keyword: 'parking lot car park'
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const googleParkingLots = results.slice(0, 8).map((place, index) => ({
              _id: `google-${index}`,
              name: place.name || 'Parking Area',
              address: place.vicinity || '',
              pricePerHour: Math.floor(Math.random() * 100) + 30,
              rating: Number((Math.random() * 2 + 3).toFixed(1)),
              totalReviews: Math.floor(Math.random() * 100) + 10,
              distance: Math.random() * 3,
              availableSpots: Math.floor(Math.random() * 30) + 5,
              totalSpots: Math.floor(Math.random() * 50) + 20,
              amenities: ['Parking'],
              isVendorLot: false,
              location: {
                type: 'Point',
                coordinates: [
                  place.geometry?.location?.lng() || 0,
                  place.geometry?.location?.lat() || 0
                ]
              }
            }));
            
            resolve(googleParkingLots);
          } else {
            resolve([]);
          }
        });
      } else {
        // Fallback to geocoding if no coordinates provided
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address: searchLocation }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            
            const request = {
              location: location,
              radius: 5000,
              type: 'parking',
              keyword: 'parking lot car park'
            };

            service.nearbySearch(request, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const googleParkingLots = results.slice(0, 8).map((place, index) => ({
                  _id: `google-${index}`,
                  name: place.name || 'Parking Area',
                  address: place.vicinity || '',
                  pricePerHour: Math.floor(Math.random() * 100) + 30,
                  rating: Number((Math.random() * 2 + 3).toFixed(1)),
                  totalReviews: Math.floor(Math.random() * 100) + 10,
                  distance: Math.random() * 3,
                  availableSpots: Math.floor(Math.random() * 30) + 5,
                  totalSpots: Math.floor(Math.random() * 50) + 20,
                  amenities: ['Parking'],
                  isVendorLot: false,
                  location: {
                    type: 'Point',
                    coordinates: [
                      place.geometry?.location?.lng() || 0,
                      place.geometry?.location?.lat() || 0
                    ]
                  }
                }));
                
                resolve(googleParkingLots);
              } else {
                resolve([]);
              }
            });
          } else {
            resolve([]);
          }
        });
      }
    });
  };

  const initializeMap = () => {
    const mapElement = document.getElementById('search-map');
    if (!mapElement || !window.google || !searchResults) return;

    // Determine map center based on search results or default to Delhi
    let mapCenter = { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
    
    // If we have results with coordinates, center on the first result
    if (searchResults.allResults && searchResults.allResults.length > 0) {
      const firstResult = searchResults.allResults[0];
      if (firstResult.location?.coordinates) {
        mapCenter = {
          lat: firstResult.location.coordinates[1],
          lng: firstResult.location.coordinates[0]
        };
      }
    }

    // If we have a geocoded location from search, use that
    if (window.searchLocationCoords) {
      mapCenter = window.searchLocationCoords;
    }

    const map = new window.google.maps.Map(mapElement, {
      center: mapCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Add markers for all results
    searchResults.allResults?.forEach((lot) => {
      const coordinates = lot.location?.coordinates ? 
        { lat: lot.location.coordinates[1], lng: lot.location.coordinates[0] } :
        { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 };
        
      const marker = new window.google.maps.Marker({
        position: coordinates,
        map: map,
        title: lot.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: lot.isVendorLot ? '#059669' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });

      marker.addListener('click', () => {
        setSelectedLot(lot);
      });
    });
  };

  const handleBookNow = (lot) => {
    if (lot._id.startsWith('google-')) {
      alert('This is a Google Places result. Please contact the location directly for booking.');
      return;
    }
    navigate(`/booking/${lot._id}`);
  };

  const handleDirections = (lot) => {
    if (lot.location?.coordinates) {
      const [lng, lat] = lot.location.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const addressStr = lot.address;
      const url = `https://www.google.com/maps/search/${encodeURIComponent(addressStr)}`;
      window.open(url, '_blank');
    }
  };

  const renderParkingLot = (lot, index, isBlurred = false) => (
    <div
      key={lot._id}
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative ${isBlurred ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{lot.name}</h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {typeof lot.address === 'string' ? lot.address : `${lot.address?.street || ''}, ${lot.address?.city || ''}, ${lot.address?.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')}
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

      <div className="flex flex-wrap gap-2 mb-3">
        {lot.amenities.map((amenity, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {amenity}
          </span>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleDirections(lot)}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
          disabled={isBlurred}
        >
          <MapPinIcon className="h-4 w-4 mr-1" />
          Directions
        </button>
        <button
          onClick={() => handleBookNow(lot)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            lot.isVendorLot 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          disabled={isBlurred}
        >
          {lot.isVendorLot ? 'Book Now' : 'Visit'}
        </button>
      </div>
      
      {/* Premium Upsell Overlay */}
      {isBlurred && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <LockClosedIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Premium Required</h3>
            <p className="text-sm text-gray-600 mb-3">Upgrade to see all results</p>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Parking</h1>
          <p className="text-gray-600 mt-2">
            Search for parking spaces near your location
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location
              </label>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter location (e.g., Connaught Place, Delhi)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !location}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select 
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Any Price</option>
                  <option value="30">Under ₹30</option>
                  <option value="50">Under ₹50</option>
                  <option value="100">Under ₹100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results with Map */}
        {searchResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results List */}
            <div className="space-y-6">
              {/* Vendor Lots */}
              {searchResults.vendorLots?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Our Partner Lots ({searchResults.vendorLots.length})
                    </h2>
                    {isFreePlan && searchResults.vendorLots.length > FREE_PLAN_LIMIT && (
                      <div className="text-sm text-indigo-600 font-medium">
                        Showing {FREE_PLAN_LIMIT} of {searchResults.vendorLots.length} results
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {searchResults.vendorLots.map((lot, index) => 
                      renderParkingLot(lot, index, isFreePlan && index >= FREE_PLAN_LIMIT)
                    )}
                  </div>
                  
                  {/* Premium Upgrade Banner */}
                  {isFreePlan && searchResults.vendorLots.length > FREE_PLAN_LIMIT && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <LockClosedIcon className="h-6 w-6 text-indigo-600 mt-1 mr-3" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              Unlock {searchResults.vendorLots.length - FREE_PLAN_LIMIT} More Results
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Upgrade to Premium to see all available parking spots, get priority booking, and access exclusive features.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>✓ View all search results</li>
                              <li>✓ Priority booking queue</li>
                              <li>✓ Advanced filters and sorting</li>
                              <li>✓ Exclusive partner discounts</li>
                            </ul>
                          </div>
                        </div>
                        <div className="ml-6">
                          <button
                            onClick={() => navigate('/pricing')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
                          >
                            Upgrade to Premium
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Google Places */}
              {searchResults.googlePlaces?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Nearby Parking Areas ({searchResults.googlePlaces.length})
                    </h2>
                    {isFreePlan && searchResults.googlePlaces.length > FREE_PLAN_LIMIT && (
                      <div className="text-sm text-indigo-600 font-medium">
                        Showing {FREE_PLAN_LIMIT} of {searchResults.googlePlaces.length} results
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {searchResults.googlePlaces.map((lot, index) => 
                      renderParkingLot(lot, index, isFreePlan && index >= FREE_PLAN_LIMIT)
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-gray-900">Map View</h3>
                  <p className="text-sm text-gray-600">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Partner Lots
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 ml-4"></span>
                    Nearby Areas
                  </p>
                </div>
                <div 
                  id="search-map" 
                  className="w-full h-96 bg-gray-100 flex items-center justify-center"
                >
                  {!mapLoaded && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchResults && !loading && (
          <div className="text-center py-12">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find Your Perfect Parking Spot</h3>
            <p className="text-gray-600 mb-6">Enter a location above to start searching for available parking spaces</p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">Popular Locations:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Connaught Place, Delhi</p>
                <p>• Bandra West, Mumbai</p>
                <p>• Koramangala, Bangalore</p>
                <p>• Park Street, Kolkata</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSearchPage;