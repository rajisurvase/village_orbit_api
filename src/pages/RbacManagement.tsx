/**
 * RBAC Management Page
 * Super Admin only - Manage roles, permissions, and user-role assignments
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useApiAuth } from "@/hooks/useApiAuth";
import { rbacService, Role, Permission } from "@/services/rbacService";
import { adminService, AdminUser } from "@/services/adminService";
import { BackendHealth } from "@/components/BackendHealth";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Key, 
  Users,
  Settings2,
  UserCog
} from "lucide-react";

const RbacManagement = () => {
  usePageSEO({ 
    title: "RBAC Management", 
    description: "Manage roles, permissions, and user assignments" 
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: authLoading, isAuthenticated, isSuperAdmin } = useApiAuth();

  // State for roles, permissions, users
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false);
  const [assignPermissionsOpen, setAssignPermissionsOpen] = useState(false);
  const [assignRolesOpen, setAssignRolesOpen] = useState(false);
  
  // Form states
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  
  // Selection states
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  
  const [actionLoading, setActionLoading] = useState(false);

  // Check authorization
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (!authLoading && !isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only Super Admin can access RBAC Management.",
        variant: "destructive",
      });
      navigate("/admin");
      return;
    }
  }, [authLoading, isAuthenticated, isSuperAdmin, navigate]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        rbacService.getRoles(),
        rbacService.getPermissions(),
        adminService.getUsers({ size: 100 }),
      ]);

      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (permissionsRes.success && permissionsRes.data) {
        setPermissions(permissionsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.content);
      }
    } catch (error) {
      console.error("Error fetching RBAC data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch RBAC data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      fetchData();
    }
  }, [authLoading, isSuperAdmin]);

  // Create role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({ title: "Error", description: "Role name is required", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const response = await rbacService.createRole({
        name: newRoleName,
        description: newRoleDescription,
      });

      if (response.success) {
        toast({ title: "Success", description: "Role created successfully" });
        setCreateRoleOpen(false);
        setNewRoleName("");
        setNewRoleDescription("");
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to create role", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    setActionLoading(true);
    try {
      const response = await rbacService.deleteRole(roleId);
      if (response.success) {
        toast({ title: "Success", description: "Role deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to delete role", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Create permission
  const handleCreatePermission = async () => {
    if (!newPermissionName.trim()) {
      toast({ title: "Error", description: "Permission name is required", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const response = await rbacService.createPermission({
        name: newPermissionName,
        description: newPermissionDescription,
      });

      if (response.success) {
        toast({ title: "Success", description: "Permission created successfully" });
        setCreatePermissionOpen(false);
        setNewPermissionName("");
        setNewPermissionDescription("");
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to create permission", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create permission", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete permission
  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    setActionLoading(true);
    try {
      const response = await rbacService.deletePermission(permissionId);
      if (response.success) {
        toast({ title: "Success", description: "Permission deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to delete permission", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete permission", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Assign permissions to role
  const handleAssignPermissions = async () => {
    if (!selectedRole || selectedPermissionIds.length === 0) {
      toast({ title: "Error", description: "Select at least one permission", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const response = await rbacService.addPermissionsToRole(selectedRole.id, selectedPermissionIds);
      if (response.success) {
        toast({ title: "Success", description: "Permissions assigned to role" });
        setAssignPermissionsOpen(false);
        setSelectedRole(null);
        setSelectedPermissionIds([]);
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to assign permissions", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign permissions", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Remove permission from role
  const handleRemovePermissionFromRole = async (roleId: string, permissionId: string) => {
    setActionLoading(true);
    try {
      const response = await rbacService.removePermissionFromRole(roleId, permissionId);
      if (response.success) {
        toast({ title: "Success", description: "Permission removed from role" });
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to remove permission", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove permission", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Assign roles to user
  const handleAssignRoles = async () => {
    if (!selectedUser || selectedRoleIds.length === 0) {
      toast({ title: "Error", description: "Select at least one role", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const response = await rbacService.assignRolesToUser(selectedUser.userId, selectedRoleIds);
      if (response.success) {
        toast({ title: "Success", description: "Roles assigned to user" });
        setAssignRolesOpen(false);
        setSelectedUser(null);
        setSelectedRoleIds([]);
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to assign roles", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign roles", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Remove role from user
  const handleRemoveRoleFromUser = async (userId: string, roleId: string) => {
    setActionLoading(true);
    try {
      const response = await rbacService.removeRoleFromUser(userId, roleId);
      if (response.success) {
        toast({ title: "Success", description: "Role removed from user" });
        fetchData();
      } else {
        toast({ title: "Error", description: response.error || "Failed to remove role", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove role", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading RBAC Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              RBAC Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <BackendHealth showDetails={false} />
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              User Roles
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Roles</CardTitle>
                  <CardDescription>Manage system roles and their permissions</CardDescription>
                </div>
                <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>Add a new role to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Role Name</Label>
                        <Input
                          placeholder="e.g., moderator"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Role description..."
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateRoleOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateRole} disabled={actionLoading}>
                        {actionLoading ? "Creating..." : "Create Role"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>System Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground">{role.description || "-"}</TableCell>
                        <TableCell>
                          {role.isSystemRole ? (
                            <Badge variant="secondary">System</Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {role.permissions.length > 0 ? (
                              role.permissions.slice(0, 3).map((perm) => (
                                <Badge 
                                  key={perm.id} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-destructive/10"
                                  onClick={() => handleRemovePermissionFromRole(role.id, perm.id)}
                                >
                                  {perm.name} ×
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No permissions</span>
                            )}
                            {role.permissions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRole(role);
                                setSelectedPermissionIds(role.permissions.map(p => p.id));
                                setAssignPermissionsOpen(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            {!role.isSystemRole && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={actionLoading}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Manage system permissions</CardDescription>
                </div>
                <Dialog open={createPermissionOpen} onOpenChange={setCreatePermissionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Permission</DialogTitle>
                      <DialogDescription>Add a new permission to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Permission Name</Label>
                        <Input
                          placeholder="e.g., services:delete"
                          value={newPermissionName}
                          onChange={(e) => setNewPermissionName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Permission description..."
                          value={newPermissionDescription}
                          onChange={(e) => setNewPermissionDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreatePermissionOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreatePermission} disabled={actionLoading}>
                        {actionLoading ? "Creating..." : "Create Permission"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium font-mono text-sm">{permission.name}</TableCell>
                        <TableCell className="text-muted-foreground">{permission.description || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(permission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDeletePermission(permission.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Roles Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Role Assignments</CardTitle>
                <CardDescription>Assign roles to users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role.id} variant="outline" className="text-xs">
                                  {role.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No roles</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.approvalStatus === 'APPROVED' ? 'default' : 'secondary'}>
                            {user.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedRoleIds(user.roles.map(r => 
                                roles.find(role => role.name === r.name)?.id || ''
                              ).filter(Boolean));
                              setAssignRolesOpen(true);
                            }}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Manage Roles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assign Permissions Dialog */}
        <Dialog open={assignPermissionsOpen} onOpenChange={setAssignPermissionsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Permissions to {selectedRole?.name}</DialogTitle>
              <DialogDescription>Select permissions for this role</DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissionIds.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPermissionIds([...selectedPermissionIds, permission.id]);
                        } else {
                          setSelectedPermissionIds(selectedPermissionIds.filter(id => id !== permission.id));
                        }
                      }}
                    />
                    <Label htmlFor={permission.id} className="flex-1 cursor-pointer">
                      <span className="font-mono text-sm">{permission.name}</span>
                      {permission.description && (
                        <span className="block text-xs text-muted-foreground">{permission.description}</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignPermissionsOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignPermissions} disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Permissions"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Roles Dialog */}
        <Dialog open={assignRolesOpen} onOpenChange={setAssignRolesOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Roles to {selectedUser?.fullName}</DialogTitle>
              <DialogDescription>Select roles for this user</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoleIds([...selectedRoleIds, role.id]);
                      } else {
                        setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id));
                      }
                    }}
                  />
                  <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{role.name}</span>
                    {role.description && (
                      <span className="block text-xs text-muted-foreground">{role.description}</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignRolesOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignRoles} disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Roles"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RbacManagement;
