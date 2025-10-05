// Debug API test - temporary file for testing
import { api } from '../services/index.js';

console.log('Testing API configuration...');

// Test the API call and log the actual URL being requested
const testRegistration = async () => {
  try {
    console.log('Attempting registration API call...');
    
    const testData = {
      name: "Test User Debug",
      email: "debug@test.com", 
      phoneNumber: "9876543210",
      password: "password123",
      userType: "user"
    };
    
    const response = await api.auth.register(testData);
    console.log('Registration successful:', response);
    
  } catch (error) {
    console.error('Registration failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      config: error.config
    });
  }
};

// Export for use in console
window.debugAPI = {
  testRegistration,
  api
};

export default testRegistration;