import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.model.js';

// Generate Tokens
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'dairy_farm_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'dairy_farm_super_secret_refresh_jwt_key_2026',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
};

//  Login Service 
export const loginUser = async (username, password) => {
  const cleanIdentifier = String(username || '').toLowerCase().trim();
  // 1. Find user by username OR email
  const user = await User.findOne({
    $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
  });

  if (!user) {
    const error = new Error('Invalid username or password.');
    error.statusCode = 401;
    throw error;
  }

  // 2. Check if account is active
  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Contact admin.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid username or password.');
    error.statusCode = 401;
    throw error;
  }

  // 4. Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save();

  // 5. Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // 6. Return tokens + sanitized user (toJSON removes passwordHash)
  return {
    accessToken,
    refreshToken,
    user: user.toJSON(),
  };
};

//  Rotate Refresh Token 
export const rotateRefreshToken = async (token) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'dairy_farm_super_secret_refresh_jwt_key_2026');
  } catch (err) {
    const error = new Error('Invalid or expired refresh token. Please login again.');
    error.statusCode = 401;
    throw error;
  }

  // Verify user still exists and is active
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    const error = new Error('User no longer exists or is deactivated.');
    error.statusCode = 401;
    throw error;
  }

  // Issue new access token
  const accessToken = generateAccessToken(user._id, user.role);

  return { accessToken };
};

// Logout Service 
export const logoutUser = async (userId) => {
  // Update lastLoginAt on logout for audit trail
  // In a production system, you'd add the refresh token to a blacklist/Redis
  await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
};
