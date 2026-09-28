import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const wastageLogSchema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'Wastage date is required'],
      default: Date.now,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Wastage type is required'],
      enum: ['MILK', 'PRODUCT'],
      default: 'MILK',
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    productName: {
      type: String,
      default: null,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Wastage quantity is required'],
      min: [0.01, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      enum: ['LITER', 'KG', 'PACKET', 'PIECE', 'BOTTLE'],
      default: 'LITER',
    },
    reason: {
      type: String,
      required: [true, 'Wastage reason is required'],
      enum: ['SPOILED', 'SPILLAGE', 'CURDLED', 'LINE_WASHING', 'EXPIRED', 'OTHER'],
      default: 'SPOILED',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by User ID is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

wastageLogSchema.index({ date: -1, type: 1 });

export const WastageLog = model('WastageLog', wastageLogSchema);
export default WastageLog;
