/**
 * Validation utilities for the parking reservation system
 */

/**
 * Validate Indian mobile number
 * @param {String} phoneNumber - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' 
    };
  }
  
  return { isValid: true, phoneNumber: cleaned };
};

/**
 * Validate Indian vehicle number plate
 * @param {String} numberPlate - Vehicle number plate
 * @returns {Object} Validation result
 */
export const validateVehicleNumber = (numberPlate) => {
  if (!numberPlate) {
    return { isValid: false, message: 'Vehicle number is required' };
  }
  
  const cleaned = numberPlate.replace(/\s/g, '').toUpperCase();
  
  // Indian vehicle number formats
  const patterns = [
    /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // Standard format: XX00XX0000
    /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{1,4}$/, // Old format: XX00X0000 or XX00X000 or XX00X00 or XX00X0
    /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/ // New format: XX00XXX0000
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return { 
      isValid: false, 
      message: 'Please enter a valid Indian vehicle number (e.g., MH12AB1234)' 
    };
  }
  
  return { isValid: true, numberPlate: cleaned };
};

/**
 * Validate Indian pincode
 * @param {String} pincode - Pincode to validate
 * @returns {Object} Validation result
 */
export const validatePincode = (pincode) => {
  if (!pincode) {
    return { isValid: false, message: 'Pincode is required' };
  }
  
  const cleaned = pincode.replace(/\D/g, '');
  
  if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid 6-digit Indian pincode' 
    };
  }
  
  return { isValid: true, pincode: cleaned };
};

/**
 * Validate GST number
 * @param {String} gstNumber - GST number to validate
 * @returns {Object} Validation result
 */
export const validateGSTNumber = (gstNumber) => {
  if (!gstNumber) {
    return { isValid: true }; // GST is optional for some vendors
  }
  
  const cleaned = gstNumber.replace(/\s/g, '').toUpperCase();
  
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleaned)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid GST number (15 characters)' 
    };
  }
  
  return { isValid: true, gstNumber: cleaned };
};

/**
 * Validate email address
 * @param {String} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid email address' 
    };
  }
  
  return { isValid: true, email: email.toLowerCase() };
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { 
      isValid: false, 
      message: 'Password must be at least 6 characters long' 
    };
  }
  
  if (password.length > 128) {
    return { 
      isValid: false, 
      message: 'Password cannot be more than 128 characters long' 
    };
  }
  
  // Check for at least one number and one letter
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  
  if (!hasNumber || !hasLetter) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one letter and one number' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate time slot
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {Object} Validation result
 */
export const validateTimeSlot = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return { 
      isValid: false, 
      message: 'Both start time and end time are required' 
    };
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { 
      isValid: false, 
      message: 'Please provide valid date and time' 
    };
  }
  
  if (start >= end) {
    return { 
      isValid: false, 
      message: 'End time must be after start time' 
    };
  }
  
  if (start < now) {
    return { 
      isValid: false, 
      message: 'Start time cannot be in the past' 
    };
  }
  
  // Check if booking is too far in the future (max 30 days)
  const maxFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (start > maxFutureDate) {
    return { 
      isValid: false, 
      message: 'Booking cannot be made more than 30 days in advance' 
    };
  }
  
  // Calculate duration in hours
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  if (durationHours < 0.5) {
    return { 
      isValid: false, 
      message: 'Minimum booking duration is 30 minutes' 
    };
  }
  
  if (durationHours > 24) {
    return { 
      isValid: false, 
      message: 'Maximum booking duration is 24 hours' 
    };
  }
  
  return { 
    isValid: true, 
    duration: durationHours,
    startTime: start,
    endTime: end
  };
};

/**
 * Validate coordinates
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Object} Validation result
 */
export const validateCoordinates = (lat, lng) => {
  if (lat === undefined || lng === undefined) {
    return { isValid: false, message: 'Coordinates are required' };
  }
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { isValid: false, message: 'Coordinates must be numbers' };
  }
  
  if (lat < -90 || lat > 90) {
    return { 
      isValid: false, 
      message: 'Latitude must be between -90 and 90' 
    };
  }
  
  if (lng < -180 || lng > 180) {
    return { 
      isValid: false, 
      message: 'Longitude must be between -180 and 180' 
    };
  }
  
  // Check if coordinates are within India bounds (approximately)
  const indiaBounds = {
    north: 37.6,
    south: 6.4,
    east: 97.25,
    west: 68.7
  };
  
  if (lat < indiaBounds.south || lat > indiaBounds.north || 
      lng < indiaBounds.west || lng > indiaBounds.east) {
    return { 
      isValid: false, 
      message: 'Coordinates must be within India' 
    };
  }
  
  return { isValid: true, coordinates: [lng, lat] }; // MongoDB format: [longitude, latitude]
};

/**
 * Sanitize string input
 * @param {String} input - String to sanitize
 * @param {Number} maxLength - Maximum allowed length
 * @returns {String} Sanitized string
 */
export const sanitizeString = (input, maxLength = 255) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Validate rating value
 * @param {Number} rating - Rating value
 * @returns {Object} Validation result
 */
export const validateRating = (rating) => {
  if (rating === undefined || rating === null) {
    return { isValid: false, message: 'Rating is required' };
  }
  
  const numRating = Number(rating);
  
  if (isNaN(numRating)) {
    return { isValid: false, message: 'Rating must be a number' };
  }
  
  if (numRating < 1 || numRating > 5) {
    return { isValid: false, message: 'Rating must be between 1 and 5' };
  }
  
  return { isValid: true, rating: Math.round(numRating * 10) / 10 }; // Round to 1 decimal place
};