import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseEmailList } from "@/lib/utils";
import { FormTemplate } from "@shared/schema";
import { UserPlus, FileText } from "lucide-react";

interface InviteUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUserType?: "mentor" | "mentee";
}

export default function InviteUsersModal({ 
  isOpen, 
  onClose, 
  defaultUserType = "mentor" 
}: InviteUsersModalProps) {
  const [userType, setUserType] = useState<"mentor" | "mentee">(defaultUserType);
  const [emailsText, setEmailsText] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { toast } = useToast();
  
  // Parse emails to array
  const emails = parseEmailList(emailsText);
  
  // Fetch form templates based on selected user type
  const { data: formTemplates, isLoading } = useQuery({
    queryKey: ['/api/form-templates', userType],
    queryFn: async () => {
      const response = await fetch(`/api/form-templates?type=${userType}&organizationId=1`);
      if (!response.ok) {
        throw new Error("Failed to fetch form templates");
      }
      return response.json() as Promise<FormTemplate[]>;
    },
    enabled: isOpen // Only fetch when modal is open
  });
  
  // Update selected template when user type changes
  useEffect(() => {
    setSelectedTemplateId("");
  }, [userType]);
  
  // Send invitations mutation
  const sendInvitesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/invitations", {
        emails,
        userType,
        message: invitationMessage,
        organizationId: 1, // Default organization
        formTemplateId: selectedTemplateId ? parseInt(selectedTemplateId) : null
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitations sent",
        description: `Invitations have been sent to ${emails.length} ${userType}s.`,
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error sending invitations",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    sendInvitesMutation.mutate();
  };
  
  // Reset form fields
  const resetForm = () => {
    setEmailsText("");
    setInvitationMessage("");
    setSelectedTemplateId("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Users
          </DialogTitle>
          <DialogDescription>
            Send invitations to prospective mentors and mentees.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>User Type</Label>
              <RadioGroup 
                defaultValue={userType} 
                onValueChange={(value) => setUserType(value as "mentor" | "mentee")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mentor" id="invite-mentors" />
                  <Label htmlFor="invite-mentors">Mentors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mentee" id="invite-mentees" />
                  <Label htmlFor="invite-mentees">Mentees</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form-template">Form Template</Label>
              <Select 
                value={selectedTemplateId} 
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger id="form-template" className="w-full">
                  <SelectValue placeholder="Select a form template" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading templates...
                    </div>
                  ) : formTemplates && formTemplates.length > 0 ? (
                    formTemplates.map((template) => (
                      <SelectItem key={template.id} value={String(template.id)}>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      No form templates available for {userType}s
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                The selected form will be sent to users when they complete the invitation signup.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-emails">Email Addresses</Label>
              <Textarea
                id="invite-emails"
                rows={4}
                placeholder="Enter email addresses separated by commas"
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                className="resize-none"
              />
              {emails.length > 0 && (
                <p className="text-sm text-gray-500">
                  {emails.length} valid email{emails.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-message">
                Invitation Message (optional)
              </Label>
              <Textarea
                id="invite-message"
                rows={3}
                placeholder="Add a personal message to the invitation"
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={emails.length === 0 || sendInvitesMutation.isPending}
            >
              {sendInvitesMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                "Send Invitations"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
