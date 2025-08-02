import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { Mentor, Mentee } from "@shared/schema";

const createMatchSchema = z.object({
  mentorId: z.string().min(1, "Mentor is required"),
  menteeId: z.string().min(1, "Mentee is required"),
});

type CreateMatchForm = z.infer<typeof createMatchSchema>;

export default function CreateMatch() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse query parameters (for pre-selected mentee)
  const params = new URLSearchParams(location.split('?')[1]);
  const preSelectedMenteeId = params.get('menteeId');
  
  // State for displaying mentor and mentee details
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(preSelectedMenteeId);
  
  // Define form
  const form = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      mentorId: "",
      menteeId: preSelectedMenteeId || "",
    },
  });
  
  // Fetch mentors data
  const { data: mentors, isLoading: isLoadingMentors } = useQuery<Mentor[]>({
    queryKey: ['/api/mentors'],
  });
  
  // Fetch mentees data
  const { data: mentees, isLoading: isLoadingMentees } = useQuery<Mentee[]>({
    queryKey: ['/api/mentees'],
  });
  
  // Only show approved mentors and mentees
  const approvedMentors = mentors?.filter(mentor => mentor.approved) || [];
  const approvedMentees = mentees?.filter(mentee => mentee.approved) || [];
  
  // Debug data
  console.log('All mentors:', mentors);
  console.log('Approved mentors:', approvedMentors);
  console.log('All mentees:', mentees);
  console.log('Approved mentees:', approvedMentees);
  
  // Get selected mentor and mentee
  const selectedMentor = approvedMentors.find(mentor => mentor.id.toString() === selectedMentorId);
  const selectedMentee = approvedMentees.find(mentee => mentee.id.toString() === selectedMenteeId);
  
  // Update selected IDs when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "mentorId" && value.mentorId) {
        setSelectedMentorId(value.mentorId.toString());
      }
      if (name === "menteeId" && value.menteeId) {
        setSelectedMenteeId(value.menteeId.toString());
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Create match mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateMatchForm) => {
      return apiRequest('POST', '/api/matches', {
        mentorId: parseInt(data.mentorId),
        menteeId: parseInt(data.menteeId),
        status: 'pending',
        organizationId: 1, // This would come from auth context in production
      });
    },
    onSuccess: () => {
      toast({
        title: "Match created",
        description: "The match has been created and is pending approval.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      navigate("/matches");
    },
    onError: (error) => {
      toast({
        title: "Failed to create match",
        description: "There was an error creating the match. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateMatchForm) => {
    createMutation.mutate(data);
  };
  
  // Loading states
  if (isLoadingMentors || isLoadingMentees) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Create Match | Mentor Match Platform</title>
        <meta name="description" content="Manually create a mentor-mentee match" />
      </Helmet>
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Create Match</h1>
          <p className="mt-1 text-sm text-gray-500">Manually create a new mentor-mentee match</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate("/matches")}>
            Back to Matches
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mentor selection column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mentorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Mentor</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a mentor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvedMentors.length > 0 ? (
                          approvedMentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id.toString()}>
                              {mentor.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-mentors" disabled>No approved mentors available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Selected mentor details */}
              {selectedMentor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentor Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" alt={selectedMentor.name} />
                        <AvatarFallback>{getInitials(selectedMentor.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{selectedMentor.name}</h3>
                        <p className="text-gray-500">
                          {(selectedMentor.formResponses?.title || selectedMentor.title || '')}
                          {(selectedMentor.formResponses?.organization || selectedMentor.organization) ? 
                            `, ${selectedMentor.formResponses?.organization || selectedMentor.organization}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Industry: </span>
                        <span>{selectedMentor.formResponses?.industry || selectedMentor.industry || '—'}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Expertise: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(() => {
                            const expertise = 
                              (selectedMentor.formResponses && Array.isArray(selectedMentor.formResponses.expertise)) 
                                ? selectedMentor.formResponses.expertise 
                                : selectedMentor.expertise;
                            
                            return Array.isArray(expertise) && expertise.length > 0 ? (
                              expertise.map((exp, index) => (
                                <Badge key={index} variant="outline">{exp}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">—</span>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Preferred Meeting Format: </span>
                        <span>
                          {selectedMentor.formResponses?.meetingFormat || selectedMentor.preferredMeetingFormat || '—'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Years of Experience: </span>
                        <span>
                          {selectedMentor.formResponses?.yearsOfExperience || selectedMentor.yearsOfExperience || '—'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Mentee selection column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="menteeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Mentee</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a mentee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvedMentees.length > 0 ? (
                          approvedMentees.map((mentee) => (
                            <SelectItem key={mentee.id} value={mentee.id.toString()}>
                              {mentee.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-mentees" disabled>No approved mentees available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Selected mentee details */}
              {selectedMentee && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mentee Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" alt={selectedMentee.name} />
                        <AvatarFallback>{getInitials(selectedMentee.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{selectedMentee.name}</h3>
                        <p className="text-gray-500">Mentee</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Background: </span>
                        <span>{selectedMentee.formResponses?.background || selectedMentee.background || '—'}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Goals: </span>
                        <p className="mt-1 text-sm">{selectedMentee.formResponses?.goals || selectedMentee.goals || '—'}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Industry: </span>
                        <span>{selectedMentee.formResponses?.industry || selectedMentee.industry || '—'}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Interests: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(() => {
                            const interests = 
                              (selectedMentee.formResponses && Array.isArray(selectedMentee.formResponses.interests)) 
                                ? selectedMentee.formResponses.interests 
                                : selectedMentee.interests;
                            
                            return Array.isArray(interests) && interests.length > 0 ? (
                              interests.map((interest, index) => (
                                <Badge key={index} variant="outline">{interest}</Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">—</span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Compatibility section (shows when both mentor and mentee selected) */}
          {selectedMentor && selectedMentee && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Compatibility Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Industry Match</h3>
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className={selectedMentor.industry === selectedMentee.industry ? 
                          "bg-green-100 text-green-800 border-green-200" : 
                          "bg-yellow-100 text-yellow-800 border-yellow-200"}
                      >
                        {selectedMentor.industry === selectedMentee.industry ? "Match" : "Partial Match"}
                      </Badge>
                      <span className="ml-2 text-sm">
                        {selectedMentor.industry === selectedMentee.industry ? 
                          "Both are in the same industry." : 
                          "Different industries, but may have complementary knowledge."}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Interests & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedMentee.interests) && selectedMentee.interests.map((interest) => {
                        const isMatch = Array.isArray(selectedMentor.expertise) && 
                          selectedMentor.expertise.some(exp => 
                            exp.toLowerCase().includes(interest.toLowerCase()) || 
                            interest.toLowerCase().includes(exp.toLowerCase())
                          );
                        
                        return (
                          <Badge 
                            key={interest}
                            variant="outline" 
                            className={isMatch ? 
                              "bg-green-100 text-green-800 border-green-200" : 
                              "bg-gray-100 text-gray-800 border-gray-200"}
                          >
                            {interest} {isMatch && "✓"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !selectedMentor || !selectedMentee}
            >
              Create Match
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}