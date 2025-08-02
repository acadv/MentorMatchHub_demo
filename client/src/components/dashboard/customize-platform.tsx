import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomizePlatform() {
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardContent className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Platform Customization</h3>
        <p className="text-sm text-gray-500">Customize your mentor matching platform's appearance and functionality</p>
      </CardContent>
      
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Form Builder Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center mb-4">
              <div className="flex-shrink-0 bg-primary bg-opacity-10 p-2 rounded-md">
                <i className="fas fa-wpforms text-primary text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-800">Form Builder</h4>
                <p className="text-sm text-gray-500">Create custom onboarding forms</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create personalized onboarding experiences for mentors and mentees with our no-code form builder. Add custom fields, question types, and required fields.
            </p>
            <div className="mt-auto">
              <Link href="/form-builder">
                <Button className="inline-flex items-center">
                  Open Form Builder
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Branding Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center mb-4">
              <div className="flex-shrink-0 bg-purple-100 p-2 rounded-md">
                <i className="fas fa-paint-brush text-purple-600 text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-800">Branding</h4>
                <p className="text-sm text-gray-500">Customize platform appearance</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Update your organization's logo, colors, and other branding elements to create a seamless experience for your mentors and mentees.
            </p>
            <div className="mt-auto">
              <Link href="/branding">
                <Button className="inline-flex items-center" variant="secondary">
                  Customize Branding
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Email Templates Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center mb-4">
              <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                <i className="fas fa-envelope text-blue-600 text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-800">Email Templates</h4>
                <p className="text-sm text-gray-500">Customize automated emails</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Customize the email templates used for introductions, follow-ups, and feedback requests to match your organization's voice and branding.
            </p>
            <div className="mt-auto">
              <Link href="/communications">
                <Button className="inline-flex items-center" variant="default" 
                  style={{ backgroundColor: "#3b82f6" }}> {/* Using blue-600 color */}
                  Edit Email Templates
                </Button>
              </Link>
            </div>
          </div>
          
          {/* AI Settings Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center mb-4">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                <i className="fas fa-robot text-green-600 text-xl"></i>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-gray-800">AI Settings</h4>
                <p className="text-sm text-gray-500">Configure matching algorithm</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Adjust the AI matching algorithm to prioritize different factors when suggesting mentor-mentee matches, such as skills, availability, or industry experience.
            </p>
            <div className="mt-auto">
              <Link href="/settings">
                <Button className="inline-flex items-center" variant="default"
                  style={{ backgroundColor: "#10b981" }}> {/* Using green-500 color */}
                  Configure AI Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
