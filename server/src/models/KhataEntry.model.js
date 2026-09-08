import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const khataEntrySchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true,
    },
    voucherNumber: {
      type: String,
      required: [true, 'Voucher number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['DEBIT', 'CREDIT'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
    },
    debitAmount: {
      type: Number,
      default: 0,
      min: [0, 'Debit cannot be negative'],
    },
    creditAmount: {
      type: Number,
      default: 0,
      min: [0, 'Credit cannot be negative'],
    },
    runningBalance: {
      type: Number,
      required: [true, 'Running balance is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE', 'ADJUSTMENT', 'CHEQUE', null],
      default: null,
    },
    referenceTransactionId: {
      type: String,
      default: null,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier User ID is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

khataEntrySchema.index({ customerId: 1, date: -1 });

export const KhataEntry = model('KhataEntry', khataEntrySchema);
export default KhataEntry;
