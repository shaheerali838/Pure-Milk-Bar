import 'dotenv/config';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import { seedAdmin } from '../src/seeds/admin.seed.js';

let isInitialized = false;

export default async function handler(req, res) {
  try {
    if (!isInitialized) {
      await connectDB();
      try {
        await seedAdmin();
      } catch (seedErr) {
        console.warn('Admin seed initialization warning:', seedErr.message);
      }
      isInitialized = true;
    }
  } catch (dbErr) {
    console.error('Database connection error in Vercel handler:', dbErr.message);
  }

  return app(req, res);
}
