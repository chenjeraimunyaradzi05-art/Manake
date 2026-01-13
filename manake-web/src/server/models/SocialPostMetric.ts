import mongoose from "mongoose";

export type SocialPlatform = "instagram" | "facebook" | "twitter";

const socialPostMetricSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["instagram", "facebook", "twitter"],
    },
    postId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    sharedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

socialPostMetricSchema.index({ platform: 1, postId: 1 }, { unique: true });

export const SocialPostMetric =
  mongoose.models.SocialPostMetric ||
  mongoose.model("SocialPostMetric", socialPostMetricSchema);
