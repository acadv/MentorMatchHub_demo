import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("password");

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  // Form for password login
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: {username: string, password: string}) => {
    try {
      await loginMutation.mutateAsync(data);
      // If successful, the auth context will redirect to the dashboard
    } catch (error) {
      // Error handling is done in the mutation itself
      console.error("Login error:", error);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <>
      <Helmet>
        <title>Login | Mentor Match Platform</title>
        <meta name="description" content="Login to access your mentor matching platform" />
      </Helmet>
      
      <div className="flex min-h-screen bg-gray-50">
        {/* Login Form Side */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Mentor Match Platform</CardTitle>
              <CardDescription>
                Log in to manage your mentor matching program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="password">Username Password</TabsTrigger>
                  <TabsTrigger value="oauth">SSO(replit)</TabsTrigger>
                </TabsList>

                <TabsContent value="password" className="space-y-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Log in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="oauth" className="space-y-4">
                  <p className="text-sm text-center text-gray-500 mb-4">
                    Log in securely using an external authentication provider.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleOAuthLogin}
                  >
                    Login with OAuth
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <div className="text-center text-sm text-gray-500">
                <p>Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a></p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Hero Side */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-12">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold">Mentor Match Platform</h1>
            <p className="text-xl">
              Connect mentors and mentees efficiently with our intelligent matching algorithm.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Smart matching based on skills and goals
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Streamlined onboarding process
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Track and measure mentoring outcomes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}