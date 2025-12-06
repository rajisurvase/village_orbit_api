import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  item_name: z.string().min(3, "Item name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  description: z.string().max(1000).optional(),
  village: z.string().min(1, "Village is required"),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number")
});

interface Item {
  id: string;
  item_name: string;
  category: string;
  price: number;
  description: string | null;
  village: string;
  contact: string;
  image_urls: string[] | null;
  status: string;
  is_available: boolean;
  sold: boolean | null;
  created_at: string;
  rejection_reason: string | null;
  seller_name: string | null;
}

interface EditItemDialogProps {
  item: Item;
  open: boolean;
  onClose: () => void;
  onItemUpdated: (item: Item) => void;
}

const EditItemDialog = ({ item, open, onClose, onItemUpdated }: EditItemDialogProps) => {
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: item.item_name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || "",
      village: item.village,
      contact: item.contact
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("items")
        .update({
          item_name: values.item_name,
          category: values.category,
          price: parseFloat(values.price),
          description: values.description || null,
          village: values.village,
          contact: values.contact
        })
        .eq("id", item.id);

      if (error) throw error;

      const updatedItem: Item = {
        ...item,
        item_name: values.item_name,
        category: values.category,
        price: parseFloat(values.price),
        description: values.description || null,
        village: values.village,
        contact: values.contact
      };

      onItemUpdated(updatedItem);
      toast.success("Item updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Used Tractor Tyre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item..."
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
                  <FormLabel>Village / Location *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Contact Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;