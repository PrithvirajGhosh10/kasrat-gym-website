
import mongoose, { Schema, Model } from "mongoose";

export type FeeChangeRequestStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IFeeChangeRequest {
  member: mongoose.Types.ObjectId;
  currentFee: number;
  requestedFee: number;
  reason?: string;
  status: FeeChangeRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  effectiveFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeChangeRequestSchema = new Schema<IFeeChangeRequest>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    currentFee: {
      type: Number,
      required: true,
      min: 0,
    },

    requestedFee: {
      type: Number,
      required: true,
      min: 1,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
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

    effectiveFrom: {
      type: String,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
  },
  {
    timestamps: true,
  }
);

// A member can have only one pending fee-change request at a time.
FeeChangeRequestSchema.index(
  { member: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  }
);

const FeeChangeRequest: Model<IFeeChangeRequest> =
  mongoose.models.FeeChangeRequest ||
  mongoose.model<IFeeChangeRequest>(
    "FeeChangeRequest",
    FeeChangeRequestSchema
  );

export default FeeChangeRequest;
