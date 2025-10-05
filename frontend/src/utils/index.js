/**
 * Utility functions for the Parking Reservation System
 */

// Format currency for Indian Rupees
export const formatCurrency = (amount, locale = 'en-IN') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date for Indian locale
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(new Date(date));
};

// Format time for Indian locale
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(new Date(date));
};

// Format date and time together
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Calculate duration between two dates in hours
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  return Math.ceil(durationMs / (1000 * 60 * 60)); // Convert to hours and round up
};

// Format duration in human readable format
export const formatDuration = (hours) => {
  if (hours < 1) {
    return '30 minutes';
  } else if (hours === 1) {
    return '1 hour';
  } else if (hours < 24) {
    return `${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  }
};

// Validate Indian phone number
export const validatePhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
};

// Format Indian phone number
export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  return phoneNumber;
};

// Validate Indian vehicle number
export const validateVehicleNumber = (numberPlate) => {
  const cleaned = numberPlate.replace(/\s/g, '').toUpperCase();
  const patterns = [
    /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // Standard format
    /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{1,4}$/, // Old format
    /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/ // New format
  ];
  return patterns.some(pattern => pattern.test(cleaned));
};

// Format vehicle number
export const formatVehicleNumber = (numberPlate) => {
  const cleaned = numberPlate.replace(/\s/g, '').toUpperCase();
  if (cleaned.length >= 8 && cleaned.length <= 10) {
    return cleaned.replace(/([A-Z]{2})([0-9]{2})([A-Z]{1,3})([0-9]{1,4})/, '$1 $2 $3 $4');
  }
  return numberPlate;
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Format distance
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Generate random ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Check if time is in the past
export const isPastTime = (time) => {
  return new Date(time) < new Date();
};

// Check if time is within business hours
export const isWithinBusinessHours = (time, operatingHours) => {
  const date = new Date(time);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'monday' }).toLowerCase();
  const daySchedule = operatingHours[dayOfWeek];
  
  if (!daySchedule.isOpen) return false;
  
  const timeString = date.toTimeString().slice(0, 5); // HH:MM format
  return timeString >= daySchedule.openTime && timeString <= daySchedule.closeTime;
};

// Get vehicle type display name
export const getVehicleTypeDisplay = (type) => {
  const vehicleTypes = {
    twoWheeler: 'Two Wheeler',
    fourWheeler: 'Four Wheeler',
    heavyVehicle: 'Heavy Vehicle'
  };
  return vehicleTypes[type] || type;
};

// Get status badge color
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// URL utilities
export const url = {
  // Build query string from params object
  buildQuery: (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value.toString());
      }
    });
    return query.toString();
  },
  
  // Parse query string to object
  parseQuery: (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }
};

// Form validation utilities
export const validation = {
  required: (value) => !!value || 'This field is required',
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  },
  
  phone: (value) => {
    return validatePhoneNumber(value) || 'Please enter a valid phone number';
  },
  
  vehicleNumber: (value) => {
    return validateVehicleNumber(value) || 'Please enter a valid vehicle number';
  },
  
  minLength: (min) => (value) => {
    return value.length >= min || `Minimum ${min} characters required`;
  },
  
  maxLength: (max) => (value) => {
    return value.length <= max || `Maximum ${max} characters allowed`;
  }
};

// Error handling utilities
export const handleError = (error) => {
  console.error('Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};