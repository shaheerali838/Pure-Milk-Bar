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
      index: true,
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    lactationStage: {
      type: String,
      enum: ['EARLY', 'MID', 'LATE', 'DRY'],
      default: 'EARLY',
      index: true,
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
    healthStatus: {
      type: String,
      enum: ['HEALTHY', 'UNDER_TREATMENT', 'QUARANTINE', 'SICK'],
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
