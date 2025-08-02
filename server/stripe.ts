import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();

/*REMOVE COMMENTS WHEN USING KEY FROM ENVIRONMENT VARIABLES
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
// }


 // Initialize Stripe with the secret key
 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
   apiVersion: "2025-04-30.basil", // Use latest stable API version
 });

*/

//ONLY FOR TESTING
const tempSecret = process.env.STRIPE_SECRET_KEY;
if (!tempSecret) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(tempSecret, {
  apiVersion: "2025-04-30.basil", // Use latest stable API version
});
/////////////

// ---------------------------------------
//  PRICE-ID CHECK
// ---------------------------------------
// (async () => {
//   const testPriceId = "price_1RQASdKKmmsi7xH7tPkOkkQt";
//   try {
//     const price = await stripe.prices.retrieve(testPriceId);
//     console.log(
//       "✅ Found price:",
//       price.id,
//       "-",
//       price.unit_amount,
//       price.currency,
//     );
//   } catch (err: any) {
//     console.error("❌ Could not retrieve price:", err.message);
//   }
// })();

//list all price
// (async () => {
//   const prices = await stripe.prices.list({ limit: 100 });
//   console.log(
//     "All test price IDs:",
//     prices.data.map((p) => p.id),
//   );
// })();
//

// Plan price mapping - using test price IDs
const PLAN_PRICE_IDS: { [key: string]: string } = {
  basic: "price_1RR0WPLx84pE2NLU6OCzh1a6",
  professional: "price_1RR0XLLx84pE2NLUhXx84vQo",
  enterprise: "price_1RR0XZLx84pE2NLUhUVcdDtc",
};

//instead of createSubscription() usign new createCheckoutSession() built method for test
export async function createCheckoutSession(customerId: string, priceId: string,origin: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${origin}/subscription-plans`,  
  });

  return { sessionId: session.id ,
         url: session.url!};
}
/**
 * Create a subscription for a customer prev impl
 */
/*
export async function createSubscription(customerId: string, priceId: string) {
  /// //////TEMP?////////////////
  // Create the sub and expand the pending_setup_intent
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["pending_setup_intent"],
  });

  // Grab the SetupIntent
  const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent;
  if (!setupIntent?.client_secret) {
    throw new Error("Missing SetupIntent.client_secret");
  }

  console.log("🔑 client_secret:", setupIntent.client_secret);
  return {
    subscriptionId: subscription.id,
    clientSecret: setupIntent.client_secret,
  };

  /////////////////////////////

  /////
  //temp remove it
  // try {
  //   const subscription = await stripe.subscriptions.create({
  //     customer: customerId,
  //     items: [{ price: priceId }],
  //     payment_behavior: "default_incomplete",
  //     expand: ["latest_invoice.payment_intent"],
  //   });
  //   console.log("subscription obj->:", JSON.stringify(subscription, null, 2));
  //   // Handle the subscription.latest_invoice being an Invoice or string
  //   let clientSecret = null;
  //   if (
  //     typeof subscription.latest_invoice === "object" &&
  //     subscription.latest_invoice
  //   ) {
  //     // Access payment_intent safely through type assertion
  //     const invoice = subscription.latest_invoice as any;
  //     if (
  //       invoice.payment_intent &&
  //       typeof invoice.payment_intent === "object"
  //     ) {
  //       clientSecret = invoice.payment_intent.client_secret;
  //     }
  //   }

  //   return {
  //     subscriptionId: subscription.id,
  //     clientSecret,
  //   };
  // } catch (error) {
  //   console.error("Error creating subscription:", error);
  //   throw error;
  // }
}
*/

/**
 * Get or create a Stripe customer for the organization
 */
export async function getOrCreateCustomer(
  email: string,
  organizationName: string,
) {
  /////logs
  console.log("getOrCreateCustomer called with:", { email, organizationName });
  ///
  
  try {
    // Search for existing customer with this email
    const customers = await stripe.customers.list({ email });
    console.log("Found existing customers:", customers.data.length);
    if (customers.data.length > 0) {
      console.log("Returning existing customer:", customers.data[0].id);
      return customers.data[0];
    }

    // Create a new customer
    console.log("Creating new customer with email:", email);
    const customer = await stripe.customers.create({
      email,
      name: organizationName,
      metadata: {
        source: "Mentor Match Platform",
      },
    });

    return customer;
  } catch (error) {
    console.error("Error getting/creating customer:", error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

//Test
export function getPriceIdForPlan(planId: string): string | undefined {
  return PLAN_PRICE_IDS[planId];
}
//
/**
 * Get price ID for plan
 */

//uncomment if test not working
// export async function getPriceIdForPlan(planId: string) {
//   // Return the price ID from the mapping
//   return PLAN_PRICE_IDS[planId] || null;
// }

/**
//  * Create setup intent for saving payment method
//  */
export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
    });
    return setupIntent;
  } catch (error) {
    console.error("Error creating setup intent:", error);
    //     throw error;
  }
}
