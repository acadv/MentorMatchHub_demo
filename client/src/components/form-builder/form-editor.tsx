import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/utils";
import { FormField, Form, formFieldSchema } from "@shared/schema";
import { PlusCircle, Trash2, GripVertical, Save } from "lucide-react";
import { QuestionTypeSelect, FormPreviewField } from "./question-types";

interface FormEditorProps {
  formType: "mentor" | "mentee";
  formTemplateId?: number;
}

export default function FormEditor({ formType, formTemplateId }: FormEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for form fields
  const [formName, setFormName] = useState<string>(`${formType.charAt(0).toUpperCase() + formType.slice(1)} Onboarding Form`);
  const [fields, setFields] = useState<FormField[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedField, setDraggedField] = useState<FormField | null>(null);

  // Fetch existing form template if editing
  const { data: formTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['/api/form-templates', formTemplateId],
    queryFn: async () => {
      if (!formTemplateId) return null;
      const response = await fetch(`/api/form-templates/${formTemplateId}`);
      if (!response.ok) throw new Error('Failed to fetch form template');
      return response.json();
    },
    enabled: !!formTemplateId,
  });

  // Load form template data if editing
  useEffect(() => {
    if (formTemplate) {
      setFormName(formTemplate.name);
      setFields(Array.isArray(formTemplate.fields) ? formTemplate.fields : []);
    }
  }, [formTemplate]);

  // Save form mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = {
        name: formName,
        type: formType,
        organizationId: 1, // Default organization
        fields
      };

      if (formTemplateId) {
        return apiRequest('PATCH', `/api/form-templates/${formTemplateId}`, formData);
      } else {
        return apiRequest('POST', '/api/form-templates', formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-templates'] });
      toast({
        title: "Form saved",
        description: "Your form has been saved successfully",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving form",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  // Add a new field
  const addField = () => {
    const newField: FormField = {
      id: generateId(),
      type: "text",
      label: "New Question",
      placeholder: "",
      required: false
    };
    setFields([...fields, newField]);
  };

  // Remove a field
  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  // Update a field
  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  // Handle drag start
  const handleDragStart = (field: FormField) => {
    setIsDragging(true);
    setDraggedField(field);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedField) return;
    
    const newFields = [...fields];
    const draggedIndex = fields.findIndex(f => f.id === draggedField.id);
    if (draggedIndex === index) return;
    
    // Remove the dragged item
    newFields.splice(draggedIndex, 1);
    // Insert it at the new position
    newFields.splice(index, 0, draggedField);
    
    setFields(newFields);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedField(null);
  };

  // Save the form
  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          className="max-w-md"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Form Name"
        />
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          Save Form
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                <PlusCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No questions added</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first question to the form.
              </p>
              <div className="mt-6">
                <Button onClick={addField}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white p-4 rounded-md shadow mb-4 border ${
                    isDragging && draggedField?.id === field.id
                      ? "border-primary border-dashed opacity-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <GripVertical className="mr-2 h-5 w-5 text-gray-400 cursor-move" />
                      <h4 className="font-medium text-gray-800">{field.label}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`label-${field.id}`} className="mb-1 block">
                        Question Text
                      </Label>
                      <Input
                        id={`label-${field.id}`}
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Enter your question"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`type-${field.id}`} className="mb-1 block">
                        Question Type
                      </Label>
                      <QuestionTypeSelect
                        id={`type-${field.id}`}
                        value={field.type}
                        onChange={(value) => updateField(field.id, { type: value as any })}
                      />
                    </div>
                  </div>
                  
                  {(field.type === "select" || field.type === "multiselect" || field.type === "radio" || field.type === "checkbox") && (
                    <div className="mt-3">
                      <Label className="mb-1 block">Options</Label>
                      <div className="space-y-2">
                        {field.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[optIndex] = {
                                  value: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                                  label: e.target.value
                                };
                                updateField(field.id, { options: newOptions });
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(field.options || [])];
                                newOptions.splice(optIndex, 1);
                                updateField(field.id, { options: newOptions });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...(field.options || [])];
                            newOptions.push({ value: `option-${newOptions.length + 1}`, label: `Option ${newOptions.length + 1}` });
                            updateField(field.id, { options: newOptions });
                          }}
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {(field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "number") && (
                    <div className="mt-3">
                      <Label htmlFor={`placeholder-${field.id}`} className="mb-1 block">
                        Placeholder Text
                      </Label>
                      <Input
                        id={`placeholder-${field.id}`}
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center mt-3">
                    <Checkbox
                      id={`required-${field.id}`}
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                    />
                    <Label htmlFor={`required-${field.id}`} className="ml-2 text-sm text-gray-700">
                      Required field
                    </Label>
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</div>
                    <FormPreviewField field={field} />
                  </div>
                </div>
              ))}
              
              <Button onClick={addField} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
