import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// ─── Authenticate Middleware ──────────────────────────────────────────────────
// Verifies JWT access token from Authorization: Bearer <token> header
// Attaches req.user = { id, role } for downstream controllers
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const error = new Error(
        err.name === 'TokenExpiredError'
          ? 'Access token expired. Please refresh your session.'
          : 'Invalid access token.'
      );
      error.statusCode = 401;
      return next(error);
    }

    // 3. Verify user still exists and is active
    const user = await User.findById(decoded.id).select('_id role isActive');

    if (!user || !user.isActive) {
      const error = new Error('User not found or account has been deactivated.');
      error.statusCode = 401;
      return next(error);
    }

    // 4. Attach lightweight user object to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
