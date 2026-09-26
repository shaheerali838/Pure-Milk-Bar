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
      enum: ['MORNING', 'EVENING'],
      default: 'MORNING',
      index: true,
    },
    route: {
      type: String,
      trim: true,
      default: 'Standard Delivery',
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
      enum: ['MOTORCYCLE_RIDER', 'WALKING_BOY', 'VAN_DRIVER', 'OTHER'],
      default: 'MOTORCYCLE_RIDER',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: false,
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in / Guest Delivery',
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: '',
    },
    itemDescription: {
      type: String,
      trim: true,
      default: 'Dairy Delivery',
    },
    qtyLiters: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'KHATA', 'ONLINE', 'PREPAID', 'SPLIT', 'COD'],
      default: 'CASH',
    },
    codAmountToCollect: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: ['POS_ONE_TIME', 'SCHEDULED_ROUTE'],
      default: 'SCHEDULED_ROUTE',
      index: true,
    },
    linkedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    receiptNumber: {
      type: String,
      default: null,
    },
    items: {
      type: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: { type: String, default: 'PIECE' },
          unitPrice: { type: Number, default: 0 },
          subtotal: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'UNPAID'],
      default: 'UNPAID',
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
