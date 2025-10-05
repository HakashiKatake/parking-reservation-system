import React, { useState, useEffect } from 'react';
import { Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useParkingStore } from '../../store';

const MapView = ({ center = { lat: 28.6139, lng: 77.2090 }, zoom = 13 }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { searchResults, selectedParkingLot, setSelectedParkingLot } = useParkingStore();

  const allParkingLots = [
    ...(searchResults?.vendorLots || []),
    ...(searchResults?.nearbyLots || [])
  ];

  const handleMarkerClick = (lot) => {
    setSelectedMarker(lot);
    setSelectedParkingLot(lot);
  };

  return (
    <div className="h-full w-full">
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="parking-map"
      >
        {/* Center marker for search location */}
        <Marker
          position={center}
          icon={{
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: { width: 32, height: 32 }
          }}
        />

        {/* Parking lot markers */}
        {allParkingLots.map((lot) => (
          <Marker
            key={lot._id}
            position={lot.coordinates}
            onClick={() => handleMarkerClick(lot)}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <rect x="5" y="10" width="30" height="25" rx="3" fill="${lot.availableSpots > 0 ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: { width: 40, height: 40 }
            }}
          />
        ))}

        {/* Info window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.coordinates}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-semibold text-lg mb-2">{selectedMarker.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedMarker.address}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-600">
                  {selectedMarker.availableSpots} spots available
                </span>
                <span className="text-sm font-semibold text-indigo-600">
                  ₹{selectedMarker.pricePerHour}/hour
                </span>
              </div>
              <div className="flex items-center text-yellow-500 mb-3">
                <span className="text-sm">★ {selectedMarker.rating}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedMarker.totalReviews} reviews)
                </span>
              </div>
              <button
                className="w-full bg-indigo-600 text-white py-2 px-3 rounded text-sm hover:bg-indigo-700"
                onClick={() => {
                  setSelectedParkingLot(selectedMarker);
                  // Navigate to booking page
                }}
              >
                Book Now
              </button>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

export default MapView;