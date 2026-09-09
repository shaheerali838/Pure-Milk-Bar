import mongoose from 'mongoose';
import './DeliveryRun.model.js';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'MANAGER', 'CASHIER', 'RIDER', 'FARM_SUPERVISOR'],
      default: 'CASHIER',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    shift: {
      type: String,
      enum: ['MORNING', 'EVENING', 'ROTATING'],
      default: 'MORNING',
    },
    assignedRouteId: {
      type: Schema.Types.ObjectId,
      ref: 'DeliveryRun',
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = model('User', userSchema);
export default User;
