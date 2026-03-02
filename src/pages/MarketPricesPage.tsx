import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GetAllMarketPrices } from "@/services/marketPrice";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";

const MarketPricesPage = () => {
  const {
    data: prices,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["marketPrices"],
    queryFn: ({ pageParam = 0 }) =>
      GetAllMarketPrices({
        page: pageParam,
        size: 20
      }),

    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.page;
      const totalPages = lastPage.data.totalPages;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    select(data) {
      return data.pages.flatMap((page) => page.data.prices);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLatestUpdate = () => {
    if (prices.length === 0) return null;
    const latest = prices.reduce((prev, current) =>
      new Date(current.lastUpdated) > new Date(prev.lastUpdated)
        ? current
        : prev,
    );
    return formatDate(latest.lastUpdated);
  };

  if (isLoading) return <SectionSkeleton />;

  return (
    <section className="py-20 bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">Market Prices</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time agricultural commodity prices for farmers
          </p>
          {getLatestUpdate() && (
            <p className="text-sm text-muted-foreground mt-2">
              Last Updated: {getLatestUpdate()}
            </p>
          )}
        </div>

        {/* Prices Card */}
        <Card className="card-elegant animate-fade-in max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Crop Prices Today</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {prices.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Prices Available
                </h3>
                <p className="text-muted-foreground">
                  Market price data will be displayed here once available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Crop Name</TableHead>
                      <TableHead className="font-bold text-right">
                        Price
                      </TableHead>
                      <TableHead className="font-bold">Unit</TableHead>
                      <TableHead className="font-bold">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((price) => (
                      <TableRow key={price.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {price.cropName}
                        </TableCell>
                        <TableCell className="text-right text-lg font-semibold text-primary">
                          ₹{price.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          per {price.unit}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(price.lastUpdated)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-primary/10 rounded-lg text-sm text-muted-foreground text-center">
          <p>
            Prices are indicative and may vary based on quality and market
            conditions. Please verify with local traders for exact rates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketPricesPage;
