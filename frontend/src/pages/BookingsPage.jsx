import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { api, reviewAPI } from '../services';
import { useAuthStore } from '../store';
import RatingReviewComponent from '../components/common/RatingReviewComponent';

const BookingsPage = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired'
  };

  useEffect(() => {
    console.log('BookingsPage - Auth state:', { isAuthenticated, user, token: token ? 'present' : 'missing' });
    if (isAuthenticated && token) {
      fetchBookings();
    } else {
      console.log('Not authenticated, skipping fetch');
      setLoading(false);
    }
  }, [page, filter, searchTerm, isAuthenticated, token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Debug: Check auth token
      const authStorage = localStorage.getItem('auth-storage');
      console.log('Auth storage:', authStorage);
      
      const params = {
        page,
        limit: 10,
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log('Fetching reservations with params:', params);
      
      const response = await api.users.getReservations(params);
      console.log('API Response:', response);
      
      // Handle the nested response structure
      const reservations = response.data?.reservations || [];
      const pagination = response.data?.pagination || {};
      
      console.log('Processed reservations:', reservations);
      console.log('Pagination:', pagination);
      
      setBookings(reservations);
      setTotalPages(pagination.pages || 1);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      console.error('Error details:', error.message, error.status);
      // Set empty array on error to prevent undefined errors
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setFilter(status);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const handleAddReview = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      console.log('Submitting review:', reviewData);
      
      const response = await reviewAPI.createReview(reviewData);
      console.log('Review submitted:', response);
      
      if (response.success) {
        alert('Review submitted successfully! Thank you for your feedback.');
        setShowReviewModal(false);
        setSelectedBooking(null);
        // Refresh bookings to show updated status
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your bookings.</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your parking reservations</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by parking lot name or location..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {!bookings || bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <CalendarIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings found.`}
              </p>
              <a
                href="/search"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Find Parking Spots
              </a>
            </div>
          ) : (
            (bookings || []).map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booking.parkingLot?.name || 'Unknown Parking Lot'}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {booking.parkingLot?.address ? 
                            `${booking.parkingLot.address.street}, ${booking.parkingLot.address.city}, ${booking.parkingLot.address.state} ${booking.parkingLot.address.pincode}` 
                            : 'Address not available'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || statusColors.pending}`}>
                        {statusLabels[booking.status] || 'Pending'}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 flex items-center">
                          <CurrencyRupeeIcon className="h-4 w-4" />
                          {booking.pricing?.totalAmount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">Start Time</div>
                        <div>{formatDateTime(booking.timeSlot?.startTime)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div>{formatDuration(booking.timeSlot?.startTime, booking.timeSlot?.endTime)}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">End Time</div>
                        <div>{formatDateTime(booking.timeSlot?.endTime)}</div>
                      </div>
                    </div>
                  </div>

                  {booking.vehicleInfo?.numberPlate && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Vehicle:</span> {booking.vehicleInfo.type} - {booking.vehicleInfo.numberPlate}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => window.open(`/booking/${booking._id}`, '_blank')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View Details
                    </button>
                    
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => handleAddReview(booking)}
                        className="flex items-center text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        Write Review
                      </button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          // TODO: Implement cancel booking functionality
                          console.log('Cancel booking:', booking._id);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <RatingReviewComponent
              reservation={selectedBooking}
              onSubmitReview={handleSubmitReview}
              onCancel={handleCancelReview}
              isSubmitting={submittingReview}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;