import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id?: string;
  title: string;
  image?: string;
  category?: string;
  date?: string;
  description?: string;
}

interface GalleryProps {
  gallery: GalleryItem[];
}

const Gallery = ({ gallery }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get unique categories
  const categories = ["all", ...new Set(gallery?.map((item) => item.category).filter(Boolean))];

  // Filter gallery by category
  const filteredGallery = selectedCategory === "all" 
    ? gallery 
    : gallery?.filter((item) => item.category === selectedCategory);

  const openLightbox = (item: GalleryItem, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? filteredGallery.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredGallery[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === filteredGallery.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredGallery[newIndex]);
  };

  if (!gallery || gallery.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Gallery</h2>
            <p className="text-muted-foreground">No gallery images available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Photo Gallery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore moments from our village - festivals, development projects, and community events.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "All" : category}
              </Button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {filteredGallery?.map((item, index) => (
            <Card 
              key={item.id || index} 
              className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
              onClick={() => openLightbox(item, index)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-foreground text-xs md:text-sm font-medium truncate">
                        {item.title}
                      </p>
                      {item.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background/95 backdrop-blur-sm border-0">
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                onClick={closeLightbox}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Navigation Buttons */}
              {filteredGallery.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="flex items-center justify-center min-h-[300px] md:min-h-[500px] p-4">
                <img
                  src={selectedImage?.image || "/placeholder.svg"}
                  alt={selectedImage?.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>

              {/* Caption */}
              <div className="p-4 text-center">
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                  {selectedImage?.title}
                </h3>
                {selectedImage?.description && (
                  <p className="text-muted-foreground text-sm">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex justify-center gap-2 mt-2">
                  {selectedImage?.category && (
                    <Badge variant="outline">{selectedImage.category}</Badge>
                  )}
                  {selectedImage?.date && (
                    <Badge variant="secondary">{selectedImage.date}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentIndex + 1} / {filteredGallery.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Gallery;
