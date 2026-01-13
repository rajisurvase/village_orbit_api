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
import { useTranslation } from "react-i18next";

const MediaGalleryPage = () => {
  const { t } = useTranslation();
  const { config, loading } = useContext(VillageContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("type") || "images";

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);



// Add here
const getYouTubeVideoId = (url: string) => {
  let match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return url.split("/").pop()?.split("?")[0] || "";
};


  usePageSEO({
    title: `${activeTab === "images"
      ? t("mediaGallery.seoImageTitle")
      : t("mediaGallery.seoVideoTitle")
      } - ${config?.village.name || "Village"} Gram Panchayat`,
    description: `${t("mediaGallery.seoDescription")} ${config?.village.name || "Village"}.`,
    keywords: ["village gallery", "photos", "videos", "events", "festivals", "development projects"]
  });

  // GALLERY DATA (language managed JSON via config)
  const gallery: GalleryItem[] = (config?.gallery || []).map((item, index) => ({
    ...item,
    id: item.id || `gallery-${index}`,
    category: item.category || item.type,
  }));

  const videos: VideoItem[] = config?.videos || [];

  // UNIQUE CATEGORIES
  const imageCategories = ["all", ...new Set(gallery?.map((i) => i.category).filter(Boolean))];

  // FILTER
  const filteredGallery =
    selectedCategory === "all"
      ? gallery
      : gallery?.filter((item) => item.category === selectedCategory);

  const openLightbox = (item: GalleryItem, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => setSelectedImage(null);

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

  // Get YouTube embed URL safely
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  return `https://www.youtube.com/embed/${videoId}`;
};


  if (loading || !config) return <SectionSkeleton />;

  return (
    <section className="py-12 md:py-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
        {t("mediaGallery.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("mediaGallery.subtitle")}
          </p>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t("mediaGallery.photosTab")}
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {t("mediaGallery.videosTab")}
            </TabsTrigger>
          </TabsList>

          {/* IMAGES */}
          <TabsContent value="images" className="animate-fade-in">
            {gallery.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("mediaGallery.noPhotosTitle")}
                </h2>
                <p className="text-muted-foreground">
                  {t("mediaGallery.noPhotosText")}
                </p>
              </div>
            ) : (
              <>
                {/* CATEGORY FILTER */}
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
                        {category === "all" ? t("mediaGallery.filterAll") : category}
                      </Button>
                    ))}
                  </div>
                )}

                {/* GRID */}
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
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

          {/* VIDEOS */}
          <TabsContent value="videos" className="animate-fade-in">
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("mediaGallery.noVideosTitle")}
                </h2>
                <p className="text-muted-foreground">
                  {t("mediaGallery.noVideosText")}
                </p>
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
                    <img
  src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.youtubeUrl)}/hqdefault.jpg`}
  alt={video.title}
  className="w-full h-full object-cover"
/>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
  <img
    src="public/youtube icon.png"
    alt="Play Video"
    className="w-16 h-16 text-white"
  />
</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                          {video.title}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* LIGHTBOX */}
        <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl w-[95vw] p-0">
            <div className="relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={closeLightbox}>
                <X />
              </Button>

              {filteredGallery.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" className="absolute left-2 top-1/2" onClick={goToPrevious}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-1/2" onClick={goToNext}>
                    <ChevronRight />
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center p-4">
                <img
                  src={selectedImage?.image}
                  alt={selectedImage?.title}
                  className="max-w-full max-h-[70vh] rounded-lg"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* VIDEO PLAYER */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl w-[95vw] p-0">
            <iframe
              src={selectedVideo ? getYouTubeEmbedUrl(selectedVideo.youtubeUrl) : ""}
              className="w-full aspect-video"
              allowFullScreen
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default MediaGalleryPage;
