import { Router } from 'express';
import Book from '../models/Book.js';
import Borrow from '../models/Borrow.js';
import User from '../models/User.js';
import { adminOnly, protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

router.get('/admin', adminOnly, asyncHandler(async (_req, res) => {
  const now = new Date();
  const [totalBooks, bookCopies, totalUsers, issuedBooks, pendingRequests, overdueBooks, recentBorrows, recentBooks, categoryStats, overdueBorrows] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([{ $group: { _id: null, count: { $sum: '$availableCopies' } } }]),
    User.countDocuments({ role: 'student' }),
    Borrow.countDocuments({ status: 'issued' }),
    Borrow.countDocuments({ status: 'pending' }),
    Borrow.countDocuments({ status: 'issued', dueDate: { $lt: now } }),
    Borrow.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email').populate('book', 'title author category'),
    Book.find().sort({ createdAt: -1 }).limit(6),
    Book.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]),
    Borrow.find({ status: 'issued', dueDate: { $lt: now } }).sort({ dueDate: 1 }).limit(20).populate('user', 'name email').populate('book', 'title author'),
  ]);
  return res.json({
    stats: {
      totalBooks,
      totalUsers,
      availableBooks: bookCopies[0]?.count || 0,
      issuedBooks,
      pendingRequests,
      overdueBooks,
    },
    recentBorrows,
    recentBooks,
    categoryStats,
    overdueBorrows,
  });
}));

router.get('/user', asyncHandler(async (req, res) => {
  const now = new Date();
  const [totalBorrowed, currentlyIssued, pendingRequests, overdueCount, currentlyIssuedBooks, pendingBorrows, overdueBorrows, recentAvailableBooks] = await Promise.all([
    Borrow.countDocuments({ user: req.user.id, status: { $in: ['issued', 'returned'] } }),
    Borrow.countDocuments({ user: req.user.id, status: 'issued' }),
    Borrow.countDocuments({ user: req.user.id, status: 'pending' }),
    Borrow.countDocuments({ user: req.user.id, status: 'issued', dueDate: { $lt: now } }),
    Borrow.find({ user: req.user.id, status: 'issued' }).sort({ dueDate: 1 }).populate('book', 'title author category shelfLocation coverImage'),
    Borrow.find({ user: req.user.id, status: 'pending' }).sort({ createdAt: -1 }).populate('book', 'title author'),
    Borrow.find({ user: req.user.id, status: 'issued', dueDate: { $lt: now } }).sort({ dueDate: 1 }).populate('book', 'title author'),
    Book.find({ availableCopies: { $gt: 0 } }).sort({ createdAt: -1 }).limit(4),
  ]);
  return res.json({
    stats: { totalBorrowed, currentlyIssued, pendingRequests, overdueCount },
    currentlyIssuedBooks,
    pendingBorrows,
    overdueBorrows,
    recentAvailableBooks,
  });
}));

export default router;
