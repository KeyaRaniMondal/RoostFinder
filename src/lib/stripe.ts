import Stripe from "stripe";
import config from "../config";

const stripeSecretKey = config.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(stripeSecretKey);