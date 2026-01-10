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
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    paymentIntentId: String,
    paymentMethod: {
      type: String,
      enum: ["card", "ecocash", "bank_transfer"],
      default: "card",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);
