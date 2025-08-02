import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar-new";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Dashboard from "@/pages/dashboard";
import Mentors from "@/pages/mentors";
import Mentees from "@/pages/mentees";
import Matches from "@/pages/matches";
import CreateMatch from "@/pages/create-match";
import Communications from "@/pages/communications";
import FormBuilder from "@/pages/form-builder";
import PublicForm from "@/pages/public-form";
import Branding from "@/pages/branding";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import SubscriptionPlans from "@/pages/subscription-plans";
import Checkout from "@/pages/checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import { Helmet } from "react-helmet";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden branded">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Navbar />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Switch>
              <ProtectedRoute path="/settings" component={Settings} />
              <ProtectedRoute path="/branding" component={Branding} />
              <ProtectedRoute path="/form-builder" component={FormBuilder} />
              <ProtectedRoute path="/communications" component={Communications} />
              <ProtectedRoute path="/matches/create" component={CreateMatch} />
              <ProtectedRoute path="/matches" component={Matches} />
              <ProtectedRoute path="/mentees" component={Mentees} />
              <ProtectedRoute path="/mentors" component={Mentors} />
              <ProtectedRoute path="/admin" component={Admin} />
              <ProtectedRoute path="/subscription-plans" component={SubscriptionPlans} />
              <ProtectedRoute path="/checkout" component={Checkout} />
              <ProtectedRoute path="/checkout/success" component={CheckoutSuccess} />
              <ProtectedRoute path="/" component={Dashboard} />
              <Route path="/dashboard">
                {() => <Redirect to="/" />}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet>
          <title>Mentor Match Platform</title>
          <meta name="description" content="A white-label mentor matching platform for Entrepreneur Support Organizations" />
        </Helmet>
        <Toaster />
        <Switch>
          <Route path="/forms/:type/:id">
            {(params) => <PublicForm params={params} />}
          </Route>
          <Route path="/auth/register">
            <Register />
          </Route>
          <Route path="/auth/login">
            <Login />
          </Route>
          <Route path="/onboarding">
            <Onboarding />
          </Route>

          {/* All authenticated routes use the sidebar layout */}
          <Route path="*">
            {isAuthenticated ? <Router /> : <Login />}
          </Route>
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;