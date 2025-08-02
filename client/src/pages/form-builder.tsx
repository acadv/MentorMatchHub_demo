import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import FormEditor from "@/components/form-builder/form-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Link as LinkIcon } from "lucide-react";
import { FormTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function FormBuilder() {
  const { toast } = useToast();
  const [activeFormType, setActiveFormType] = useState<"mentor" | "mentee">("mentor");
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Fetch form templates
  const { data: formTemplates, isLoading } = useQuery<FormTemplate[]>({
    queryKey: ['/api/form-templates'],
  });
  
  // Filter templates by type
  const mentorTemplates = formTemplates?.filter(template => template.type === "mentor") || [];
  const menteeTemplates = formTemplates?.filter(template => template.type === "mentee") || [];
  
  return (
    <>
      <Helmet>
        <title>Form Builder | Mentor Match Platform</title>
        <meta name="description" content="Create and customize onboarding forms for mentors and mentees" />
      </Helmet>
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Form Builder</h1>
          <p className="mt-1 text-sm text-gray-500">Create and customize onboarding forms for mentors and mentees</p>
        </div>
      </div>
      
      {/* Form builder tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mentor" onValueChange={(value) => {
            setActiveFormType(value as "mentor" | "mentee");
            setActiveTemplateId(null);
            setShowCreateForm(false);
          }}>
            <TabsList className="mb-4">
              <TabsTrigger value="mentor">Mentor Forms</TabsTrigger>
              <TabsTrigger value="mentee">Mentee Forms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mentor">
              <FormTemplatesList
                templates={mentorTemplates}
                isLoading={isLoading}
                onSelect={(id) => {
                  setActiveTemplateId(id);
                  setShowCreateForm(true);
                }}
                onNew={() => {
                  setActiveTemplateId(null);
                  setShowCreateForm(true);
                }}
                formType="mentor"
              />
            </TabsContent>
            
            <TabsContent value="mentee">
              <FormTemplatesList
                templates={menteeTemplates}
                isLoading={isLoading}
                onSelect={(id) => {
                  setActiveTemplateId(id);
                  setShowCreateForm(true);
                }}
                onNew={() => {
                  setActiveTemplateId(null);
                  setShowCreateForm(true);
                }}
                formType="mentee"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Form editor section */}
      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {activeTemplateId 
                ? `Edit ${activeFormType === "mentor" ? "Mentor" : "Mentee"} Form` 
                : `Create New ${activeFormType === "mentor" ? "Mentor" : "Mentee"} Form`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormEditor
              formType={activeFormType}
              formTemplateId={activeTemplateId || undefined}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

interface FormTemplatesListProps {
  templates: FormTemplate[];
  isLoading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
  formType: "mentor" | "mentee";
}

function FormTemplatesList({ templates, isLoading, onSelect, onNew, formType }: FormTemplatesListProps) {
  const { toast } = useToast();
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          <PlusCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No form templates</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first {formType} onboarding form.
        </p>
        <div className="mt-6">
          <Button onClick={onNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create {formType === "mentor" ? "Mentor" : "Mentee"} Form
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Form
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
            onClick={() => onSelect(template.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500">
                  {Array.isArray(template.fields) ? template.fields.length : 0} questions
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {template.updatedAt ? new Date(String(template.updatedAt)).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <div className="flex space-x-2 mb-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Create a public form URL
                      const url = `${window.location.origin}/forms/${template.type}/${template.id}`;
                      navigator.clipboard.writeText(url);
                      toast({
                        title: "Form link copied!",
                        description: "You can now share this link with mentors or mentees.",
                        variant: "default",
                      });
                    }}
                  >
                    Copy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-gray-500 hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
