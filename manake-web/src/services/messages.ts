import api from "./api";

export type MessageChannel =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "inapp"
  | "sms"
  | "email";

export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface MessageDto {
  id?: string;
  userId?: string;
  channel?: MessageChannel;
  direction?: MessageDirection;
  status?: MessageStatus;
  senderPhone?: string;
  senderEmail?: string;
  senderName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  content?: string;
  contentType?: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
  conversationId?: string;
  externalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function sendInAppMessage(message: string): Promise<void> {
  await api.post("/v1/messages/send", {
    channels: ["inapp"],
    message,
  });
}

export async function listMyMessages(params?: {
  page?: number;
  limit?: number;
  channel?: MessageChannel;
  status?: MessageStatus;
}): Promise<{ data: MessageDto[] }> {
  const response = await api.get<{ data: MessageDto[] }>("/v1/messages", {
    params,
  });
  return response.data;
}
