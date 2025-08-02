import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface KeyMetricsProps {
  data?: {
    totalMatches: number;
    activeMentors: number;
    sessionsCompleted: number;
    averageRating: number;
    pendingMatches: number;
  };
  isLoading: boolean;
}

export default function KeyMetrics({ data, isLoading }: KeyMetricsProps) {
  const metrics = [
    {
      title: "Total Matches",
      value: data?.totalMatches || 0,
      icon: "handshake",
      color: "primary",
      link: "/matches",
    },
    {
      title: "Active Mentors",
      value: data?.activeMentors || 0,
      icon: "users",
      color: "secondary",
      link: "/mentors",
    },
    {
      title: "Sessions Completed",
      value: data?.sessionsCompleted || 0,
      icon: "calendar-check",
      color: "accent",
      link: "/matches",
    },
    {
      title: "Average Rating",
      value: data?.averageRating || 0,
      icon: "star",
      color: "warning",
      link: "/matches",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.title} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 bg-${metric.color} bg-opacity-10 rounded-md p-3`}>
                  <i className={`fas fa-${metric.icon} text-${metric.color} text-xl`}></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-500 truncate">{metric.title}</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {metric.title === "Average Rating" ? metric.value.toFixed(1) : metric.value}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href={metric.link} className="font-medium text-primary hover:text-primary-light">
                  View all
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
