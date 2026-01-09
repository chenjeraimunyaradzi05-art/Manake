/**
 * Message Model
 * Stores messages from all channels (WhatsApp, Instagram, Facebook, In-app)
 */
import mongoose, { Document, Schema } from 'mongoose';

// Message channels
export type MessageChannel = 'whatsapp' | 'instagram' | 'facebook' | 'inapp' | 'sms' | 'email';

// Message direction
export type MessageDirection = 'inbound' | 'outbound';

// Message status
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// Message document interface
export interface IMessage extends Document {
  channel: MessageChannel;
  direction: MessageDirection;
  status: MessageStatus;
  
  // Sender/Recipient info
  externalId?: string;        // External message ID (from WhatsApp, etc.)
  senderPhone?: string;       // Phone number for WhatsApp/SMS
  senderEmail?: string;       // Email for email channel
  senderName?: string;        // Display name
  recipientPhone?: string;
  recipientEmail?: string;
  
  // Content
  content: string;
  contentType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  
  // Metadata
  metadata: Record<string, unknown>;
  
  // Threading
  conversationId?: string;
  replyToMessageId?: mongoose.Types.ObjectId;
  
  // User association (if logged in)
  userId?: mongoose.Types.ObjectId;
  
  // Timestamps
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    channel: {
      type: String,
      enum: ['whatsapp', 'instagram', 'facebook', 'inapp', 'sms', 'email'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    externalId: {
      type: String,
      index: true,
    },
    senderPhone: {
      type: String,
      index: true,
    },
    senderEmail: {
      type: String,
      index: true,
    },
    senderName: {
      type: String,
    },
    recipientPhone: {
      type: String,
    },
    recipientEmail: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
    },
    mediaMimeType: {
      type: String,
    },
    mediaSize: {
      type: Number,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    conversationId: {
      type: String,
      index: true,
    },
    replyToMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, channel: 1 });

// Text index for message search
messageSchema.index({ content: 'text', senderName: 'text' });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
