import React from 'react';
import QRCode from 'react-qr-code';

const ReservationQRCode = ({ reservation, size = 200 }) => {
  // Create QR code data with reservation details
  const qrData = {
    reservationId: reservation._id,
    parkingLotId: reservation.parkingLotId,
    userId: reservation.userId,
    spotNumber: reservation.spotNumber,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    amount: reservation.amount,
    timestamp: new Date().toISOString(),
    type: 'parking_reservation'
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode
          value={JSON.stringify(qrData)}
          size={size}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Reservation QR Code</h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Show this QR code to the parking vendor to confirm your spot
        </p>
        <div className="mt-2 text-xs text-gray-500">
          <p>Reservation ID: {reservation._id?.slice(-8) || 'N/A'}</p>
          <p>Spot: #{reservation.spotNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default ReservationQRCode;