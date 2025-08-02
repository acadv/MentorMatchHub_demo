import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormEditor } from "@/components/form-builder/form-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FormBuilderModal({ isOpen, onClose }: FormBuilderModalProps) {
  const [formType, setFormType] = useState<"mentor" | "mentee">("mentor");
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Form Builder</DialogTitle>
          <DialogDescription>
            Create custom onboarding forms for mentors and mentees.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {/* Form Type Selection */}
          <div className="mb-6">
            <Tabs defaultValue={formType} onValueChange={(value) => setFormType(value as "mentor" | "mentee")}>
              <TabsList>
                <TabsTrigger value="mentor">Mentor Onboarding</TabsTrigger>
                <TabsTrigger value="mentee">Mentee Onboarding</TabsTrigger>
              </TabsList>
              <TabsContent value="mentor">
                <div className="mt-4">
                  <FormEditor formType="mentor" />
                </div>
              </TabsContent>
              <TabsContent value="mentee">
                <div className="mt-4">
                  <FormEditor formType="mentee" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
