import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Module Routes
import farmRoutes from './modules/farm/routes/farm.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dairy Milk Farm API server is up and running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Dairy Milk Farm Management API',
    docs: '/api/health',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  MODULE ROUTES
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/farm', farmRoutes);
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
