import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start Express Server
  const server = app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`,
    );
  });

  // Connect to Database asynchronously
  connectDB();

  // Handle Unhandled Promise Rejections
  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
