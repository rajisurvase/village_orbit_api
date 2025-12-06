import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Loader2, Package, Edit, CheckCircle2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EditItemDialog from "./EditItemDialog";

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

const MyListings = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchMyItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Failed to load your listings");
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [user]);

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(itemId);
      const { error } = await supabase
        .from("items")
        .update({ is_available: !currentStatus })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ));

      toast.success(!currentStatus ? "Item marked as available" : "Item marked as unavailable");
    } catch (error: any) {
      toast.error("Failed to update item status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAsSold = async (itemId: string) => {
    try {
      setUpdatingId(itemId);
      const { error } = await supabase
        .from("items")
        .update({ sold: true, is_available: false })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, sold: true, is_available: false } : item
      ));

      toast.success("Item marked as sold! Congratulations! 🎉");
    } catch (error: any) {
      toast.error("Failed to mark item as sold");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast.success("Item deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete item");
    }
  };

  const handleItemUpdated = (updatedItem: Item) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const getStatusBadge = (item: Item) => {
    if (item.sold) {
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Sold</Badge>;
    }
    if (item.status === "pending") {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">Pending Review</Badge>;
    }
    if (item.status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (!item.is_available) {
      return <Badge variant="secondary">Unavailable</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-center">No listings yet</h3>
          <p className="text-muted-foreground text-center text-sm md:text-base">
            You haven't posted any items for sale yet. Start selling by adding your first item!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">My Listings</h2>
          <p className="text-muted-foreground text-sm">Manage your posted items</p>
        </div>
        <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-1 md:py-2">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </Badge>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                {/* Image */}
                <div className="w-full sm:w-32 md:w-48 h-32 md:h-48 flex-shrink-0">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.item_name}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold truncate">{item.item_name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    {getStatusBadge(item)}
                  </div>

                  <p className="text-xl md:text-2xl font-bold text-primary">₹{item.price.toLocaleString()}</p>

                  {item.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground">
                    <span>📍 {item.village}</span>
                    <span className="hidden sm:inline">•</span>
                    <a href={`tel:${item.contact}`} className="text-primary hover:underline">
                      📞 {item.contact}
                    </a>
                  </div>

                  {item.status === "rejected" && item.rejection_reason && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 md:p-3">
                      <p className="text-xs md:text-sm font-semibold text-destructive mb-1">Rejection Reason:</p>
                      <p className="text-xs md:text-sm text-destructive/90">{item.rejection_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {item.status === "approved" && !item.sold && (
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-2">
                      {/* Availability Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => handleToggleAvailability(item.id, item.is_available)}
                          disabled={updatingId === item.id}
                        />
                        <span className="text-xs md:text-sm flex items-center gap-1">
                          {item.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          <span className="hidden sm:inline">{item.is_available ? "Available" : "Unavailable"}</span>
                        </span>
                      </div>

                      {/* Edit Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      {/* Mark as Sold Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Mark Sold</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark "{item.item_name}" as sold. The item will no longer be visible to buyers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleMarkAsSold(item.id)} className="bg-blue-600 hover:bg-blue-700">
                              Yes, Mark as Sold
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1">
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your listing "{item.item_name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  {/* Sold Badge Message */}
                  {item.sold && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 md:p-3">
                      <p className="text-xs md:text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        This item has been sold. Congratulations!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </div>
  );
};

export default MyListings;