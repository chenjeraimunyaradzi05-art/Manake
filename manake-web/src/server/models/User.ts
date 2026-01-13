/**
 * User Model
 * Handles user authentication and profile data
 */
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// User roles
export type UserRole = "user" | "admin" | "moderator";

// User document interface
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
  lastLogin?: Date;
  socialProfiles: {
    google?: string;
    facebook?: string;
    apple?: string;
  };
  profile?: {
    bio?: string;
    headline?: string;
    bannerImage?: string;
    location?: string;
    interests?: string[];
    skills?: string[];
  };
  mentorship?: {
    isMentor?: boolean;
    mentorshipStyle?: string;
    yearsInRecovery?: number;
    specializations?: string[];
    availability?: {
      hoursPerWeek?: number;
      preferredTimes?: string[];
    };
    averageRating?: number;
  };
  milestones?: {
    recoveryDaysCount?: number;
    lastMilestoneReached?: Date;
    milestones?: Array<{ date: Date; days: number; title: string }>;
  };
  privacy?: {
    visibility?: "public" | "connections-only" | "private";
    allowMessages?: "anyone" | "connections" | "none";
    allowMentorRequests?: boolean;
    showConnectionList?: boolean;
    showActivityFeed?: boolean;
    blockList?: mongoose.Types.ObjectId[];
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Partial<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't include by default in queries
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+263[0-9]{9}$/, "Please enter a valid Zimbabwe phone number"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockoutUntil: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    socialProfiles: {
      google: String,
      facebook: String,
      apple: String,
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      headline: { type: String },
      bannerImage: { type: String },
      location: { type: String },
      interests: [{ type: String }],
      skills: [{ type: String }],
    },
    mentorship: {
      isMentor: { type: Boolean, default: false },
      mentorshipStyle: { type: String },
      yearsInRecovery: { type: Number },
      specializations: [{ type: String }],
      availability: {
        hoursPerWeek: { type: Number },
        preferredTimes: [{ type: String }],
      },
      averageRating: { type: Number },
    },
    milestones: {
      recoveryDaysCount: { type: Number },
      lastMilestoneReached: { type: Date },
      milestones: [
        {
          date: { type: Date },
          days: { type: Number },
          title: { type: String },
        },
      ],
    },
    privacy: {
      visibility: {
        type: String,
        enum: ["public", "connections-only", "private"],
        default: "public",
      },
      allowMessages: {
        type: String,
        enum: ["anyone", "connections", "none"],
        default: "connections",
      },
      allowMentorRequests: { type: Boolean, default: true },
      showConnectionList: { type: Boolean, default: true },
      showActivityFeed: { type: Boolean, default: true },
      blockList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
// email: 1 is already indexed via unique: true in schema
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ name: "text", "profile.bio": "text" });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;

  // Only hash if it looks like a plain password (not already hashed)
  if (!this.passwordHash.startsWith("$2")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

// Update lastLogin on login
userSchema.methods.updateLastLogin = async function (): Promise<void> {
  this.lastLogin = new Date();
  await this.save();
};

// Compare password for login
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Return public user data (without sensitive fields)
userSchema.methods.toPublicJSON = function (): Record<string, unknown> {
  return {
    id: this._id?.toString(),
    email: this.email,
    name: this.name,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    isEmailVerified: this.isEmailVerified,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select("+passwordHash");
};

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
