/**
 * WebhookEvent Model
 * Logs incoming webhooks for debugging and replay
 */
import mongoose, { Document, Schema } from "mongoose";

export type WebhookSource =
  | "stripe"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google"
  | "other";
export type WebhookStatus = "received" | "processing" | "processed" | "failed";

export interface IWebhookEvent extends Document {
  source: WebhookSource;
  eventType: string;
  eventId?: string;
  status: WebhookStatus;

  // Request data
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  signature?: string;

  // Processing info
  processedAt?: Date;
  processingDuration?: number;
  error?: string;
  retryCount: number;
  maxRetries: number;

  // IP tracking
  ipAddress?: string;

  createdAt: Date;
  updatedAt: Date;

  markProcessed(duration: number): Promise<void>;
  markFailed(error: string): Promise<void>;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    source: {
      type: String,
      enum: ["stripe", "whatsapp", "instagram", "facebook", "google", "other"],
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["received", "processing", "processed", "failed"],
      default: "received",
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    signature: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
    processingDuration: {
      type: Number,
    },
    error: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
webhookEventSchema.index({ source: 1, createdAt: -1 });
webhookEventSchema.index({ status: 1 });
webhookEventSchema.index(
  { eventId: 1, source: 1 },
  { unique: true, sparse: true },
);

// TTL index - delete old events after 30 days
webhookEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);

// Mark as processed
webhookEventSchema.methods.markProcessed = async function (
  duration: number,
): Promise<void> {
  this.status = "processed";
  this.processedAt = new Date();
  this.processingDuration = duration;
  await this.save();
};

// Mark as failed
webhookEventSchema.methods.markFailed = async function (
  error: string,
): Promise<void> {
  this.status = "failed";
  this.error = error;
  this.retryCount += 1;
  await this.save();
};

export const WebhookEvent = mongoose.model<IWebhookEvent>(
  "WebhookEvent",
  webhookEventSchema,
);
