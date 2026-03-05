import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Edit,
  CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EditItemDialog from "./EditItemDialog";
import useApiAuth from "@/hooks/useApiAuth";
import {
  useActionTriggerItem,
  useMyItems,
} from "@/services/marketPlace/items.query";
import { Item } from "@/services/marketPlace/items.types";
import CommonImage from "../CommonImage";

const RenderItem = ({ item, refetch }: { item: Item; refetch: () => void }) => {
  const [editingItem, setEditingItem] = useState(false);
  const { mutateAsync: actionTriggerItem, isPending: isDeleting } =
    useActionTriggerItem();

  const handleToggleAvailability = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    actionTriggerItem({
      id: itemId,
      type: "IS_AVAILABLE",
      item : {
        ...item,
        isAvailable : currentStatus
      } ,
    });
  };

  const getStatusBadge = (item: Item) => {
    if (item.sold) {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          Sold
        </Badge>
      );
    }
    if (item.status === "pending") {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
        >
          Pending Review
        </Badge>
      );
    }
    if (item.status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (!item.isAvailable) {
      return <Badge variant="secondary">Unavailable</Badge>;
    }
    return (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        Active
      </Badge>
    );
  };

  return (
    <>
      <Card key={item.id} className="overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {/* Image */}
            <div className="w-full sm:w-32 md:w-48 h-32 md:h-48 flex-shrink-0">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <CommonImage
                  fileKey={item.imageUrls?.[0] || ""}
                  className="w-full h-full object-cover rounded-lg"
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
                  <h3 className="text-lg md:text-xl font-semibold truncate">
                    {item.itemName}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                {getStatusBadge(item)}
              </div>

              <p className="text-xl md:text-2xl font-bold text-primary">
                ₹{item.price.toLocaleString()}
              </p>

              {item.description && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground">
                <span>📍 {item.village}</span>
                <span className="hidden sm:inline">•</span>
                <a
                  href={`tel:${item.contact}`}
                  className="text-primary hover:underline"
                >
                  📞 {item.contact}
                </a>
              </div>

              {item.status === "rejected" && item.rejection_reason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 md:p-3">
                  <p className="text-xs md:text-sm font-semibold text-destructive mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-xs md:text-sm text-destructive/90">
                    {item.rejection_reason}
                  </p>
                </div>
              )}

              {/* Actions */}
              {item.status === "approved" && !item.sold && (
                <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-2">
                  {/* Availability Toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={(value) =>{
                        console.log("value", value)
                        handleToggleAvailability(item.id, value)
                       } }
                    />
                    <span className="text-xs md:text-sm flex items-center gap-1">
                      {item.isAvailable ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </span>
                  </div>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(true)}
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  {/* Mark as Sold Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Mark Sold</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Sold?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark "{item.itemName}" as sold. The item
                          will no longer be visible to buyers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            actionTriggerItem({ id: item.id, type: "SOLD" })
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
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
                          This action cannot be undone. This will permanently
                          delete your listing "{item.itemName}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isDeleting}
                          onClick={() =>
                            actionTriggerItem({
                              id: item.id,
                              type: "DELETE",
                            })
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
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
      {/* Edit Dialog */}
      {editingItem && (
        <EditItemDialog
          item={item}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onItemUpdated={() => refetch()}
        />
      )}
    </>
  );
};

const MyListings = () => {
  const { user } = useApiAuth();
  const { data, isLoading, refetch } = useMyItems({
    villageId: user?.villageId || "",
  });

  const { content: items = [] } = data || {};

  if (isLoading) {
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
          <h3 className="text-xl font-semibold mb-2 text-center">
            No listings yet
          </h3>
          <p className="text-muted-foreground text-center text-sm md:text-base">
            You haven't posted any items for sale yet. Start selling by adding
            your first item!
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
          <p className="text-muted-foreground text-sm">
            Manage your posted items
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-base md:text-lg px-3 md:px-4 py-1 md:py-2"
        >
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </Badge>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <RenderItem item={item} refetch={refetch} />
        ))}
      </div>
    </div>
  );
};

export default MyListings;
