import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        clearSession: true 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id) || await User.findOne({ uuid: decoded.uuid });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found.',
        clearSession: true 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token format.',
        clearSession: true 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.',
        clearSession: true 
      });
    }
    res.status(401).json({ 
      error: 'Authentication failed.',
      clearSession: true 
    });
  }
};
