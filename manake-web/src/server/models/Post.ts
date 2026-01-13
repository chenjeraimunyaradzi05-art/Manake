import mongoose, { Document, Schema } from "mongoose";

export type PostScope = "public" | "connections" | "mentors";

export interface IPostMedia {
  url: string;
  type: string;
  alt?: string;
}

export interface IPostComment {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPostShare {
  platform: string;
  sharedAt: Date;
}

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  media: IPostMedia[];
  scope: PostScope;
  mood?: string;
  likes: mongoose.Types.ObjectId[];
  comments: IPostComment[];
  shares: IPostShare[];
  createdAt: Date;
  updatedAt: Date;
}

const PostMediaSchema = new Schema<IPostMedia>(
  {
    url: { type: String, required: true },
    type: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false },
);

const PostCommentSchema = new Schema<IPostComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const PostShareSchema = new Schema<IPostShare>(
  {
    platform: { type: String, required: true },
    sharedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    media: { type: [PostMediaSchema], default: [] },
    scope: {
      type: String,
      enum: ["public", "connections", "mentors"],
      default: "public",
    },
    mood: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: { type: [PostCommentSchema], default: [] },
    shares: { type: [PostShareSchema], default: [] },
  },
  { timestamps: true },
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ likes: 1 });
PostSchema.index({ content: "text" });

export const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
