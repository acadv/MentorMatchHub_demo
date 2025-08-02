import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useBranding } from "@/contexts/branding-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Menu, Bell, HelpCircle, Check, UserPlus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

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
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      You have {unreadNotifications} unread notifications
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="cursor-pointer py-3 px-4 focus:bg-gray-50"
                    onClick={() => navigate(notification.link)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {notification.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="text-center py-2 px-2">
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs h-8" 
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
    </div>
  );
}