import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { 
  QrCodeIcon, 
  CameraIcon, 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services';

const QRCodeScanner = ({ onScanSuccess, onClose, vendorId }) => {
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const scanner = new QrScanner(
          videoRef.current,
          result => handleScanResult(result.data),
          {
            onDecodeError: err => {
              // Silently handle decode errors (normal when no QR code is visible)
              console.log('Decode error (normal):', err);
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        setQrScanner(scanner);
        
        // Start scanning
        await scanner.start();
        setScanning(true);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Camera not available. Please check camera permissions.');
      }
    };

    if (videoRef.current) {
      initScanner();
    }

    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, []);

  const handleScanResult = async (data) => {
    if (loading) return; // Prevent multiple simultaneous scans
    
    try {
      setLoading(true);
      const qrData = JSON.parse(data);
      
      // Validate QR code structure
      if (qrData.type !== 'parking_reservation' || !qrData.reservationId) {
        throw new Error('Invalid parking reservation QR code');
      }

      // Verify with backend
      const response = await api.post('/reservations/verify-qr', {
        qrData,
        vendorId
      });

      setScanResult({
        type: 'success',
        data: response.data,
        message: 'Reservation verified successfully!'
      });

      // Stop scanning after successful scan
      if (qrScanner) {
        qrScanner.stop();
        setScanning(false);
      }

      // Call success callback
      if (onScanSuccess) {
        onScanSuccess(response.data);
      }

    } catch (error) {
      console.error('Scan verification error:', error);
      setScanResult({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to verify QR code'
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setScanResult(null);
      setError(null);
      if (qrScanner) {
        await qrScanner.start();
        setScanning(true);
      }
    } catch (err) {
      setError('Failed to start camera');
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <QrCodeIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              style={{ display: scanning ? 'block' : 'none' }}
            />
            
            {!scanning && !scanResult && (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Camera not active</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Verifying...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Scan Result Display */}
          {scanResult && (
            <div className={`mb-4 p-4 rounded-lg border ${
              scanResult.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {scanResult.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    scanResult.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {scanResult.message}
                  </p>
                  
                  {scanResult.type === 'success' && scanResult.data && (
                    <div className="mt-2 text-xs text-green-700">
                      <p><strong>Reservation:</strong> {scanResult.data.reservation?.id}</p>
                      <p><strong>Spot:</strong> #{scanResult.data.reservation?.spotNumber}</p>
                      <p><strong>Customer:</strong> {scanResult.data.customer?.name}</p>
                      <p><strong>Status:</strong> {scanResult.data.reservation?.status}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 mb-4">
            <p>Position the QR code within the camera frame</p>
            <p className="text-xs mt-1">The code will be scanned automatically</p>
          </div>

          {/* Controls */}
          <div className="flex space-x-3">
            {!scanning ? (
              <button
                onClick={startScanning}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CameraIcon className="h-4 w-4 inline mr-2" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Stop Scanning
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;