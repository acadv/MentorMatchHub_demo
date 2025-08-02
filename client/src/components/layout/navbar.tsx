import { useState } from "react";
import { Link } from "wouter";
import { useBranding } from "@/contexts/branding-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Menu, HelpCircle } from "lucide-react";
import NotificationDropdown from "@/components/ui/notification-dropdown";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const { organization } = useBranding();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Notification data
  const notifications = [
    { 
      id: 1, 
      title: "New mentor approved", 
      description: "Sarah Johnson has been approved as a mentor",
      time: "10 min ago",
      icon: <Check className="h-4 w-4 text-green-500" />,
      read: false,
      link: "/mentors"
    },
    { 
      id: 2, 
      title: "New mentee application", 
      description: "Marcus Brown submitted a mentee application",
      time: "1 hour ago",
      icon: <UserPlus className="h-4 w-4 text-blue-500" />,
      read: false,
      link: "/mentees"
    },
    { 
      id: 3, 
      title: "Match waiting approval", 
      description: "A new mentor-mentee match is waiting for approval",
      time: "3 hours ago",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      read: false,
      link: "/matches"
    }
  ];

  const markAllAsRead = () => {
    setUnreadNotifications(0);
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read",
    });
  };

  const handleHelpClick = () => {
    toast({
      title: "Help & Support",
      description: "Need help? Contact support@mentormatch.com",
    });
  };

  return (
    <div className="bg-white shadow-sm z-10 relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Mobile menu button */}
            <button 
              type="button" 
              className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </button>
            
            {/* Mobile logo (centered) */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 md:hidden">
              {organization?.logo ? (
                <img
                  className="h-8 w-auto"
                  src={organization.logo}
                  alt={`${organization.name} Logo`}
                />
              ) : (
                <div className="text-lg font-semibold organization-name">
                  {organization?.name || "Mentor Match"}
                </div>
              )}
            </div>
          </div>
          
          {/* Navbar right section */}
          <div className="flex items-center">
            {/* Notification bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
            
            {/* Help button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleHelpClick}
              className="ml-2"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Mobile sidebar content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                {organization?.logo ? (
                  <img
                    className="h-8 w-auto"
                    src={organization.logo}
                    alt={`${organization.name} Logo`}
                  />
                ) : (
                  <div className="text-lg font-semibold organization-name">
                    {organization?.name || "Mentor Match"}
                  </div>
                )}
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link href="/" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-chart-pie w-5 h-5 mr-2 text-gray-500"></i>
                  Dashboard
                </Link>
                <Link href="/mentors" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-users w-5 h-5 mr-2 text-gray-500"></i>
                  Mentors
                </Link>
                <Link href="/mentees" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-user-graduate w-5 h-5 mr-2 text-gray-500"></i>
                  Mentees
                </Link>
                <Link href="/matches" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-handshake w-5 h-5 mr-2 text-gray-500"></i>
                  Matches
                </Link>
                <Link href="/communications" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-envelope w-5 h-5 mr-2 text-gray-500"></i>
                  Communications
                </Link>
                <Link href="/form-builder" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-wpforms w-5 h-5 mr-2 text-gray-500"></i>
                  Form Builder
                </Link>
                <Link href="/branding" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-paint-brush w-5 h-5 mr-2 text-gray-500"></i>
                  Branding
                </Link>
                <Link href="/settings" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50">
                  <i className="fas fa-cog w-5 h-5 mr-2 text-gray-500"></i>
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
