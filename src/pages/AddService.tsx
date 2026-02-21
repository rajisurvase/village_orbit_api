import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { useServiceCategory } from "@/hooks/village/useService";
import { useMutation } from "@tanstack/react-query";
import { CreateService } from "@/services/village-service-category";
import { useForm } from "react-hook-form";
import { AddServiceFormData, AddServiceSchema } from "@/schema/service";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UploadVillageFile } from "@/services/village-service";
import { VILLAGES } from "@/config/villageConfig";
import { CUSTOM_ROUTES } from "@/custom-routes";

const AddService = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: categoriesData, isLoading } = useServiceCategory();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: CreateService,
  });

  const { mutateAsync: uploadImage, isPending: isSubmitting } = useMutation({
    mutationFn: UploadVillageFile,
    onError: () => {
      toast.error("Failed to upload image");
    },
  });

  const form = useForm<AddServiceFormData>({
    resolver: zodResolver(AddServiceSchema),
  });

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

  const onSubmit = (formData: AddServiceFormData) => {
    uploadImage(
      { file: imageFile, villageId: VILLAGES.shivankhed.id },
      {
        onSuccess: (uploadResponse) => {
          mutateAsync(
            { ...formData, image_url: uploadResponse.data.fileUrl },
            {
              onSuccess: () => {
                toast.success("Service added successfully!");
                navigate(CUSTOM_ROUTES.SERVICES_ADMIN);
              },
              onError: (error: any) => {
                toast.error(error.message || "Failed to add service");
              },
            }
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Add New Service</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="Loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : categoriesData.length > 0 ? (
                          categoriesData.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no value" disabled>
                            No categories available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Service Name *</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        {...field}
                        placeholder="Enter service name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">
                      Service Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        {...field}
                        placeholder="Describe the service"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Owner/Provider */}
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="owner">Owner/Provider Name</FormLabel>
                    <FormControl>
                      <Input
                        id="owner"
                        {...field}
                        placeholder="Enter owner or provider name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="contact">Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        id="contact"
                        {...field}
                        type="number"
                        placeholder="Enter contact number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="address">Address</FormLabel>
                    <FormControl>
                      <Input
                        id="address"
                        {...field}
                        placeholder="Enter address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operating Hours */}
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="hours">Operating Hours</FormLabel>
                    <FormControl>
                      <Input
                        id="hours"
                        {...field}
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Information */}
              <FormField
                control={form.control}
                name="speciality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="speciality">
                      Additional Information
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="speciality"
                        {...field}
                        placeholder="Any special notes or features"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Service Image</Label>
                <div className="mt-2">
                  <label
                    htmlFor="image"
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
                          Click to upload image
                        </p>
                      </div>
                    )}
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending || isSubmitting}
                className="w-full"
              >
                {isPending || isSubmitting
                  ? "Adding Service..."
                  : "Add Service"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddService;
