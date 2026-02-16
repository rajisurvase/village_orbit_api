import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiAuth } from "@/hooks/useApiAuth";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  LogOut,
  Shield,
  ShoppingBag,
  Users,
  FileText,
  MessagesSquare,
  LayoutDashboard,
  GraduationCap,
  FolderTree,
  Settings,
} from "lucide-react";
import { CUSTOM_ROUTES } from "@/custom-routes";
import { SuperAdminGuard } from "@/components/guards/PermissionGuard";
import { usePageVisibilityData } from "@/hooks/village/useService";
import { VILLAGES } from "@/config/villageConfig";

const Admin = () => {
  const {
    user,
    isSuperAdmin,
    isAdmin,
    isSubAdmin,
    loading: authLoading,
    logout,
    hasPermission,
  } = useApiAuth();
  const [selectedVillage, setSelectedVillage] = useState(VILLAGES.shivankhed.name);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user can access admin panel
  const canAccessAdmin = isSuperAdmin || isAdmin || isSubAdmin;
  const { data: pages, isLoading } = usePageVisibilityData(canAccessAdmin);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !canAccessAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [authLoading, user, canAccessAdmin, navigate, toast, selectedVillage]);

  // const fetchPageVisibility = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("page_visibility")
  //       .select("*")
  //       .eq("village_name", selectedVillage)
  //       .order("page_key");

  //     if (error) throw error;
  //     setPages(data || []);
  //   } catch (error) {
  //     console.error("Error fetching pages:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to load page visibility settings.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleToggleVisibility = async (
    pageId: string,
    currentVisibility: boolean,
  ) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("page_visibility")
        .update({
          is_visible: !currentVisibility,
          updated_at: new Date().toISOString(),
          updated_by: user?.userId,
        })
        .eq("id", pageId);

      if (error) throw error;

      // Update local state
      // setPages(
      //   pages.map((page) =>
      //     page.id === pageId
      //       ? { ...page, is_visible: !currentVisibility }
      //       : page,
      //   ),
      // );

      toast({
        title: "Updated",
        description: "Page visibility has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update page visibility.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !canAccessAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Admin Header */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Admin Panel</CardTitle>
                    <CardDescription>
                      Manage page visibility and village data
                      {isSuperAdmin && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Super Admin
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
              <CardDescription>
                Access different management sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {hasPermission("users:view") && (
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(CUSTOM_ROUTES.USER_MANAGEMENT)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Review, approve, and reject user registrations
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(CUSTOM_ROUTES.VILLAGE_MANAGEMENT)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Village Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add, edit, and manage village information
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(CUSTOM_ROUTES.JSON_CONFIG)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      JSON Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Edit village configuration data dynamically
                    </p>
                  </CardContent>
                </Card>

                {hasPermission("feedback:view") && (
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(CUSTOM_ROUTES.CONTACT_MESSAGE)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessagesSquare className="h-5 w-5" />
                        Contact Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View and manage contact form submissions
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(CUSTOM_ROUTES.ADMIN_DASHBOARD)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Admin Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View users, posts, and ratings analytics
                    </p>
                  </CardContent>
                </Card>

                {hasPermission("marketplace:view") && (
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(CUSTOM_ROUTES.ADMIN_MARKETPLACE)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Marketplace Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Approve, reject, and manage marketplace listings
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/admin/exam-management")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Exam Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create, manage, and conduct online exams
                    </p>
                  </CardContent>
                </Card>

                {hasPermission("services:view") && (
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(CUSTOM_ROUTES.SERVICES_ADMIN)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FolderTree className="h-5 w-5" />
                        Manage Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View, edit, and delete village services
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* {hasPermission('services:create') && (
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(CUSTOM_ROUTES.ADD_SERVICE)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Add new services to the village directory
                      </p>
                    </CardContent>
                  </Card>
                )} */}

                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(CUSTOM_ROUTES.MANAGE_CATEGORIES)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderTree className="h-5 w-5" />
                      Manage Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage service categories and organization
                    </p>
                  </CardContent>
                </Card>

                {/* Super Admin Only - RBAC Management */}
                <SuperAdminGuard>
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-primary/30"
                    onClick={() => navigate("/admin/rbac")}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        RBAC Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Manage roles, permissions, and user assignments
                      </p>
                    </CardContent>
                  </Card>
                </SuperAdminGuard>
              </div>
            </CardContent>
          </Card>

          {/* Village Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Village</CardTitle>
              <CardDescription>
                Choose a village to manage its page visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedVillage}
                onValueChange={setSelectedVillage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shivankhed">Shivankhed</SelectItem>
                  <SelectItem value="Gudsoor">Gudsoor</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Page Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Page Visibility for {selectedVillage}</CardTitle>
              <CardDescription>
                Toggle pages on/off for this village
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : pages.length >= 0 ? (
                  pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <Label
                        htmlFor={page.id}
                        className="text-base font-medium cursor-pointer"
                      >
                        {page.pageLabel}
                      </Label>
                      <Switch
                        id={page.id}
                        checked={page.isVisible}
                        onCheckedChange={() =>
                          handleToggleVisibility(page.id, page.isVisible)
                        }
                        disabled={updating}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No page visibility settings found for this village.
                  </p>
                )} */}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
