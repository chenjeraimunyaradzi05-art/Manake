/**
 * SocialAccount Model
 * Stores social media account connections for users
 */
import mongoose, { Document, Schema } from "mongoose";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "whatsapp"
  | "google"
  | "apple";

export interface ISocialAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: SocialPlatform;

  // Account info
  platformUserId: string;
  platformUsername?: string;
  displayName?: string;
  profilePictureUrl?: string;

  // Tokens
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;

  // Permissions/Scopes
  scopes: string[];

  // Page info (for Facebook pages)
  pageId?: string;
  pageName?: string;
  pageAccessToken?: string;

  // Status
  isActive: boolean;
  lastSyncAt?: Date;
  syncError?: string;

  createdAt: Date;
  updatedAt: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "twitter", "whatsapp", "google", "apple"],
      required: true,
    },
    platformUserId: {
      type: String,
      required: true,
    },
    platformUsername: {
      type: String,
    },
    displayName: {
      type: String,
    },
    profilePictureUrl: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
      select: false, // Don't include by default
    },
    refreshToken: {
      type: String,
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
    },
    scopes: {
      type: [String],
      default: [],
    },
    pageId: {
      type: String,
    },
    pageName: {
      type: String,
    },
    pageAccessToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
    },
    syncError: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index
socialAccountSchema.index(
  { userId: 1, platform: 1, platformUserId: 1 },
  { unique: true },
);

// Indexes for queries
socialAccountSchema.index({ userId: 1 });
socialAccountSchema.index({ platform: 1, isActive: 1 });

// Check if token is expired
socialAccountSchema.methods.isTokenExpired = function (): boolean {
  if (!this.tokenExpiresAt) return false;
  return new Date() >= this.tokenExpiresAt;
};

// Update tokens
socialAccountSchema.methods.updateTokens = async function (
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date,
): Promise<void> {
  this.accessToken = accessToken;
  if (refreshToken) this.refreshToken = refreshToken;
  if (expiresAt) this.tokenExpiresAt = expiresAt;
  await this.save();
};

export const SocialAccount = mongoose.model<ISocialAccount>(
  "SocialAccount",
  socialAccountSchema,
);
