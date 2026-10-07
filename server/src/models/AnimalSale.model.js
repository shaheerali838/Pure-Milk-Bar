import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const animalSaleSchema = new Schema(
  {
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: [true, 'Animal ID is required'],
      index: true,
    },
    animalTag: {
      type: String,
      required: [true, 'Animal tag number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    animalName: {
      type: String,
      trim: true,
      default: '',
    },
    species: {
      type: String,
      default: 'Cow',
    },
    breed: {
      type: String,
      default: 'Sahiwal',
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'Sale price is required'],
      min: [0, 'Sale price cannot be negative'],
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
    },
    buyerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    buyerAddress: {
      type: String,
      trim: true,
      default: '',
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Online', 'JazzCash/EasyPaisa', 'Cheque', 'Credit / Udhaar'],
      default: 'Cash',
    },
    hasCalfIncluded: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

animalSaleSchema.index({ saleDate: -1 });

export const AnimalSale = model('AnimalSale', animalSaleSchema);
export default AnimalSale;
