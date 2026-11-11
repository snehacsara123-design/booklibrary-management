import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { adminOnly, protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array()[0].msg, errors: result.array() });
  }
  return next();
}

router.get('/', adminOnly, asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(500);
  return res.json({ users });
}));

router.patch('/:id/status', adminOnly, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean.').toBoolean(),
  validate,
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Administrator accounts cannot be deactivated here.' });
  user.isActive = req.body.isActive;
  await user.save();
  return res.json({ user });
}));

router.put('/profile', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Phone is too long.'),
  body('studentId').optional({ values: 'falsy' }).trim().isLength({ max: 50 }).withMessage('Student ID is too long.'),
  validate,
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.name = req.body.name;
  user.phone = req.body.phone || '';
  if (user.role !== 'admin') user.studentId = req.body.studentId || '';
  await user.save();
  return res.json({ user });
}));

router.put('/profile/password', [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters.'),
  validate,
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const matches = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!matches) return res.status(400).json({ message: 'Current password is incorrect.' });
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  return res.json({ message: 'Password updated successfully.' });
}));

export default router;
