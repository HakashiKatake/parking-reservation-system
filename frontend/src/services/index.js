import apiClient from './api.js';

// Export the base API client
export const api = {
  auth: {
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    sendOTP: (data) => apiClient.post('/auth/send-otp', data),
    verifyOTP: (data) => apiClient.post('/auth/verify-otp', data),
    sendOtp: (data) => apiClient.post('/auth/send-otp', data),
    verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
    resendOtp: (data) => apiClient.post('/auth/resend-otp', data),
    getProfile: () => apiClient.get('/auth/profile'),
    updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
    changePassword: (passwordData) => apiClient.put('/auth/change-password', passwordData),
    logout: () => apiClient.post('/auth/logout'),
  },
  
  parking: {
    getParkingLots: (params = {}) => apiClient.get('/parking-lots', { params }),
    getParkingLot: (id) => apiClient.get(`/parking-lots/${id}`),
    createParkingLot: (lotData) => apiClient.post('/parking-lots', lotData),
    updateParkingLot: (id, lotData) => apiClient.put(`/parking-lots/${id}`, lotData),
    deleteParkingLot: (id) => apiClient.delete(`/parking-lots/${id}`),
    checkAvailability: (id, availabilityData) => 
      apiClient.post(`/parking-lots/${id}/check-availability`, availabilityData),
    searchVendorLots: (location) => apiClient.get('/parking-lots/search-vendors', { params: { location } }),
  },
  
  search: {
    searchPlaces: (query, location) => 
      apiClient.get('/search/places', { params: { query, ...location } }),
    searchParkingLots: (searchParams) => 
      apiClient.get('/search/parking-lots', { params: searchParams }),
  },

  reservations: {
    createReservation: (reservationData) => apiClient.post('/reservations', reservationData),
    getReservations: (params = {}) => apiClient.get('/reservations', { params }),
    getReservation: (id) => apiClient.get(`/reservations/${id}`),
    updateReservation: (id, updateData) => apiClient.put(`/reservations/${id}`, updateData),
    cancelReservation: (id, reason) => apiClient.put(`/reservations/${id}/cancel`, { reason }),
    checkinReservation: (id) => apiClient.post(`/reservations/${id}/checkin`),
    checkoutReservation: (id) => apiClient.post(`/reservations/${id}/checkout`),
  },

  payments: {
    createPaymentIntent: (paymentData) => apiClient.post('/payments/create-intent', paymentData),
    confirmPayment: (paymentIntentId, paymentMethodId) => 
      apiClient.post('/payments/confirm-payment', { paymentIntentId, paymentMethodId }),
    getPaymentHistory: (params = {}) => apiClient.get('/payments/history', { params }),
  },

  vendors: {
    getDashboard: () => apiClient.get('/vendors/dashboard'),
    getParkingLots: (params = {}) => apiClient.get('/vendors/parking-lots', { params }),
    getReservations: (params = {}) => apiClient.get('/vendors/reservations', { params }),
    getAnalytics: (params = {}) => apiClient.get('/vendors/analytics', { params }),
  },

  users: {
    getDashboard: () => apiClient.get('/users/dashboard'),
    getReservations: (params = {}) => apiClient.get('/users/reservations', { params }),
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (profileData) => apiClient.put('/users/profile', profileData),
  }
};

// Authentication API endpoints
export const authAPI = {
  // Register new user or vendor
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Send OTP for phone verification
  sendOTP: async (phoneNumber, purpose = 'phone_verification') => {
    return api.post('/auth/send-otp', { phoneNumber, purpose });
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp, purpose = 'phone_verification') => {
    return api.post('/auth/verify-otp', { phoneNumber, otp, purpose });
  },

  // Get current user profile
  getProfile: async () => {
    return api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return api.put('/auth/change-password', passwordData);
  },

  // Logout
  logout: async () => {
    return api.post('/auth/logout');
  },
};

