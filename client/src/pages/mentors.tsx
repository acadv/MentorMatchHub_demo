import { useState, useEffect } from "react";
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
import { getInitials, displayFormValue } from "@/lib/utils";
import InviteUsersModal from "@/components/modals/invite-users-modal";
import { Mentor, FormTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Mentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorFormTemplate, setMentorFormTemplate] = useState<FormTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mentors
  const { data: mentors, isLoading } = useQuery<Mentor[]>({
    queryKey: ['/api/mentors'],
  });
  
  // Fetch mentor form template
  const { data: formTemplates } = useQuery<FormTemplate[]>({
    queryKey: ['/api/form-templates'],
  });
  
  // Set mentor form template when data is available
  useEffect(() => {
    if (formTemplates) {
      const template = formTemplates.find((t: FormTemplate) => t.type === 'mentor');
      if (template) {
        setMentorFormTemplate(template);
      }
    }
  }, [formTemplates]);
  
  // Approve mentor mutation
  const approveMutation = useMutation({
    mutationFn: async (mentorId: number) => {
      return apiRequest('POST', `/api/mentors/${mentorId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Mentor approved",
        description: "A welcome email has been sent to the mentor.",
        variant: "default"
      });
      // Refresh mentors list
      queryClient.invalidateQueries({ queryKey: ['/api/mentors'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve mentor",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
      console.error("Error approving mentor:", error);
    }
  });

  // Filter mentors based on search query
  const filteredMentors = mentors?.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Mentors | Mentor Match Platform</title>
        <meta name="description" content="Manage your mentors and invite new ones to join the platform" />
      </Helmet>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Mentors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your mentors and their profiles</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Mentors
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
              placeholder="Search mentors by name, email, organization, or industry"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentors table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mentors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMentors && filteredMentors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title & Organization</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" alt={mentor.name} />
                          <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{mentor.name}</div>
                          <div className="text-sm text-gray-500">{mentor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {(mentor.formResponses && mentor.formResponses.title) || mentor.title || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(mentor.formResponses && mentor.formResponses.organization) || mentor.organization || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(mentor.formResponses && mentor.formResponses.industry) || mentor.industry || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const expertise = 
                            (mentor.formResponses && Array.isArray(mentor.formResponses.expertise)) 
                              ? mentor.formResponses.expertise 
                              : mentor.expertise;
                          
                          return Array.isArray(expertise) && expertise.length > 0 ? (
                            expertise.slice(0, 2).map((exp, i) => (
                              <Badge key={i} variant="secondary" className="mr-1">
                                {exp}
                              </Badge>
                            ))
                          ) : (
                            "—"
                          );
                        })()}
                        {(() => {
                          const expertise = 
                            (mentor.formResponses && Array.isArray(mentor.formResponses.expertise)) 
                              ? mentor.formResponses.expertise 
                              : mentor.expertise;
                          
                          return Array.isArray(expertise) && expertise.length > 2 ? (
                            <Badge variant="outline">+{expertise.length - 2}</Badge>
                          ) : null;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mentor.approved ? (
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
                        {!mentor.approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50"
                            onClick={() => approveMutation.mutate(mentor.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMentor(mentor)}
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">No mentors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No mentors match your search criteria. Try a different search."
                  : "Get started by inviting mentors to join your platform."}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Mentors
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentor detail dialog */}
      {selectedMentor && (
        <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={selectedMentor.name} />
                  <AvatarFallback>{getInitials(selectedMentor.name)}</AvatarFallback>
                </Avatar>
                {selectedMentor.name}
              </DialogTitle>
              <DialogDescription>
                {selectedMentor.title}{selectedMentor.organization ? ` at ${selectedMentor.organization}` : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                <p className="text-base text-gray-900">{selectedMentor.email}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Industry</h3>
                <p className="text-base text-gray-900">
                  {selectedMentor.formResponses && selectedMentor.formResponses.industry 
                    ? selectedMentor.formResponses.industry
                    : selectedMentor.industry || "—"}
                </p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Years of Experience</h3>
                <p className="text-base text-gray-900">
                  {selectedMentor.formResponses && selectedMentor.formResponses.yearsOfExperience
                    ? selectedMentor.formResponses.yearsOfExperience
                    : selectedMentor.yearsOfExperience || "—"}
                </p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Booking Link</h3>
                {(() => {
                  const bookingLink = selectedMentor.formResponses?.bookingLink || selectedMentor.bookingLink;
                  if (bookingLink) {
                    return (
                      <a 
                        href={typeof bookingLink === 'string' ? bookingLink : String(bookingLink)}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {typeof bookingLink === 'string' ? bookingLink : String(bookingLink)}
                      </a>
                    );
                  } else {
                    return <p className="text-base text-gray-400">No booking link provided</p>;
                  }
                })()}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(() => {
                    const expertise = 
                      (selectedMentor.formResponses && Array.isArray(selectedMentor.formResponses.expertise)) 
                        ? selectedMentor.formResponses.expertise 
                        : selectedMentor.expertise;
                    
                    return Array.isArray(expertise) && expertise.length > 0 ? (
                      expertise.map((item, i) => (
                        <Badge key={i} variant="secondary" className="mr-1 mb-1">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-base text-gray-400">No expertise specified</p>
                    );
                  })()}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-1">Availability</h3>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const availability = 
                      (selectedMentor.formResponses && Array.isArray(selectedMentor.formResponses.availability)) 
                        ? selectedMentor.formResponses.availability 
                        : selectedMentor.availability;
                    
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
                      (selectedMentor.formResponses && selectedMentor.formResponses.meetingFormat) 
                        ? selectedMentor.formResponses.meetingFormat 
                        : selectedMentor.preferredMeetingFormat;
                    
                    return format 
                      ? (typeof format === 'string' ? format.charAt(0).toUpperCase() + format.slice(1) : format) 
                      : "—";
                  })()}
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="mr-auto">
                {selectedMentor.approved ? (
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
                      approveMutation.mutate(selectedMentor.id);
                      setSelectedMentor(null);
                    }}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve Mentor
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Mentors Modal */}
      <InviteUsersModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        defaultUserType="mentor"
      />
    </>
  );
}
