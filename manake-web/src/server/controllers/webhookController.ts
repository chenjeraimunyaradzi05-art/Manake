import { Request, Response } from "express";
import crypto from "crypto";
import { WebhookEvent, WebhookSource } from "../models/WebhookEvent";
import { ApiError } from "../errors";

const resolveSource = (provider: string): WebhookSource => {
  if (
    ["instagram", "facebook", "whatsapp", "stripe", "google"].includes(provider)
  ) {
    return provider as WebhookSource;
  }
  return "other";
};

const getSecretForProvider = (provider: string): string | undefined => {
  const key = `WEBHOOK_SECRET_${provider.toUpperCase()}`;
  return process.env[key];
};

const verifySignature = (
  provided: string | undefined,
  expectedSecret: string | undefined,
  payload: Record<string, unknown>,
): boolean => {
  if (!expectedSecret) {
    // In production we must not accept unsigned webhooks
    return process.env.NODE_ENV !== "production";
  }
  if (!provided) return false;

  const computed = crypto
    .createHmac("sha256", expectedSecret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(computed));
};

export const ingestWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawProvider = req.params.provider;
  const provider = Array.isArray(rawProvider)
    ? rawProvider[0]
    : rawProvider || "other";
  const source = resolveSource(provider);
  const started = Date.now();
  const signature = (req.headers["x-webhook-signature"] ||
    req.headers["x-signature"]) as string | undefined;
  const eventId = (req.headers["x-event-id"] || req.headers["x-request-id"]) as
    | string
    | undefined;
  const eventType = (req.headers["x-event-type"] ||
    req.headers["x-message-type"]) as string | undefined;
  const expectedSecret = getSecretForProvider(provider);

  const event = await WebhookEvent.create({
    source,
    eventType: eventType || "unknown",
    eventId,
    status: "received",
    headers: req.headers as Record<string, string>,
    payload: req.body as Record<string, unknown>,
    signature,
    ipAddress: req.ip,
  });

  const isValid = verifySignature(signature, expectedSecret, req.body || {});
  if (!isValid) {
    await event.markFailed("Signature verification failed");
    throw new ApiError("Invalid webhook signature", 401, "INVALID_SIGNATURE");
  }

  const duration = Date.now() - started;
  await event.markProcessed(duration);

  res.json({ status: "ok", processedInMs: duration });
};
