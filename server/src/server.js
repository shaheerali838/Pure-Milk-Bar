import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./seeds/admin.seed.js";
import { seedProducts } from "./seeds/product.seed.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedAdmin();
      await seedProducts();
    }
  } catch (error) {
    console.error("DB initialization error:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
