import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireStripe } from "../config/stripe";
import { logger } from "../utils/logger";

// Validation constants
const MIN_DONATION_CENTS = 100; // $1 minimum
const MAX_DONATION_CENTS = 10000000; // $100,000 maximum
const ALLOWED_CURRENCIES = ["usd", "zwl"];

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency = "usd",
      donorName,
      donorEmail,
      recurring,
      paymentMethod = "card",
      isAnonymous,
      message,
      frequency,
      purpose,
    } = req.body;

    // Validate amount (frontend sends cents)
    const amountCents = parseInt(amount, 10);
    if (isNaN(amountCents) || amountCents < MIN_DONATION_CENTS) {
      return res
        .status(400)
        .json({ message: `Minimum donation is $${MIN_DONATION_CENTS / 100}` });
    }
    if (amountCents > MAX_DONATION_CENTS) {
      return res
        .status(400)
        .json({ message: `Maximum donation is $${MAX_DONATION_CENTS / 100}` });
    }

    // Validate currency
    if (!ALLOWED_CURRENCIES.includes(currency.toLowerCase())) {
      return res.status(400).json({
        message: `Currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}`,
      });
    }

    // Validate email
    if (!donorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return res
        .status(400)
        .json({ message: "Valid email address is required" });
    }

    // Generate a unique reference for this donation
    const reference = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const amountDollars = amountCents / 100;

    const normalizedPurpose =
      typeof purpose === "string" && purpose.trim()
        ? purpose.trim()
        : "general_donation";

    const recurringFlag = Boolean(recurring);
    const donationType = recurringFlag ? "monthly" : "one-time";

    const normalizedPaymentMethod =
      paymentMethod === "bank_transfer" ? "bank" : paymentMethod;

    const normalizedCurrency =
      typeof currency === "string" && currency.trim()
        ? currency.trim().toUpperCase()
        : "USD";

    // Handle different payment methods
    if (paymentMethod === "card") {
      const stripe = requireStripe();
      // Create a Stripe Checkout Session (cleaner than PaymentIntent for donations)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: recurringFlag ? "subscription" : "payment",
        customer_email: donorEmail,
        line_items: [
          {
            price_data: {
              currency: normalizedCurrency.toLowerCase(),
              product_data: {
                name: "Donation to Manake Rehabilitation Center",
                description:
                  normalizedPurpose ||
                  "General donation to support youth recovery programs",
              },
              unit_amount: amountCents,
              ...(recurringFlag && { recurring: { interval: "month" } }),
            },
            quantity: 1,
          },
        ],
        metadata: {
          donorName: donorName || "Anonymous",
          donorEmail,
          purpose: normalizedPurpose,
          reference,
        },
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/thank-you?ref=${reference}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/donate`,
      });

      await prisma.donation.create({
        data: {
          amount: amountDollars,
          currency: normalizedCurrency,
          donorName: donorName || "Anonymous",
          donorEmail,
          type: donationType,
          purpose: normalizedPurpose,
          recurring: recurringFlag,
          ...(typeof frequency === "string" && frequency.trim()
            ? { frequency: frequency.trim() }
            : {}),
          paymentIntentId: session.id,
          reference,
          paymentMethod: normalizedPaymentMethod,
          ...(typeof isAnonymous === "boolean" ? { isAnonymous } : {}),
          ...(typeof message === "string" && message.trim() ? { message } : {}),
          status: "pending",
        },
      });

      return res.json({
        checkoutUrl: session.url,
        reference,
      });
    }

    await prisma.donation.create({
      data: {
        amount: amountDollars,
        currency: normalizedCurrency,
        donorName: donorName || "Anonymous",
        donorEmail,
        type: donationType,
        purpose: normalizedPurpose,
        recurring: recurringFlag,
        ...(typeof frequency === "string" && frequency.trim()
          ? { frequency: frequency.trim() }
          : {}),
        reference,
        paymentMethod: normalizedPaymentMethod,
        ...(typeof isAnonymous === "boolean" ? { isAnonymous } : {}),
        ...(typeof message === "string" && message.trim() ? { message } : {}),
        status: "pending",
      },
    });

    return res.json({
      reference,
      paymentMethod: normalizedPaymentMethod,
      instructions:
        normalizedPaymentMethod === "ecocash"
          ? "Send payment to EcoCash number: 0775 772 277. Use reference: " +
            reference
          : "Bank: CBZ Bank, Account: 12345678, Branch: Harare. Use reference: " +
            reference,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Payment error", { message, error });
    res
      .status(500)
      .json({ message: "Payment initiation failed. Please try again." });
  }
};
