import { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { VillageContext } from "@/context/VillageContextConfig";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Video, Play } from "lucide-react";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";
import { GalleryItem, VideoItem } from "@/hooks/useVillageConfig";

const MediaGalleryPage = () => {
  const { config, loading } = useContext(VillageContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("type") || "images";

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  usePageSEO({
    title: `${activeTab === "images" ? "Image" : "Video"} Gallery - ${config?.village.name || "Village"} Gram Panchayat`,
    description: `${activeTab === "images" ? "Photo" : "Video"} gallery showcasing festivals, development projects, and cultural events in ${config?.village.name || "Village"}.`,
    keywords: ["village gallery", "photos", "videos", "events", "festivals", "development projects"]
  });

  // Get gallery data from config - use type as category if category not provided
  const gallery: GalleryItem[] = (config?.gallery || []).map((item, index) => ({
    ...item,
    id: item.id || `gallery-${index}`,
    category: item.category || item.type,
  }));
  
  const videos: VideoItem[] = config?.videos || [];

  // Get unique categories for images
  const imageCategories = ["all", ...new Set(gallery?.map((item) => item.category).filter(Boolean))];

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

  const handleTabChange = (value: string) => {
    setSearchParams({ type: value });
    setSelectedCategory("all");
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("embed")) return url;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsRes498\/\S.+\/|\/shorts\/)|youtu\.be\/)([^\/&\?]{10,12})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (loading || !config) return <SectionSkeleton />;

  return (
    <section className="py-12 md:py-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            मीडिया गॅलरी
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            गावातील सण, विकास कामे आणि सामुदायिक कार्यक्रमांचे फोटो आणि व्हिडिओ पहा.
          </p>
        </div>

        {/* Tabs for Images / Videos */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              फोटो गॅलरी
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              व्हिडिओ गॅलरी
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="animate-fade-in">
            {gallery.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">फोटो उपलब्ध नाहीत</h2>
                <p className="text-muted-foreground">गॅलरी फोटो लवकरच अपडेट केले जातील.</p>
              </div>
            ) : (
              <>
                {/* Category Filter */}
                {imageCategories.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {imageCategories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category === "all" ? "सर्व" : category}
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
              </>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="animate-fade-in">
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">व्हिडिओ उपलब्ध नाहीत</h2>
                <p className="text-muted-foreground">व्हिडिओ गॅलरी लवकरच अपडेट केली जाईल.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeUrl.split("/").pop()}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                          {video.title}
                        </h3>
                        {video.category && (
                          <Badge variant="secondary" className="text-xs">
                            {video.category}
                          </Badge>
                        )}
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Image Lightbox Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background/95 backdrop-blur-sm border-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                onClick={closeLightbox}
              >
                <X className="h-5 w-5" />
              </Button>

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

              <div className="flex items-center justify-center min-h-[300px] md:min-h-[500px] p-4">
                <img
                  src={selectedImage?.image || "/placeholder.svg"}
                  alt={selectedImage?.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>

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

        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background border-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-10 right-0 z-10 bg-background/80 hover:bg-background"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="aspect-video">
                {selectedVideo && (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl)}
                    title={selectedVideo.title}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedVideo?.title}
                </h3>
                {selectedVideo?.description && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default MediaGalleryPage;
