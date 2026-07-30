import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    next(new Error('Access denied. Token is missing or invalid.'));
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401);
      next(new Error('User linked to this token no longer exists.'));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Unauthorized access. Please log in again.'));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    next(new Error('You are not authorized to access this resource.'));
    return;
  }

  next();
};
