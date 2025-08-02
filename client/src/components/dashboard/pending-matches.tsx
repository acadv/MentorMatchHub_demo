import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Match, Mentor, Mentee } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";

export default function PendingMatches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch pending matches
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ['/api/matches', { status: 'pending' }],
    queryFn: async () => {
      const response = await fetch('/api/matches?status=pending');
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    }
  });

  // Match approval mutation
  const approveMutation = useMutation({
    mutationFn: async (matchId: number) => {
      return apiRequest('POST', `/api/matches/${matchId}/approve`, { adminId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Match approved",
        description: "Introduction email has been sent to both mentor and mentee.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error approving match",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-800">Pending Match Approvals</CardTitle>
        <p className="text-sm text-gray-500">Review and approve AI-suggested mentor-mentee matches</p>
      </CardHeader>
      
      <div className="divide-y divide-gray-200">
        {isLoadingMatches ? (
          <div className="p-5">
            <Skeleton className="h-32 mb-4" />
            <Skeleton className="h-32" />
          </div>
        ) : matches && matches.length > 0 ? (
          matches.map((match) => (
            <MatchItem 
              key={match.id}
              match={match}
              onApprove={() => approveMutation.mutate(match.id)}
              isPending={approveMutation.isPending}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              <i className="fas fa-check text-gray-400"></i>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending matches</h3>
            <p className="mt-1 text-sm text-gray-500">
              All matches have been reviewed. Check back later for new matches.
            </p>
          </div>
        )}
      </div>
      
      {matches && matches.length > 0 && (
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">1-{matches.length}</span> of{" "}
              <span className="font-medium">{matches.length}</span> pending matches
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

interface MatchItemProps {
  match: Match;
  onApprove: () => void;
  isPending: boolean;
}

function MatchItem({ match, onApprove, isPending }: MatchItemProps) {
  const [expandedMentorId, setExpandedMentorId] = useState<number | null>(null);
  const [showMenteeProfile, setShowMenteeProfile] = useState(false);
  
  // Fetch mentee details
  const { data: mentee, isLoading: isLoadingMentee } = useQuery<Mentee>({
    queryKey: ['/api/mentees', match.menteeId],
    queryFn: async () => {
      const response = await fetch(`/api/mentees/${match.menteeId}`);
      if (!response.ok) throw new Error('Failed to fetch mentee');
      return response.json();
    }
  });
  
  // Fetch mentor details for this match
  const { data: mentor, isLoading: isLoadingMentor } = useQuery<Mentor>({
    queryKey: ['/api/mentors', match.mentorId],
    queryFn: async () => {
      const response = await fetch(`/api/mentors/${match.mentorId}`);
      if (!response.ok) throw new Error('Failed to fetch mentor');
      return response.json();
    }
  });
  
  if (isLoadingMentee || isLoadingMentor) {
    return (
      <div className="p-5">
        <Skeleton className="h-32" />
      </div>
    );
  }
  
  if (!mentee || !mentor) {
    return null;
  }
  
  return (
    <div className="p-5">
      <div className="sm:flex sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-800">
            Mentee: <span className="text-primary">{mentee.name}</span>
          </h4>
          <p className="text-sm text-gray-500 mt-1">Submitted application on {mentee.createdAt ? new Date(mentee.createdAt).toLocaleDateString() : 'N/A'}</p>
          
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700">AI-Suggested Match:</h5>
            <div className="mt-2">
              {/* Mentor Card */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={mentor.name} />
                      <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                    </Avatar>
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <h6 className="text-base font-medium text-gray-800">{mentor.name}</h6>
                      <p className="text-sm text-gray-500">{mentor.title}, {mentor.organization}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center">
                    <Badge className="mr-3 bg-indigo-100 text-indigo-600">{match.matchScore}% match</Badge>
                    <Button onClick={onApprove} disabled={isPending} size="sm">
                      <i className="fas fa-check mr-1"></i> Approve
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <h6 className="text-xs font-medium text-gray-700">Match Reasons:</h6>
                  <ul className="mt-1 text-xs text-gray-600 space-y-1">
                    {Array.isArray(match.matchReasons) && match.matchReasons.map((reason, index) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:flex-col sm:items-end">
          <Button 
            variant="outline" 
            className="w-full justify-center mb-3"
            onClick={() => setShowMenteeProfile(true)}
          >
            <i className="fas fa-user mr-2"></i>
            View Mentee Profile
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-center"
            onClick={() => window.location.href = `/matches/create?menteeId=${match.menteeId}`}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3L3 21"></path>
              <path d="M21 21L3 3"></path>
            </svg>
            Find Different Matches
          </Button>
        </div>
        
        {/* Mentee Profile Dialog */}
        {mentee && (
          <Dialog open={showMenteeProfile} onOpenChange={setShowMenteeProfile}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={mentee.name} />
                    <AvatarFallback>{getInitials(mentee.name)}</AvatarFallback>
                  </Avatar>
                  {mentee.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="text-sm text-gray-500">Mentee</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                  <p className="text-base text-gray-900">{mentee.email}</p>
                  
                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Industry</h3>
                  <p className="text-base text-gray-900">
                    {mentee.formResponses?.industry || mentee.industry || "—"}
                  </p>
                  
                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Background</h3>
                  <p className="text-base text-gray-900">
                    {mentee.formResponses?.background || mentee.background || "—"}
                  </p>
                  
                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Goals</h3>
                  <p className="text-base text-gray-900">
                    {mentee.formResponses?.goals || mentee.goals || "—"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Areas of Interest</h3>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(() => {
                      const interests = 
                        (mentee.formResponses && Array.isArray(mentee.formResponses.interests)) 
                          ? mentee.formResponses.interests 
                          : mentee.interests;
                      
                      return Array.isArray(interests) && interests.length > 0 ? (
                        interests.map((interest, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 mb-1">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-base text-gray-400">No interests specified</p>
                      );
                    })()}
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Availability</h3>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const availability = 
                        (mentee.formResponses && Array.isArray(mentee.formResponses.availability)) 
                          ? mentee.formResponses.availability 
                          : mentee.availability;
                      
                      return Array.isArray(availability) && availability.length > 0 ? (
                        availability.map((slot, i) => (
                          <Badge key={i} variant="outline" className="mr-1 mb-1">
                            {typeof slot === 'string' ? slot.replace('-', ' ') : slot}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-base text-gray-400">No availability specified</p>
                      );
                    })()}
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Preferred Meeting Format</h3>
                  <p className="text-base text-gray-900">
                    {(() => {
                      const format = 
                        (mentee.formResponses && mentee.formResponses.meetingFormat) 
                          ? mentee.formResponses.meetingFormat 
                          : mentee.preferredMeetingFormat;
                      
                      return format 
                        ? (typeof format === 'string' ? format.charAt(0).toUpperCase() + format.slice(1) : format) 
                        : "—";
                    })()}
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                {mentee.approved && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 mr-auto py-1.5 px-2.5">
                    Approved
                  </Badge>
                )}
                <Button variant="outline" onClick={() => setShowMenteeProfile(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
