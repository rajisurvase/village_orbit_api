import { useState, memo, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import {
  Phone,
  Clock,
  MapPin,
  Store,
  Car,
  User,
  GraduationCap,
  Coffee,
  Heart,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import MemberPopupModal from "./MemberPopupModal";
import GalleryModal from "./GalleryModal";
import StarRating from "./StarRating";
import { VillageContext } from "@/context/VillageContextConfig";

const CATEGORY_ID_MAP: Record<string, string> = {
  "Retail & Grocery": "shops",
  Healthcare: "health",
  Education: "education",
  Transportation: "transport",
  "Food & Dining": "food",
};

interface ServicesProps {
  services: any[];
}

const Services = ({ services }: ServicesProps) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{
    [key: string]: number;
  }>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");

  const handleOwnerClick = (service: any) => {
    const owner =
      service.owner || service.doctor || service.teacher || service.pujari;
    if (!owner) return;

    setSelectedMember({
      name: owner,
      image: Array.isArray(service.photos) ? service.photos[0] : service.image,
      role: service.owner
        ? "Owner"
        : service.doctor
          ? "Doctor"
          : service.teacher
            ? "Teacher"
            : "Pujari",
      description:
        service.speciality || service.subjects || service.services || "",
      contact: service.contact,
    });
    setIsModalOpen(true);
  };

  const getServicePhotos = (service: any): string[] => {
    // Support multiple field names for backward compatibility
    if (Array.isArray(service.images)) return service.images;
    if (Array.isArray(service.photos)) return service.photos;
    if (Array.isArray(service.image)) return service.image; // Handle when 'image' is an array
    if (service.image) return [service.image]; // Handle single image string
    return [];
  };

  const openGallery = (service: any) => {
    const photos = getServicePhotos(service);
    if (photos.length > 0) {
      setGalleryImages(photos);
      setGalleryTitle(service.name);
      setGalleryOpen(true);
    }
  };

  const nextPhoto = (serviceKey: string, totalPhotos: number) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [serviceKey]: ((prev[serviceKey] || 0) + 1) % totalPhotos,
    }));
  };

  const prevPhoto = (serviceKey: string, totalPhotos: number) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [serviceKey]: ((prev[serviceKey] || 0) - 1 + totalPhotos) % totalPhotos,
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "retails & grocery":
        return Store;
      case "transportation":
        return Car;
      case "religious services":
        return User;
      case "education":
        return GraduationCap;
      case "food & dining":
        return Coffee;
      case "healthcare":
        return Heart;
      default:
        return Store;
    }
  };

  // ✅ Navigation hash → service category mapping

  const SERVICE_CATEGORY_MAP: Record<string, string> = {
    shops: "Retails & Grocery",
    health: "Healthcare",
    education: "Education",
    transport: "Transportation",
    food: "Food & Dining",
  };

  const activeHash = location.hash?.replace("#", "");

  const filteredServices =
    activeHash && SERVICE_CATEGORY_MAP[activeHash]
      ? services.filter(
          (cat) => cat.category === SERVICE_CATEGORY_MAP[activeHash],
        )
      : services;

  return (
    <section
      id="services"
      className="py-10 sm:py-14 md:py-16 lg:py-20 bg-muted/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gradient">
            {t("services.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            {t("services.description")}
          </p>
        </div>

        {/* Services Categories */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {filteredServices.map((category, categoryIndex) => {
            const IconComponent = getCategoryIcon(category.category);
            return (
              <div
                id={CATEGORY_ID_MAP[category.category]}
                key={category.category}
                className="animate-fade-in"
                style={{ animationDelay: `${categoryIndex * 200}ms` }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gradient">
                    {t(
                      `services.category.${category.category.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {category.items.map((service, serviceIndex) => {
                    const serviceKey = `${category.category}-${serviceIndex}`;
                    const photos = getServicePhotos(service);
                    const currentIndex = currentPhotoIndex[serviceKey] || 0;

                    return (
                      <Card
                        key={service.name}
                        className="card-elegant hover-lift animate-slide-up"
                        style={{
                          animationDelay: `${(categoryIndex * 3 + serviceIndex) * 100}ms`,
                        }}
                      >
                        <CardHeader>
                          <div
                            className="relative w-full h-48 rounded-lg overflow-hidden mb-4 group cursor-pointer"
                            onClick={() => openGallery(service)}
                          >
                            <img
                              src={photos[currentIndex]}
                              alt={service.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                            />

                            {/* View Gallery Overlay */}
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                <span className="font-medium">
                                  {photos.length > 1
                                    ? `View ${photos.length} Photos`
                                    : "View Photo"}
                                </span>
                              </div>
                            </div>

                            {/* Photo Navigation */}
                            {photos.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    prevPhoto(serviceKey, photos.length);
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nextPhoto(serviceKey, photos.length);
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>

                                {/* Photo Indicators */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                  {photos.map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentIndex
                                          ? "bg-primary w-4"
                                          : "bg-background/50"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <CardTitle className="text-xl">
                            {service.name}
                          </CardTitle>
                          {service.owner && (
                            <div
                              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleOwnerClick(service)}
                            >
                              <User className="h-4 w-4" />
                              <span>
                                {t("services.owner")}: {service.owner}
                              </span>
                            </div>
                          )}
                          {service.doctor && (
                            <div
                              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleOwnerClick(service)}
                            >
                              <User className="h-4 w-4" />
                              <span>
                                {t("services.doctor")}: {service.doctor}
                              </span>
                            </div>
                          )}
                          {service.teacher && (
                            <div
                              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleOwnerClick(service)}
                            >
                              <User className="h-4 w-4" />
                              <span>
                                {t("services.teacher")}: {service.teacher}
                              </span>
                            </div>
                          )}
                          {service.pujari && (
                            <div
                              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleOwnerClick(service)}
                            >
                              <User className="h-4 w-4" />
                              <span>
                                {t("services.pujari")}: {service.pujari}
                              </span>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {service.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span>{service.address}</span>
                            </div>
                          )}

                          {(service.hours ||
                            service.timing ||
                            service.timings) && (
                            <div className="flex items-start gap-2 text-sm">
                              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span>
                                {service.hours ||
                                  service.timing ||
                                  service.timings}
                              </span>
                            </div>
                          )}

                          {service.speciality && (
                            <Badge variant="secondary" className="w-fit">
                              {service.speciality}
                            </Badge>
                          )}

                          {service.subjects && (
                            <Badge variant="secondary" className="w-fit">
                              {service.subjects}
                            </Badge>
                          )}

                          {service.services && (
                            <Badge variant="secondary" className="w-fit">
                              {service.services}
                            </Badge>
                          )}

                          {service.vehicle && (
                            <div className="text-sm">
                              <strong>Vehicle:</strong> {service.vehicle}
                            </div>
                          )}
                          {service.vehicle && (
                            <div className="text-sm">
                              <strong>Vehicle Number:</strong>{" "}
                              {service.vehicleNumber}
                            </div>
                          )}

                          {service.routes && (
                            <div className="text-sm">
                              <strong>Routes:</strong> {service.routes}
                            </div>
                          )}

                          {service.deity && (
                            <div className="text-sm">
                              <strong>Deity:</strong> {service.deity}
                            </div>
                          )}

                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${service.contact}`;
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {service.contact}
                          </Button>

                          {/* Star Rating */}
                          {/* <StarRating
                            serviceId={`${category.category}-${service.name}`}
                            serviceName={service.name}
                            villageId={undefined}
                          /> */}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MemberPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
      />

      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        title={galleryTitle}
      />
    </section>
  );
};

export default memo(Services);
