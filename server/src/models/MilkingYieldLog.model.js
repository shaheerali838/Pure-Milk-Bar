import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const milkingYieldLogSchema = new Schema(
  {
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Milking date is required'],
      default: Date.now,
      index: true,
    },
    shift: {
      type: String,
      required: [true, 'Milking shift is required'],
      enum: ['MORNING', 'EVENING'],
      index: true,
    },
    yieldLiters: {
      type: Number,
      required: [true, 'Yield in liters is required'],
      min: [0, 'Yield cannot be negative'],
    },
    fatPercentage: {
      type: Number,
      min: [0, 'FAT % cannot be negative'],
      max: [15, 'FAT % exceeds realistic threshold'],
      default: null,
    },
    snfPercentage: {
      type: Number,
      min: [0, 'SNF % cannot be negative'],
      max: [20, 'SNF % exceeds realistic threshold'],
      default: null,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator User ID is required'],
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

milkingYieldLogSchema.index({ animalId: 1, date: 1, shift: 1 }, { unique: true });

export const MilkingYieldLog = model('MilkingYieldLog', milkingYieldLogSchema);
export default MilkingYieldLog;
