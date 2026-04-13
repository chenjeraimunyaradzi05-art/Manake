/** Prisma stub — schema: prisma/schema.prisma */
export type { Message } from "@prisma/client";
export type MessageChannel =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "inapp"
  | "sms"
  | "email";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";
