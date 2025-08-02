import * as React from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CheckoutSuccess() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = React.useState(true);

  React.useEffect(() => {
    const verifySession = async () => {
      try {
        // Get session_id from URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Verify the session and save subscription details
        const response = await apiRequest(
          'GET',
          `/api/verify-checkout-session?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to verify session');
        }

        setVerifying(false);
      } catch (error) {
        console.error('Error verifying session:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify subscription. Please contact support.',
          variant: 'destructive'
        });
        navigate('/subscription-plans');
      }
    };

    verifySession();
  }, []);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Verifying your subscription...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Subscription Successful | Mentor Match</title>
        <meta name="description" content="Your subscription has been activated successfully" />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl">Subscription Activated!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Thank you for subscribing to Mentor Match. Your subscription has been 
              activated and you now have access to all the features of your plan.
            </p>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Your payment has been processed successfully and your subscription is now active.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}