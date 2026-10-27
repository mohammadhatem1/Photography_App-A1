import Stripe from "stripe";
import process from "node:process";

// One shared Stripe client, using the secret key from .env.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);