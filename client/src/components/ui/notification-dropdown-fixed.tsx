import { useState } from "react";
import { useLocation } from "wouter";
import { Check, UserPlus, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Sample notification items
const notificationItems = [
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

export default function NotificationDropdown() {
  const [unreadCount, setUnreadCount] = useState(3);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const markAllAsRead = () => {
    setUnreadCount(0);
    toast({
      title: "Notifications",
      description: "All notifications have been marked as read",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
              {unreadCount}
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
              You have {unreadCount} unread notifications
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notificationItems.map((notification) => (
          <div 
            key={notification.id}
            className="cursor-pointer py-3 px-4 hover:bg-gray-50"
            onClick={() => navigate(notification.link)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {notification.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
                <p className="text-xs text-gray-600">{notification.description}</p>
              </div>
            </div>
          </div>
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
  );
}