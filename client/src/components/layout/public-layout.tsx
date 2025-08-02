import { ReactNode, useEffect } from "react";
import { useBranding } from "@/contexts/branding-context";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { organization } = useBranding();
  
  // Apply brand colors as inline styles for public forms
  useEffect(() => {
    if (organization) {
      // Ensure body has the branded class
      document.body.classList.add('branded');
      
      // Set styles on root - in case branding context hasn't done it yet for public forms
      if (organization.primaryColor) {
        const hexToHSL = (hex: string) => {
          // Remove the # if present
          hex = hex.replace(/^#/, '');
          
          // Parse the hex values
          let r = parseInt(hex.substring(0, 2), 16) / 255;
          let g = parseInt(hex.substring(2, 4), 16) / 255;
          let b = parseInt(hex.substring(4, 6), 16) / 255;
          
          // Find the min and max values to calculate saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            
            h = Math.round(h * 60);
          }
          
          s = Math.round(s * 100);
          l = Math.round(l * 100);
          
          return `${h} ${s}% ${l}%`;
        };
        
        document.documentElement.style.setProperty('--primary', hexToHSL(organization.primaryColor));
        document.documentElement.style.setProperty('--secondary', hexToHSL(organization.secondaryColor || '#f44336'));
        document.documentElement.style.setProperty('--accent', hexToHSL(organization.accentColor || '#faa19b'));
      }
    }
  }, [organization]);
  
  // Use styles that inherit from the branded state
  const headerStyle = {
    borderBottom: '1px solid #eaeaea',
  };
  
  const logoTextStyle = {
    color: organization?.primaryColor || 'hsl(var(--primary))'
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm" style={headerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          {organization?.logo ? (
            <img 
              src={organization.logo} 
              alt={`${organization.name} Logo`} 
              className="h-8 mr-3" 
            />
          ) : (
            <h1 className="text-xl font-semibold" style={logoTextStyle}>
              {organization?.name || "Mentor Match Platform"}
            </h1>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Mentor Match Platform &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}