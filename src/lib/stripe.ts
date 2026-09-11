import Stripe from "stripe";

let client: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export const STRIPE_PRICES: Record<"contact" | "pro", string | undefined> = {
  contact: process.env.STRIPE_PRICE_CONTACT,
  pro: process.env.STRIPE_PRICE_PRO,
};
