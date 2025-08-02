import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { formatDate, getInitials } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Match, Mentor, Mentee } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { Check, Eye, UserPlus, ArrowRightLeft, Send, Mail } from "lucide-react";

export default function Matches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  
  const tabs = [
    { value: "all", label: "All Matches" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" }
  ];
  
  return (
    <>
      <Helmet>
        <title>Matches | Mentor Match Platform</title>
        <meta name="description" content="Manage mentor-mentee matches and track their progress" />
      </Helmet>
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Matches</h1>
          <p className="mt-1 text-sm text-gray-500">Manage mentor-mentee matches and their progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => window.location.href = "/matches/create"}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Create Match
          </Button>
        </div>
      </div>
      
      {/* Matches tabs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Mentorship Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                <MatchesTable
                  status={tab.value === "all" ? undefined : tab.value}
                  onViewMatch={setSelectedMatch}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Match details dialog */}
      {selectedMatch && (
        <MatchDetailsDialog
          matchId={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}

interface MatchesTableProps {
  status?: string;
  onViewMatch: (matchId: number) => void;
}

function MatchesTable({ status, onViewMatch }: MatchesTableProps) {
  // Fetch matches based on status
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches', { status }],
    queryFn: async () => {
      const url = status ? `/api/matches?status=${status}` : '/api/matches';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    }
  });
  
  // Fetch mentors and mentees for the table
  const { data: mentors, isLoading: isLoadingMentors } = useQuery<Mentor[]>({
    queryKey: ['/api/mentors'],
  });
  
  const { data: mentees, isLoading: isLoadingMentees } = useQuery<Mentee[]>({
    queryKey: ['/api/mentees'],
  });
  
  // Find mentor and mentee by ID
  const findMentor = (id: number) => mentors?.find(m => m.id === id);
  const findMentee = (id: number) => mentees?.find(m => m.id === id);
  
  // Status badge color mapping
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };
  
  if (isLoading || isLoadingMentors || isLoadingMentees) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          <UserPlus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No matches found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {status === "pending"
            ? "There are no pending matches awaiting approval."
            : status === "approved"
            ? "There are no approved matches yet."
            : status === "completed"
            ? "There are no completed matches yet."
            : "No matches have been created yet."}
        </p>
        <div className="mt-6">
          <Button onClick={() => window.location.href = "/matches/create"}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Create New Match
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mentor</TableHead>
          <TableHead>Mentee</TableHead>
          <TableHead>Match Score</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map(match => {
          const mentor = findMentor(match.mentorId);
          const mentee = findMentee(match.menteeId);
          
          return (
            <TableRow key={match.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={mentor?.name || "Mentor"} />
                    <AvatarFallback>{getInitials(mentor?.name || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{mentor?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{mentor?.email || ""}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={mentee?.name || "Mentee"} />
                    <AvatarFallback>{getInitials(mentee?.name || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{mentee?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{mentee?.email || ""}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{match.matchScore}%</Badge>
              </TableCell>
              <TableCell>{match.createdAt ? formatDate(match.createdAt) : 'N/A'}</TableCell>
              <TableCell>
                <Badge className={statusColors[match.status || "pending"]}>
                  {match.status ? match.status.charAt(0).toUpperCase() + match.status.slice(1) : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewMatch(match.id)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

interface MatchDetailsDialogProps {
  matchId: number;
  onClose: () => void;
}

function MatchDetailsDialog({ matchId, onClose }: MatchDetailsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch match details
  const { data, isLoading } = useQuery({
    queryKey: ['/api/match-details', matchId],
    queryFn: async () => {
      const response = await fetch(`/api/match-details/${matchId}`);
      if (!response.ok) throw new Error('Failed to fetch match details');
      return response.json();
    }
  });
  
  // Approve match mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/matches/${matchId}/approve`, { adminId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/match-details', matchId] });
      toast({
        title: "Match approved",
        description: "Introduction email has been sent to both mentor and mentee.",
        variant: "default"
      });
    }
  });
  
  // Send follow-up email mutation
  const followUpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/matches/${matchId}/follow-up`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/match-details', matchId] });
      toast({
        title: "Follow-up sent",
        description: "A follow-up email has been sent to the mentee.",
        variant: "default"
      });
    }
  });
  
  if (isLoading || !data) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const { match, mentor, mentee, sessions } = data;
  
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
          <DialogDescription>
            View and manage the mentor-mentee relationship
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Match overview */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Match Status</h3>
            <Badge className={`${
              match.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              match.status === "approved" ? "bg-blue-100 text-blue-800" :
              match.status === "completed" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </Badge>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Match Score</h3>
              <Badge variant="secondary" className="text-base">{match.matchScore}%</Badge>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Match Reasons</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {Array.isArray(match.matchReasons) && match.matchReasons.map((reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Communication Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${match.introEmailSent ? "bg-green-500" : "bg-gray-200"}`}></div>
                  <span>Introduction Email {match.introEmailSent ? "Sent" : "Not Sent"}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${match.followUpEmailSent ? "bg-green-500" : "bg-gray-200"}`}></div>
                  <span>Follow-up Email {match.followUpEmailSent ? "Sent" : "Not Sent"}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${match.sessionScheduled ? "bg-green-500" : "bg-gray-200"}`}></div>
                  <span>Session {match.sessionScheduled ? "Scheduled" : "Not Scheduled"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mentor & Mentee Profiles */}
          <div>
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={mentor.name} />
                  <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{mentor.name}</div>
                  <div className="text-sm text-gray-500">{mentor.title}, {mentor.organization}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div><span className="font-medium">Email:</span> {mentor.email}</div>
                <div><span className="font-medium">Industry:</span> {mentor.industry}</div>
                {mentor.bookingLink && (
                  <div>
                    <span className="font-medium">Booking Link:</span>{" "}
                    <a href={mentor.bookingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {mentor.bookingLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={mentee.name} />
                  <AvatarFallback>{getInitials(mentee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{mentee.name}</div>
                  <div className="text-sm text-gray-500">Mentee</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div><span className="font-medium">Email:</span> {mentee.email}</div>
                <div><span className="font-medium">Industry:</span> {mentee.industry}</div>
                <div><span className="font-medium">Goals:</span> {mentee.goals || "Not specified"}</div>
              </div>
            </div>
            
            {/* Sessions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sessions</h3>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((session: any) => (
                    <div key={session.id} className="p-2 border rounded-md text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {session.scheduledDate ? formatDate(session.scheduledDate) : "Date not set"}
                        </span>
                        <Badge className={`${
                          session.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          session.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                          session.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                      {session.status === "completed" && (
                        <div className="mt-1">
                          <div>Mentor Rating: {Array(session.mentorRating || 0).fill("★").join("")}</div>
                          <div>Mentee Rating: {Array(session.menteeRating || 0).fill("★").join("")}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No sessions have been recorded.</div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 flex flex-wrap justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => window.location.href = `/matches/create?menteeId=${mentee.id}`}
              className="mr-2"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Find Different Matches
            </Button>
          </div>
          
          <div className="flex gap-2">
            {match.status === "pending" && (
              <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                <Check className="mr-2 h-4 w-4" />
                Approve Match
              </Button>
            )}
            
            {match.status === "approved" && !match.followUpEmailSent && (
              <Button onClick={() => followUpMutation.mutate()} disabled={followUpMutation.isPending}>
                <Send className="mr-2 h-4 w-4" />
                Send Follow-up
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
