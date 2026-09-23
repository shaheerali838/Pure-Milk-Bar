import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

// Route Imports
import authRoutes from "./modules/auth/routes/auth.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import farmRoutes from "./modules/farm/routes/farm.routes.js";
import supplierRoutes from "./modules/suppliers/routes/supplier.routes.js";
import customerRoutes from "./modules/customers/routes/customer.routes.js";
import deliveryRoutes from "./modules/deliveries/routes/delivery.routes.js";
import financeRoutes from "./modules/finance/routes/finance.routes.js";
import dailyClosingRoutes from "./modules/dailyClosing/routes/dailyClosing.routes.js";
import auditLogRoutes from "./modules/auditLog/routes/auditLog.routes.js";
import inventoryRoutes from "./modules/inventory/routes/inventory.routes.js";
import posRoutes from "./modules/pos/routes/pos.routes.js";
import staffRoutes from "./modules/staff/routes/staff.routes.js";
import processingRoutes from "./modules/processing/routes/processing.routes.js";

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  "https://pure-milk-bar.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        allowedOrigins.some((o) => o.replace(/\/$/, "") === cleanOrigin) ||
        /^https:\/\/pure-milk-bar(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);

// Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: process.env.NODE_ENV === "development" ? 10000 : 500, // Limit each IP per windowMs
  skip: () => process.env.NODE_ENV === "development",
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

app.use("/api/", limiter);

// Health Check Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pure Milk Bar API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/deliveries", deliveryRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/daily-closings", dailyClosingRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/processing", processingRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Pure Milk Bar ERP Management API",
    docs: "/api/v1/health",
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  MODULE ROUTES
// ═══════════════════════════════════════════════════════════════════════════
app.use("/api/farm/processing", processingRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/v1/farm", farmRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/pos", posRoutes);
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
