import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HexColorPicker } from "react-colorful";
import { useBranding } from "@/contexts/branding-context";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/common/tabs";
import { Upload, Paintbrush, Save, RefreshCw } from "lucide-react";

export default function Branding() {
  const { organization, updateOrganization, isLoading } = useBranding();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState<string>("#8B5CF6");
  const [accentColor, setAccentColor] = useState<string>("#10B981");
  const [showPrimaryPicker, setShowPrimaryPicker] = useState<boolean>(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState<boolean>(false);
  const [showAccentPicker, setShowAccentPicker] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");

  // Load organization data when available
  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
      setLocation(organization.location || "");
      setAbout(organization.about || "");
      setLogoUrl(organization.logo || "");
      setPrimaryColor(organization.primaryColor || "#03254d");
      setSecondaryColor(organization.secondaryColor || "#f44336");
      setAccentColor(organization.accentColor || "#faa19b");
      
      // Ensure body has the branded class
      document.body.classList.add('branded');
    }
  }, [organization]);

  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: async () => {
      const updates = {
        name,
        location,
        about,
        logo: logoUrl,
        primaryColor,
        secondaryColor,
        accentColor
      };
      await updateOrganization(updates);
    },
    onSuccess: () => {
      toast({
        title: "Branding updated",
        description: "Your branding changes have been saved successfully.",
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving branding",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload this to a server
    // For now, we'll just create a data URL (not recommended for production)
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle save all branding changes
  const handleSave = () => {
    saveBrandingMutation.mutate();
  };

  // Reset branding to defaults
  const handleReset = () => {
    setPrimaryColor("#3B82F6");
    setSecondaryColor("#8B5CF6");
    setAccentColor("#10B981");
    toast({
      title: "Colors reset",
      description: "Colors have been reset to default values. Don't forget to save your changes.",
      variant: "default"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Branding | Mentor Match Platform</title>
        <meta name="description" content="Customize your mentor matching platform's appearance with your organization's branding" />
      </Helmet>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Branding</h1>
          <p className="mt-1 text-sm text-gray-500">Customize your mentor matching platform's appearance</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saveBrandingMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveBrandingMutation.isPending}
          >
            {saveBrandingMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branding Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Organization Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-location">Location</Label>
                <Input
                  id="org-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State/Province, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-about">About Your Organization</Label>
                <Textarea
                  id="org-about"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell us about your organization, its mission, and goals..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Organization Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 border rounded flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Paintbrush className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      Recommended size: 200x200 pixels. SVG, PNG, or JPG format.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="relative">
                    <div className="flex">
                      <div
                        className="w-10 h-10 rounded-l-md border border-r-0 border-gray-300"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                      ></div>
                      <Input
                        id="primary-color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                    {showPrimaryPicker && (
                      <div className="absolute z-10 mt-2">
                        <HexColorPicker
                          color={primaryColor}
                          onChange={setPrimaryColor}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => setShowPrimaryPicker(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Used for primary buttons, links, and active states</p>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="relative">
                    <div className="flex">
                      <div
                        className="w-10 h-10 rounded-l-md border border-r-0 border-gray-300"
                        style={{ backgroundColor: secondaryColor }}
                        onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                      ></div>
                      <Input
                        id="secondary-color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                    {showSecondaryPicker && (
                      <div className="absolute z-10 mt-2">
                        <HexColorPicker
                          color={secondaryColor}
                          onChange={setSecondaryColor}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => setShowSecondaryPicker(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Used for secondary buttons and highlights</p>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="relative">
                    <div className="flex">
                      <div
                        className="w-10 h-10 rounded-l-md border border-r-0 border-gray-300"
                        style={{ backgroundColor: accentColor }}
                        onClick={() => setShowAccentPicker(!showAccentPicker)}
                      ></div>
                      <Input
                        id="accent-color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                    {showAccentPicker && (
                      <div className="absolute z-10 mt-2">
                        <HexColorPicker
                          color={accentColor}
                          onChange={setAccentColor}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => setShowAccentPicker(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Used for success indicators and special elements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Branding Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as "light" | "dark")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="light">Light Mode</TabsTrigger>
                  <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                </TabsList>
              </Tabs>

              <div
                className={`rounded-lg border p-4 branded ${
                  previewMode === "dark" ? "bg-gray-900 text-white" : "bg-white"
                }`}
              >
                {/* Header */}
                <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-8 mr-2"
                    />
                  ) : (
                    <div className="font-semibold text-lg" style={{ color: primaryColor }}>
                      {name || "Organization"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold" style={{ color: primaryColor }}>
                    Welcome to your mentor matching platform!
                  </h3>
                  <p className="text-sm">
                    Custom branding helps create a cohesive experience for your users.
                  </p>

                  {/* Button examples */}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full btn-primary"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      size="sm"
                      className="w-full btn-secondary"
                      style={{
                        backgroundColor: secondaryColor,
                        borderColor: secondaryColor,
                      }}
                    >
                      Secondary Button
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Outline Button
                    </Button>
                  </div>

                  {/* Sample content */}
                  <div className="text-sm">
                    <p>
                      Example of a{" "}
                      <a href="#" style={{ color: primaryColor }} className="underline text-primary">
                        link
                      </a>{" "}
                      with your primary color.
                    </p>
                    <div className="mt-2 p-2 rounded text-white text-xs" style={{ backgroundColor: accentColor }}>
                      This success message uses your accent color.
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                This is a simplified preview. Actual appearance may vary across different parts of the application.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
