import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
      index: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier User ID is required'],
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    customerNameSnapshot: {
      type: String,
      default: null,
    },
    customerPhoneSnapshot: {
      type: String,
      default: null,
    },
    fulfillmentType: {
      type: String,
      enum: ['COUNTER', 'DELIVERY', 'TAKEAWAY'],
      default: 'COUNTER',
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['CASH', 'KHATA', 'ONLINE', 'SPLIT'],
      index: true,
    },
    items: {
      type: Schema.Types.Mixed,
      required: [true, 'Order items are required'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required'],
      min: [0, 'Grand total cannot be negative'],
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    changeGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    onlineTransferMeta: {
      type: Schema.Types.Mixed,
      default: null,
    },
    deliveryMeta: {
      riderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      riderNameSnapshot: {
        type: String,
        default: null,
      },
      dropAddress: {
        type: String,
        default: null,
      },
      deliverySubType: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

orderSchema.index({ date: -1, fulfillmentType: 1 });
orderSchema.index({ cashierId: 1, date: -1 });
orderSchema.index({ customerId: 1, date: -1 });

export const Order = model('Order', orderSchema);
export default Order;
