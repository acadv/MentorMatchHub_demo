import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import React from "react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { user, registerMutation } = useAuth();

  // Redirect if already logged in
  // if (user) {
  //   setLocation("/");
  //   return null;
  // }

  // Form for registration
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // If user is logged in, render nothing
  if (user) {
    return null;
  }

  const onSubmit = async (data: {
    username: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  }) => {
    try {
      await registerMutation.mutateAsync(data);
      // If successful, the auth context will redirect to the dashboard
    } catch (error) {
      // Error handling is done in the mutation itself
      console.error("Registration error:", error);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <>
      <Helmet>
        <title>Register | Mentor Match Platform</title>
        <meta name="description" content="Create a new account for the mentor matching platform" />
      </Helmet>
      
      <div className="flex min-h-screen bg-gray-50">
        {/* Registration Form Side */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription>
                Register to access the mentor matching platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="oauth">OAuth</TabsTrigger>
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
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
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
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="oauth" className="space-y-4">
                  <p className="text-sm text-center text-gray-500 mb-4">
                    Register securely using an external authentication provider.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleOAuthLogin}
                  >
                    Continue with OAuth
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <div className="text-center text-sm text-gray-500">
                <p>Already have an account? <a href="/auth/login" className="text-blue-600 hover:underline">Log in</a></p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Hero Side */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-12">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold">Join Our Mentoring Platform</h1>
            <p className="text-xl">
              Create an account to connect with experienced mentors or share your expertise with others.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create a detailed profile to showcase your skills or goals
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Get matched with the perfect mentor or mentee
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Schedule sessions and track your progress
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}