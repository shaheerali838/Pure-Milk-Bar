import mongoose from 'mongoose';
import './User.model.js';

const { Schema, model } = mongoose;

const processingBatchSchema = new Schema(
  {
    batchNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    product: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      default: 'Dahi (Plain)',
      index: true,
    },
    milkUsedLiters: {
      type: Number,
      required: [true, 'Milk used in liters is required'],
      min: [0, 'Milk used cannot be negative'],
    },
    outputQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Output quantity cannot be negative'],
    },
    outputUnit: {
      type: String,
      trim: true,
      default: 'kg',
      enum: ['kg', 'liters', 'bottles', 'tubs', 'packs', 'grams'],
    },
    output: {
      type: String,
      trim: true,
      default: '',
    },
    fatPercentage: {
      type: Number,
      min: [0, 'FAT % cannot be negative'],
      max: [20, 'FAT % exceeds threshold'],
      default: 4.5,
    },
    date: {
      type: Date,
      required: [true, 'Processing date is required'],
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      trim: true,
      default: 'Completed',
      enum: ['Completed', 'In Progress', 'Failed', 'COMPLETED', 'IN_PROGRESS', 'FAILED', 'READY_FOR_POS'],
      index: true,
    },
    stage: {
      type: String,
      trim: true,
      default: 'pos',
      enum: ['incubating', 'chilled', 'pos', 'sold_out', 'INCUBATING', 'CHILLED', 'POS', 'SOLD_OUT'],
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: 'Farm & Supplier Mix',
    },
    farmMilkUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplierMilkUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    posRate: {
      type: String,
      trim: true,
      default: 'Rs. 320 / kg',
    },
    costEstimate: {
      type: Number,
      default: 0,
      min: [0, 'Cost estimate cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.batchNumber || ret._id;
        // Frontend compatibility aliases
        ret.milkUsed = `${ret.milkUsedLiters} L`;
        ret.fat = `${ret.fatPercentage}%`;
        if (!ret.output && ret.outputQuantity) {
          ret.output = `${ret.outputQuantity} ${ret.outputUnit || 'kg'}`;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Pre-save hook to auto-generate batchNumber and format output string if missing
processingBatchSchema.pre('save', async function () {
  if (!this.batchNumber) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(100 + Math.random() * 900);
    this.batchNumber = `DAH-${timestamp}${random}`;
  }

  if (this.outputQuantity && (!this.output || this.output.trim() === '')) {
    this.output = `${this.outputQuantity} ${this.outputUnit || 'kg'}`;
  } else if (this.milkUsedLiters && (!this.output || this.output.trim() === '')) {
    // Default estimated output ~90% of milk used
    const est = Math.round(Number(this.milkUsedLiters) * 0.9);
    this.output = `${est} kg`;
    this.outputQuantity = est;
  }
});

export const ProcessingBatch = model('ProcessingBatch', processingBatchSchema);
export default ProcessingBatch;
