import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { useAuth } from "./auth-context";

interface BrandingContextType {
  organization: Organization | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Fetch organization data (defaulting to organization ID 1)
  const { data: organization, isLoading, refetch } = useQuery({
    queryKey: ["/api/organizations", user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;

      const response = await fetch(`/api/organizations/${user.organizationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      return response.json() as Organization;
    },
    enabled: !!user?.organizationId,
  });

  // Check if organization needs onboarding (placeholder name means not set up)
  const needsOnboarding = organization && organization.name === "Your Organization";

  const updateOrganization = async (updates: Partial<Organization>) => {
    try {
      if (!user?.organizationId) {
        throw new Error("No organization ID found");
      }
      
      // Make the API request to update organization
      await fetch(`/api/organizations/${user.organizationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      // Refetch to update the context with new data
      refetch();
    } catch (error) {
      console.error("Failed to update organization:", error);
      throw error;
    }
  };

  // Set CSS variables based on branding colors
  useEffect(() => {
    if (organization) {
      // Convert hex to hsl for tailwind compatibility
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

      // Add CSS class to body for branding
      document.body.classList.add('branded');

      // Define the primary color with fallback
      const primaryColor = organization.primaryColor || '#03254d';
      const secondaryColor = organization.secondaryColor || '#f44336';
      const accentColor = organization.accentColor || '#faa19b';

      // Apply colors directly to CSS variables
      const root = document.documentElement;

      // For Tailwind CSS variables
      root.style.setProperty('--primary', hexToHSL(primaryColor));
      root.style.setProperty('--primary-foreground', '0 0% 100%');

      root.style.setProperty('--secondary', hexToHSL(secondaryColor));
      root.style.setProperty('--secondary-foreground', '0 0% 100%');

      root.style.setProperty('--accent', hexToHSL(accentColor));
      root.style.setProperty('--accent-foreground', '0 0% 100%');

      // For direct color use (original format)
      root.style.setProperty('--primary-color', primaryColor);
      root.style.setProperty('--secondary-color', secondaryColor);
      root.style.setProperty('--accent-color', accentColor);

      // Add additional CSS for buttons
      const styleElement = document.getElementById('dynamic-brand-styles') || document.createElement('style');
      styleElement.id = 'dynamic-brand-styles';
      styleElement.textContent = `
        /* Primary buttons and elements */
        .btn-primary, 
        .bg-primary,
        button[type="submit"]:not(.btn-secondary):not(.btn-accent):not(.btn-outline):not([class*="destructive"]) {
          background-color: ${primaryColor} !important;
          color: white !important;
        }

        /* Secondary buttons and elements */
        .btn-secondary, 
        .bg-secondary {
          background-color: ${secondaryColor} !important;
          color: white !important;
        }

        /* Accent buttons and elements */
        .btn-accent, 
        .bg-accent {
          background-color: ${accentColor} !important;
        }

        /* Text colors */
        .text-primary {
          color: ${primaryColor} !important;
        }

        .text-secondary {
          color: ${secondaryColor} !important;
        }

        .text-accent {
          color: ${accentColor} !important;
        }

        /* Border colors */
        .border-primary {
          border-color: ${primaryColor} !important;
        }

        /* Header title (organization name) */
        .organization-name {
          color: ${primaryColor} !important;
        }
      `;

      if (!document.getElementById('dynamic-brand-styles')) {
        document.head.appendChild(styleElement);
      }
    }
  }, [organization]);

  const value = {
    organization,
    isLoading,
    needsOnboarding,
    updateOrganization,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}