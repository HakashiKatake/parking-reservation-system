import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits']
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset', 'phone_verification'],
    required: [true, 'Purpose is required']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum 5 attempts allowed']
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phoneNumber: 1, purpose: 1 });

// Method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method to verify OTP
otpSchema.methods.verifyOTP = function(enteredOTP) {
  if (this.isUsed) {
    return { success: false, message: 'OTP already used' };
  }
  
  if (this.expiresAt < new Date()) {
    return { success: false, message: 'OTP expired' };
  }
  
  if (this.attempts >= 5) {
    return { success: false, message: 'Too many attempts. Please request a new OTP' };
  }
  
  this.attempts += 1;
  
  if (this.otp !== enteredOTP) {
    this.save();
    return { success: false, message: 'Invalid OTP' };
  }
  
  this.isUsed = true;
  this.save();
  
  return { success: true, message: 'OTP verified successfully' };
};

export default mongoose.model('OTP', otpSchema);