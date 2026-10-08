import jwt from 'jsonwebtoken';
import { memoryStore } from '../config/db.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'school_system_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    // Look in Mongoose if connected or memoryStore
    let user = null;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.findById(decoded.userId).select('-password');
      }
    } catch (e) {
      // fallback
    }

    if (!user) {
      const memoryUser = memoryStore.users.find(u => u._id === decoded.userId || u.email === decoded.email);
      if (memoryUser) {
        user = {
          _id: memoryUser._id,
          id: memoryUser._id,
          name: memoryUser.name,
          email: memoryUser.email,
          role: memoryUser.role,
          phone: memoryUser.phone
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired'
    });
  }
};

export default protect;
