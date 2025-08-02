import { loadStripe } from '@stripe/stripe-js';
import * as React from "react";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BadgeCheck,
  AlertCircle,
  CreditCard,
  Package,
  Check,
} from "lucide-react";
import { useLocation } from "wouter";



// Define subscription plan types
interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  popular?: boolean;
}


//ONLY FOR TESTING OF STRIPE FUNCTIONALITY-REMOVE LATER
const tempStripe =
  "pk_test_51RQuN9Lx84pE2NLUgb9Q5ITGfQit7VKpfkpttR4vL2cg4Kr6mINdsrzcPG08NJBFw9t4nkwkywHGqxoZE4ej6bRg00HrZ022Q6";
if (!tempStripe) {
  throw new Error("Missing Stripe public key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(tempStripe);
//////////

// Subscription plans
const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$49",
    interval: "month",
    description:
      "Perfect for small organizations just getting started with mentoring",
    features: [
      "Up to 10 active mentors",
      "Up to 30 active mentees",
      "Basic match analytics",
      "Email notifications",
      "Standard support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    interval: "month",
    description:
      "Ideal for growing organizations with a moderate-sized mentoring program",
    features: [
      "Up to 30 active mentors",
      "Up to 100 active mentees",
      "Advanced analytics and reporting",
      "Custom form templates",
      "Priority support",
      "API access",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$249",
    interval: "month",
    description:
      "For large organizations with comprehensive mentoring programs",
    features: [
      "Unlimited mentors",
      "Unlimited mentees",
      "Advanced matching algorithm",
      "Custom onboarding workflows",
      "Dedicated account manager",
      "White-label branding",
      "SSO integration",
      "24/7 premium support",
    ],
  },
];

function SubscriptionPlanCard({
  plan,
  onSelect,
  currentPlan,
}: {
  plan: Plan;
  onSelect: (planId: string) => void;
  currentPlan: string | null;
}) {
  const isCurrentPlan = currentPlan === plan.id;

  return (
    <Card
      className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}
    >
      {plan.popular && (
        <div className="bg-primary py-1 px-3 text-white text-xs font-medium text-center">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.name}
          {isCurrentPlan && (
            <Badge variant="outline" className="ml-2">
              Current Plan
            </Badge>
          )}
        </CardTitle>
        <div>
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-gray-500">/{plan.interval}</span>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(
    null,
  );

  // Fetch organization subscription data
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: !!user?.organizationId,
  });

  // Define the subscription type
  interface SubscriptionData {
    planId: string;
    planName: string;
    status: string;
    currentPeriodEnd?: string;
  }

  // Type assertion for subscription data
  const subscriptionData = subscription as SubscriptionData | undefined;
  const currentPlan = subscriptionData?.planId || null;


  
  
  const handleSelectPlan = async (planId: string) => {
    if (!user?.organizationId) {
      toast({
        title: "Error",
        description: "Organization not found. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure organization ID exists
    const organizationId = user.organizationId || 1; // Default to 1 for development

    try {
      setProcessingPlan(planId);

      // Redirect to Stripe checkout for the selected plan
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const { url } = await response.json();
      window.location.href = url;
      } catch (err: any) {
        console.error('Error selecting plan:', err);
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setProcessingPlan(null);
      }
      // Navigate to the payment page with the client secret to inbuilt checkout page - previous process
    //   navigate(`/checkout?clientSecret=${data.clientSecret}&planId=${planId}`);
    // } catch (error) {
    //   console.error("Error selecting plan:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to process subscription. Please try again.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setProcessingPlan(null);
    // }
  };

  //////////////

  const handleCancelSubscription = async () => {
    if (!user?.organizationId || !subscriptionData?.planId) return;

    try {
      const response = await apiRequest("POST", "/api/cancel-subscription", {});

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Subscription Plans | Mentor Match</title>
        <meta
          name="description"
          content="Choose a subscription plan for your organization"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-gray-500 mt-1">
              Choose the right plan for your organization's mentoring program
            </p>
          </div>

          {/* {subscriptionData?.planId && (
            <div className="flex items-center gap-4">
              <div className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>
                  Current plan:{" "}
                  <strong>{subscriptionData.planName || "Free Trial"}</strong>
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            </div>
          )} */}
          {subscriptionData?.planId && (
            <div className="flex items-center gap-4">
              <div className="text-sm flex flex-col">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>
                    Current plan: <strong>{subscriptionData.planName || "Free Trial"}</strong>
                  </span>
                </div>
                {subscriptionData.currentPeriodEnd && (
                  <span className="text-gray-500 text-xs ml-6">
                    Renews on {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              currentPlan={currentPlan}
            />
          ))}
        </div>
      </div>
    </>
  );
}
