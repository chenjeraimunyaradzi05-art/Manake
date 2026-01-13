import mongoose, { Document, Schema } from "mongoose";

export interface IInternalPost extends Document {
  author: mongoose.Types.ObjectId; // User ID
  content: string;
  mediaUrls: string[]; // Array of image/video URLs
  mediaType?: "image" | "video" | "none"; // Simplified type
  likes: mongoose.Types.ObjectId[]; // User IDs who liked
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InternalPostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 },
    mediaUrls: [{ type: String }],
    mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Index for feed retrieval (reverse chronological)
InternalPostSchema.index({ createdAt: -1 });

export const InternalPost =
  mongoose.models.InternalPost ||
  mongoose.model<IInternalPost>("InternalPost", InternalPostSchema);
