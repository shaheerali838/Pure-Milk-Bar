import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/routes/auth.routes.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';
<<<<<<< HEAD
import farmRoutes from './modules/farm/routes/farm.routes.js';
import supplierRoutes from './modules/suppliers/routes/supplier.routes.js';
=======
import customerRoutes from './modules/customers/routes/customer.routes.js';
import deliveryRoutes from './modules/deliveries/routes/delivery.routes.js';
>>>>>>> origin/Nabeel-Ahmad

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging (Development Only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

app.use('/api/', limiter);

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pure Milk Bar API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Pure Milk Bar ERP Management API',
    docs: '/api/v1/health',
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  MODULE ROUTES
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/farm', farmRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;