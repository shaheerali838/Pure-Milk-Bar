import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const animalSchema = new Schema(
  {
    tagNumber: {
      type: String,
      required: [true, 'Ear tag number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Animal type is required'],
      enum: ['COW', 'BUFFALO'],
      uppercase: true,
      default: 'COW',
      index: true,
    },
    species: {
      type: String,
      default: 'Cow (Sahiwal)',
    },
    breed: {
      type: String,
      default: 'Sahiwal',
      trim: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    lactationStage: {
      type: String,
      default: 'EARLY',
      index: true,
    },
    lactationStatus: {
      type: String,
      default: 'Milking',
    },
    lactationCycle: {
      type: Number,
      default: 1,
      min: 1,
    },
    dailyAvgYield: {
      type: Number,
      default: 0,
      min: 0,
    },
    morningYield: {
      type: Number,
      default: 0,
    },
    eveningYield: {
      type: Number,
      default: 0,
    },
    expectedDailyYield: {
      type: Number,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    acquisitionDate: {
      type: String,
      default: null,
    },
    healthStatus: {
      type: String,
      default: 'HEALTHY',
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index per architecture spec: operational query path for tag + active status
animalSchema.index({ tagNumber: 1, isActive: 1 });

export const Animal = model('Animal', animalSchema);
export default Animal;
