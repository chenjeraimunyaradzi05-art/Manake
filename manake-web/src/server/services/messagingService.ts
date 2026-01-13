/**
 * Unified Messaging Service
 * Abstraction layer for WhatsApp, Instagram DM, and Facebook Messenger
 */
import { Message, IMessage } from "../models/Message";
import { SocialAccount, ISocialAccount } from "../models/SocialAccount";
import {
  sendWhatsAppMessage,
  WhatsAppSendOptions,
  WhatsAppMessageResult,
} from "../integrations/whatsapp";
import {
  sendInstagramDM,
  InstagramDMSendOptions,
  InstagramDMResult,
} from "../integrations/instagramDM";
import {
  sendMessengerMessage,
  MessengerSendOptions,
  MessengerSendResult,
} from "../integrations/facebookMessenger";
import { NotFoundError } from "../errors";
import { logger } from "../utils/logger";

export type MessagingChannel =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "inapp"
  | "sms"
  | "email";

export interface UnifiedSendOptions {
  userId: string;
  channels: MessagingChannel[];
  message: string;
  recipientPhone?: string; // for whatsapp/sms
  recipientId?: string; // for instagram/facebook (PSID or IGSID)
  mediaUrl?: string;
}

export interface UnifiedSendResult {
  channel: MessagingChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

async function getSocialAccount(
  userId: string,
  platform: "instagram" | "facebook",
): Promise<ISocialAccount | null> {
  return SocialAccount.findOne({
    userId,
    platform,
    isActive: true,
  });
}

export async function sendUnifiedMessage(
  options: UnifiedSendOptions,
): Promise<UnifiedSendResult[]> {
  const { userId, channels, message, recipientPhone, recipientId, mediaUrl } =
    options;
  const results: UnifiedSendResult[] = [];

  for (const channel of channels) {
    let result: UnifiedSendResult = { channel, success: false };

    try {
      switch (channel) {
        case "whatsapp": {
          if (!recipientPhone) {
            result.error = "Recipient phone required for WhatsApp";
            break;
          }
          const waOptions: WhatsAppSendOptions = {
            phoneNumber: recipientPhone,
            message,
            mediaUrl,
          };
          const waResult: WhatsAppMessageResult =
            await sendWhatsAppMessage(waOptions);
          result = { channel, success: true, messageId: waResult.id };
          break;
        }

        case "instagram": {
          if (!recipientId) {
            result.error = "Recipient ID required for Instagram";
            break;
          }
          const igAccount = await getSocialAccount(userId, "instagram");
          if (!igAccount?.accessToken || !igAccount.pageId) {
            result.error = "Instagram account not connected or missing page";
            break;
          }
          const igOptions: InstagramDMSendOptions = {
            recipientId,
            message,
            accessToken: igAccount.accessToken,
            pageId: igAccount.pageId,
          };
          const igResult: InstagramDMResult = await sendInstagramDM(igOptions);
          result = { channel, success: true, messageId: igResult.messageId };
          break;
        }

        case "facebook": {
          if (!recipientId) {
            result.error = "Recipient ID required for Facebook Messenger";
            break;
          }
          const fbAccount = await getSocialAccount(userId, "facebook");
          if (!fbAccount?.accessToken || !fbAccount.pageId) {
            result.error = "Facebook account not connected or missing page";
            break;
          }
          const fbOptions: MessengerSendOptions = {
            recipientId,
            message,
            accessToken: fbAccount.accessToken,
            pageId: fbAccount.pageId,
          };
          const fbResult: MessengerSendResult =
            await sendMessengerMessage(fbOptions);
          result = { channel, success: true, messageId: fbResult.messageId };
          break;
        }

        case "inapp":
          // Store directly in DB, no external send
          result = { channel, success: true, messageId: "inapp-" + Date.now() };
          break;

        case "sms":
        case "email":
          // Placeholder for future SMS/email integrations (Twilio, SendGrid)
          result.error = `${channel} channel not yet implemented`;
          break;

        default:
          result.error = `Unknown channel: ${channel}`;
      }
    } catch (err) {
      result.error = (err as Error).message || "Unknown error";
    }

    // Persist message to DB
    try {
      await Message.create({
        userId,
        channel,
        direction: "outbound",
        status: result.success ? "sent" : "failed",
        recipientPhone:
          channel === "whatsapp" || channel === "sms"
            ? recipientPhone
            : undefined,
        content: message,
        contentType: mediaUrl ? "image" : "text",
        mediaUrl,
        externalId: result.messageId,
        metadata: result.error ? { error: result.error } : undefined,
      });
    } catch (dbErr) {
      logger.error("Failed to persist message", { error: dbErr });
    }

    results.push(result);
  }

  return results;
}

export async function getMessageHistory(
  userId: string,
  channel?: MessagingChannel,
  limit = 50,
  skip = 0,
): Promise<IMessage[]> {
  const query: Record<string, unknown> = { userId };
  if (channel) query.channel = channel;

  return Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

export async function getConversation(
  userId: string,
  conversationId: string,
  limit = 100,
): Promise<IMessage[]> {
  return Message.find({ userId, conversationId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

export async function markMessageRead(messageId: string): Promise<IMessage> {
  const message = await Message.findByIdAndUpdate(
    messageId,
    { status: "read", readAt: new Date() },
    { new: true },
  );
  if (!message) throw new NotFoundError("Message");
  return message;
}

export async function searchMessages(
  userId: string,
  query: string,
  limit = 50,
): Promise<IMessage[]> {
  return Message.find({
    userId,
    content: { $regex: query, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
