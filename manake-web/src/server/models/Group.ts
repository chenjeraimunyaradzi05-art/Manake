import mongoose, { Document, Schema } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    icon: { type: String },
    category: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    moderators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

GroupSchema.index({ name: 1 });

export const Group = mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);
