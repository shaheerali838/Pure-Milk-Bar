import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const staffSchema = new Schema(
  {
    staffCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff full name is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Staff role/designation is required'],
      trim: true,
      default: 'Farm Work Man',
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    cnic: {
      type: String,
      trim: true,
      default: '',
    },
    shift: {
      type: String,
      trim: true,
      default: 'Morning',
      enum: ['Morning', 'Evening', 'Both', 'Night', 'Full Day', 'Morning & Evening', 'Rotating'],
    },
    monthlySalary: {
      type: Number,
      default: 0,
      min: [0, 'Monthly salary cannot be negative'],
    },
    dailySalary: {
      type: Number,
      default: 0,
      min: [0, 'Daily salary cannot be negative'],
    },
    status: {
      type: String,
      trim: true,
      default: 'Active',
      enum: ['Active', 'On Leave', 'Inactive', 'Off Duty', 'Terminated'],
      index: true,
    },
    route: {
      type: String,
      trim: true,
      default: 'Not Assigned',
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleType: {
      type: String,
      trim: true,
      default: 'Motorcycle',
    },
    assignedBarn: {
      type: String,
      trim: true,
      default: '',
    },
    milkingShiftSpecialization: {
      type: String,
      trim: true,
      default: '',
    },
    assignedCattleCount: {
      type: Schema.Types.Mixed,
      default: '',
    },
    guardPost: {
      type: String,
      trim: true,
      default: '',
    },
    weaponLicense: {
      type: String,
      trim: true,
      default: '',
    },
    posRegisterId: {
      type: String,
      trim: true,
      default: '',
    },
    khataAuthLimit: {
      type: Schema.Types.Mixed,
      default: '',
    },
    departmentSupervised: {
      type: String,
      trim: true,
      default: '',
    },
    attendanceMap: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
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
    strict: false,
  }
);

// Pre-save hook to calculate daily salary and auto-generate staffCode if missing
staffSchema.pre('save', function () {
  if (this.monthlySalary !== undefined && this.monthlySalary !== null) {
    this.dailySalary = Math.round(Number(this.monthlySalary) / 30);
  }

  if (!this.staffCode) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(100 + Math.random() * 900);
    this.staffCode = `STF-${timestamp}${random}`;
  }
});

export const Staff = model('Staff', staffSchema);
export default Staff;
