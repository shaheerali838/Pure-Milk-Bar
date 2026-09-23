import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const milkProcurementSchema = new Schema(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
      index: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Procurement date is required'],
      default: Date.now,
      index: true,
    },
    shift: {
      type: String,
      required: [true, 'Intake shift is required'],
      enum: ['MORNING', 'EVENING'],
      index: true,
    },
    quantityLiters: {
      type: Number,
      required: [true, 'Quantity in liters is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    fatPercentage: {
      type: Number,
      required: [true, 'FAT percentage is required'],
      min: [0, 'FAT cannot be negative'],
    },
    lactometerReading: {
      type: Number,
      required: [true, 'Lactometer Reading (LR) is required'],
    },
    snfCalculated: {
      type: Number,
      required: [true, 'Calculated SNF is required'],
    },
    ratePerLiter: {
      type: Number,
      required: [true, 'Rate per liter is required'],
      min: [0, 'Rate cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balanceAddedToKhata: {
      type: Number,
      required: true,
    },
    dockInspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dock inspector User ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['ACCEPTED', 'REJECTED', 'PENDING'],
      default: 'ACCEPTED',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

milkProcurementSchema.index({ supplierId: 1, date: -1 });
milkProcurementSchema.index({ date: -1, shift: 1 });
milkProcurementSchema.index({ createdAt: -1 });

export const MilkProcurement = model('MilkProcurement', milkProcurementSchema);
export default MilkProcurement;
