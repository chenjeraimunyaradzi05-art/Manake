import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Stripe secret key is missing in environment variables");
}

const stripeApiVersion: Stripe.LatestApiVersion = "2025-12-15.clover";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: stripeApiVersion,
  typescript: true,
});
