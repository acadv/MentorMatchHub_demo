import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FormTemplate, FormField } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicLayout from "@/components/layout/public-layout";

export default function PublicForm({ params }: { params: { type: string; id: string } }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Required fields for all submissions
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const formType = params.type; // "mentor" or "mentee"
  const formId = parseInt(params.id);

  // Fetch form template
  const { data: formTemplate, isLoading, error } = useQuery<FormTemplate>({
    queryKey: [`/api/form-templates/${formId}`],
    enabled: !isNaN(formId)
  });
  
  // Type assertion for fields
  const templateFields = formTemplate?.fields as FormField[] | undefined;

  // Initialize form data
  useEffect(() => {
    if (templateFields) {
      const initialData: Record<string, any> = {};
      templateFields.forEach((field: FormField) => {
        if (field.type === "checkbox" || field.type === "multiselect") {
          initialData[field.id] = [];
        } else {
          initialData[field.id] = "";
        }
      });
      setFormData(initialData);
    }
  }, [templateFields]);

  // Handle form field changes
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Handle multiselect/checkbox field changes
  const handleMultiChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[fieldId]) ? [...prev[fieldId]] : [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, value] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter(v => v !== value) };
      }
    });
  };

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // Check required fields
      if (!name.trim()) {
        throw new Error("Name is required");
      }
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (!email.includes('@')) {
        throw new Error("Please enter a valid email address");
      }

      // Create submission data
      const submissionData = {
        name,
        email,
        organizationId: formTemplate?.organizationId || 1,
        formResponses: formData
      };

      // Submit based on form type
      if (formType === "mentor") {
        return apiRequest('POST', `/api/mentors`, submissionData);
      } else {
        return apiRequest('POST', `/api/mentees`, submissionData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Form submitted successfully",
        description: "Thank you for your submission!",
        variant: "default"
      });
      
      // Reset form
      setName("");
      setEmail("");
      setFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting form",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !formTemplate) {
    return (
      <PublicLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800">Form Not Found</h2>
          <p className="mt-2 text-gray-600">The form you are looking for does not exist or has been removed.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto pt-8 pb-16 px-4">
        <Helmet>
          <title>{formTemplate.name} | Mentor Match Platform</title>
          <meta name="description" content={`Fill out the ${formTemplate.name} form to join our mentoring program`} />
        </Helmet>

        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl">{formTemplate.name}</CardTitle>
            <CardDescription>
              {formType === "mentor" 
                ? "Thank you for your interest in becoming a mentor! Please fill out this form to join our mentor network."
                : "Please fill out this form to be matched with a mentor who can help guide your entrepreneurial journey."}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Additional Information</h3>
                
                {templateFields && templateFields.map((field: FormField) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === "text" && (
                      <Input 
                        id={field.id} 
                        value={formData[field.id] || ""} 
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                      />
                    )}
                    
                    {field.type === "textarea" && (
                      <Textarea 
                        id={field.id} 
                        value={formData[field.id] || ""} 
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                      />
                    )}
                    
                    {field.type === "select" && (
                      <Select 
                        value={formData[field.id] || ""} 
                        onValueChange={(value) => handleFieldChange(field.id, value)}
                      >
                        <SelectTrigger id={field.id}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {field.type === "multiselect" && (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <Checkbox 
                              id={`${field.id}-${option.value}`}
                              checked={formData[field.id]?.includes(option.value)}
                              onCheckedChange={(checked) => handleMultiChange(field.id, option.value, !!checked)}
                            />
                            <Label htmlFor={`${field.id}-${option.value}`} className="ml-2">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.type === "checkbox" && (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <Checkbox 
                              id={`${field.id}-${option.value}`}
                              checked={formData[field.id]?.includes(option.value)}
                              onCheckedChange={(checked) => handleMultiChange(field.id, option.value, !!checked)}
                            />
                            <Label htmlFor={`${field.id}-${option.value}`} className="ml-2">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.type === "radio" && (
                      <RadioGroup 
                        value={formData[field.id] || ""} 
                        onValueChange={(value) => handleFieldChange(field.id, value)}
                      >
                        {field.options?.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {field.type === "email" && (
                      <Input 
                        id={field.id} 
                        type="email"
                        value={formData[field.id] || ""} 
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "email@example.com"}
                        required={field.required}
                      />
                    )}
                    
                    {field.type === "number" && (
                      <Input 
                        id={field.id} 
                        type="number"
                        value={formData[field.id] || ""} 
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "0"}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t pt-6">
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="w-full md:w-auto"
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Submitting...
                  </>
                ) : (
                  `Submit ${formType === "mentor" ? "Mentor" : "Mentee"} Application`
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Thank you for your interest in our mentoring program. Your information will be reviewed by our team.</p>
        </div>
      </div>
    </PublicLayout>
  );
}