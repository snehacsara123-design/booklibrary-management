import mongoose from 'mongoose';

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI or MONGODB_URI environment variable.');
  }

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
