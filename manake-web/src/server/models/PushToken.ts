/**
 * Push Token Model
 * Stores push notification tokens for users/devices
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IPushToken extends Document {
  userId?: mongoose.Types.ObjectId;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pushTokenSchema = new Schema<IPushToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    deviceId: {
      type: String,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for user lookup
pushTokenSchema.index({ userId: 1, isActive: 1 });

export const PushToken = mongoose.model<IPushToken>('PushToken', pushTokenSchema);
