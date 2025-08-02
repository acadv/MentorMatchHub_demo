import { useMemo } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export default function RecentActivity() {
  // Sample activity data
  // In a real implementation, this would be fetched from an API
  const activities = useMemo(() => [
    {
      id: 1,
      type: "match",
      content: "John Smith was matched with Lisa Johnson",
      date: new Date(),
      icon: "check",
      color: "green"
    },
    {
      id: 2,
      type: "session",
      content: "Robert Williams completed a session with Alex Davis",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: "handshake",
      color: "blue"
    },
    {
      id: 3,
      type: "rating",
      content: "Michael Brown rated his session 5 stars",
      date: new Date(Date.now() - 36 * 60 * 60 * 1000),
      icon: "star",
      color: "yellow"
    },
    {
      id: 4,
      type: "signup",
      content: "Jennifer Lee signed up as a new mentor",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: "user-plus",
      color: "purple"
    }
  ], []);

  // Helper function to format the date relative to now
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays >= 1) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours >= 1) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-800">Recent Activity</CardTitle>
      </CardHeader>
      
      <div className="overflow-y-auto" style={{ maxHeight: "350px" }}>
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.id} className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 bg-${activity.color}-100 rounded-full p-1`}>
                  <i className={`fas fa-${activity.icon} text-${activity.color}-600 text-xs`}></i>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-800">
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRelativeTime(activity.date)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 border-t border-gray-200 text-center">
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-light">
          View all activity
        </a>
      </div>
    </Card>
  );
}
