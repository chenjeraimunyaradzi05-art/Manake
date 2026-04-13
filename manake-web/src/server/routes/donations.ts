import { Router, Request, Response } from "express";
import { createPaymentIntent } from "../controllers/donationController";
import { legacyAuthenticate } from "../controllers/mobileAuthController";
import { prisma } from "../config/prisma";

const router = Router();

router.post("/create-payment-intent", createPaymentIntent);

type LegacySuccess<T> = { success: true; data: T; message?: string };
type LegacyFailure = { success: false; data: null; message: string };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function ok<T>(res: Response, data: T, message?: string): void {
  const payload: LegacySuccess<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  res.json(payload);
}

function fail(res: Response, message: string): void {
  const payload: LegacyFailure = { success: false, data: null, message };
  res.json(payload);
}

function normalizeDonationForMobile(rawInput: unknown) {
  const raw = asRecord(rawInput);

  const statusValue = raw["status"];
  const status: "pending" | "completed" | "failed" | "refunded" =
    statusValue === "succeeded"
      ? "completed"
      : statusValue === "completed" ||
          statusValue === "pending" ||
          statusValue === "failed" ||
          statusValue === "refunded"
        ? statusValue
        : "pending";

  const paymentMethodValue = raw["paymentMethod"];
  const paymentMethod: "card" | "ecocash" | "bank" =
    paymentMethodValue === "bank_transfer"
      ? "bank"
      : paymentMethodValue === "bank" ||
          paymentMethodValue === "card" ||
          paymentMethodValue === "ecocash"
        ? paymentMethodValue
        : "card";

  const currencyValue = raw["currency"];
  const currency =
    typeof currencyValue === "string" && currencyValue.trim()
      ? currencyValue.trim().toLowerCase()
      : "usd";

  const createdAtValue = raw["createdAt"];
  const createdAtDate =
    createdAtValue instanceof Date
      ? createdAtValue
      : typeof createdAtValue === "string" || typeof createdAtValue === "number"
        ? new Date(createdAtValue)
        : createdAtValue
          ? new Date(String(createdAtValue))
          : null;
  const createdAt =
    createdAtDate && !Number.isNaN(createdAtDate.getTime())
      ? createdAtDate.toISOString()
      : new Date().toISOString();

  const idValue = raw["_id"] ?? raw["id"];
  const id =
    typeof idValue === "string"
      ? idValue
      : typeof idValue === "number"
        ? String(idValue)
        : idValue
          ? String(idValue)
          : "";

  const amountValue = raw["amount"];
  const amount =
    typeof amountValue === "number"
      ? amountValue
      : typeof amountValue === "string"
        ? Number(amountValue)
        : 0;

  const isAnonymous = raw["isAnonymous"] === true;
  const donorNameValue = raw["donorName"];
  const donorName = isAnonymous
    ? "Anonymous"
    : typeof donorNameValue === "string"
      ? donorNameValue
      : donorNameValue
        ? String(donorNameValue)
        : undefined;

  const donorEmailValue = raw["donorEmail"];
  const donorEmail =
    typeof donorEmailValue === "string"
      ? donorEmailValue
      : donorEmailValue
        ? String(donorEmailValue)
        : "";

  const recurring = raw["recurring"] === true;

  const purposeValue = raw["purpose"];
  const purpose =
    typeof purposeValue === "string" && purposeValue.trim()
      ? purposeValue.trim()
      : "general_donation";

  return {
    id,
    amount: Number.isFinite(amount) ? amount : 0,
    currency,
    ...(donorName ? { donorName } : {}),
    donorEmail,
    recurring,
    paymentMethod,
    status,
    purpose,
    createdAt,
  };
}

router.get(
  "/history",
  legacyAuthenticate,
  async (req: Request, res: Response) => {
    try {
      const email = req.user?.email;
      if (!email) {
        fail(res, "Authentication required");
        return;
      }

      const donations = await prisma.donation.findMany({
        where: { donorEmail: email },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      ok(res, donations.map(normalizeDonationForMobile));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load donations";
      fail(res, message);
    }
  },
);

router.get(
  "/stats",
  legacyAuthenticate,
  async (req: Request, res: Response) => {
    try {
      const email = req.user?.email;
      if (!email) {
        fail(res, "Authentication required");
        return;
      }

      const agg = await prisma.donation.aggregate({
        where: {
          donorEmail: email,
          status: { in: ["completed", "succeeded"] },
        },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
      });

      ok(res, {
        total: agg._sum.amount ?? 0,
        count: agg._count.id ?? 0,
        average: agg._avg.amount ?? 0,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load stats";
      fail(res, message);
    }
  },
);

router.get("/:id", legacyAuthenticate, async (req: Request, res: Response) => {
  try {
    const email = req.user?.email;
    if (!email) {
      fail(res, "Authentication required");
      return;
    }

    const { id } = req.params;
    if (!id || typeof id !== "string" || id.length < 1) {
      fail(res, "Donation not found");
      return;
    }

    const donation = await prisma.donation.findFirst({
      where: { id, donorEmail: email },
    });

    if (!donation) {
      fail(res, "Donation not found");
      return;
    }

    ok(res, normalizeDonationForMobile(donation));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load donation";
    fail(res, message);
  }
});

export default router;
