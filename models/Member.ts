
import mongoose, { Schema, Model } from "mongoose";

export interface IMonthlyFeeHistory {
  amount: number;
  effectiveFrom: string;
  updatedAt: Date;
}

export interface IMember {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  membershipStartDate: Date;
  slNo?: number;
  monthlyFee: number;
  monthlyFeeHistory?: IMonthlyFeeHistory[];
  isActive: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyFeeHistorySchema = new Schema<IMonthlyFeeHistory>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    effectiveFrom: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    membershipStartDate: {
      type: Date,
      required: true,
    },
    slNo: {
      type: Number,
      unique: true,
      sparse: true,
      min: 1,
    },
    monthlyFee: {
      type: Number,
      required: true,
      default: 400,
      min: 0,
    },
    monthlyFeeHistory: {
      type: [MonthlyFeeHistorySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

const Member: Model<IMember> =
  mongoose.models.Member ||
  mongoose.model<IMember>("Member", MemberSchema);

export default Member;
