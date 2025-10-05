import { body } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import JWTUtils from '../utils/jwt.js';
import SMSService from '../utils/smsService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validatePhoneNumber, validatePassword } from '../utils/validators.js';


export const register = asyncHandler(async (req, res) => {
  const { name, phoneNumber, password, userType, businessName, businessLicense, email } = req.body;

  
  const phoneValidation = validatePhoneNumber(phoneNumber);
  if (!phoneValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: phoneValidation.message
    });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message
    });
  }


  const existingUser = await User.findOne({ phoneNumber: phoneValidation.phoneNumber });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already registered with this phone number'
    });
  }


  const userData = {
    name,
    phoneNumber: phoneValidation.phoneNumber,
    password,
    userType,
    email
  };

 
  if (userType === 'vendor') {
    if (!businessName || !businessLicense) {
      return res.status(400).json({
        success: false,
        message: 'Business name and license are required for vendors'
      });
    }
    userData.businessName = businessName;
    userData.businessLicense = businessLicense;
  }

  
  const user = await User.create(userData);

  
  const otp = OTP.generateOTP();
  await OTP.create({
    phoneNumber: phoneValidation.phoneNumber,
    otp,
    purpose: 'registration'
  });

  
  await SMSService.sendOTP(phoneValidation.phoneNumber, otp);

  
  const token = JWTUtils.generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your phone number.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        isPhoneVerified: user.isPhoneVerified
      },
      token
    }
  });
});


export const login = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  
  const phoneValidation = validatePhoneNumber(phoneNumber);
  if (!phoneValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: phoneValidation.message
    });
  }

  
  const user = await User.findOne({ phoneNumber: phoneValidation.phoneNumber });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or password'
    });
  }

 
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or password'
    });
  }


  const token = JWTUtils.generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        isPhoneVerified: user.isPhoneVerified,
        isVerified: user.isVerified
      },
      token
    }
  });
});


export const sendOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, purpose = 'phone_verification' } = req.body;

  let targetPhoneNumber = phoneNumber;
  
  
  if (!phoneNumber && req.user) {
    targetPhoneNumber = req.user.phoneNumber;
  }

  
  const phoneValidation = validatePhoneNumber(targetPhoneNumber);
  if (!phoneValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: phoneValidation.message
    });
  }

  
  await OTP.deleteMany({
    phoneNumber: phoneValidation.phoneNumber,
    purpose,
    isUsed: false
  });

  
  const otp = OTP.generateOTP();
  await OTP.create({
    phoneNumber: phoneValidation.phoneNumber,
    otp,
    purpose
  });


  const smsResult = await SMSService.sendOTP(phoneValidation.phoneNumber, otp);

  if (smsResult.success) {
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: phoneValidation.phoneNumber,
        expiresIn: '10 minutes'
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});


export const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, purpose = 'phone_verification' } = req.body;

  let targetPhoneNumber = phoneNumber;
  
 
  if (!phoneNumber && req.user) {
    targetPhoneNumber = req.user.phoneNumber;
  }


  const phoneValidation = validatePhoneNumber(targetPhoneNumber);
  if (!phoneValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: phoneValidation.message
    });
  }


  const otpRecord = await OTP.findOne({
    phoneNumber: phoneValidation.phoneNumber,
    purpose,
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'No OTP found. Please request a new one.'
    });
  }

  // Verify OTP
  const verificationResult = otpRecord.verifyOTP(otp);

  if (!verificationResult.success) {
    return res.status(400).json({
      success: false,
      message: verificationResult.message
    });
  }

  // If phone verification or registration, update user's verification status
  if (purpose === 'phone_verification' || purpose === 'registration') {
    const updateData = { isPhoneVerified: true };
    
    // For vendor registration, also set isVerified: true for business verification
    if (purpose === 'registration') {
      const user = await User.findOne({ phoneNumber: phoneValidation.phoneNumber });
      if (user && user.userType === 'vendor') {
        updateData.isVerified = true;
      }
    }
    
    await User.findOneAndUpdate(
      { phoneNumber: phoneValidation.phoneNumber },
      updateData
    );
  }

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      phoneNumber: phoneValidation.phoneNumber,
      purpose
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'address', 'profileImage'];
  const updateData = {};

  // Only include allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id);

  // Check current password
  const isCurrentPasswordMatch = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Here we can log the logout event or add token to blacklist if needed
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Validation rules for routes
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('userType')
    .isIn(['user', 'vendor'])
    .withMessage('User type must be either user or vendor'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('businessName')
    .if(body('userType').equals('vendor'))
    .notEmpty()
    .withMessage('Business name is required for vendors'),
  
  body('businessLicense')
    .if(body('userType').equals('vendor'))
    .notEmpty()
    .withMessage('Business license is required for vendors')
];

export const loginValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];