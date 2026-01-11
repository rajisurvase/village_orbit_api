import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, X, Edit, Trash2, Download, Search, GraduationCap, School, UserCog } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  aadhar_number: string;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason?: string;
  standard?: string;
  school_name?: string;
  roles?: string[];
}

const STANDARDS = [
  { value: "1st", label: "1st" },
  { value: "2nd", label: "2nd" },
  { value: "3rd", label: "3rd" },
  { value: "4th", label: "4th" },
  { value: "5th", label: "5th" },
  { value: "6th", label: "6th" },
  { value: "7th", label: "7th" },
  { value: "8th", label: "8th" },
  { value: "9th", label: "9th" },
  { value: "10th", label: "10th" },
  { value: "11th", label: "11th" },
  { value: "12th", label: "12th" },
];

const ROLES = [
  { value: "user", label: "User" },
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "sub_admin", label: "Sub Admin" },
  { value: "gramsevak", label: "Gramsevak" },
];

export default function UserManagementDashboard() {
  usePageSEO({ title: "User Management", description: "Manage user registrations and approvals" });
  const { user, loading: authLoading, isAdmin, isGramsevak, isSubAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState({
    standard: "",
    school_name: "",
    selectedRole: ""
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin && !isGramsevak && !isSubAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
      } else {
        fetchUsers();
      }
    }
  }, [authLoading, user, isAdmin, isGramsevak, isSubAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);
          
          return {
            ...profile,
            roles: rolesData?.map(r => r.role) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const userProfile = users.find(u => u.id === userId);
      if (!userProfile) {
        throw new Error("User not found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User approved successfully. Sending notification email...",
      });

      // Send approval email in background
      try {
        await supabase.functions.invoke("send-user-status-email", {
          body: {
            email: userProfile.email,
            fullName: userProfile.full_name,
            status: "approved",
          },
        });
        console.log("Approval email sent successfully");
      } catch (emailError: any) {
        console.error("Failed to send approval email:", emailError);
      }

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "rejected",
          rejection_reason: rejectionReason,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User rejected. Sending notification email...",
      });

      // Send rejection email in background
      try {
        await supabase.functions.invoke("send-user-status-email", {
          body: {
            email: selectedUser.email,
            fullName: selectedUser.full_name,
            status: "rejected",
            rejectionReason: rejectionReason,
          },
        });
        console.log("Rejection email sent successfully");
      } catch (emailError: any) {
        console.error("Failed to send rejection email:", emailError);
      }

      setRejectDialogOpen(false);
      setRejectionReason("");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setEditForm({
      standard: userProfile.standard || "",
      school_name: userProfile.school_name || "",
      selectedRole: userProfile.roles?.[0] || "user"
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;

    try {
      // Update profile with standard and school name
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          standard: editForm.standard || null,
          school_name: editForm.school_name || null,
        })
        .eq("id", selectedUser.id);

      if (profileError) throw profileError;

      // Update role if changed
      const currentRole = selectedUser.roles?.[0] || "user";
      if (editForm.selectedRole !== currentRole) {
        // Delete existing roles
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedUser.id);

        // Insert new role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: selectedUser.id,
            role: editForm.selectedRole as any
          });

        if (roleError) throw roleError;
      }

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      // Delete from profiles and user_roles (cascade will handle it)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Name", "Email", "Mobile", "Aadhar", "Status", "Standard", "School", "Roles", "Created At"],
      ...filteredUsers.map((u) => [
        u.full_name,
        u.email,
        u.mobile,
        u.aadhar_number,
        u.approval_status,
        u.standard || "",
        u.school_name || "",
        u.roles?.join(", ") || "",
        new Date(u.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || u.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Standard</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((userProfile) => (
              <TableRow key={userProfile.id}>
                <TableCell className="font-medium">{userProfile.full_name}</TableCell>
                <TableCell>{userProfile.email}</TableCell>
                <TableCell>{userProfile.mobile}</TableCell>
                <TableCell>
                  {userProfile.standard ? (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <GraduationCap className="h-3 w-3" />
                      {userProfile.standard}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  {userProfile.school_name ? (
                    <span className="text-sm flex items-center gap-1">
                      <School className="h-3 w-3" />
                      {userProfile.school_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not set</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(userProfile.approval_status)}</TableCell>
                <TableCell>
                  {userProfile.roles?.map((role) => (
                    <Badge key={role} variant="outline" className="mr-1">
                      {role}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(userProfile.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {userProfile.approval_status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(userProfile.id)}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(userProfile);
                            setRejectDialogOpen(true);
                          }}
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(userProfile)}
                      title="Edit User Details"
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(userProfile.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Edit User Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">User</Label>
              <p className="font-medium">{selectedUser?.full_name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>

            <div>
              <Label htmlFor="standard" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Standard / Class
              </Label>
              <Select 
                value={editForm.standard || "none"} 
                onValueChange={(value) => setEditForm({ ...editForm, standard: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  {STANDARDS.map((std) => (
                    <SelectItem key={std.value} value={std.value}>
                      {std.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Required for exam eligibility
              </p>
            </div>

            <div>
              <Label htmlFor="school_name" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                School Name
              </Label>
              <Input
                id="school_name"
                value={editForm.school_name}
                onChange={(e) => setEditForm({ ...editForm, school_name: e.target.value })}
                placeholder="Enter school name"
                className="mt-1"
              />
            </div>

            {isAdmin && (
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={editForm.selectedRole} 
                  onValueChange={(value) => setEditForm({ ...editForm, selectedRole: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
