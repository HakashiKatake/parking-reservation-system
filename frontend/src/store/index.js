import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Authentication Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true,
        error: null 
      }),

      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true,
        error: null 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Getters
      isUser: () => get().user?.userType === 'user',
      isVendor: () => get().user?.userType === 'vendor',
      isPhoneVerified: () => get().user?.isPhoneVerified || false,
      isVerified: () => get().user?.isVerified || false,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Parking Store for search and booking
export const useParkingStore = create((set, get) => ({
  // State
  searchLocation: null,
  searchRadius: 5000, // 5km default
  vehicleType: 'twoWheeler',
  startTime: null,
  endTime: null,
  parkingLots: [],
  selectedParkingLot: null,
  isSearching: false,
  searchError: null,
  
  // Booking state
  currentBooking: null,
  bookingStep: 1, // 1: Search, 2: Select, 3: Details, 4: Payment, 5: Confirmation
  
  // Map state
  mapCenter: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
  mapZoom: 12,
  
  // Actions
  setSearchLocation: (location) => set({ searchLocation: location }),
  
  setSearchRadius: (radius) => set({ searchRadius: radius }),
  
  setVehicleType: (type) => set({ vehicleType: type }),
  
  setTimeSlot: (startTime, endTime) => set({ startTime, endTime }),
  
  setParkingLots: (lots) => set({ parkingLots: lots }),
  
  setSelectedParkingLot: (lot) => set({ selectedParkingLot: lot }),
  
  setSearching: (isSearching) => set({ isSearching }),
  
  setSearchError: (error) => set({ searchError: error }),
  
  clearSearchError: () => set({ searchError: null }),
  
  // Booking actions
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  
  setBookingStep: (step) => set({ bookingStep: step }),
  
  nextBookingStep: () => set((state) => ({ 
    bookingStep: Math.min(state.bookingStep + 1, 5) 
  })),
  
  prevBookingStep: () => set((state) => ({ 
    bookingStep: Math.max(state.bookingStep - 1, 1) 
  })),
  
  resetBooking: () => set({ 
    currentBooking: null, 
    bookingStep: 1,
    selectedParkingLot: null 
  }),
  
  // Map actions
  setMapCenter: (center) => set({ mapCenter: center }),
  
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  
  // Utility actions
  clearSearch: () => set({
    searchLocation: null,
    parkingLots: [],
    selectedParkingLot: null,
    searchError: null
  }),

  // Getters
  getSearchParams: () => {
    const state = get();
    return {
      location: state.searchLocation,
      radius: state.searchRadius,
      vehicleType: state.vehicleType,
      startTime: state.startTime,
      endTime: state.endTime
    };
  },

  isSearchValid: () => {
    const state = get();
    return !!(state.searchLocation && state.startTime && state.endTime && state.vehicleType);
  }
}));

// UI Store for app-wide UI state
export const useUIStore = create((set, get) => ({
  // State
  sidebarOpen: false,
  theme: 'light',
  language: 'en',
  notifications: [],
  loading: {
    global: false,
    auth: false,
    search: false,
    booking: false
  },
  
  // Modal states
  modals: {
    login: false,
    register: false,
    booking: false,
    profile: false
  },

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  // Notification actions
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...notification
    }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading actions
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),
  
  // Modal actions
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  })),

  // Utility getters
  isLoading: (key) => get().loading[key] || false,
  isModalOpen: (modalName) => get().modals[modalName] || false
}));

// User preferences and favorites
export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      favoriteLocations: [],
      recentSearches: [],
      preferredVehicleType: 'twoWheeler',
      preferredRadius: 5000,
      savedParkingLots: [],
      bookingHistory: [],
      
      // Actions
      addFavoriteLocation: (location) => set((state) => {
        const exists = state.favoriteLocations.find(l => 
          l.lat === location.lat && l.lng === location.lng
        );
        if (!exists) {
          return {
            favoriteLocations: [...state.favoriteLocations, {
              ...location,
              id: Date.now(),
              addedAt: new Date()
            }]
          };
        }
        return state;
      }),
      
      removeFavoriteLocation: (id) => set((state) => ({
        favoriteLocations: state.favoriteLocations.filter(l => l.id !== id)
      })),
      
      addRecentSearch: (search) => set((state) => {
        const recentSearches = [search, ...state.recentSearches.slice(0, 9)]; // Keep last 10
        return { recentSearches };
      }),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      setPreferredVehicleType: (type) => set({ preferredVehicleType: type }),
      
      setPreferredRadius: (radius) => set({ preferredRadius: radius }),
      
      saveParkingLot: (lot) => set((state) => {
        const exists = state.savedParkingLots.find(l => l._id === lot._id);
        if (!exists) {
          return {
            savedParkingLots: [...state.savedParkingLots, {
              ...lot,
              savedAt: new Date()
            }]
          };
        }
        return state;
      }),
      
      removeSavedParkingLot: (lotId) => set((state) => ({
        savedParkingLots: state.savedParkingLots.filter(l => l._id !== lotId)
      })),
      
      addBookingToHistory: (booking) => set((state) => ({
        bookingHistory: [booking, ...state.bookingHistory]
      })),
      
      // Getters
      isFavoriteLocation: (location) => {
        return get().favoriteLocations.some(l => 
          l.lat === location.lat && l.lng === location.lng
        );
      },
      
      isSavedParkingLot: (lotId) => {
        return get().savedParkingLots.some(l => l._id === lotId);
      }
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Vendor-specific store
export const useVendorStore = create((set, get) => ({
  // State
  vendorParkingLots: [],
  vendorReservations: [],
  vendorAnalytics: {
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    occupancyRate: 0
  },
  
  // Actions
  setVendorParkingLots: (lots) => set({ vendorParkingLots: lots }),
  
  addVendorParkingLot: (lot) => set((state) => ({
    vendorParkingLots: [...state.vendorParkingLots, lot]
  })),
  
  updateVendorParkingLot: (lotId, updates) => set((state) => ({
    vendorParkingLots: state.vendorParkingLots.map(lot =>
      lot._id === lotId ? { ...lot, ...updates } : lot
    )
  })),
  
  removeVendorParkingLot: (lotId) => set((state) => ({
    vendorParkingLots: state.vendorParkingLots.filter(lot => lot._id !== lotId)
  })),
  
  setVendorReservations: (reservations) => set({ vendorReservations: reservations }),
  
  setVendorAnalytics: (analytics) => set({ vendorAnalytics: analytics }),
  
  // Getters
  getVendorParkingLot: (lotId) => {
    return get().vendorParkingLots.find(lot => lot._id === lotId);
  },
  
  getTotalParkingSpots: () => {
    return get().vendorParkingLots.reduce((total, lot) => {
      return total + lot.capacity.twoWheeler + lot.capacity.fourWheeler + lot.capacity.heavyVehicle;
    }, 0);
  }
}));