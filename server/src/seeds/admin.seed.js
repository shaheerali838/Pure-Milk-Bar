import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';

export const seedAdmin = async () => {
    try {
        const plainPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@123456';

        const adminData = {
            username: process.env.ADMIN_USERNAME || 'admin',
            name: 'System Administrator',
            phone: process.env.ADMIN_PHONE || '03001234567',
            email: process.env.ADMIN_EMAIL || 'admin@puremilkbar.com',
            role: 'ADMIN',
            shift: 'ROTATING',
        };

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        // Remove old manager & cashier test users if present
        await User.deleteMany({ username: { $in: ['manager', 'cashier'] } });

        const result = await User.findOneAndUpdate(
            { username: adminData.username },
            {
                $set: {
                    ...adminData,
                    passwordHash,
                    isActive: true,
                },
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true,
            }
        );

        console.log(` [OK] Admin user created/ready (Username: ${result.username} | Role: ${result.role})`);
        return result;
    } catch (error) {
        console.error(' [ERROR] Admin seed failed:', error.message);
    }
};

// Allow standalone execution via `node src/seeds/admin.seed.js`
if (process.argv[1] && (process.argv[1].includes('admin.seed.js'))) {
    connectDB().then(async () => {
        await seedAdmin();
        await mongoose.disconnect();
        console.log(' [OK] Database connection closed');
        process.exit(0);
    });
}