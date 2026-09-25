import mongoose from 'mongoose';
import './User.model.js';
import './Customer.model.js';

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
      enum: ['CASH', 'ONLINE', 'ADJUSTMENT', 'CHEQUE', 'KHATA', 'SPLIT', 'COD', null],
      default: null,
    },
    referenceTransactionId: {
      type: String,
      default: null,
    },
    items: {
      type: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: { type: String, default: '' },
          unitPrice: { type: Number, default: 0 },
          subtotal: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    orderTotal: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    fulfillmentType: {
      type: String,
      default: null,
    },
    riderName: {
      type: String,
      default: null,
    },
    deliveryAddress: {
      type: String,
      default: null,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
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
