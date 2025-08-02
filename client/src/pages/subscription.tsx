import * as React from "react";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BadgeCheck, AlertCircle, CreditCard, Package } from "lucide-react";

/*ENABLE IT WHEN USING KEY FROM ENVIRONMENT VARIABLES
 if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
   throw new Error('Missing Stripe public key: VITE_STRIPE_PUBLIC_KEY');
 }

 const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
*/

//only for testing-
const tempStripe="vpk_test_51RQuN9Lx84pE2NLUgb9Q5ITGfQit7VKpfkpttR4vL2cg4Kr6mINdsrzcPG08NJBFw9t4nkwkywHGqxoZE4ej6bRg00HrZ022Q6";
if (!tempStripe) {
   throw new Error('Missing Stripe public key: VITE_STRIPE_PUBLIC_KEY');
 }
const stripePromise = loadStripe(tempStripe);
//////////

  


// Subscription plans
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$49",
    interval: "month",
    description: "Perfect for small organizations just getting started with mentoring",
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
    description: "Ideal for growing organizations with a moderate-sized mentoring program",
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
    description: "For large organizations with comprehensive mentoring programs",
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

function SubscriptionPlanCard({ plan, onSelect, currentPlan }: { 
  plan: typeof plans[0], 
  onSelect: (planId: string) => void,
  currentPlan: string | null 
}) {
  const isCurrentPlan = currentPlan === plan.id;
  
  return (
    <Card className={`flex flex-col ${plan.popular ? 'border-primary' : ''}`}>
      {plan.popular && (
        <div className="bg-primary py-1 px-3 text-white text-xs font-medium text-center">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.name}
          {isCurrentPlan && <BadgeCheck className="h-5 w-5 text-primary" />}
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
              <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
}

function PaymentSetup({ planId }: { planId: string }) {
  const [clientSecret, setClientSecret] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    apiRequest("POST", "/api/create-subscription", { planId })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create subscription");
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [planId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-6">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (!clientSecret) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-6">
        <AlertCircle className="h-5 w-5" />
        <p>Unable to initialize payment. Please try again.</p>
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
}

export default function Subscription() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [showPayment, setShowPayment] = React.useState(false);
  
  // Fetch organization subscription data
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: !!user?.organizationId,
  });
  
  const currentPlan = subscription?.planId || null;
  
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };
  
  const handleBackToPlans = () => {
    setShowPayment(false);
  };
  
  return (
    <>
      <Helmet>
        <title>Subscription Management | Mentor Match</title>
        <meta name="description" content="Manage your organization's subscription plan" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-gray-500 mt-1">
              Choose the right plan for your organization's mentoring program
            </p>
          </div>
          
          {subscription && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Current plan: <strong>{subscription.planName || "Free Trial"}</strong></span>
            </div>
          )}
        </div>
        
        {showPayment ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Complete Your Subscription
              </CardTitle>
              <CardDescription>
                Enter your payment details to subscribe to the{" "}
                {plans.find(p => p.id === selectedPlan)?.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSetup planId={selectedPlan || ""} />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={handleBackToPlans}>
                Back to Plans
              </Button>
            </CardFooter>
          </Card>
        ) : (
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
        )}
      </div>
    </>
  );
}