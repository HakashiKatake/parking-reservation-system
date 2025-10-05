import JWTUtils from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware to protect routes - requires valid JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = JWTUtils.extractToken(req.headers.authorization);
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    
    // Verify token
    const decoded = JWTUtils.verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

/**
 * Middleware to restrict access to specific user types
 * @param {...String} userTypes - Allowed user types
 */
export const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    next();
  };
};

/**
 * Middleware to check if user's phone is verified
 */
export const requirePhoneVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required'
    });
  }
  next();
};

/**
 * Middleware to check if vendor is verified
 */
export const requireVendorVerification = (req, res, next) => {
  if (req.user.userType === 'vendor' && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Vendor verification required'
    });
  }
  next();
};