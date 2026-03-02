import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomLoader from "@/components/CustomLoader";
// import { usePushNotifications } from "@/hooks/usePushNotifications";
import useApiAuth from "@/hooks/useApiAuth";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  GetAdminItemAnalytics,
  GetAdminItems,
} from "@/services/marketPlace/items.service";
import { Item } from "@/services/marketPlace/items.types";
import { VILLAGES } from "@/config/villageConfig";
import {
  useActionTriggerItem,
  useAdminActionOnBuySellItem,
} from "@/services/marketPlace/items.query";
import CommonImage from "@/components/CommonImage";

const ItemCard = ({ isSelected, item, refetch, handleCheckBox }: { isSelected: boolean, item: Item; refetch: () => void, handleCheckBox:()=>void }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const { mutateAsync, isPending } = useAdminActionOnBuySellItem();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { mutateAsync: actionTriggerItem, isPending: checking } =
    useActionTriggerItem();

  const handleApproveReject = async (
    itemId: string,
    type: "approve" | "reject" | "delete",
  ) => {
    if (
      type === "delete" &&
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone.",
      )
    ) {
      return;
    }
    mutateAsync(
      { id: itemId, type, reason: rejectionReason },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(`Item ${type}ed`);
            setShowRejectDialog(false);
            refetch();
          } else {
            toast.error("Failed item");
            setRejectionReason("");
          }
        },
      },
    );
  };

  const handleToggleAvailability = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    actionTriggerItem({
      id: itemId,
      type: "IS_AVAILABLE",
      item: {
        ...item,
        isAvailable: currentStatus,
      },
    }, {
      onSuccess :(res)=>{
         if(res.success){
          refetch()
         } 
      }
    });
  };

  const openRejectDialog = (item: Item) => {
    setShowRejectDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {item.status === "pending" && (
              <div
                className="cursor-pointer p-1"
                onClick={handleCheckBox}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-primary" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            )}
            {item.imageUrls[0] && (
              <CommonImage
                fileKey={item.imageUrls[0]}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{item.itemName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-sm mb-2">{item.description}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>₹{item.price}</span>
                <span>•</span>
                <span>{item.village}</span>
                <span>•</span>
                <span>{item.contact}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Posted: {new Date(item.created_at).toLocaleDateString()}
              </p>
              {item.rejection_reason && (
                <p className="text-sm text-destructive mt-2">
                  Reason: {item.rejection_reason}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {item.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApproveReject(item.id, "approve")}
                    disabled={isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openRejectDialog(item)}
                    disabled={isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {item.status === "approved" && (
                <div className="flex items-center gap-2 border rounded p-2">
                  <Switch
                    id={`admin-available-${item.id}`}
                    checked={item.isAvailable}
                    disabled={checking}
                    onCheckedChange={() =>
                      handleToggleAvailability(item.id, item.isAvailable)
                    }
                  />
                  <Label
                    htmlFor={`admin-available-${item.id}`}
                    className="text-xs cursor-pointer"
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </Label>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApproveReject(item.id, "delete")}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting "{item?.itemName}"
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApproveReject(item.id, "reject")}
              disabled={isPending}
            >
              Reject Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function AdminMarketplaceDashboard() {
  const { loading: authLoading } = useApiAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  // const { sendNotification } = usePushNotifications();
  const villageId = VILLAGES.shivankhed.id;
  const { mutateAsync, isPending } = useAdminActionOnBuySellItem();

  const { data: analytics } = useQuery({
    queryKey: ["marketPlace", "analytics", villageId],
    queryFn: () => GetAdminItemAnalytics({ villageId }),
    enabled: !!villageId,
    select(data) {
      return data.data;
    },
  });

  const {
    data: items,
    isLoading,
    refetch,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["marketPlace", villageId, tab],
    queryFn: ({ pageParam = 0 }) =>
      GetAdminItems({
        page: pageParam,
        size: 10,
        villageId: villageId,
        status: tab,
      }),
    enabled: !!villageId,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.number;
      const totalPages = lastPage?.data?.totalPages;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    select(data) {
      return data.pages.flatMap((page) => page?.data?.content || []);
    },
  });

  const toggleSelectAll = (items: Item[]) => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

   const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleBulkApproveReject = async (type: "approve" | "reject") => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to approve");
      return;
    }

    selectedItems.forEach((itemId) => {
      mutateAsync(
        {
          id: itemId,
          type,
          reason: "Bulk Rejected",
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(
                `${selectedItems.size} items approved successfully`,
              );
              setSelectedItems(new Set());
              refetch()
            } else {
              toast.error("Failed to approve items");
            }
          },
          onError: () => {
            toast.error("Failed to approve items");
          },
        },
      );
    });
  };


  if (authLoading) {
    return <CustomLoader />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        <h1 className="text-3xl font-bold">Marketplace Management</h1>
        <p className="text-muted-foreground">
          Review and manage marketplace listings
        </p>
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics?.totalItems || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics?.pendingItems || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {analytics?.approvedItems || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {analytics?.rejectedItems || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for different statuses */}
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <CustomLoader />
          ) : !!items?.length ? (
            <>
              {tab === "pending" && (
                <div className="mb-4 flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSelectAll(items)}
                  >
                    {selectedItems.size === items.length ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                  {selectedItems.size > 0 && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleBulkApproveReject("approve")}
                        disabled={isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Selected ({selectedItems.size})
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkApproveReject("reject")}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Selected ({selectedItems.size})
                      </Button>
                    </>
                  )}
                </div>
              )}
              {items.map((item) => (
                <ItemCard 
                isSelected={new Set(selectedItems).has(item.id)}
                handleCheckBox={()=>toggleItemSelection(item.id)}
                key={item.id} item={item} refetch={refetch} />
              ))}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No {tab} items
            </p>
          )}
          {hasNextPage && (
            <div className="flex justify-center p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                Load more
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
