import * as React from "react";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Package, ArrowLeft, CreditCard } from "lucide-react";
import { useLocation, useSearchParams, Link } from "wouter";

// Make sure to call `loadStripe` outside of a component's render
// if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
//   throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
// }
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY

//ONLY FOR TESTING OF STRIPE FUNCTIONALITY-REMOVE LATER
const tempStripe =
  "pk_test_51RQuN9Lx84pE2NLUgb9Q5ITGfQit7VKpfkpttR4vL2cg4Kr6mINdsrzcPG08NJBFw9t4nkwkywHGqxoZE4ej6bRg00HrZ022Q6";
if (!tempStripe) {
  throw new Error("Missing Stripe public key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(tempStripe);
//////////

////

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated!",
      });
      navigate("/subscription-plans");
    }
  };

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

export default function Checkout() {
  const [searchParams] = useSearchParams();
  // guard against both null _and_ the literal "null"
  const raw = searchParams.get("clientSecret");
  const clientSecret =
    raw && raw !== "null"
      ? raw
      : null;
  // const clientSecret = searchParams.get("clientSecret");
  const planId = searchParams.get("planId");
  const { toast } = useToast();

  // Get the plan details based on the planId
  const getPlanName = () => {
    switch (planId) {
      case "basic":
        return "Basic";
      case "professional":
        return "Professional";
      case "enterprise":
        return "Enterprise";
      default:
        return "Selected";
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Missing Payment Information</h2>
        <p className="text-gray-500 mb-4">
          The checkout session is invalid or has expired.
        </p>
        <Link href="/subscription-plans">
          <Button>Return to Plan Selection</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Complete Your Subscription | Mentor Match</title>
        <meta name="description" content="Complete your subscription payment" />
      </Helmet>

      <div className="max-w-2xl mx-auto my-8">
        <Link
          href="/subscription-plans"
          className="flex items-center text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Plans
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Complete Your Subscription
            </CardTitle>
            <CardDescription>
              Enter your payment details to subscribe to the {getPlanName()}{" "}
              plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6 text-xs text-gray-500">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Secure payment processing by Stripe
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
