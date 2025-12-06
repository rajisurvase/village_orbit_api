import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import ItemCard from "./ItemCard";
import ItemPopup from "./ItemPopup";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface Item {
  id: string;
  item_name: string;
  category: string;
  price: number;
  description: string | null;
  village: string;
  contact: string;
  image_urls: string[];
  created_at: string;
  seller_name: string | null;
}

const CATEGORIES = [
  "All Categories",
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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "priceLowToHigh", label: "Price: Low → High" },
  { value: "priceHighToLow", label: "Price: High → Low" },
  { value: "nameAtoZ", label: "Name: A to Z" }
];

const ITEMS_PER_PAGE = 20;

const ItemList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("status", "approved")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filter by search query (search across ALL categories)
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const nameMatch = item.item_name.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower) || false;
        const categoryMatch = item.category.toLowerCase().includes(searchLower);
        return nameMatch || descMatch || categoryMatch;
      });
    } else if (selectedCategory !== "All Categories") {
      // Only apply category filter if NO search query
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort items
    switch (sortBy) {
      case "priceLowToHigh":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "nameAtoZ":
        filtered.sort((a, b) => a.item_name.localeCompare(b.item_name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, sortBy]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All Categories" || sortBy !== "newest";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, category, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Collapsible Filters for Mobile */}
      <div className="block md:hidden">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-12">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Sort
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 text-xs">Active</Badge>
                )}
              </span>
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3 animate-accordion-down">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex gap-4 bg-card p-4 rounded-lg border border-border items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
        </div>
      </div>

      {/* Results Count - Mobile */}
      <div className="md:hidden text-sm text-muted-foreground text-center">
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
      </div>

      {/* Recently Added Scroller */}
      {items.length > 0 && !searchQuery && selectedCategory === "All Categories" && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 md:p-4 rounded-lg border border-border">
          <h3 className="text-base md:text-lg font-semibold mb-3 text-foreground">🔥 Recently Added</h3>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {items.slice(0, 8).map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex-shrink-0 w-36 md:w-48 bg-card p-2 md:p-3 rounded-lg border border-border cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] snap-start"
              >
                <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                  {item.image_urls && item.image_urls[0] ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl bg-muted">
                      📦
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-xs md:text-sm truncate">{item.item_name}</h4>
                <p className="text-primary font-bold text-sm md:text-base">₹{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg font-medium">No items found</p>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Try adjusting your search or filter criteria
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" /> Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
            {paginatedItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-10 w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Item Details Popup */}
      {selectedItem && (
        <ItemPopup
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default ItemList;