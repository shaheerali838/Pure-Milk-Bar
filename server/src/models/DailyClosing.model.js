import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const dailyClosingSchema = new Schema(
  {
    closingDate: {
      type: Date,
      required: [true, 'Closing date is required'],
      unique: true,
      index: true,
    },
    closedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Closed by User ID is required'],
      index: true,
    },
    approvedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reopenedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      required: [true, 'Closed at timestamp is required'],
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'RECONCILED', 'APPROVED', 'REOPENED', 'CLOSED', 'LOCKED'],
      default: 'DRAFT',
      index: true,
    },
    milkBalance: {
      type: Schema.Types.Mixed,
      required: true,
    },
    financialBalance: {
      type: Schema.Types.Mixed,
      required: true,
    },
    supervisorNotes: {
      type: String,
      default: null,
    },
    reopenReason: {
      type: String,
      default: null,
    },
    summarySnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    productStockSnapshot: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          name: { type: String, required: true },
          unit: { type: String, default: 'PIECE' },
          category: { type: String, default: 'General' },
          openingStock: { type: Number, default: 0 },
          produced: { type: Number, default: 0 },
          sold: { type: Number, default: 0 },
          wasted: { type: Number, default: 0 },
          closingStock: { type: Number, default: 0 },
          physicalCount: { type: Number, default: null },
          revenue: { type: Number, default: 0 },
          cost: { type: Number, default: 0 },
          profit: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    physicalMilkDip: {
      type: Number,
      default: null,
    },
    milkVariance: {
      type: Number,
      default: 0,
    },
    physicalCash: {
      type: Number,
      default: null,
    },
    cashVariance: {
      type: Number,
      default: 0,
    },
    varianceReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const DailyClosing = model('DailyClosing', dailyClosingSchema);
export default DailyClosing;
