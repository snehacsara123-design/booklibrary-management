import { Router } from 'express';
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

const bookValidators = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (maximum 200 characters).'),
  body('author').trim().isLength({ min: 1, max: 150 }).withMessage('Author is required (maximum 150 characters).'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('Category is required (maximum 80 characters).'),
  body('totalCopies').isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer.').toInt(),
  body('isbn').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 4000 }),
  body('coverImage').optional({ values: 'falsy' }).trim().isLength({ max: 2048 }),
  body('shelfLocation').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
];

const bookFields = ['title', 'author', 'category', 'isbn', 'description', 'coverImage', 'shelfLocation'];
function cleanBookBody(body) {
  const data = {};
  for (const field of bookFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await Book.distinct('category');
  return res.json(categories.sort((a, b) => a.localeCompare(b)));
}));

router.get('/', asyncHandler(async (req, res) => {
  const query = {};
  const search = String(req.query.search || '').trim();
  const category = String(req.query.category || '').trim();
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
  }
  if (category) query.category = category;
  if (req.query.available === 'true') query.availableCopies = { $gt: 0 };

  const books = await Book.find(query).sort({ title: 1 }).limit(300);
  return res.json({ books });
}));

router.post('/', adminOnly, bookValidators, validate, asyncHandler(async (req, res) => {
  const book = await Book.create({
    ...cleanBookBody(req.body),
    totalCopies: req.body.totalCopies,
    availableCopies: req.body.totalCopies,
  });
  return res.status(201).json({ book });
}));

router.put('/:id', adminOnly, bookValidators, validate, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  const borrowedCopies = book.totalCopies - book.availableCopies;
  if (req.body.totalCopies < borrowedCopies) {
    return res.status(409).json({ message: `At least ${borrowedCopies} copies are currently issued; total copies cannot be lower.` });
  }

  Object.assign(book, cleanBookBody(req.body));
  book.totalCopies = req.body.totalCopies;
  book.availableCopies = req.body.totalCopies - borrowedCopies;
  await book.save();
  return res.json({ book });
}));

router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  const activeBorrow = await Borrow.exists({ book: book.id, status: { $in: ['pending', 'approved', 'issued'] } });
  if (activeBorrow) return res.status(409).json({ message: 'This book has active borrow requests or loans and cannot be deleted.' });

  await book.deleteOne();
  return res.json({ message: 'Book deleted.' });
}));

export default router;