// Parking Lots API endpoints
export const parkingAPI = {
  // Get all parking lots with filters
  getParkingLots: async (params = {}) => {
    return api.get('/parking-lots', { params });
  },

  // Get single parking lot
  getParkingLot: async (id) => {
    return api.get(`/parking-lots/${id}`);
  },

  // Create new parking lot (vendor only)
  createParkingLot: async (lotData) => {
    return api.post('/parking-lots', lotData);
  },

  // Update parking lot (vendor only)
  updateParkingLot: async (id, lotData) => {
    return api.put(`/parking-lots/${id}`, lotData);
  },

  // Delete parking lot (vendor only)
  deleteParkingLot: async (id) => {
    return api.delete(`/parking-lots/${id}`);
  },

  // Check availability for specific time slot
  checkAvailability: async (id, availabilityData) => {
    return api.post(`/parking-lots/${id}/check-availability`, availabilityData);
  },
};

// Reservations API endpoints
export const reservationAPI = {
  // Get user reservations
  getReservations: async (params = {}) => {
    return api.get('/reservations', { params });
  },

  // Get single reservation
  getReservation: async (id) => {
    return api.get(`/reservations/${id}`);
  },

  // Create new reservation
  createReservation: async (reservationData) => {
    return api.post('/reservations', reservationData);
  },

  // Update reservation
  updateReservation: async (id, reservationData) => {
    return api.put(`/reservations/${id}`, reservationData);
  },

  // Cancel reservation
  cancelReservation: async (id, reason) => {
    return api.put(`/reservations/${id}/cancel`, { reason });
  },

  // Check in to parking slot
  checkIn: async (id, checkInData) => {
    return api.post(`/reservations/${id}/check-in`, checkInData);
  },

  // Check out from parking slot
  checkOut: async (id, checkOutData) => {
    return api.post(`/reservations/${id}/check-out`, checkOutData);
  },
};

// Search API endpoints
export const searchAPI = {
  // Search places using Google Places API
  searchPlaces: async (query, location) => {
    return api.get('/search/places', { 
      params: { query, ...location } 
    });
  },

  // Search nearby parking lots
  searchParkingLots: async (searchParams) => {
    return api.get('/search/parking-lots', { params: searchParams });
  },
};

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return api.get('/users/profile');
  },

  // Get user reservations
  getReservations: async (params = {}) => {
    return api.get('/users/reservations', { params });
  },

  // Get user favorites
  getFavorites: async () => {
    return api.get('/users/favorites');
  },

  // Add favorite location
  addFavorite: async (favoriteData) => {
    return api.post('/users/favorites', favoriteData);
  },

  // Remove favorite
  removeFavorite: async (id) => {
    return api.delete(`/users/favorites/${id}`);
  },
};

// Vendor API endpoints
export const vendorAPI = {
  // Get vendor dashboard data
  getDashboard: async () => {
    return api.get('/vendors/dashboard');
  },

  // Get vendor parking lots
  getParkingLots: async () => {
    return api.get('/vendors/parking-lots');
  },

  // Get vendor analytics
  getAnalytics: async (params = {}) => {
    return api.get('/vendors/analytics', { params });
  },

  // Get vendor reservations
  getReservations: async (params = {}) => {
    return api.get('/vendors/reservations', { params });
  },
};

// Reviews API endpoints
export const reviewAPI = {
  // Get reviews for parking lot
  getReviews: async (parkingLotId, params = {}) => {
    return api.get(`/reviews`, { 
      params: { parkingLot: parkingLotId, ...params } 
    });
  },

  // Create review
  createReview: async (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Update review
  updateReview: async (id, reviewData) => {
    return api.put(`/reviews/${id}`, reviewData);
  },

  // Delete review
  deleteReview: async (id) => {
    return api.delete(`/reviews/${id}`);
  },
};

// Helper functions for API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    console.error('API call failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message || 'An error occurred',
        status: error.status || 0,
        errors: error.errors || []
      }
    };
  }
};

// Batch API calls
export const batchApiCall = async (apiCalls) => {
  try {
    const results = await Promise.allSettled(apiCalls);
    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  } catch (error) {
    console.error('Batch API call failed:', error);
    return [];
  }
};