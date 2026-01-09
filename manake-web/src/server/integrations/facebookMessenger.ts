/**
 * Facebook Messenger Integration
 * Uses Meta Graph API for Messenger
 */
import crypto from "crypto";
import axios, { AxiosInstance } from "axios";
import { BadRequestError, UnauthorizedError } from "../errors";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface MessengerSendOptions {
  recipientId: string;
  message: string;
  accessToken: string;
  pageId: string;
  quickReplies?: Array<{
    content_type: "text";
    title: string;
    payload: string;
  }>;
}

export interface MessengerSendResult {
  recipientId: string;
  messageId: string;
  timestamp: Date;
}

export interface MessengerConversation {
  id: string;
  participantId: string;
  participantName?: string;
  updatedTime: string;
}

export interface MessengerMessage {
  id: string;
  from: { id: string; name?: string };
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
 * Send a Messenger message
 */
export async function sendMessengerMessage(
  options: MessengerSendOptions,
): Promise<MessengerSendResult> {
  const { recipientId, message, accessToken, pageId, quickReplies } = options;

  if (!accessToken) throw new UnauthorizedError("Page access token required");
  if (!pageId) throw new BadRequestError("Page ID required");

  const client = getClient(accessToken);

  const payload: Record<string, unknown> = {
    recipient: { id: recipientId },
    message: { text: message },
    messaging_type: "RESPONSE",
  };

  if (quickReplies?.length) {
    (payload.message as Record<string, unknown>).quick_replies = quickReplies;
  }

  try {
    const response = await client.post(`/${pageId}/messages`, payload);

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
    console.error("Messenger send error", axiosErr.response?.data || err);
    throw new BadRequestError("Failed to send Messenger message");
  }
}

/**
 * Send a template message (buttons, generic, etc.)
 */
export async function sendMessengerTemplate(
  pageId: string,
  accessToken: string,
  recipientId: string,
  template: Record<string, unknown>,
): Promise<MessengerSendResult> {
  const client = getClient(accessToken);

  try {
    const response = await client.post(`/${pageId}/messages`, {
      recipient: { id: recipientId },
      message: { attachment: { type: "template", payload: template } },
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
    console.error(
      "Messenger template send error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to send Messenger template");
  }
}

/**
 * Fetch Messenger conversations for a page
 */
export async function getMessengerConversations(
  pageId: string,
  accessToken: string,
  limit = 25,
): Promise<MessengerConversation[]> {
  const client = getClient(accessToken);

  try {
    const response = await client.get(`/${pageId}/conversations`, {
      params: {
        fields: "id,participants,updated_time",
        limit,
      },
    });

    const data = response.data as {
      data?: Array<{
        id: string;
        participants?: { data?: Array<{ id: string; name?: string }> };
        updated_time?: string;
      }>;
    };

    return (data.data || []).map((conv) => ({
      id: conv.id,
      participantId: conv.participants?.data?.[0]?.id || "",
      participantName: conv.participants?.data?.[0]?.name,
      updatedTime: conv.updated_time || "",
    }));
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error(
      "Messenger conversations fetch error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to fetch Messenger conversations");
  }
}

/**
 * Fetch messages in a conversation
 */
export async function getMessengerMessages(
  conversationId: string,
  accessToken: string,
  limit = 50,
): Promise<MessengerMessage[]> {
  const client = getClient(accessToken);

  try {
    const response = await client.get(`/${conversationId}/messages`, {
      params: {
        fields: "id,from,to,message,created_time",
        limit,
      },
    });

    const data = response.data as { data?: MessengerMessage[] };
    return data.data || [];
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error(
      "Messenger messages fetch error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to fetch Messenger messages");
  }
}

/**
 * Get user profile from Messenger
 */
export async function getMessengerUserProfile(
  userId: string,
  accessToken: string,
): Promise<{ id: string; name?: string; profilePic?: string }> {
  const client = getClient(accessToken);

  try {
    const response = await client.get(`/${userId}`, {
      params: { fields: "id,name,profile_pic" },
    });

    const data = response.data as {
      id: string;
      name?: string;
      profile_pic?: string;
    };
    return {
      id: data.id,
      name: data.name,
      profilePic: data.profile_pic,
    };
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    console.error(
      "Messenger user profile fetch error",
      axiosErr.response?.data || err,
    );
    throw new BadRequestError("Failed to fetch Messenger user profile");
  }
}

/**
 * Parse incoming Messenger webhook event
 */
export interface MessengerWebhookMessage {
  senderId: string;
  recipientId: string;
  timestamp: number;
  messageId: string;
  text?: string;
  attachments?: Array<{ type: string; payload?: { url?: string } }>;
  quickReply?: { payload: string };
  postback?: { title: string; payload: string };
}

export function parseMessengerWebhook(
  body: unknown,
): MessengerWebhookMessage | null {
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
          quick_reply?: { payload: string };
        };
        postback?: { title: string; payload: string };
      }>;
    }>;
  };

  const msgEvent = payload.entry?.[0]?.messaging?.[0];
  if (!msgEvent) return null;

  // Could be a message or a postback
  const message = msgEvent.message;
  const postback = msgEvent.postback;

  if (!message && !postback) return null;

  return {
    senderId: msgEvent.sender?.id || "",
    recipientId: msgEvent.recipient?.id || "",
    timestamp: msgEvent.timestamp || Date.now(),
    messageId: message?.mid || "",
    text: message?.text,
    attachments: message?.attachments,
    quickReply: message?.quick_reply,
    postback,
  };
}

/**
 * Verify Facebook webhook signature
 */
export function verifyMessengerWebhook(
  payload: string,
  signature: string,
  appSecret: string,
): boolean {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    return false;
  }
}
