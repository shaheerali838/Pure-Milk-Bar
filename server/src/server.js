import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { seedAdmin } from './seeds/admin.seed.js';

const PORT = process.env.PORT || 8443;

const startServer = async () => {
    try {
        await connectDB();
        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 Pure Milk Bar API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();