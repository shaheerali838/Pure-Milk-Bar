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
    closedAt: {
      type: Date,
      required: [true, 'Closed at timestamp is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'LOCKED'],
      default: 'CLOSED',
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const DailyClosing = model('DailyClosing', dailyClosingSchema);
export default DailyClosing;
