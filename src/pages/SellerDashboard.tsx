import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiAuth } from "@/hooks/useApiAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package, CheckCircle, Clock, XCircle, TrendingUp, PlusCircle } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";
import CustomLoader from "@/components/CustomLoader";
import PostItemForm from "@/components/marketplace/PostItemForm";

interface SellerItem {
  id: string;
  item_name: string;
  category: string;
  price: number;
  description: string;
  village: string;
  contact: string;
  seller_name: string;
  image_urls: string[];
  created_at: string;
  status: string;
  is_available: boolean;
  rejection_reason?: string;
}

export default function SellerDashboard() {
  usePageSEO({
    title: "Seller Dashboard - Manage Your Listings",
    description: "View and manage your marketplace listings, track approval status, and mark items as sold.",
    keywords: ["seller dashboard", "my items", "marketplace", "listings"],
    canonical: window.location.origin + "/seller-dashboard"
  });

  const { user, loading: authLoading } = useApiAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchSellerItems();
    }
  }, [authLoading, user, navigate]);

  const fetchSellerItems = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load your items");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ is_available: !currentStatus })
        .eq("id", itemId);

      if (error) throw error;
      toast.success(!currentStatus ? "Item marked as available" : "Item marked as unavailable");
      fetchSellerItems();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const getStatusBadge = (status: string, isAvailable: boolean) => {
    if (!isAvailable) {
      return <Badge variant="secondary" className="bg-gray-500">Unavailable</Badge>;
    }
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const stats = {
    total: items.length,
    approved: items.filter(item => item.status === "approved" && item.is_available).length,
    pending: items.filter(item => item.status === "pending").length,
    unavailable: items.filter(item => !item.is_available).length,
    totalValue: items
      .filter(item => item.status === "approved" && item.is_available)
      .reduce((sum, item) => sum + Number(item.price), 0),
  };

  if (authLoading || loading) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Seller Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Post items and manage your listings
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-600">{stats.unavailable}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Active Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Post Item and Manage Items */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              My Items
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Post an Item
            </TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <PostItemForm onSuccess={() => {
                setActiveTab("items");
                fetchSellerItems();
              }} />
            </div>
          </TabsContent>

          <TabsContent value="items" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Your Listings</h2>
              {items.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p className="mb-4">You haven't posted any items yet.</p>
                    <Button onClick={() => setActiveTab("post")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post Your First Item
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image_urls[0] && (
                          <img
                            src={item.image_urls[0]}
                            alt={item.item_name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{item.item_name}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            {getStatusBadge(item.status, item.is_available)}
                          </div>
                          <p className="text-sm mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">₹{item.price}</span>
                            <span>•</span>
                            <span>{item.village}</span>
                            <span>•</span>
                            <span>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          {item.status === "approved" && (
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`available-${item.id}`}
                                checked={item.is_available}
                                onCheckedChange={() => handleToggleAvailability(item.id, item.is_available)}
                              />
                              <Label htmlFor={`available-${item.id}`} className="text-sm cursor-pointer">
                                {item.is_available ? "Available" : "Unavailable"}
                              </Label>
                            </div>
                          )}
                          {item.status === "rejected" && item.rejection_reason && (
                            <p className="text-xs text-destructive">
                              Reason: {item.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
