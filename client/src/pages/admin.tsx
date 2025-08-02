import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { EditProfileDialog } from "@/components/admin/edit-profile-dialog";
import { Organization } from "@shared/schema";

export default function Admin() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fetch organization data
    const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organizations", user?.organizationId],
    enabled: !!user?.organizationId,
  });

  const handleLogout = () => {
    // Show a success toast before redirecting
    toast({
      title: "Logging out...",
      description: "You are being logged out of the system."
    });
    
    // For local auth system
    logout();
    
    // Short timeout to allow the toast to be shown before redirect
    setTimeout(() => {
      // For Replit Auth, redirect to the API endpoint
      window.location.href = "/api/logout";
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Admin Profile | Mentor Match</title>
        <meta name="description" content="Manage your admin profile and account settings" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-gray-500">
          Manage your profile and account settings
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl bg-primary text-white">
                    {user?.email?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-medium">
                    {user?.username || user?.email || "Admin"}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email || "No email provided"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Username</h4>
                  <p>{user?.username || "admin"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{user?.email || "No email provided"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    Administrator
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Organization</h4>
                  {/* <p>Demo Organization</p> */}
                  <p>{organization?.name || " organization"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <EditProfileDialog />
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account settings and session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
                <p className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  Active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Last Login</h4>
                <p>{new Date().toLocaleString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-6 py-4">
              <div className="text-sm text-gray-500">
                Session will expire in 7 days
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}