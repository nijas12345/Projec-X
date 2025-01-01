import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const secret_key = process.env.STRIPE_SECRET_KEY as string;

if (!secret_key) {
  throw new Error("SECRET_KEY is not defined in the environment variables");
}

const stripe = new Stripe(secret_key, {
  apiVersion: "2024-11-20.acacia",
});

export default stripe;
