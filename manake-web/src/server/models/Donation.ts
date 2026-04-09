import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    donorName: {
      type: String,
      required: true,
    },
    donorEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["one-time", "monthly"],
      default: "one-time",
    },
    purpose: {
      type: String,
      default: "general_donation",
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: String,
    reference: {
      type: String,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "ecocash", "bank", "bank_transfer"],
      default: "card",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);
