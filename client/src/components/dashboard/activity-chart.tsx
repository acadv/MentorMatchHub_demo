import { useMemo } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ActivityChartProps {
  className?: string;
}

export default function ActivityChart({ className }: ActivityChartProps) {
  // In a real implementation, this would fetch actual activity data
  // For now, we'll use static data for the display
  const activityData = useMemo(() => [
    { week: "Week 1", matches: 18, height: "75%" },
    { week: "Week 2", matches: 12, height: "45%" },
    { week: "Week 3", matches: 24, height: "90%" },
    { week: "Week 4", matches: 16, height: "60%" },
    { week: "Week 5", matches: 17, height: "65%" },
  ], []);

  // Get the current date for "last updated"
  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric", 
    minute: "numeric"
  });

  return (
    <Card className={cn("bg-white rounded-lg shadow", className)}>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-800">Activity Overview</CardTitle>
        <p className="text-sm text-gray-500">Matching activity over the last 30 days</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-5 h-64 flex items-end justify-between space-x-2">
          <div className="flex-1 h-full flex items-end">
            {activityData.map((item, index) => (
              <div
                key={index}
                className="chart-bar bg-primary hover:bg-primary-dark flex-1 mx-1 rounded-t transition-all duration-300"
                style={{ height: item.height }}
                title={`${item.week}: ${item.matches} matches`}
              />
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-200 text-center text-sm text-gray-500">
          Last updated: {lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}
