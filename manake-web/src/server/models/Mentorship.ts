import mongoose, { Document, Schema } from "mongoose";

export type MentorshipStatus = "pending" | "active" | "completed";

export interface IMentorshipMeeting {
  date: Date;
  duration?: number;
  notes?: string;
  rating?: number;
}

export interface IMentorship extends Document {
  mentor: mongoose.Types.ObjectId;
  mentee: mongoose.Types.ObjectId;
  status: MentorshipStatus;
  goals: string[];
  startDate?: Date;
  endDate?: Date;
  meetings: IMentorshipMeeting[];
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorshipMeetingSchema = new Schema<IMentorshipMeeting>(
  {
    date: { type: Date, required: true },
    duration: { type: Number },
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: true },
);

const MentorshipSchema = new Schema<IMentorship>(
  {
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    goals: { type: [String], default: [] },
    startDate: { type: Date },
    endDate: { type: Date },
    meetings: { type: [MentorshipMeetingSchema], default: [] },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true },
);

MentorshipSchema.index({ mentor: 1, status: 1 });
MentorshipSchema.index({ mentee: 1, status: 1 });

export const Mentorship =
  mongoose.models.Mentorship ||
  mongoose.model<IMentorship>("Mentorship", MentorshipSchema);
