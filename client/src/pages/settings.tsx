import { useState } from "react";
import { Helmet } from "react-helmet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Save, UserCog, Brain, Mail, ShieldCheck } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [aiWeights, setAiWeights] = useState({
    expertise: 40,
    industry: 20,
    availability: 30,
    meetingFormat: 10
  });
  
  const [matchThreshold, setMatchThreshold] = useState(70);
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(true);
  const [autoSendFollowUp, setAutoSendFollowUp] = useState(true);
  const [autoSendFeedback, setAutoSendFeedback] = useState(true);
  const [followUpDelay, setFollowUpDelay] = useState("3");
  const [feedbackDelay, setFeedbackDelay] = useState("1");

  // Save AI settings mutation
  const saveAiSettingsMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would save to the backend
      // For now we'll just simulate success
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({
        title: "AI settings saved",
        description: "Your AI matching settings have been updated successfully.",
        variant: "success"
      });
    }
  });

  // Save communication settings mutation
  const saveCommunicationSettingsMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would save to the backend
      // For now we'll just simulate success
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({
        title: "Communication settings saved",
        description: "Your communication workflow settings have been updated successfully.",
        variant: "success"
      });
    }
  });

  // Handle AI weight change
  const handleWeightChange = (category: keyof typeof aiWeights, value: number) => {
    // Ensure total weights add up to 100
    const otherCategories = Object.keys(aiWeights).filter(
      key => key !== category
    ) as Array<keyof typeof aiWeights>;
    
    const otherSum = otherCategories.reduce(
      (sum, key) => sum + aiWeights[key],
      0
    );
    
    const remaining = 100 - value;
    const ratio = remaining / otherSum;
    
    const newWeights = { ...aiWeights };
    newWeights[category] = value;
    
    // Adjust other weights proportionally
    otherCategories.forEach(key => {
      newWeights[key] = Math.round(aiWeights[key] * ratio);
    });
    
    // Handle rounding errors to ensure sum is exactly 100
    const newSum = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    if (newSum !== 100) {
      const diff = 100 - newSum;
      const lastKey = otherCategories[otherCategories.length - 1];
      newWeights[lastKey] += diff;
    }
    
    setAiWeights(newWeights);
  };

  return (
    <>
      <Helmet>
        <title>Settings | Mentor Match Platform</title>
        <meta name="description" content="Configure AI matching algorithm and platform settings" />
      </Helmet>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure your mentor matching platform</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="ai-matching">
        <TabsList className="mb-6">
          <TabsTrigger value="ai-matching" className="flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            AI Matching
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* AI Matching Settings */}
        <TabsContent value="ai-matching">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Matching Algorithm Settings</CardTitle>
                <CardDescription>
                  Configure how the AI matching algorithm prioritizes different factors when suggesting mentor-mentee matches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Matching Weights</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Adjust the importance of each factor in the matching algorithm. Total weight must equal 100%.
                  </p>
                  
                  <div className="space-y-6">
                    {/* Expertise/Interest Weight */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Expertise & Interests</Label>
                        <Badge variant="outline">{aiWeights.expertise}%</Badge>
                      </div>
                      <Slider
                        value={[aiWeights.expertise]}
                        min={10}
                        max={70}
                        step={5}
                        onValueChange={([value]) => handleWeightChange("expertise", value)}
                      />
                      <p className="text-xs text-gray-500">
                        How much weight to give to matching mentors' expertise with mentees' interests
                      </p>
                    </div>
                    
                    {/* Industry Weight */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Industry Match</Label>
                        <Badge variant="outline">{aiWeights.industry}%</Badge>
                      </div>
                      <Slider
                        value={[aiWeights.industry]}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={([value]) => handleWeightChange("industry", value)}
                      />
                      <p className="text-xs text-gray-500">
                        How much weight to give to matching mentors and mentees from the same industry
                      </p>
                    </div>
                    
                    {/* Availability Weight */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Availability</Label>
                        <Badge variant="outline">{aiWeights.availability}%</Badge>
                      </div>
                      <Slider
                        value={[aiWeights.availability]}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={([value]) => handleWeightChange("availability", value)}
                      />
                      <p className="text-xs text-gray-500">
                        How much weight to give to overlapping availability between mentors and mentees
                      </p>
                    </div>
                    
                    {/* Meeting Format Weight */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Meeting Format</Label>
                        <Badge variant="outline">{aiWeights.meetingFormat}%</Badge>
                      </div>
                      <Slider
                        value={[aiWeights.meetingFormat]}
                        min={5}
                        max={30}
                        step={5}
                        onValueChange={([value]) => handleWeightChange("meetingFormat", value)}
                      />
                      <p className="text-xs text-gray-500">
                        How much weight to give to matching preferred meeting formats
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Matching Threshold</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Minimum Match Score</Label>
                      <Badge variant="outline">{matchThreshold}%</Badge>
                    </div>
                    <Slider
                      value={[matchThreshold]}
                      min={50}
                      max={90}
                      step={5}
                      onValueChange={([value]) => setMatchThreshold(value)}
                    />
                    <p className="text-xs text-gray-500">
                      Only suggest matches with a score at or above this threshold
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="admin-approval" className="text-base font-medium">Admin Approval Required</Label>
                    <p className="text-sm text-gray-500">
                      Require admin approval before introducing mentors and mentees
                    </p>
                  </div>
                  <Switch
                    id="admin-approval"
                    checked={adminApprovalRequired}
                    onCheckedChange={setAdminApprovalRequired}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => saveAiSettingsMutation.mutate()}
                    disabled={saveAiSettingsMutation.isPending}
                  >
                    {saveAiSettingsMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save AI Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communication Settings */}
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication Workflow Settings</CardTitle>
              <CardDescription>
                Configure how the platform communicates with mentors and mentees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Workflows</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="auto-follow-up" className="text-base font-medium">Automatic Follow-up Emails</Label>
                    <p className="text-sm text-gray-500">
                      Automatically send follow-up emails to mentees after introduction
                    </p>
                  </div>
                  <Switch
                    id="auto-follow-up"
                    checked={autoSendFollowUp}
                    onCheckedChange={setAutoSendFollowUp}
                  />
                </div>
                
                {autoSendFollowUp && (
                  <div className="ml-6 mt-2">
                    <Label htmlFor="follow-up-delay">Send follow-up after</Label>
                    <div className="flex items-center mt-1 w-64">
                      <Select value={followUpDelay} onValueChange={setFollowUpDelay}>
                        <SelectTrigger id="follow-up-delay">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="ml-2 text-sm text-gray-500">after introduction</span>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="auto-feedback" className="text-base font-medium">Automatic Feedback Requests</Label>
                    <p className="text-sm text-gray-500">
                      Automatically send feedback request emails after sessions
                    </p>
                  </div>
                  <Switch
                    id="auto-feedback"
                    checked={autoSendFeedback}
                    onCheckedChange={setAutoSendFeedback}
                  />
                </div>
                
                {autoSendFeedback && (
                  <div className="ml-6 mt-2">
                    <Label htmlFor="feedback-delay">Send feedback requests after</Label>
                    <div className="flex items-center mt-1 w-64">
                      <Select value={feedbackDelay} onValueChange={setFeedbackDelay}>
                        <SelectTrigger id="feedback-delay">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Same day</SelectItem>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="ml-2 text-sm text-gray-500">after session</span>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                
                <div className="space-y-2">
                  <Label>Email Administrators When:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-new-mentee" defaultChecked />
                      <Label htmlFor="notify-new-mentee" className="text-sm">New mentee registers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-new-mentor" defaultChecked />
                      <Label htmlFor="notify-new-mentor" className="text-sm">New mentor registers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-new-match" defaultChecked />
                      <Label htmlFor="notify-new-match" className="text-sm">New match is generated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-feedback" defaultChecked />
                      <Label htmlFor="notify-feedback" className="text-sm">Feedback is submitted</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => saveCommunicationSettingsMutation.mutate()}
                  disabled={saveCommunicationSettingsMutation.isPending}
                >
                  {saveCommunicationSettingsMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Communication Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and access to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 text-center">
                  <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">User Management Settings</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                    This feature will be available in the next release. Here you'll be able to manage administrators, 
                    set permissions, and control user access.
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication and security features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <RadioGroup id="password-policy" defaultValue="balanced" className="mt-2">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="basic" id="password-basic" />
                        <div>
                          <Label htmlFor="password-basic" className="text-sm font-medium">Basic</Label>
                          <p className="text-xs text-gray-500">Minimum 8 characters</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="balanced" id="password-balanced" />
                        <div>
                          <Label htmlFor="password-balanced" className="text-sm font-medium">Balanced (Recommended)</Label>
                          <p className="text-xs text-gray-500">Minimum 8 characters, must include uppercase, lowercase, and numbers</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="strict" id="password-strict" />
                        <div>
                          <Label htmlFor="password-strict" className="text-sm font-medium">Strict</Label>
                          <p className="text-xs text-gray-500">Minimum 12 characters, must include uppercase, lowercase, numbers, and special characters</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="session-timeout" className="text-base font-medium">Session Timeout</Label>
                      <p className="text-sm text-gray-500">
                        Automatically log users out after inactivity
                      </p>
                    </div>
                    <Select defaultValue="2hours">
                      <SelectTrigger id="session-timeout" className="w-32">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                        <SelectItem value="2hours">2 hours</SelectItem>
                        <SelectItem value="4hours">4 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="enable-2fa" className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Require 2FA for all administrator accounts
                      </p>
                    </div>
                    <Switch id="enable-2fa" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Privacy</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="data-retention" className="text-base font-medium">Data Retention Policy</Label>
                    <p className="text-sm text-gray-500">
                      How long to keep user data after accounts are inactive
                    </p>
                  </div>
                  <Select defaultValue="1year">
                    <SelectTrigger id="data-retention" className="w-32">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="allow-data-export" className="text-base font-medium">User Data Export</Label>
                    <p className="text-sm text-gray-500">
                      Allow users to export their personal data
                    </p>
                  </div>
                  <Switch id="allow-data-export" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
