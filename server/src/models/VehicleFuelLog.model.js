import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const vehicleFuelLogSchema = new Schema(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rider User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Log date is required'],
      default: Date.now,
      index: true,
    },
    shift: {
      type: String,
      required: [true, 'Shift is required'],
      enum: ['MORNING', 'EVENING'],
    },
    vehiclePlate: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    expenseType: {
      type: String,
      enum: ['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER'],
      default: 'FUEL',
    },
    liters: {
      type: Number,
      min: 0,
      default: null,
    },
    costRupees: {
      type: Number,
      required: [true, 'Cost in Rupees is required'],
      min: [0, 'Cost cannot be negative'],
    },
    odometerKm: {
      type: Number,
      min: 0,
      default: null,
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: null,
    },
    linkedDeliveryRunId: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryRun',
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const VehicleFuelLog = model('VehicleFuelLog', vehicleFuelLogSchema);
export default VehicleFuelLog;
