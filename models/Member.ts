
import mongoose, { Schema, Model } from "mongoose";

export interface IMember {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  membershipStartDate: Date;
  monthlyFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    monthlyFee: {
      type: Number,
      required: true,
      default: 400,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Member: Model<IMember> =
  mongoose.models.Member ||
  mongoose.model<IMember>("Member", MemberSchema);

export default Member;
