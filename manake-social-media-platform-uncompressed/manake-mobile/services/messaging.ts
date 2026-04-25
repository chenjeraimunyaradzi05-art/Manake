/**
 * Messaging API service for mobile app
 */
import { Platform } from "react-native";
import { getAuthToken } from "./api";

const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001/api",
      android: "http://10.0.2.2:3001/api",
      default: "http://localhost:3001/api",
    })
  : "https://manake.netlify.app/api";

export type MessagingChannel =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "inapp"
  | "sms"
  | "email";

export interface Message {
  id: string;
  channel: MessagingChannel;
  direction: "inbound" | "outbound";
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  content: string;
  contentType: "text" | "image" | "video" | "audio" | "document" | "location";
  mediaUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  channels: MessagingChannel[];
  message: string;
  recipientPhone?: string;
  recipientId?: string;
  mediaUrl?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const messagingApi = {
  getHistory: async (
    channel?: MessagingChannel,
    limit = 50,
  ): Promise<Message[]> => {
    const query = channel
      ? `?channel=${channel}&limit=${limit}`
      : `?limit=${limit}`;
    const data = await fetchApi<{ data: Message[] }>(`/v1/messages${query}`);
    return data.data || [];
  },

  send: async (
    request: SendMessageRequest,
  ): Promise<{
    results: Array<{ channel: string; success: boolean; messageId?: string }>;
  }> => {
    return fetchApi("/v1/messages/send", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  markRead: async (messageId: string): Promise<void> => {
    await fetchApi(`/v1/messages/${messageId}/read`, { method: "PATCH" });
  },

  search: async (query: string, limit = 50): Promise<Message[]> => {
    const data = await fetchApi<{ data: Message[] }>(
      `/v1/messages/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return data.data || [];
  },
};
