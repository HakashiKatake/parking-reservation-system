import jwt from 'jsonwebtoken';

/**
 * JWT utility functions for token management
 */
class JWTUtils {
  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  static generateToken(user) {
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} Decoded payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {String} Refresh token
   */
  static generateRefreshToken(user) {
    const payload = {
      id: user._id,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  }

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header
   * @returns {String|null} Token or null
   */
  static extractToken(authHeader) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Generate password reset token
   * @param {Object} user - User object
   * @returns {String} Reset token
   */
  static generatePasswordResetToken(user) {
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      type: 'password_reset'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
  }

  /**
   * Generate email verification token
   * @param {Object} user - User object
   * @returns {String} Verification token
   */
  static generateVerificationToken(user) {
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      type: 'email_verification'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }
}

export default JWTUtils;