import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const expenseSchema = new Schema(
    {
        voucherNumber: {
            type: String,
            required: [true, 'Voucher number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'Expense date is required'],
            default: Date.now,
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Expense category is required'],
            enum: [
                'UTILITIES',     // Electricity, Water, Gas
                'SALARIES',      // Staff Salaries & Daily Wages
                'MAINTENANCE',   // Chilling Tank / Equipment Repair
                'FEED',          // Cattle Feed & Fodder
                'PACKAGING',     // Milk Bottles & Bags
                'RENT',          // Shop / Farm Rent
                'TRANSPORT',     // Vehicle & Freight
                'MISC',          // Miscellaneous Expenses
            ],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Expense title is required'],
            trim: true,
        },
        amountRupees: {
            type: Number,
            required: [true, 'Amount in Rupees is required'],
            min: [0, 'Amount cannot be negative'],
        },
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required'],
            enum: ['CASH', 'ONLINE', 'CHEQUE'],
            default: 'CASH',
        },
        receiptNumber: {
            type: String,
            trim: true,
            default: null,
        },
        notes: {
            type: String,
            trim: true,
            default: null,
        },
        loggedByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Logged by User ID is required'],
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound Index for fast date & category queries
expenseSchema.index({ category: 1, date: -1 });

export const Expense = model('Expense', expenseSchema);
export default Expense;
