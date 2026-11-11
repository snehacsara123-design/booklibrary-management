import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array()[0].msg, errors: result.array() });
  }
  return next();
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ sub: user.id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function authPayload(user) {
  return { token: createToken(user), user };
}

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Phone is too long.'),
  body('studentId').trim().isLength({ min: 1, max: 50 }).withMessage('Student ID is required.'),
  validate,
], asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const exists = await User.exists({ email });
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });

  const user = await User.create({
    name: req.body.name,
    email,
    password: await bcrypt.hash(req.body.password, 12),
    phone: req.body.phone || '',
    studentId: req.body.studentId,
    role: 'student',
  });
  return res.status(201).json(authPayload(user));
}));

router.post('/login', [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  validate,
], asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }
  return res.json(authPayload(user));
}));

export default router;
