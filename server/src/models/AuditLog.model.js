import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username snapshot is required'],
      trim: true,
    },
    userRole: {
      type: String,
      required: [true, 'User role snapshot is required'],
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
    },
    action: {
      type: String,
      required: [true, 'Action name is required'],
      index: true,
    },
    resource: {
      type: String,
      required: [true, 'Resource name is required'],
      index: true,
    },
    resourceId: {
      type: String,
      default: null,
      index: true,
    },
    beforeSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    afterSnapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    details: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
