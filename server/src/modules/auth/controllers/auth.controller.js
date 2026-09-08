import jwt from 'jsonwebtoken';
import { loginUser, rotateRefreshToken, logoutUser } from '../services/auth.service.js';
import User from '../../../models/User.model.js';

// Login API
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const { accessToken, refreshToken, user } = await loginUser(username, password);

    // Set refresh token in HttpOnly cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
};

// RefreshToken API
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      const error = new Error('Refresh token not found. Please login again.');
      error.statusCode = 401;
      return next(error);
    }

    const { accessToken } = await rotateRefreshToken(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// GetMe API
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user || !user.isActive) {
      const error = new Error('User not found or account is deactivated.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Logout API
export const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
