import { Request, Response } from "express";
import { Donation } from "../models/Donation";
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
      return res
        .status(400)
        .json({
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

    // Handle different payment methods
    if (paymentMethod === "card") {
      const stripe = requireStripe();
      // Create a Stripe Checkout Session (cleaner than PaymentIntent for donations)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: recurring ? "subscription" : "payment",
        customer_email: donorEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: "Donation to Manake Rehabilitation Center",
                description:
                  purpose ||
                  "General donation to support youth recovery programs",
              },
              unit_amount: amountCents,
              ...(recurring && { recurring: { interval: "month" } }),
            },
            quantity: 1,
          },
        ],
        metadata: {
          donorName: donorName || "Anonymous",
          donorEmail,
          purpose: purpose || "general_donation",
          reference,
        },
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/thank-you?ref=${reference}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/donate`,
      });

      // Save pending donation record
      await Donation.create({
        amount: amountDollars,
        currency,
        donorName: donorName || "Anonymous",
        donorEmail,
        type: purpose || "general_donation",
        paymentIntentId: session.id,
        reference,
        status: "pending",
      });

      return res.json({
        checkoutUrl: session.url,
        reference,
      });
    }

    // For EcoCash or Bank transfer, just create a pending record with instructions
    await Donation.create({
      amount: amountDollars,
      currency,
      donorName: donorName || "Anonymous",
      donorEmail,
      type: purpose || "general_donation",
      reference,
      paymentMethod,
      status: "pending",
    });

    return res.json({
      reference,
      paymentMethod,
      instructions:
        paymentMethod === "ecocash"
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
