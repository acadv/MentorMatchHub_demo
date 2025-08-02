import { Request, Response } from "express";
import type { Express } from "express";
import { storage } from "./storage";
import * as stripeService from "./stripe";
import type { Organization } from "@shared/schema";
import Stripe from "stripe";
import { PLAN_PRICE_IDS } from './stripe';


//ONLY FOR TESTING
const tempSecret =
process.env.STRIPE_SECRET_KEY;
if (!tempSecret) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(tempSecret, {
  apiVersion: "2025-04-30.basil", // Use latest stable API version
});
/////

//Test
declare module 'express' {
  interface Request {
    organizationId?: number;
    user?: {
      claims?: { sub: string };
      id?: string;
      email?: string;
    };
  }
}

function hasSubscription(org: Organization): org is Organization & { stripeSubscriptionId: string } {
   return org.stripeSubscriptionId !== null;
 }
////////

//Test
const simpleAuth = async (req: Request, res: Response, next: any) => {
  try {
    const userId = req.user?.claims?.sub || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Please log in" });
    }

    const user = await storage.getUser(userId);
    if (!user || !user.organizationId) {
      return res.status(401).json({ message: "No organization associated with user" });
    }

    req.organizationId = user.organizationId;
    if (!req.user) req.user = {};
    req.user.email = user.email
    // Log the user info for debugging
    console.log("Auth middleware - User info:", {
      userId,
      email: user.email,
      organizationId: user.organizationId
    });
    return next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/////////

// // Simple middleware for development - uncommnet if Test not working
// const simpleAuth = (_req: Request, _res: Response, next: any) => {
//   return next();
// };

/**
 * Register subscription routes for the application
 */
export function registerSubscriptionRoutes(app: Express) {
  // Map Stripe price IDs to plan names
  const PRICE_TO_PLAN_NAME: { [key: string]: string } = {
    "price_1RR0WPLx84pE2NLU6OCzh1a6": "Basic",
    "price_1RR0XLLx84pE2NLUhXx84vQo": "Professional",
    "price_1RR0XZLx84pE2NLUhUVcdDtc": "Enterprise"
  };
  /**
   * Get subscription details for the current organization
   */
  app.get("/api/subscription", simpleAuth, async (req: Request, res: Response) => {
    try {
      // For development, use a fixed organization ID
      const organizationId = req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      
      const organization = await storage.getOrganization(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // If the organization doesn't have a subscription yet
      if (!organization.stripeSubscriptionId) {
        return res.json({
          planId: null,
          planName: "Free Trial",
          status: null,
        });
      }

      // Get subscription details from Stripe
      try {
        const subscription = await stripeService.getSubscription(organization.stripeSubscriptionId);
        
        // Access subscription data safely with type assertion
        const subData = subscription as any;
        
        // Extract the plan information from the subscription
        const planId = subData.items?.data[0]?.price.id || null;
        const planName = planId ? PRICE_TO_PLAN_NAME[planId] || "Unknown Plan" : "Unknown Plan";
        
        return res.json({
          planId,
          planName,
          status: subData.status || "unknown",
          currentPeriodEnd: subData.current_period_end ? 
            new Date(subData.current_period_end * 1000).toISOString() : null,
        });
      } catch (error) {
        console.error("Error fetching subscription:", error);
        return res.status(500).json({ message: "Failed to fetch subscription details" });
      }
    } catch (error) {
      console.error("Error in subscription route:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  /**
   * Create a new subscription for the organization
   */
  app.post("/api/create-subscription", simpleAuth, async (req: Request, res: Response) => {

    /////log
    console.log("[create-subscription] hit. method:", req.method);
    console.log("headers:", req.headers["content-type"]);
    console.log(" raw body:", JSON.stringify(req.body));
    console.log("user info:", {
      id: req.user?.id,
      email: req.user?.email,
      organizationId: req.organizationId
    });
    //////
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      // For development, use a fixed organization ID
      const organizationId = req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      const organization = await storage.getOrganization(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Get price ID for the selected plan
      const priceId = await stripeService.getPriceIdForPlan(planId);
      if (!priceId) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      // If the organization already has a Stripe customer ID, use it
      // Otherwise, create a new customer
      let customerId = organization.stripeCustomerId;
      if (!customerId) {
        const userEmail = req.user?.email;
        if (!userEmail) {
          console.error("No user email found in request");
          return res.status(400).json({ message: "User email is required" });
        }
        console.log("Creating new Stripe customer with email:", userEmail);
        const customer = await stripeService.getOrCreateCustomer(
          // req.user?.email || "admin@example.com", // Default email if no email
          userEmail,
          organization.name
        );
        console.log("Created Stripe customer:", customer);
        customerId = customer.id;

        // Update the organization with the customer ID
        await storage.updateOrganization(organization.id, {
          stripeCustomerId: customerId,
        });
      }

      // Create the subscription- uncomment if test not working
      /*
      const { subscriptionId, clientSecret } = await stripeService.createSubscription(
        customerId,
        priceId
      );

      // Update the organization with the subscription ID
      await storage.updateOrganization(organization.id, {
        stripeSubscriptionId: subscriptionId,
        subscriptionPlan: planId,
      });

      return res.json({
        clientSecret,
        subscriptionId,
      });
      */
      const origin = `${req.protocol}://${req.get("host")}`;
      //instead of above code, use below code for testing
      const { sessionId, url } = await     stripeService.createCheckoutSession(
        customerId,
        priceId,
        origin
      );
      return res.json({ url });
    } catch (error) {
      console.error("Error creating subscription:", error);
      return res.status(500).json({ message: "Failed to create subscription" });
    }

    
  });

  /////
  // Add this new endpoint
  // Add this new endpoint
  app.get("/api/verify-checkout-session", simpleAuth, async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'] // This will include the subscription details
      });

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Get the organization ID from the request
      const organizationId = req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      // Get subscription details
      const subscription = session.subscription as Stripe.Subscription;
      const priceId = subscription.items.data[0].price.id;

      // Map price IDs to plan names
      let planId = 'unknown';
      if (priceId === 'price_1RR0WPLx84pE2NLU6OCzh1a6') {
        planId = 'basic';
      } else if (priceId === 'price_1RR0XLLx84pE2NLUhXx84vQo') {
        planId = 'professional';
      } else if (priceId === 'price_1RR0XZLx84pE2NLUhUVcdDtc') {
        planId = 'enterprise';
      }

      // Update organization with subscription details
      await storage.updateOrganization(organizationId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: planId
      });

      return res.json({ 
        success: true,
        subscriptionId: subscription.id,
        plan: planId,
        status: subscription.status
      });
    } catch (error) {
      console.error("Error verifying checkout session:", error);
      return res.status(500).json({ message: "Failed to verify subscription" });
    }
  });

  /////

  /**
   * Cancel the current subscription for the organization
   */
  app.post("/api/cancel-subscription", simpleAuth, async (req: Request, res: Response) => {
    try {
      // For development, use a fixed organization ID
      const organizationId = req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      
      const organization = await storage.getOrganization(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      if (!organization.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      // Cancel the subscription in Stripe
      await stripeService.cancelSubscription(organization.stripeSubscriptionId);

      // Update the organization to remove the subscription
      await storage.updateOrganization(organization.id, {
        stripeSubscriptionId: null,
        subscriptionPlan: null,
      });

      return res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
}