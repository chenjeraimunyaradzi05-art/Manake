import mongoose, { Document, Schema } from "mongoose";

export interface IAttachment {
  type: "image" | "video" | "document";
  url: string;
  name?: string;
  size?: number;
}

export interface IConversation extends Document {
  participants: string[]; // User IDs
  type: "direct" | "group";
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  admins?: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    groupName: { type: String },
    groupAvatar: { type: String },
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema,
);
