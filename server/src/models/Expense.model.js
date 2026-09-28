import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const expenseSchema = new Schema(
    {
        voucherNumber: {
            type: String,
            default: () => `EXP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            sparse: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        scope: {
            type: String,
            trim: true,
            default: 'FARM',
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
            trim: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Expense title is required'],
            trim: true,
            default: 'Expense',
        },
        amountRupees: {
            type: Number,
            required: [true, 'Amount in Rupees is required'],
            min: [0, 'Amount cannot be negative'],
        },
        paymentMethod: {
            type: String,
            trim: true,
            uppercase: true,
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
        description: {
            type: String,
            trim: true,
            default: '',
        },
        authorizedBy: {
            type: String,
            trim: true,
            default: 'Admin',
        },
        costAttribution: {
            type: String,
            trim: true,
            default: '',
        },
        loggedByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id;
                ret.amount = ret.amountRupees;
                return ret;
            },
        },
        toObject: { virtuals: true },
        strict: false,
    }
);

expenseSchema.virtual('amount').get(function () {
    return this.amountRupees;
});

// Pre-save hook to calculate voucherNumber if missing
expenseSchema.pre('save', function () {
    if (!this.voucherNumber) {
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(100 + Math.random() * 900);
        this.voucherNumber = `VCH-${timestamp}${random}`;
    }
    if (this.amountRupees !== undefined && !this.amount) {
        this.amount = this.amountRupees;
    }
});

// Compound Index for fast date & category queries
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ scope: 1, date: -1 });

export const Expense = model('Expense', expenseSchema);
export default Expense;
