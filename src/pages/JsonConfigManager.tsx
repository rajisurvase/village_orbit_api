import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetVillageConfigById, useVillages } from "@/hooks/useVillagehooks";
import { useMutation } from "@tanstack/react-query";
import { UpdateVillageConfigById } from "@/services/village-service";
import useApiAuth from "@/hooks/useApiAuth";

const JsonConfigManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission, isAuthenticated, logout } = useApiAuth();
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("mr");
  const [jsonContent, setJsonContent] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi (हिंदी)" },
    { code: "mr", name: "Marathi (मराठी)" },
  ];
  const { data: villagesData, isLoading } = useVillages();
  const { data: villageConfig, isLoading: isConfigLoading } =
    useGetVillageConfigById({
      id: selectedVillage,
      language: selectedLanguage,
    });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: UpdateVillageConfigById,
  });

  const validateJson = (text: string): boolean => {
    try {
      JSON.parse(text);
      setValidationError(null);
      setValidationSuccess(true);
      return true;
    } catch (e) {
      setValidationError(
        e instanceof Error ? e.message : "Invalid JSON format",
      );
      setValidationSuccess(false);
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    if (value.trim()) {
      validateJson(value);
    } else {
      setValidationError(null);
      setValidationSuccess(false);
    }
  };

  const handleSave = () => {
    if (!selectedVillage) {
      toast({
        title: "Error",
        description: "Please select a village",
        variant: "destructive",
      });
      return;
    }

    if (!validateJson(jsonContent)) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax errors before saving",
        variant: "destructive",
      });
      return;
    }

    let parsedConfig = JSON.parse(jsonContent);

    // Strip metadata fields if they exist (in case user pasted entire request payload)
    if (
      parsedConfig.village_id ||
      parsedConfig.language ||
      parsedConfig.updated_by
    ) {
      // User pasted entire payload, extract only config_data
      if (parsedConfig.config_data) {
        parsedConfig = parsedConfig.config_data;
      }
      // Remove metadata fields
      delete parsedConfig.village_id;
      delete parsedConfig.language;
      delete parsedConfig.updated_by;
    }

    mutateAsync(
      {
        id: selectedVillage,
        language: selectedLanguage,
        ...parsedConfig,
      },
      {
        onSuccess() {
          toast({
            title: "Success",
            description: "Configuration saved successfully",
          });
        },
        onError(error) {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to save configuration",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (villageConfig && !isConfigLoading) {
      setJsonContent(JSON.stringify(villageConfig, null, 2));
    }
  }, [villageConfig]);

  if (!hasPermission("village:config") && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              JSON Configuration Manager
            </h1>
            <p className="text-muted-foreground">
              Manage village configuration data dynamically
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Village Configuration Editor</CardTitle>
            <CardDescription>
              Select a village and edit its configuration JSON. Changes are
              saved to the database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Village</label>
                <Select
                  value={selectedVillage}
                  onValueChange={setSelectedVillage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a village..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      villagesData.map((village) => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Language</label>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedVillage && selectedLanguage && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Configuration JSON
                  </label>
                  {isConfigLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Textarea
                      value={jsonContent}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="font-mono text-sm min-h-[500px]"
                      placeholder="Enter JSON configuration..."
                    />
                  )}
                </div>

                {validationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {validationSuccess && !validationError && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Valid JSON format
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={
                      isPending ||
                      !!validationError ||
                      !jsonContent.trim() ||
                      isConfigLoading
                    }
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonConfigManager;
