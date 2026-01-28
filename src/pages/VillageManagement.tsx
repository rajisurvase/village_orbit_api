import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateUpdateVillage,
  DeleteVillage,
  GetVillagesList,
  Village,
} from "@/services/village-service";

const VillageManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [formData, setFormData] = useState<
    Omit<Village, "createdAt" | "updatedAt" | "isActive">
  >({
    name: "",
    state: "",
    district: "",
    pincode: "",
    established: "",
    area: "",
    latitude: "",
    longitude: "",
    altitude: "",
    description: "",
    vision: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: villagesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["villages"],
    queryFn: GetVillagesList,
    select(data) {
      return data.data;
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: CreateUpdateVillage,
  });

  const { mutateAsync: deleteVillage, isPending: isDeletePending } =
    useMutation({
      mutationFn: DeleteVillage,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutateAsync(formData, {
      onSuccess(data) {
        refetch();
        toast({
          title: "Success",
          description: formData?.id
            ? "Village updated successfully."
            : "Village created successfully.",
        });
        setIsDialogOpen(false);
        setEditingVillage(null);
        resetForm();
      },
      onError(error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create village.",
          variant: "destructive",
        });
      },
    });
  };

  const handleEdit = (village: Village) => {
    setEditingVillage(village);
    setFormData({
      id: village.id,
      name: village.name,
      state: village.state,
      district: village.district,
      pincode: village.pincode,
      established: village.established || "",
      area: village.area || "",
      description: village.description || "",
      vision: village.vision || "",
      altitude: village.altitude || "",
      latitude: village.latitude || "",
      longitude: village.longitude || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this village?")) return;

    deleteVillage(id, {
      onSuccess() {
        refetch();
        toast({
          title: "Success",
          description: "Village deleted successfully.",
        });
      },
      onError(error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete village.",
          variant: "destructive",
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      state: "",
      district: "",
      pincode: "",
      established: "",
      area: "",
      description: "",
      vision: "",
      latitude: "",
      longitude: "",
      altitude: "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Village Management</h1>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingVillage(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Village
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Villages</CardTitle>
            <CardDescription>
              Manage village information and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {villagesData.map((village) => (
                  <TableRow key={village.id}>
                    <TableCell className="font-medium">
                      {village.name}
                    </TableCell>
                    <TableCell>{village.district}</TableCell>
                    <TableCell>{village.state}</TableCell>
                    <TableCell>{village.pincode}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(village)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeletePending}
                          onClick={() => handleDelete(village.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVillage ? "Edit Village" : "Add New Village"}
              </DialogTitle>
              <DialogDescription>
                {editingVillage
                  ? "Update village information"
                  : "Create a new village entry"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Village Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    value={formData.established}
                    onChange={(e) =>
                      setFormData({ ...formData, established: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    placeholder="e.g., 15.2 sq km"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altitude">Altitude *</Label>
                  <Input
                    id="altitude"
                    value={formData.altitude}
                    onChange={(e) =>
                      setFormData({ ...formData, altitude: e.target.value })
                    }
                    placeholder="e.g., 500m"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) =>
                    setFormData({ ...formData, vision: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {editingVillage ? "Update" : "Create"} Village
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VillageManagement;
