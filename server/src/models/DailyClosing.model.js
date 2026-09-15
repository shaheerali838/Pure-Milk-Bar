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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const DailyClosing = model('DailyClosing', dailyClosingSchema);
export default DailyClosing;
