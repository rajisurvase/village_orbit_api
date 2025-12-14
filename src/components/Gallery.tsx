import { memo } from "react";
// import { Calendar, Camera, Play } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useTranslation } from "react-i18next";

interface GalleryProps {
  gallery: any[];
}

const Gallery = ({ gallery }: GalleryProps) => {
  // ❌ Gallery page temporarily disabled
  // ❌ All logic commented to avoid errors

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground">
          Gallery Coming Soon
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This section is temporarily disabled.
        </p>
      </div>
    </section>
  );
};

export default memo(Gallery);
