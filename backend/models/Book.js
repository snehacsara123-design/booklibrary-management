import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  isbn: { type: String, trim: true, default: '', maxlength: 30 },
  description: { type: String, trim: true, default: '', maxlength: 4000 },
  coverImage: { type: String, trim: true, default: '' },
  shelfLocation: { type: String, trim: true, default: '', maxlength: 80 },
  totalCopies: { type: Number, min: 0, default: 1, required: true },
  availableCopies: { type: Number, min: 0, default: 1, required: true },
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

export default mongoose.models.Book || mongoose.model('Book', bookSchema);
