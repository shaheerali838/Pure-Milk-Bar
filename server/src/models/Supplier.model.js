import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const supplierSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Supplier code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    villageOrLocation: {
      type: String,
      required: [true, 'Village or location is required'],
      trim: true,
    },
    milkType: {
      type: String,
      required: [true, 'Supplied milk type is required'],
      enum: ['COW', 'BUFFALO', 'MIXED'],
    },
    baseRatePerLiter: {
      type: Number,
      required: [true, 'Base rate per liter is required'],
      min: [0, 'Rate cannot be negative'],
    },
    standardFat: {
      type: Number,
      default: 6.0,
      min: 0,
    },
    currentPayableBalance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const Supplier = model('Supplier', supplierSchema);
export default Supplier;
