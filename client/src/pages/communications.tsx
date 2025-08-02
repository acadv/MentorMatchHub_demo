import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/contexts/branding-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function Communications() {
  const { organization } = useBranding();
  const { toast } = useToast();
  
  // State for email templates
  const [mentorWelcomeTemplate, setMentorWelcomeTemplate] = useState<string>(
    `Dear {{mentor_name}},

We're delighted to welcome you as an approved mentor in the {{organization_name}} mentorship program!

Your expertise and experience will be invaluable to our mentees who are eager to learn and grow. You are now visible in our mentor pool and may be matched with mentees based on skills and interests.

Here's what you can expect next:
- You'll receive notifications when you're matched with a mentee
- You can review potential matches and schedule sessions
- You'll have access to resources to help make your mentoring effective

Thank you for your commitment to supporting the next generation of entrepreneurs and professionals.

Best regards,
The {{organization_name}} Team`
  );
    
  const [menteeWelcomeTemplate, setMenteeWelcomeTemplate] = useState<string>(
    `Dear {{mentee_name}},

Welcome to the {{organization_name}} mentorship program! We're excited to have you join us as a mentee.

Your application has been approved, and we're now working on finding the perfect mentor match for you based on your goals, interests, and requirements.

Here's what happens next:
- You'll be notified when we've found a suitable mentor for you
- You'll be able to schedule your first mentoring session
- You'll gain access to additional resources to help you make the most of your mentorship

We're committed to helping you grow and achieve your goals through this mentorship opportunity.

Best regards,
The {{organization_name}} Team`
  );
  
  const [introductionTemplate, setIntroductionTemplate] = useState<string>(
    `Dear {{mentee_name}},

I am pleased to introduce you to {{mentor_name}}, who has agreed to be your mentor as part of {{organization_name}}'s mentorship program.

{{mentor_name}} is a {{mentor_title}} at {{mentor_organization}} with expertise in {{mentor_expertise}}. Based on your interests in {{mentee_interests}}, we believe this will be a valuable mentoring relationship.

{{booking_link_section}}

Please connect with {{mentor_name}} and arrange your first mentoring session. We recommend meeting within the next two weeks.

Best regards,
The {{organization_name}} Team`
  );
  
  const [followUpTemplate, setFollowUpTemplate] = useState<string>(
    `Dear {{mentee_name}},

I hope this email finds you well. We recently connected you with {{mentor_name}} for mentorship.

We would like to know if you have scheduled a meeting with your mentor. If yes, please let us know when the session is planned. If not, please make arrangements soon to get the most out of this mentoring opportunity.

{{booking_link_section}}

Thank you for your participation in our mentorship program.

Best regards,
The {{organization_name}} Team`
  );
  
  const [feedbackTemplate, setFeedbackTemplate] = useState<string>(
    `Dear {{recipient_name}},

Thank you for participating in our mentorship program at {{organization_name}}.

We hope your recent session with {{partner_name}} was valuable. We would appreciate your feedback to help us improve the program.

Please take a moment to rate your experience from 1 to 5 stars and provide any comments you may have.

Your feedback is valuable to us.

Best regards,
The {{organization_name}} Team`
  );
  
  const [invitationTemplate, setInvitationTemplate] = useState<string>(
    `Dear {{user_type}},

You have been invited to join {{organization_name}}'s mentorship program as a {{user_type}}.

{{custom_message}}

To get started, please click the link below to complete your profile:
[Complete Your Profile]

Best regards,
The {{organization_name}} Team`
  );
  
  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: { type: string; content: string }) => {
      // In a real implementation, this would save to the backend
      // For now we'll just simulate success
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: "Email template has been updated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving template",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Handle save template
  const handleSaveTemplate = (type: string, content: string) => {
    saveTemplateMutation.mutate({ type, content });
  };
  
  return (
    <>
      <Helmet>
        <title>Communications | Mentor Match Platform</title>
        <meta name="description" content="Customize email templates for mentor-mentee communications" />
      </Helmet>
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Communications</h1>
          <p className="mt-1 text-sm text-gray-500">Customize email templates for mentor-mentee communications</p>
        </div>
      </div>
      
      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="welcome-emails">
            <TabsList className="mb-4 flex w-full flex-wrap border-b pb-0">
              <TabsTrigger value="welcome-emails" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <div className="flex items-center">
                  Welcome Emails
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span><Info className="ml-1 h-4 w-4 text-muted-foreground" /></span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Sent to mentors and mentees when their applications are approved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TabsTrigger>
              <TabsTrigger value="introduction" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Introduction Email</TabsTrigger>
              <TabsTrigger value="followup" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Follow-up Email</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Feedback Request</TabsTrigger>
              <TabsTrigger value="invitation" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Invitation Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="welcome-emails">
              <div className="space-y-8">
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="text-lg font-medium mb-4">Mentor Welcome Email Template</h3>
                  <p className="text-sm text-gray-500 mb-4">This email is sent to mentors when their application is approved.</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <Textarea
                        value={mentorWelcomeTemplate}
                        onChange={(e) => setMentorWelcomeTemplate(e.target.value)}
                        rows={10}
                        className="font-mono text-sm min-h-[200px] resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-md border p-4">
                        <h4 className="text-sm font-medium mb-2">Available Placeholders</h4>
                        <div className="bg-card p-3 rounded-md border">
                          <ul className="space-y-2">
                            <li className="font-mono text-xs">{'{{'+'mentor_name'+'}}'}</li>
                            <li className="font-mono text-xs">{'{{'+'organization_name'+'}}'}</li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveTemplate("mentor-welcome", mentorWelcomeTemplate)}
                        className="w-full"
                        disabled={saveTemplateMutation.isPending}
                      >
                        {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="text-lg font-medium mb-4">Mentee Welcome Email Template</h3>
                  <p className="text-sm text-gray-500 mb-4">This email is sent to mentees when their application is approved.</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <Textarea
                        value={menteeWelcomeTemplate}
                        onChange={(e) => setMenteeWelcomeTemplate(e.target.value)}
                        rows={10}
                        className="font-mono text-sm min-h-[200px] resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-md border p-4">
                        <h4 className="text-sm font-medium mb-2">Available Placeholders</h4>
                        <div className="bg-card p-3 rounded-md border">
                          <ul className="space-y-2">
                            <li className="font-mono text-xs">{'{{'+'mentee_name'+'}}'}</li>
                            <li className="font-mono text-xs">{'{{'+'organization_name'+'}}'}</li>
                          </ul>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveTemplate("mentee-welcome", menteeWelcomeTemplate)}
                        className="w-full"
                        disabled={saveTemplateMutation.isPending}
                      >
                        {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="introduction">
              <EmailTemplateEditor
                title="Introduction Email Template"
                description="This email is sent to introduce the mentor and mentee after a match is created."
                content={introductionTemplate}
                onChange={setIntroductionTemplate}
                onSave={() => handleSaveTemplate("introduction", introductionTemplate)}
                placeholders={[
                  "{{mentor_name}}", 
                  "{{mentee_name}}", 
                  "{{organization_name}}", 
                  "{{mentor_title}}",
                  "{{mentor_organization}}",
                  "{{mentor_expertise}}",
                  "{{mentee_interests}}",
                  "{{booking_link_section}}"
                ]}
                isPending={saveTemplateMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="followup">
              <EmailTemplateEditor
                title="Follow-up Email Template"
                description="This email is sent to check if the mentee has scheduled a session with their mentor."
                content={followUpTemplate}
                onChange={setFollowUpTemplate}
                onSave={() => handleSaveTemplate("followup", followUpTemplate)}
                placeholders={[
                  "{{mentor_name}}", 
                  "{{mentee_name}}", 
                  "{{organization_name}}",
                  "{{booking_link_section}}"
                ]}
                isPending={saveTemplateMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="feedback">
              <EmailTemplateEditor
                title="Feedback Request Template"
                description="This email is sent after a mentorship session to collect feedback."
                content={feedbackTemplate}
                onChange={setFeedbackTemplate}
                onSave={() => handleSaveTemplate("feedback", feedbackTemplate)}
                placeholders={[
                  "{{recipient_name}}", 
                  "{{partner_name}}", 
                  "{{organization_name}}"
                ]}
                isPending={saveTemplateMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="invitation">
              <EmailTemplateEditor
                title="Invitation Email Template"
                description="This email is sent to invite new mentors and mentees to the platform."
                content={invitationTemplate}
                onChange={setInvitationTemplate}
                onSave={() => handleSaveTemplate("invitation", invitationTemplate)}
                placeholders={[
                  "{{user_type}}", 
                  "{{organization_name}}", 
                  "{{custom_message}}"
                ]}
                isPending={saveTemplateMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Email Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email-from">From Email Address</Label>
              <Input 
                id="email-from" 
                defaultValue={`mentoring@${organization?.name?.toLowerCase().replace(/\s+/g, '-') || 'organization'}.com`} 
                placeholder="From email address" 
              />
              <p className="text-sm text-gray-500">
                This email will appear as the sender of all automated emails.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reply-to">Reply-To Email Address</Label>
              <Input 
                id="reply-to" 
                defaultValue="admin@example.com" 
                placeholder="Reply-to email address" 
              />
              <p className="text-sm text-gray-500">
                Replies to automated emails will be directed to this address.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email-footer">Email Footer</Label>
              <Textarea 
                id="email-footer" 
                rows={3}
                defaultValue={`© ${new Date().getFullYear()} ${organization?.name || 'Your Organization'}. All rights reserved.`} 
                placeholder="Email footer text" 
              />
              <p className="text-sm text-gray-500">
                This text will appear at the bottom of all emails.
              </p>
            </div>
            
            <Button className="mt-4">
              Save Email Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

interface EmailTemplateEditorProps {
  title: string;
  description: string;
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  placeholders: string[];
  isPending: boolean;
}

function EmailTemplateEditor({
  title,
  description,
  content,
  onChange,
  onSave,
  placeholders,
  isPending
}: EmailTemplateEditorProps) {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        <div className="md:col-span-3">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            className="font-mono text-sm h-full min-h-[200px]"
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-muted/30 p-3 rounded-md border">
            <h4 className="text-sm font-medium mb-2">Available Placeholders</h4>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <ul className="space-y-1 text-sm">
                {placeholders.map((placeholder) => (
                  <li key={placeholder} className="font-mono text-xs">
                    {placeholder}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={onSave} 
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
