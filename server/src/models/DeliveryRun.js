import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const deliveryRunSchema = new Schema(
  {
    runCode: {
      type: String,
      required: [true, 'Run code is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Delivery date is required'],
      default: Date.now,
      index: true,
    },
    shift: {
      type: String,
      required: [true, 'Shift is required'],
      enum: ['MORNING', 'EVENING'],
      index: true,
    },
    route: {
      type: String,
      required: [true, 'Route is required'],
      trim: true,
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    riderNameSnapshot: {
      type: String,
      default: null,
    },
    staffType: {
      type: String,
      enum: ['MOTORCYCLE_RIDER', 'WALKING_BOY', 'VAN_DRIVER'],
      default: 'MOTORCYCLE_RIDER',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },
    itemDescription: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    qtyLiters: {
      type: Number,
      required: [true, 'Quantity in liters is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: ['CASH', 'KHATA', 'ONLINE', 'PREPAID'],
    },
    codAmountToCollect: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'DELIVERED', 'FAILED', 'SKIPPED'],
      default: 'PENDING',
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    bottlesReturned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const DeliveryRun = model('DeliveryRun', deliveryRunSchema);
export default DeliveryRun;
