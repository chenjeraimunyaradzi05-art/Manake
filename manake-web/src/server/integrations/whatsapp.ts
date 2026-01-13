/**
 * WhatsApp Integration Service
 * Uses Whapi.cloud (or Meta Cloud API) for messaging
 */
import crypto from "crypto";
import axios, { AxiosInstance } from "axios";
import { BadRequestError } from "../errors";
import { logger } from "../utils/logger";

export interface WhatsAppSendOptions {
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
  mediaCaption?: string;
}

export interface WhatsAppMessageResult {
  id: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  timestamp: Date;
}

const WHAPI_API_KEY = process.env.WHAPI_API_KEY;
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || "https://gate.whapi.cloud";

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!WHAPI_API_KEY) {
    throw new BadRequestError("WHAPI_API_KEY is not configured");
  }
  if (!client) {
    client = axios.create({
      baseURL: WHAPI_BASE_URL,
      headers: {
        Authorization: `Bearer ${WHAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }
  return client;
}

function normalizePhone(phone: string): string {
  // Remove spaces, dashes, parentheses; ensure starts with country code
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  // Validate E.164-ish format (digits only, 7-15 length)
  if (!/^\d{7,15}$/.test(cleaned)) {
    throw new BadRequestError("Invalid phone number format");
  }
  return cleaned;
}

export async function sendWhatsAppMessage(
  options: WhatsAppSendOptions,
): Promise<WhatsAppMessageResult> {
  const api = getClient();
  const phone = normalizePhone(options.phoneNumber);

  const payload: Record<string, unknown> = {
    to: `${phone}@s.whatsapp.net`,
    body: options.message,
  };

  if (options.mediaUrl) {
    payload.media = { url: options.mediaUrl };
    if (options.mediaCaption) {
      payload.caption = options.mediaCaption;
    }
  }

  try {
    const response = await api.post("/messages/text", payload);
    const data = response.data as { message?: { id?: string } };
    return {
      id: data.message?.id || "unknown",
      status: "queued",
      timestamp: new Date(),
    };
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    logger.error("WhatsApp send error", {
      error: err,
      response: axiosErr.response?.data,
    });
    throw new BadRequestError("Failed to send WhatsApp message");
  }
}

export async function sendWhatsAppMedia(
  phoneNumber: string,
  mediaUrl: string,
  caption?: string,
): Promise<WhatsAppMessageResult> {
  const api = getClient();
  const phone = normalizePhone(phoneNumber);

  try {
    const response = await api.post("/messages/image", {
      to: `${phone}@s.whatsapp.net`,
      media: { url: mediaUrl },
      caption,
    });
    const data = response.data as { message?: { id?: string } };
    return {
      id: data.message?.id || "unknown",
      status: "queued",
      timestamp: new Date(),
    };
  } catch (err) {
    const axiosErr = err as { response?: { data?: unknown } };
    logger.error("WhatsApp media send error", {
      error: err,
      response: axiosErr.response?.data,
    });
    throw new BadRequestError("Failed to send WhatsApp media");
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  // Whapi uses HMAC-SHA256 signature verification
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: number;
  type: "text" | "image" | "video" | "audio" | "document" | "location";
  body?: string;
  mediaUrl?: string;
}

export function parseWebhookPayload(
  body: unknown,
): WhatsAppIncomingMessage | null {
  const payload = body as {
    messages?: Array<{
      from?: string;
      id?: string;
      timestamp?: number;
      type?: string;
      text?: { body?: string };
      image?: { url?: string };
    }>;
  };

  const msg = payload.messages?.[0];
  if (!msg) return null;

  return {
    from: msg.from || "",
    id: msg.id || "",
    timestamp: msg.timestamp || Date.now(),
    type: (msg.type as WhatsAppIncomingMessage["type"]) || "text",
    body: msg.text?.body,
    mediaUrl: msg.image?.url,
  };
}
