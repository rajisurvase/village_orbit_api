import { Calendar, MapPin, Phone, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Item } from "@/services/marketPlace/items.types";
import CommonImage from "../CommonImage";


interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    "Farming Tools": "🚜",
    Vegetables: "🥬",
    Electronics: "📱",
    Vehicles: "🚗",
    "Mobile Phones": "📱",
    Animals: "🐄",
    "Household Items": "🏠",
    Furniture: "🪑",
    "Construction Tools": "🔨",
    "Seeds & Fertilizers": "🌱",
    Other: "📦",
  };
  return icons[category] || "📦";
};

const ItemCard = ({ item, onClick }: ItemCardProps) => {
  const formattedDate = dayjs(item.created_at).format("DD MMMM YYYY")
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
    >
      {/* Image */}
      <div className="aspect-square bg-muted overflow-hidden relative">
        {item.imageUrls?.[0] ? (
         <CommonImage fileKey={item.imageUrls?.[0] ||""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> 
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getCategoryIcon(item.category)}
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-white dark:bg-white/90 text-green-700 dark:text-green-600 backdrop-blur-sm font-semibold">
          {getCategoryIcon(item.category)} {item.category}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Item Name */}
        <h3 className="font-semibold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {item.itemName}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-primary">
          ₹{item.price.toLocaleString("en-IN")}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.village}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{item.contact}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
