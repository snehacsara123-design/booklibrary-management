import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'student'], default: 'student', required: true },
  phone: { type: String, trim: true, default: '', maxlength: 30 },
  studentId: { type: String, trim: true, default: '', maxlength: 50 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(_document, returned) {
    delete returned.password;
    delete returned.__v;
    return returned;
  },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
