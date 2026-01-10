/**
 * Instagram Direct Messages Integration
 * Uses Meta Graph API for Instagram DMs (requires Instagram Business account)
 */
import axios, { AxiosInstance } from "axios";
import { BadRequestError, UnauthorizedError } from "../errors";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface InstagramDMSendOptions {
  recipientId: string;
  message: string;
  accessToken: string;
  pageId: string;
}

export interface InstagramDMResult {
  recipientId: string;
  messageId: string;
  timestamp: Date;
}

export interface InstagramConversation {
  id: string;
  participantId: string;
  participantUsername?: string;
  updatedTime: string;
}

export interface InstagramMessage {
  id: string;
  from: { id: string; username?: string };
  to: { data: Array<{ id: string }> };
  message?: string;
  created_time: string;
}

function getClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: GRAPH_BASE_URL,
    params: { access_token: accessToken },
    timeout: 30000,
  });
}

/**
 * Send a direct message to an Instagram user
 * Requires: instagram_basic, instagram_manage_messages, pages_messaging permissions
 */
export async function sendInstagramDM(
  options: InstagramDMSendOptions,
): Promise<InstagramDMResult> {
  const { recipientId, message, accessToken, pageId } = options;

  if (!accessToken)
    throw new UnauthorizedError("Instagram access token required");
  if (!pageId) throw new BadRequestError("Instagram page ID required");

  const client = getClient(accessToken);

  try {
    const response = await client.post(`/${pageId}/messages`, {
      recipient: { id: recipientId },
      message: { text: message },
      messaging_type: "RESPONSE",
    });

    const data = response.data as {
      recipient_id?: string;
      message_id?: string;
    };
    return {
      recipientId: data.recipient_id || recipientId,
      messageId: data.message_id || "unknown",
      timestamp: new Date(),
    };
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error("Instagram DM send error", axiosErr.response?.data || err);
    throw new BadRequestError("Failed to send Instagram DM");
  }
}

/**
 * Fetch Instagram conversations for a page
 */
export async function getInstagramConversations(
  pageId: string,
  accessToken: string,
  limit = 25,
): Promise<InstagramConversation[]> {
  const client = getClient(accessToken);

  try {
    const response = await client.get(`/${pageId}/conversations`, {
      params: {
        platform: "instagram",
        fields: "id,participants,updated_time",
        limit,
      },
    });

    const data = response.data as {
      data?: Array<{
        id: string;
        participants?: { data?: Array<{ id: string; username?: string }> };
        updated_time?: string;
      }>;
    };

    return (data.data || []).map((conv) => ({
      id: conv.id,
      participantId: conv.participants?.data?.[0]?.id || "",
      participantUsername: conv.participants?.data?.[0]?.username,
      updatedTime: conv.updated_time || "",
    }));
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error(
      "Instagram conversations fetch error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to fetch Instagram conversations");
  }
}

/**
 * Fetch messages in a conversation
 */
export async function getInstagramMessages(
  conversationId: string,
  accessToken: string,
  limit = 50,
): Promise<InstagramMessage[]> {
  const client = getClient(accessToken);

  try {
    const response = await client.get(`/${conversationId}/messages`, {
      params: {
        fields: "id,from,to,message,created_time",
        limit,
      },
    });

    const data = response.data as { data?: InstagramMessage[] };
    return data.data || [];
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error(
      "Instagram messages fetch error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to fetch Instagram messages");
  }
}

/**
 * Parse incoming Instagram webhook message event
 */
export interface InstagramWebhookMessage {
  senderId: string;
  recipientId: string;
  timestamp: number;
  messageId: string;
  text?: string;
  attachments?: Array<{ type: string; payload?: { url?: string } }>;
}

export function parseInstagramWebhook(
  body: unknown,
): InstagramWebhookMessage | null {
  const payload = body as {
    entry?: Array<{
      messaging?: Array<{
        sender?: { id?: string };
        recipient?: { id?: string };
        timestamp?: number;
        message?: {
          mid?: string;
          text?: string;
          attachments?: Array<{ type: string; payload?: { url?: string } }>;
        };
      }>;
    }>;
  };

  const msgEvent = payload.entry?.[0]?.messaging?.[0];
  if (!msgEvent?.message) return null;

  return {
    senderId: msgEvent.sender?.id || "",
    recipientId: msgEvent.recipient?.id || "",
    timestamp: msgEvent.timestamp || Date.now(),
    messageId: msgEvent.message.mid || "",
    text: msgEvent.message.text,
    attachments: msgEvent.message.attachments,
  };
}
