import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error('JWT_SECRET is not configured.'));

  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'This account is unavailable.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
    return next(error);
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' });
  }
  return next();
}
