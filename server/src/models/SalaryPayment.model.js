import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const salaryPaymentSchema = new Schema(
  {
    voucherNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
      default: () => `SAL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff reference is required'],
      index: true,
    },
    staffCode: {
      type: String,
      trim: true,
      default: '',
    },
    staffName: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      trim: true,
      default: 'Farm Staff',
    },
    monthlySalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailySalary: {
      type: Number,
      default: 0,
      min: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    presentDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: [true, 'Payable amount is required'],
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: 0,
    },
    status: {
      type: String,
      default: 'Paid',
      trim: true,
      index: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    monthYear: {
      type: String,
      trim: true,
      default: () =>
        new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE', 'CHEQUE'],
      default: 'CASH',
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
      index: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const SalaryPayment = model('SalaryPayment', salaryPaymentSchema);
export default SalaryPayment;
