import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';

export const seedAdmin = async (force = false) => {
    try {
        const salt = await bcrypt.genSalt(10);

        const demoAccounts = [
            {
                username: process.env.ADMIN_USERNAME || 'admin',
                name: 'System Administrator',
                phone: process.env.ADMIN_PHONE || '03001234567',
                email: process.env.ADMIN_EMAIL || 'admin@puremilkbar.com',
                password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin@123456',
                role: 'ADMIN',
                shift: 'ROTATING',
            },
            {
                username: 'manager',
                name: 'Tariq Mehmood',
                phone: '03218844221',
                email: 'manager@puremilkbar.com',
                password: 'manager123',
                role: 'MANAGER',
                shift: 'MORNING',
            },
            {
                username: 'cashier',
                name: 'Hamza Butt',
                phone: '03339955112',
                email: 'cashier@puremilkbar.com',
                password: 'cashier123',
                role: 'CASHIER',
                shift: 'EVENING',
            },
            {
                username: 'supervisor',
                name: 'Chaudhry Akram',
                phone: '03457711223',
                email: 'farm@puremilkbar.com',
                password: 'farm123',
                role: 'FARM_SUPERVISOR',
                shift: 'MORNING',
            },
        ];

        for (const acc of demoAccounts) {
            const userExists = await User.findOne({
                $or: [
                    { username: acc.username },
                    { email: acc.email }
                ]
            });

            if (userExists && !force) {
                continue;
            }

            const passwordHash = await bcrypt.hash(acc.password, salt);

            if (userExists && force) {
                userExists.name = acc.name;
                userExists.phone = acc.phone;
                userExists.passwordHash = passwordHash;
                userExists.role = acc.role;
                userExists.shift = acc.shift;
                userExists.isActive = true;
                await userExists.save();
            } else {
                await User.create({
                    username: acc.username,
                    name: acc.name,
                    phone: acc.phone,
                    email: acc.email,
                    passwordHash,
                    role: acc.role,
                    shift: acc.shift,
                    isActive: true,
                });
            }
        }

        console.log('[Auth Seed] Initial default user accounts provisioned successfully.');
        return true;
    } catch (error) {
        console.error('[Auth Seed Error]:', error.message);
        throw error;
    }
};

// Allow standalone execution via `node src/seeds/admin.seed.js [--force]`
if (process.argv[1] && (process.argv[1].includes('admin.seed.js'))) {
    const isForce = process.argv.includes('--force');
    connectDB().then(async () => {
        await seedAdmin(isForce);
        await mongoose.disconnect();
        process.exit(0);
    }).catch(() => {
        process.exit(1);
    });
}