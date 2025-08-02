import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@shared/schema";

// Component to select question type
interface QuestionTypeSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function QuestionTypeSelect({ id, value, onChange }: QuestionTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select question type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="text">Text Input</SelectItem>
        <SelectItem value="textarea">Text Area</SelectItem>
        <SelectItem value="select">Dropdown</SelectItem>
        <SelectItem value="multiselect">Multiple Select</SelectItem>
        <SelectItem value="checkbox">Checkboxes</SelectItem>
        <SelectItem value="radio">Radio Buttons</SelectItem>
        <SelectItem value="email">Email</SelectItem>
        <SelectItem value="number">Number</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Component to preview a form field
interface FormPreviewFieldProps {
  field: FormField;
}

export function FormPreviewField({ field }: FormPreviewFieldProps) {
  switch (field.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <Input
            id={`preview-${field.id}`}
            placeholder={field.placeholder || ""}
            disabled
          />
        </div>
      );
      
    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <Textarea
            id={`preview-${field.id}`}
            placeholder={field.placeholder || ""}
            disabled
          />
        </div>
      );
      
    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <Select disabled>
            <SelectTrigger id={`preview-${field.id}`}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
      
    case "multiselect":
      return (
        <div className="space-y-2">
          <Label>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <div className="border rounded-md p-2 bg-white">
            <div className="flex flex-wrap gap-1">
              {field.options?.slice(0, 2).map((option, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                  {option.label}
                  <button type="button" className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                </span>
              ))}
              <input type="text" className="border-0 outline-none flex-1 px-1 py-0.5 text-sm" placeholder="Select options..." disabled />
            </div>
          </div>
        </div>
      );
      
    case "checkbox":
      return (
        <div className="space-y-2">
          <Label>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`preview-${field.id}-${index}`} disabled />
                <Label htmlFor={`preview-${field.id}-${index}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
      );
      
    case "radio":
      return (
        <div className="space-y-2">
          <Label>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <RadioGroup disabled>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`preview-${field.id}-${index}`} />
                <Label htmlFor={`preview-${field.id}-${index}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
      
    case "email":
      return (
        <div className="space-y-2">
          <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <Input
            id={`preview-${field.id}`}
            type="email"
            placeholder={field.placeholder || "email@example.com"}
            disabled
          />
        </div>
      );
      
    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={`preview-${field.id}`}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
          <Input
            id={`preview-${field.id}`}
            type="number"
            placeholder={field.placeholder || "0"}
            disabled
          />
        </div>
      );
      
    default:
      return null;
  }
}
