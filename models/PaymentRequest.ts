
import mongoose, { Schema, Model } from "mongoose";

export type PaymentRequestMethod = "cash" | "online";

export type PaymentRequestStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IPaymentRequest {
  member: mongoose.Types.ObjectId;
  amount: number;
  feeMonth: string;
  paymentMethod: PaymentRequestMethod;
  transactionId?: string;
  proofImageUrl?: string;
  status: PaymentRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Payment amount must be greater than zero."],
    },

    feeMonth: {
      type: String,
      required: true,
      match: [
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Invalid billing month.",
      ],
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    proofImageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },

    reviewedAt: {
      type: Date,
    },

    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Validate online payment details.
PaymentRequestSchema.pre("validate", function () {
  if (this.paymentMethod === "online") {
    if (!this.transactionId?.trim()) {
      this.invalidate(
        "transactionId",
        "Transaction ID is required for online payments."
      );
    }

    if (!this.proofImageUrl?.trim()) {
      this.invalidate(
        "proofImageUrl",
        "Payment screenshot is required for online payments."
      );
    }
  }
});

// Only one pending request per member per billing month.
PaymentRequestSchema.index(
  { member: 1, feeMonth: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
    name: "unique_pending_member_fee_month",
  }
);

const PaymentRequest: Model<IPaymentRequest> =
  mongoose.models.PaymentRequest ||
  mongoose.model<IPaymentRequest>(
    "PaymentRequest",
    PaymentRequestSchema
  );

export default PaymentRequest;
