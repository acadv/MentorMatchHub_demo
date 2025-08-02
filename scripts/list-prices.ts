import * as dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

// DEBUG: print the secret key so you can verify you’re in test mode
// console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-04-30.basil",
// });

//only for testing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2025-04-30.basil",
  },
);

(async () => {
  const { data: prices } = await stripe.prices.list({
    limit: 500,
    expand: ["data.product"],
  });

  prices.forEach((p) => {
    const prod = p.product as Stripe.Product;
    const amount = p.unit_amount != null ? p.unit_amount / 100 : "n/a";
    const currency = p.currency.toUpperCase();
    const interval = p.recurring?.interval ?? "one_time";
    console.log(
      `${p.id} → Product: ${prod.name} | Amount: ${amount} ${currency} / ${interval}`,
    );
  });
})();
