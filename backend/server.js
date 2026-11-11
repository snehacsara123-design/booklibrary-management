import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { resolve } from 'node:path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

dotenv.config();
dotenv.config({ path: resolve(process.cwd(), 'backend', '.env') });

const app = express();
const port = Number(process.env.PORT || 5000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value at least 32 characters long.');
}
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

await connectDB();
const server = app.listen(port, () => {
  console.log(`Library API listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing server.`);
  server.close(() => {
    import('mongoose').then(({ default: mongoose }) => mongoose.disconnect())
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Error during shutdown:', error);
        process.exit(1);
      });
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
