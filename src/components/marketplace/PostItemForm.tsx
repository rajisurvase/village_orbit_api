import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = [
  "Farming Tools",
  "Vegetables",
  "Electronics",
  "Vehicles",
  "Mobile Phones",
  "Animals",
  "Household Items",
  "Furniture",
  "Construction Tools",
  "Seeds & Fertilizers",
  "Accessories",
  "Other"
];

const formSchema = z.object({
  seller_name: z.string().min(2, "Seller name must be at least 2 characters").max(100),
  item_name: z.string().min(3, "Item name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  description: z.string().max(1000).optional(),
  village: z.string().min(1, "Village/Location is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
});

interface PostItemFormProps {
  onSuccess: () => void;
}

const PostItemForm = ({ onSuccess }: PostItemFormProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seller_name: "",
      item_name: "",
      category: "",
      price: "",
      description: "",
      village: "Shivankhed Khurd",
      contact: ""
    }
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + imageFiles.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 3 images",
        variant: "destructive"
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    const newFiles = validFiles.slice(0, 3 - imageFiles.length);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to post items",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Upload images first
      const imageUrls = await uploadImages();

      // Insert item data
      const { error } = await supabase.from("items").insert({
        seller_name: values.seller_name,
        item_name: values.item_name,
        category: values.category,
        price: parseFloat(values.price),
        description: values.description || null,
        village: values.village,
        contact: values.contact,
        image_urls: imageUrls,
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Item posted! It will be visible after admin approval."
      });

      // Reset form
      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl md:text-2xl">Post Your Item</CardTitle>
        <CardDescription>Fill in the details to list your item for sale</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Image Upload - First */}
            <div className="space-y-3">
              <FormLabel>Upload Images (Max 3)</FormLabel>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {imageFiles.length < 3 && (
                  <label className="h-20 w-20 md:h-24 md:w-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Upload clear photos of your item (max 5MB each)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seller_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9876543210" maxLength={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Used Tractor Tyre, iPhone 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2500" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item in detail..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Village / Area name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Post Item for Sale
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PostItemForm;