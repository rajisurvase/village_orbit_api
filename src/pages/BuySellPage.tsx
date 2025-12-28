import { usePageSEO } from "@/hooks/usePageSEO";
import { ShoppingBag, Plus, Package, LogIn, Settings } from "lucide-react";
import ItemList from "@/components/marketplace/ItemList";
import PostItemForm from "@/components/marketplace/PostItemForm";
import MyListings from "@/components/marketplace/MyListings";
import NotificationSettings from "@/components/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from 'react-i18next';

const BuySellPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  usePageSEO({
    title: "Buy & Sell - Shivankhed Khurd Market",
    description: "Buy, sell, and exchange items in your village. Find farming tools, electronics, vehicles, animals, and more from local sellers.",
    keywords: ["buy", "sell", "marketplace", "village market", "OLX", "local sellers", "Shivankhed Khurd"],
    canonical: window.location.origin + "/buy-sell"
  });
const { t } = useTranslation();

  const handleLoginRedirect = () => {
    toast.info("Please login to sell items");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-4 md:py-6 border-b border-border">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2 flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t("marketplace.title")}</span>

              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
               {t("marketplace.subtitle")}
              </p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
              <SheetTitle>{t("marketplace.settings")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <NotificationSettings />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className={`grid w-full max-w-2xl mx-auto mb-4 md:mb-8 h-auto ${user ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <TabsTrigger value="browse" className="text-xs md:text-sm py-2 md:py-3 gap-1 md:gap-2">
              <ShoppingBag className="h-4 w-4" />
           <span>{t("marketplace.browse")}</span>

            </TabsTrigger>
            {user ? (
              <>
                <TabsTrigger value="sell" className="text-xs md:text-sm py-2 md:py-3 gap-1 md:gap-2">
                  <Plus className="h-4 w-4" />
              <span>{t("marketplace.sellItem")}</span>

                </TabsTrigger>
                <TabsTrigger value="mylistings" className="text-xs md:text-sm py-2 md:py-3 gap-1 md:gap-2">
                  <Package className="h-4 w-4" />
                <span>{t("marketplace.myListings")}</span>

                </TabsTrigger>
              </>
            ) : (
              <TabsTrigger 
                value="sell" 
                className="text-xs md:text-sm py-2 md:py-3 gap-1 md:gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleLoginRedirect();
                }}
              >
                <Plus className="h-4 w-4" />
             <span>{t("marketplace.sellItem")}</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="browse" className="animate-fade-in">
            <ItemList />
          </TabsContent>
          
          {user ? (
            <>
              <TabsContent value="sell" className="animate-fade-in">
                <div className="max-w-3xl mx-auto">
                  <PostItemForm 
                    onSuccess={() => {
                      toast.success("Item posted successfully! It will be visible after admin approval.");
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="mylistings" className="animate-fade-in">
                <MyListings />
              </TabsContent>
            </>
          ) : (
            <TabsContent value="sell" className="animate-fade-in">
              <Card className="max-w-md mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <LogIn className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("marketplace.loginRequired")}</h3>
                  <p className="text-muted-foreground mb-6">
             {t("marketplace.loginMessage")}

                  </p>
                  <Button onClick={handleLoginRedirect} size="lg">
                    <LogIn className="h-5 w-5 mr-2" />
                   {t("marketplace.loginToSell")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default BuySellPage;