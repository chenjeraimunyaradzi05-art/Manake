import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeApiVersion: Stripe.LatestApiVersion = "2025-12-15.clover";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: stripeApiVersion,
      typescript: true,
    });
  }

  return stripeInstance;
}

export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error(
      "Stripe secret key is missing. Set STRIPE_SECRET_KEY to enable donations.",
    );
  }
  return stripe;
}
