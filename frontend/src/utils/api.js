// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  
  // User endpoints
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    RESERVATIONS: '/api/users/reservations'
  },
  
  // Vendor endpoints
  VENDORS: {
    PROFILE: '/api/vendors/profile',
    UPDATE_PROFILE: '/api/vendors/profile',
    PARKING_LOTS: '/api/vendors/parking-lots',
    RESERVATIONS: '/api/vendors/reservations'
  },
  
  // Parking lot endpoints
  PARKING_LOTS: {
    BASE: '/api/parking-lots',
    SEARCH: '/api/search/parking-lots',
    AVAILABILITY: '/api/parking-lots/:id/availability'
  },
  
  // Reservation endpoints
  RESERVATIONS: {
    BASE: '/api/reservations',
    CREATE: '/api/reservations',
    CANCEL: '/api/reservations/:id/cancel'
  },
  
  // Payment endpoints
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    CONFIRM: '/api/payments/confirm'
  }
};

// API helper function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  }),
  patch: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    method: 'PATCH', 
    body: JSON.stringify(data), 
    ...options 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: 'DELETE', ...options })
};

export default api;