import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, MessageCircle, Share2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { LazyLoadImage } from "react-lazy-load-image-component";

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
  seller_name?: string | null;
}

interface ItemPopupProps {
  item: Item;
  open: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    "Farming Tools": "🚜",
    "Vegetables": "🥬",
    "Electronics": "📱",
    "Vehicles": "🚗",
    "Mobile Phones": "📱",
    "Animals": "🐄",
    "Household Items": "🏠",
    "Furniture": "🪑",
    "Construction Tools": "🔨",
    "Seeds & Fertilizers": "🌱",
    "Accessories": "👜",
    "Other": "📦"
  };
  return icons[category] || "📦";
};

const ItemPopup = ({ item, open, onClose }: ItemPopupProps) => {
  const { toast } = useToast();

  const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleWhatsApp = () => {
    const cleanContact = item.contact.replace(/\D/g, '');
    const phoneNumber = cleanContact.length === 10 ? `91${cleanContact}` : cleanContact;
    const message = `Hi, I'm interested in "${item.item_name}" listed for ₹${item.price.toLocaleString()}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${item.contact}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: item.item_name,
      text: `Check out this item: ${item.item_name} for ₹${item.price.toLocaleString()}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${item.item_name} - ₹${item.price.toLocaleString()} | ${window.location.href}`);
      toast({
        title: "Link Copied",
        description: "Item link copied to clipboard"
      });
    }
  };

  const hasImages = item.image_urls && item.image_urls.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl md:text-2xl pr-8">{item.item_name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Image Carousel */}
          <div className="space-y-4">
            {hasImages ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {item.image_urls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <LazyLoadImage
                          src={url}
                          alt={`${item.item_name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                          effect="opacity"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {item.image_urls.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center text-7xl md:text-8xl">
                {getCategoryIcon(item.category)}
              </div>
            )}
            
            {/* Image thumbnails for multiple images */}
            {hasImages && item.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.image_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 border-border"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Price */}
            <div className="text-2xl md:text-3xl font-bold text-primary">
              ₹{item.price.toLocaleString('en-IN')}
            </div>

            {/* Category Badge */}
            <Badge variant="secondary" className="text-sm md:text-base">
              {getCategoryIcon(item.category)} {item.category}
            </Badge>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-semibold mb-2 text-foreground text-sm md:text-base">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {item.description}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 text-sm">
              {item.seller_name && (
                <div className="flex items-center gap-3 text-foreground">
                  <User className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <span className="font-medium">Seller: {item.seller_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.village}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <a 
                  href={`tel:${item.contact}`}
                  className="font-medium text-primary hover:underline"
                >
                  {item.contact}
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <span>Posted on {formattedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 md:pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCall}
                  size="lg"
                  variant="default"
                  className="w-full gap-2 h-12"
                >
                  <Phone className="h-5 w-5" />
                  <span className="hidden sm:inline">Call</span> Seller
                </Button>
                <Button
                  onClick={handleWhatsApp}
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 h-12 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="lg"
                className="w-full gap-2"
              >
                <Share2 className="h-5 w-5" />
                Share Item
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPopup;