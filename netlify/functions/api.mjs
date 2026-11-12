import mongoose from 'mongoose';
import serverless from 'serverless-http';
import app from '../../backend/app.js';
import connectDB from '../../backend/config/db.js';

const expressHandler = serverless(app);
let connectionPromise;

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connectDB().finally(() => {
      connectionPromise = undefined;
    });
  }

  await connectionPromise;
}

export async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDatabaseConnection();

  const functionPrefix = '/.netlify/functions/api';
  const functionEvent = {
    ...event,
    path: event.path.startsWith(functionPrefix)
      ? event.path.slice(functionPrefix.length) || '/'
      : event.path,
  };

  return expressHandler(functionEvent, context);
}
