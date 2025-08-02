import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import InviteUsersModal from "@/components/modals/invite-users-modal";
import { Mentee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Mentees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mentees
  const { data: mentees, isLoading } = useQuery<Mentee[]>({
    queryKey: ['/api/mentees'],
  });
  
  // Approve mentee mutation
  const approveMutation = useMutation({
    mutationFn: async (menteeId: number) => {
      return apiRequest('POST', `/api/mentees/${menteeId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Mentee approved",
        description: "A welcome email has been sent to the mentee.",
        variant: "default"
      });
      // Refresh mentees list
      queryClient.invalidateQueries({ queryKey: ['/api/mentees'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve mentee",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
      console.error("Error approving mentee:", error);
    }
  });

  // Filter mentees based on search query
  const filteredMentees = mentees?.filter(mentee => 
    mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.background?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Mentees | Mentor Match Platform</title>
        <meta name="description" content="Manage your mentees and invite new ones to join the platform" />
      </Helmet>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Mentees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your mentees and their profiles</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Mentees
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search mentees by name, email, background, or industry"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentees table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mentees</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMentees && filteredMentees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Interests</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentees.map((mentee) => (
                  <TableRow key={mentee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" alt={mentee.name} />
                          <AvatarFallback>{getInitials(mentee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{mentee.name}</div>
                          <div className="text-sm text-gray-500">{mentee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {mentee.background ? (
                          <span title={mentee.background}>
                            {mentee.background.length > 50
                              ? `${mentee.background.substring(0, 50)}...`
                              : mentee.background}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{mentee.industry || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(mentee.interests) && mentee.interests.length > 0 ? (
                          mentee.interests.slice(0, 2).map((interest, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          "—"
                        )}
                        {Array.isArray(mentee.interests) && mentee.interests.length > 2 && (
                          <Badge variant="outline">+{mentee.interests.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mentee.approved ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending Approval
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!mentee.approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                            onClick={() => approveMutation.mutate(mentee.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMentee(mentee)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                <UserPlus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No mentees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No mentees match your search criteria. Try a different search."
                  : "Get started by inviting mentees to join your platform."}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Mentees
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentee detail dialog */}
      {selectedMentee && (
        <Dialog open={!!selectedMentee} onOpenChange={() => setSelectedMentee(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={selectedMentee.name} />
                  <AvatarFallback>{getInitials(selectedMentee.name)}</AvatarFallback>
                </Avatar>
                {selectedMentee.name}
              </DialogTitle>
              <DialogDescription>
                Mentee
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                <p className="text-base text-gray-900">{selectedMentee.email}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Industry</h3>
                <p className="text-base text-gray-900">{selectedMentee.industry || "—"}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Background</h3>
                <p className="text-base text-gray-900">{selectedMentee.background || "—"}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Goals</h3>
                <p className="text-base text-gray-900">{selectedMentee.goals || "—"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Areas of Interest</h3>
                <div className="flex flex-wrap gap-1 mb-4">
                  {Array.isArray(selectedMentee.interests) && selectedMentee.interests.length > 0 ? (
                    selectedMentee.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary" className="mr-1 mb-1">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-base text-gray-400">No interests specified</p>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Availability</h3>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(selectedMentee.availability) && selectedMentee.availability.length > 0 ? (
                    selectedMentee.availability.map((slot, i) => (
                      <Badge key={i} variant="outline" className="mr-1 mb-1">
                        {slot.replace('-', ' ')}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-base text-gray-400">No availability specified</p>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Preferred Meeting Format</h3>
                <p className="text-base text-gray-900">
                  {selectedMentee.preferredMeetingFormat ? selectedMentee.preferredMeetingFormat.charAt(0).toUpperCase() + selectedMentee.preferredMeetingFormat.slice(1) : "—"}
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="mr-auto">
                {selectedMentee.approved ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 py-1.5 px-2.5">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approved
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                    onClick={() => {
                      approveMutation.mutate(selectedMentee.id);
                      setSelectedMentee(null);
                    }}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve Mentee
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedMentee(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Mentees Modal */}
      <InviteUsersModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        defaultUserType="mentee"
      />
    </>
  );
}
