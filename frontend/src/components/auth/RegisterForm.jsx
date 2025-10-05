import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, 
  LockClosedIcon, 
  UserIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { api } from '../../services';
import OTPModal from './OTPModal';

const RegisterForm = ({ userType = 'user' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    // Vendor specific fields
    businessName: '',
    gstNumber: '',
    businessType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Format phone number: remove non-digits, limit to 10 digits
    if (name === 'phoneNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    if (!/^[6-9]/.test(formData.phoneNumber)) {
      setError('Phone number must start with 6, 7, 8, or 9');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        userType,
        // Vendor specific fields if present
        ...(userType === 'vendor' && {
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
          businessLicense: formData.businessType // Backend expects businessLicense
        })
      };
      
      console.log('Sending registration data:', requestData);
      
      const response = await api.auth.register(requestData);

      console.log('Registration response:', response);
      
      // Store registration data and show OTP modal
      setRegisteredUserData({
        user: response.data.user,
        token: response.data.token
      });
      setShowOTPModal(true);
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        errors: err.errors
      });
      
      // Log the specific validation errors
      if (err.errors && err.errors.length > 0) {
        console.error('Validation errors:', err.errors);
        err.errors.forEach((error, index) => {
          console.error(`Error ${index + 1}:`, error);
        });
      }
      
      // Show specific error message if available
      const errorMessage = err.errors && err.errors.length > 0 
        ? err.errors[0].message || err.errors[0] 
        : err.message || 'Registration failed';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = (verificationData) => {
    // Login the user with the stored data
    if (registeredUserData) {
      login(registeredUserData.user, registeredUserData.token);
      
      // Redirect to appropriate dashboard
      if (userType === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
    setShowOTPModal(false);
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    // Optionally clear registered user data
    // setRegisteredUserData(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {userType === 'vendor' ? 'Vendor Registration' : 'Create your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to={`/${userType}/login`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Common Fields */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter 10-digit mobile number (e.g., 9876543210)"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter 10-digit Indian mobile number without country code
                </p>
              </div>

              {/* Vendor Specific Fields */}
              {userType === 'vendor' && (
                <>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                      GST Number (Optional)
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="gstNumber"
                        name="gstNumber"
                        type="text"
                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter GST number"
                        value={formData.gstNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                      Business Type
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.businessType}
                      onChange={handleChange}
                    >
                      <option value="">Select business type</option>
                      <option value="parking_operator">Parking Operator</option>
                      <option value="mall_complex">Mall/Complex</option>
                      <option value="hotel_restaurant">Hotel/Restaurant</option>
                      <option value="office_building">Office Building</option>
                      <option value="individual">Individual</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {userType === 'vendor' ? 'Looking for user registration?' : 'Are you a vendor?'}
              </span>
              <Link
                to={`/${userType === 'vendor' ? 'user' : 'vendor'}/register`}
                className="ml-2 font-medium text-indigo-600 hover:text-indigo-500"
              >
                {userType === 'vendor' ? 'User Registration' : 'Vendor Registration'}
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        phoneNumber={formData.phoneNumber}
        onSuccess={handleOTPVerificationSuccess}
      />
    </div>
  );
};

export default RegisterForm;