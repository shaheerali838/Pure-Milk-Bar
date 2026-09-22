import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Authentication Middleware
 * Currently allows open access during development/integration without blocking on missing or invalid JWTs.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = null;
    let userRole = 'ADMIN';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dairy_farm_super_secret_jwt_key_2026');
        if (decoded && decoded.id) {
          userId = decoded.id;
          userRole = decoded.role || 'ADMIN';
        }
      } catch (err) {
        // Ignore token verification errors during open development
      }
    }

    if (!userId) {
      const adminUser = await User.findOne({ role: 'ADMIN', isActive: true });
      if (adminUser) {
        userId = adminUser._id.toString();
        userRole = adminUser.role;
      } else {
        userId = '65f000000000000000000001';
      }
    }

    req.user = {
      id: userId,
      role: userRole,
    };

    next();
  } catch (error) {
    req.user = {
      id: '65f000000000000000000001',
      role: 'ADMIN',
    };
    next();
  }
};

export default authenticate;
