import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useBranding } from "@/contexts/branding-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "chart-pie" },
  { name: "Mentors", href: "/mentors", icon: "users" },
  { name: "Mentees", href: "/mentees", icon: "user-graduate" },
  { name: "Matches", href: "/matches", icon: "handshake" },
  { name: "Communications", href: "/communications", icon: "envelope" },
];

const adminNavigation = [
  { name: "Form Builder", href: "/form-builder", icon: "wpforms" },
  { name: "Branding", href: "/branding", icon: "paint-brush" },
  { name: "Subscription", href: "/subscription-plans", icon: "credit-card" },
  { name: "Settings", href: "/settings", icon: "cog" },
  { name: "Admin Profile", href: "/admin", icon: "user-shield" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { organization } = useBranding();

  return (
    <aside className="flex flex-shrink-0 branded">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        {/* Organization Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {organization?.logo ? (
            <img
              src={organization.logo}
              alt={`${organization.name} Logo`}
              className="h-8"
            />
          ) : (
            <div className="text-lg font-semibold organization-name">
              {organization?.name || "Mentor Match"}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto pt-4">
          <div className="px-4 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main
            </p>
            <div className="mt-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <i className={`fas fa-${item.icon} w-5 h-5 mr-2`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-4 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </p>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <i className={`fas fa-${item.icon} w-5 h-5 mr-2`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.username || "User"} />
                <AvatarFallback>{getInitials(user?.username || "")}</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.username || "User"}</p>
              <p className="text-xs font-medium text-gray-500">{user?.role || "User"}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}