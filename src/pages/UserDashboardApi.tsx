/**
 * API-based User Dashboard
 * Uses REST API authentication instead of Supabase
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useApiAuth } from "@/hooks/useApiAuth";
import { ArrowLeft, LogOut, Edit, Save, X, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/services/userProfileService";

const UserDashboardApi = () => {
  usePageSEO({ title: "My Dashboard", description: "Your personal dashboard" });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    user, 
    loading: authLoading, 
    isAuthenticated, 
    isApproved,
    logout,
    refreshUser,
  } = useApiAuth();

  const { mutateAsync, isPending} = useMutation({
    mutationFn : updateUserProfile
  })

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        mobile: user.mobile || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    window.location.replace("/");
  };

  // const handleUpdate = async () => {
  //   // Note: Profile update would require a backend API endpoint
  //   // For now, just show a placeholder message
  //   toast({
  //     title: "Update Pending",
  //     description: "Profile updates require backend API integration.",
  //   });
  //   setEditing(false);
  // };

  const handleUpdateUserProfile = ()=>{
    mutateAsync(formData, {
      onSuccess: async()=>{
        toast({ 
          title: "Success", 
          description: "Profile updated successfully."
        })
        await refreshUser();
        setEditing(false);
      },
      onError: (error: any)=>{
        toast({
          title: "Error",
          description: error.message || "Failed to update profile.",
          variant: "destructive",
        });
      }
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show pending approval view
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Account Pending Approval</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your registration is currently being reviewed by our administrators. 
                You will receive a notification once your account is approved.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Registered Email:</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" disabled={isPending} onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user?.fullName || 'User'}!</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Details</CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={()=>setEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpdateUserProfile} disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                {editing ? (
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                ) : (
                  <p className="text-muted-foreground">{user?.fullName || '-'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-muted-foreground">{user?.email || '-'}</p>
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                {editing ? (
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                ) : (
                  <p className="text-muted-foreground">{user?.mobile || '-'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Aadhar Number</Label>
                <p className="text-muted-foreground">
                  {user?.aadharNumber ? `XXXX-XXXX-${user.aadharNumber.slice(-4)}` : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <p className="text-green-600 font-medium">Approved</p>
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-1">
                  {user?.roles?.map((role) => (
                    <span key={role.id} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm capitalize">
                      {role.name.replace('_', ' ')}
                    </span>
                  )) || <span className="text-muted-foreground">-</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardApi;
