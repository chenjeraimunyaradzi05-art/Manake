/** Prisma stub — schema: prisma/schema.prisma */
export type { WebhookEvent as IWebhookEvent } from "@prisma/client";
export type WebhookSource =
  | "stripe"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google"
  | "other";
export type WebhookStatus = "received" | "processing" | "processed" | "failed";
