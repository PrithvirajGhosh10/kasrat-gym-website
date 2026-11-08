
import mongoose, { Schema, Model } from "mongoose";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "card"
  | "bank_transfer";

export interface IPayment {
  member: mongoose.Types.ObjectId;
  amount: number;
  feeMonth: string;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  note?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    feeMonth: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ member: 1, feeMonth: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
