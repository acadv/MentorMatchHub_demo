import { useState } from "react";
import { Link } from "wouter";
import { useBranding } from "@/contexts/branding-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Menu, HelpCircle } from "lucide-react";
import NotificationDropdown from "@/components/ui/notification-dropdown-fixed";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { organization } = useBranding();
  const { toast } = useToast();

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
            <NotificationDropdown />
            
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