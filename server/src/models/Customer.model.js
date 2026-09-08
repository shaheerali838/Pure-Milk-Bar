import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const customerSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Customer code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    deliveryRoute: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    creditLimit: {
      type: Number,
      default: 5000,
      min: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
      index: true,
    },
    preferredPayment: {
      type: String,
      enum: ['KHATA', 'CASH', 'ONLINE'],
      default: 'KHATA',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Customer = model('Customer', customerSchema);
export default Customer;
