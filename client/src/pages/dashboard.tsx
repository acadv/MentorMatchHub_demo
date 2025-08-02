import { useState } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useBranding } from "@/contexts/branding-context";
import KeyMetrics from "@/components/dashboard/key-metrics";
import ActivityChart from "@/components/dashboard/activity-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import PendingMatches from "@/components/dashboard/pending-matches";
import CustomizePlatform from "@/components/dashboard/customize-platform";
import InviteUsersModal from "@/components/modals/invite-users-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, ChevronDown, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { organization, needsOnboarding } = useBranding();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [_, navigate] = useLocation();

  // Redirect to onboarding if organization needs setup
  React.useEffect(() => {
    if (needsOnboarding) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, navigate]);

  // Define analytics data type
  type AnalyticsData = {
    totalMatches: number;
    activeMentors: number;
    sessionsCompleted: number;
    averageRating: number;
    pendingMatches: number;
  };

  // Fetch analytics data
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <>
      <Helmet>
        <title>Dashboard | Mentor Match Platform</title>
        <meta name="description" content="Mentor matching platform dashboard showing key metrics and pending matches" />
      </Helmet>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your mentor-mentee matching program</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Users
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="inline-flex items-center">
                <span>Quick Action</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/matches/create")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create New Match</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <KeyMetrics 
        data={analytics} 
        isLoading={isLoadingAnalytics} 
      />

      {/* Tabs */}
      <div className="mb-8 mt-8">
        <Tabs defaultValue="pending-matches">
          <TabsList>
            <TabsTrigger value="pending-matches" className="flex items-center">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Pending Matches
              {analytics && analytics.pendingMatches > 0 && (
                <span className="ml-2 bg-primary bg-opacity-10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {analytics.pendingMatches}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Activity
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Customize Platform
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending-matches" className="mt-4">
            <PendingMatches />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ActivityChart className="lg:col-span-2" />
              <RecentActivity />
            </div>
          </TabsContent>

          <TabsContent value="customize" className="mt-4">
            <CustomizePlatform />
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Users Modal */}
      <InviteUsersModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
      />
    </>
  );
}
