import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      enum: ['LITER', 'KG', 'PACKET', 'PIECE'],
      default: 'LITER',
    },
    price: {
      type: Number,
      required: [true, 'Retail selling price is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minimumAlertStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    isAvailableForPos: {
      type: Boolean,
      default: true,
      index: true,
    },
    isAvailableForDelivery: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model('Product', productSchema);
export default Product;
