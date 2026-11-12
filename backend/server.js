import dotenv from 'dotenv';
import { resolve } from 'node:path';
import connectDB from './config/db.js';

dotenv.config();
dotenv.config({ path: resolve(process.cwd(), 'backend', '.env') });

const port = Number(process.env.PORT || 5000);

const { default: app } = await import('./app.js');
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
