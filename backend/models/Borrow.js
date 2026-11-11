import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'issued', 'returned', 'rejected'],
    default: 'pending',
    required: true,
    index: true,
  },
  requestDate: { type: Date, default: Date.now, required: true },
  issueDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  returnedAt: { type: Date, default: null },
  fine: { type: Number, min: 0, default: 0 },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ status: 1, dueDate: 1 });

export default mongoose.models.Borrow || mongoose.model('Borrow', borrowSchema);
