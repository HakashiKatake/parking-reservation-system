/**
 * SMS utility for sending OTP and notifications
 * This is a mock implementation - replace with actual SMS service provider
 */
class SMSService {
  /**
   * Send OTP to phone number
   * @param {String} phoneNumber - Indian mobile number
   * @param {String} otp - 6-digit OTP
   * @returns {Promise<Object>} Response object
   */
  static async sendOTP(phoneNumber, otp) {
    try {
      // Mock implementation - replace with actual SMS provider
      // Examples: Twilio, AWS SNS, TextLocal, MSG91, etc.
      
      console.log(`SMS Service: Sending OTP ${otp} to ${phoneNumber}`);
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, implement actual SMS service
      // const response = await smsProvider.send({
      //   to: phoneNumber,
      //   message: `Your ParkingReservation OTP is: ${otp}. Valid for 10 minutes. Don't share with anyone.`
      // });
      
      return {
        success: true,
        messageId: `mock_${Date.now()}`,
        message: 'OTP sent successfully'
      };
      
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Send reservation confirmation SMS
   * @param {String} phoneNumber - User's phone number
   * @param {Object} reservationDetails - Reservation details
   * @returns {Promise<Object>} Response object
   */
  static async sendReservationConfirmation(phoneNumber, reservationDetails) {
    try {
      const message = `Parking confirmed! Location: ${reservationDetails.parkingLotName}. Date: ${reservationDetails.date}. Time: ${reservationDetails.timeSlot}. Booking ID: ${reservationDetails.bookingId}`;
      
      console.log(`SMS Service: Sending confirmation to ${phoneNumber}`);
      console.log(`Message: ${message}`);
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        messageId: `conf_${Date.now()}`,
        message: 'Confirmation SMS sent successfully'
      };
      
    } catch (error) {
      console.error('Confirmation SMS failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send confirmation SMS'
      };
    }
  }

  /**
   * Send reservation reminder SMS
   * @param {String} phoneNumber - User's phone number
   * @param {Object} reservationDetails - Reservation details
   * @returns {Promise<Object>} Response object
   */
  static async sendReservationReminder(phoneNumber, reservationDetails) {
    try {
      const message = `Reminder: Your parking slot is booked for ${reservationDetails.time} at ${reservationDetails.parkingLotName}. Show QR code: ${reservationDetails.qrCode}`;
      
      console.log(`SMS Service: Sending reminder to ${phoneNumber}`);
      
      return {
        success: true,
        messageId: `rem_${Date.now()}`,
        message: 'Reminder SMS sent successfully'
      };
      
    } catch (error) {
      console.error('Reminder SMS failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send reminder SMS'
      };
    }
  }

  /**
   * Send cancellation SMS
   * @param {String} phoneNumber - User's phone number
   * @param {Object} cancellationDetails - Cancellation details
   * @returns {Promise<Object>} Response object
   */
  static async sendCancellationNotification(phoneNumber, cancellationDetails) {
    try {
      const message = `Booking cancelled. Booking ID: ${cancellationDetails.bookingId}. Refund of ₹${cancellationDetails.refundAmount} will be processed in 3-5 business days.`;
      
      console.log(`SMS Service: Sending cancellation notification to ${phoneNumber}`);
      
      return {
        success: true,
        messageId: `canc_${Date.now()}`,
        message: 'Cancellation SMS sent successfully'
      };
      
    } catch (error) {
      console.error('Cancellation SMS failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send cancellation SMS'
      };
    }
  }

  /**
   * Format Indian phone number
   * @param {String} phoneNumber - Phone number
   * @returns {String} Formatted phone number
   */
  static formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.length === 13 && cleaned.startsWith('+91')) {
      return cleaned;
    }
    
    throw new Error('Invalid Indian phone number format');
  }

  /**
   * Validate Indian phone number
   * @param {String} phoneNumber - Phone number to validate
   * @returns {Boolean} Is valid
   */
  static isValidIndianPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  }
}

export default SMSService;