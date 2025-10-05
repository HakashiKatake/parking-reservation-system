const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');


const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
    
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
   
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
});


const vendorOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.userType === 'vendor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Vendor verification required'
    });
  }
});

module.exports = { protect, vendorOnly };