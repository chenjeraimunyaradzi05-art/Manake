import mongoose, { Document, Schema } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";
export type ConnectionType = "mentor" | "peer" | "professional";

export interface IConnection extends Document {
  userId: mongoose.Types.ObjectId;
  connectedUserId: mongoose.Types.ObjectId;
  status: ConnectionStatus;
  connectionType: ConnectionType;
  initiatedAt: Date;
  acceptedAt?: Date;
  strength: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    connectedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    connectionType: {
      type: String,
      enum: ["mentor", "peer", "professional"],
      default: "peer",
    },
    initiatedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    strength: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

ConnectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });
ConnectionSchema.index({ connectedUserId: 1, status: 1 });

export const Connection =
  mongoose.models.Connection ||
  mongoose.model<IConnection>("Connection", ConnectionSchema);
