import { Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import Borrow from '../models/Borrow.js';
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

function fineFor(dueDate, now = new Date()) {
  const finePerBook = Number(process.env.FINE_PER_BOOK ?? '150');
  if (!Number.isFinite(finePerBook) || finePerBook < 0) {
    throw new Error('FINE_PER_BOOK must be a non-negative number.');
  }
  if (!dueDate || now <= dueDate) return 0;
  return finePerBook;
}

function borrowLimit() {
  const limit = Number.parseInt(process.env.MAX_BORROW_LIMIT ?? '3', 10);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('MAX_BORROW_LIMIT must be a positive integer.');
  }
  return limit;
}

function withCurrentFine(record) {
  const borrow = record.toObject();
  if (borrow.status === 'issued') borrow.fine = fineFor(borrow.dueDate);
  return borrow;
}

router.post('/request', [
  body('bookId').isMongoId().withMessage('A valid bookId is required.'),
  validate,
], asyncHandler(async (req, res) => {
  const limit = borrowLimit();
  const activeCount = await Borrow.countDocuments({
    user: req.user.id,
    status: { $in: ['pending', 'approved', 'issued'] },
  });
  if (activeCount >= limit) {
    return res.status(409).json({ message: `You have reached the limit of ${limit} active borrow requests or loans.` });
  }

  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  if (book.availableCopies < 1) return res.status(409).json({ message: 'No copies of this book are currently available.' });

  const activeRequest = await Borrow.exists({
    user: req.user.id,
    book: book.id,
    status: { $in: ['pending', 'approved', 'issued'] },
  });
  if (activeRequest) return res.status(409).json({ message: 'You already have an active request or loan for this book.' });

  const borrow = await Borrow.create({ user: req.user.id, book: book.id });
  return res.status(201).json({ borrow });
}));

router.get('/my-books', asyncHandler(async (req, res) => {
  const records = await Borrow.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('book', 'title author category coverImage shelfLocation isbn')
    .limit(300);
  return res.json(records.map(withCurrentFine));
}));

router.get('/all', adminOnly, asyncHandler(async (_req, res) => {
  const records = await Borrow.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email studentId')
    .populate('book', 'title author category')
    .limit(500);
  return res.json({ borrows: records.map(withCurrentFine) });
}));

router.post('/:id/:action', adminOnly, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid borrow record identifier.' });
  }

  const { action } = req.params;
  if (!['approve', 'reject', 'issue', 'return'].includes(action)) {
    return res.status(404).json({ message: 'Unknown borrow action.' });
  }

  const borrow = await Borrow.findById(req.params.id);
  if (!borrow) return res.status(404).json({ message: 'Borrow request not found.' });
  const expectedStatus = { approve: 'pending', reject: 'pending', issue: 'approved', return: 'issued' }[action];
  if (borrow.status !== expectedStatus) {
    return res.status(409).json({ message: `Cannot ${action} a borrow with status "${borrow.status}".` });
  }

  if (action === 'approve' || action === 'reject') {
    const updated = await Borrow.findOneAndUpdate(
      { _id: borrow.id, status: 'pending' },
      { $set: { status: action === 'approve' ? 'approved' : 'rejected', processedBy: req.user.id } },
      { new: true },
    );
    if (!updated) return res.status(409).json({ message: 'This request has already been processed.' });
    return res.json({ borrow: updated });
  }

  if (action === 'issue') {
    const activeCount = await Borrow.countDocuments({
      user: borrow.user,
      status: { $in: ['pending', 'approved', 'issued'] },
    });
    if (activeCount > borrowLimit()) {
      return res.status(409).json({ message: 'This member is over the active borrow limit and cannot be issued another book.' });
    }

    const book = await Book.findOneAndUpdate(
      { _id: borrow.book, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true },
    );
    if (!book) return res.status(409).json({ message: 'No copies of this book are currently available.' });

    const issueDate = new Date();
    const loanDays = Number.parseInt(process.env.DEFAULT_BORROW_DAYS ?? '14', 10);
    if (!Number.isInteger(loanDays) || loanDays < 1 || loanDays > 365) {
      await Book.updateOne({ _id: book.id }, { $inc: { availableCopies: 1 } });
      return res.status(500).json({ message: 'DEFAULT_BORROW_DAYS must be between 1 and 365.' });
    }
    const dueDate = new Date(issueDate.getTime() + loanDays * 86400000);
    const updated = await Borrow.findOneAndUpdate(
      { _id: borrow.id, status: 'approved' },
      { $set: { status: 'issued', issueDate, dueDate, fine: 0, processedBy: req.user.id } },
      { new: true },
    );
    if (!updated) {
      await Book.updateOne({ _id: book.id }, { $inc: { availableCopies: 1 } });
      return res.status(409).json({ message: 'This request has already been processed.' });
    }
    return res.json({ borrow: updated });
  }

  const returnedAt = new Date();
  const fine = fineFor(borrow.dueDate, returnedAt);
  const updated = await Borrow.findOneAndUpdate(
    { _id: borrow.id, status: 'issued' },
    { $set: { status: 'returned', returnedAt, fine, processedBy: req.user.id } },
    { new: true },
  );
  if (!updated) return res.status(409).json({ message: 'This loan has already been returned.' });

  try {
    const inventory = await Book.updateOne(
      { _id: borrow.book, $expr: { $lt: ['$availableCopies', '$totalCopies'] } },
      { $inc: { availableCopies: 1 } },
    );
    if (inventory.modifiedCount !== 1) {
      await Borrow.updateOne(
        { _id: updated.id, status: 'returned', returnedAt },
        { $set: { status: 'issued', returnedAt: null, fine: 0, processedBy: null } },
      );
      return res.status(409).json({ message: 'Could not reconcile the book inventory. No return was recorded.' });
    }
  } catch (error) {
    await Borrow.updateOne(
      { _id: updated.id, status: 'returned', returnedAt },
      { $set: { status: 'issued', returnedAt: null, fine: 0, processedBy: null } },
    );
    throw error;
  }
  return res.json({ borrow: updated });
}));

export default router;
