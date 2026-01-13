import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "connection"
  | "like"
  | "comment"
  | "mention"
  | "message"
  | "mentorship";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title?: string;
  message?: string;
  data?: unknown;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "connection",
        "like",
        "comment",
        "mention",
        "message",
        "mentorship",
      ],
      required: true,
    },
    title: { type: String },
    message: { type: String },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
