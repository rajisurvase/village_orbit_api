import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Upload } from "lucide-react";
import { useServices } from "@/hooks/village/useService";
import { VILLAGES } from "@/config/villageConfig";
import { IService } from "@/services/village-service-category";

const ServicesAdminDashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const {
    data,
    isLoading,
  } = useServices({
    villageId: VILLAGES.shivankhed.id,
    page: 1,
    limit: 20,
    sortOrder: "asc",
  });

  const { services = [] } = data || {};

  const handleEdit = (service: IService) => {
    setSelectedService(service);
    setImagePreview(service.imageUrl || "");
    setImageFile(null);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    const { error } = await supabase
      .from("village_services")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete service");
      console.error(error);
    } else {
      toast.success("Service deleted successfully");
      // fetchServices();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `services/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("items")
      .upload(filePath, imageFile);

    if (uploadError) {
      toast.error("Failed to upload image");
      console.error(uploadError);
      return null;
    }

    const { data } = supabase.storage.from("items").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      const updateData: any = {
        category: selectedService.category,
        name: selectedService.name,
        owner: selectedService.owner || null,
        contact: selectedService.contact || null,
        address: selectedService.address || null,
        hours: selectedService.hours || null,
        speciality: selectedService.speciality || null,
      };

      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from("village_services")
        .update(updateData)
        .eq("id", selectedService.id);

      if (error) throw error;

      toast.success("Service updated successfully");
      setEditDialogOpen(false);
      // fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to update service");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Services Management</h1>
            <Button onClick={() => navigate("/admin/add-service")}>
              Add New Service
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>{service.owner || "-"}</TableCell>
                      <TableCell>{service.contact || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No services available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>

          {selectedService && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={selectedService.category}
                  onValueChange={(value) =>
                    setSelectedService({ ...selectedService, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Name *</Label>
                <Input
                  value={selectedService.name}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label>Owner/Provider Name</Label>
                <Input
                  value={selectedService.owner || ""}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      owner: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Contact Number</Label>
                <Input
                  type="tel"
                  value={selectedService.contact || ""}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      contact: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={selectedService.address || ""}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Operating Hours</Label>
                <Input
                  value={selectedService.hours || ""}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      hours: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description/Speciality</Label>
                <Textarea
                  value={selectedService.speciality || ""}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      speciality: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Service Image</Label>
                <div className="mt-2">
                  <label
                    htmlFor="edit-image"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click to upload new image
                        </p>
                      </div>
                    )}
                    <input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Service"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesAdminDashboard;
