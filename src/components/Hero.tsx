import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useTranslation } from "react-i18next";
import Autoplay from "embla-carousel-autoplay";
import { useRef, memo } from "react";

interface HeroProps {
  village: any;
  panchayat: any;
}

const Hero = ({ village, panchayat }: HeroProps) => {
  const { t } = useTranslation();
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center">
      {/* Background Carousel */}
      <div className="absolute inset-0 h-full overflow-hidden">
        <Carousel
          className="w-full h-full"
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-full -ml-0">
            {[...village.heroImages].map((image, index) => (
              <CarouselItem key={index} className="h-full pl-0 basis-full">
                <div className="relative w-full h-screen">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    // fetchPriority={index === 0 ? "high" : "low"}
                    {...(typeof window !== "undefined" ? { fetchpriority: "high" } : {})}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselPrevious className="left-2 sm:left-4 md:left-8 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12" /> */}
          {/* <CarouselNext className="right-2 sm:right-4 md:right-8 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 w-10 h-10 sm:w-12 sm:h-12" /> */}
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/40 to-primary/40 animate-fade-in" />
        {/* from-primary/80 via-primary/70 to-primary/40 */}
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Text */}
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-primary-foreground drop-shadow-lg">
              {t("hero.title")}
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 text-primary-foreground/95 drop-shadow-md">{t("hero.subtitle")}</p>

            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md px-2">
              {t("hero.description")}
            </p>

            {/* Sarpanch Message */}
            {/*<Card className="bg-card/20 backdrop-blur-md border-primary-foreground/20 p-6 mb-8 max-w-2xl mx-auto shadow-lg">
              <blockquote className="text-primary-foreground/95 italic text-base mb-4 drop-shadow">
                "{t("panchayat.message")}"
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                {panchayat.sarpanch.image ? (
                  <img
                    src={panchayat.sarpanch.image}
                    alt={panchayat.sarpanch.name}
                    className="inline-block w-10 h-10 rounded-full object-cover ring-2 ring-white outline outline-1 outline-black/5"
                  />
                ) : (
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-semibold shadow-md">
                    {panchayat.sarpanch.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-primary-foreground drop-shadow">
                    {panchayat.sarpanch.name}
                  </p>
                  <p className="text-sm text-primary-foreground/80 drop-shadow-sm">
                    {t("panchayat.sarpanch")} ({panchayat.sarpanch.tenure})
                  </p>
                </div>
              </div>
            </Card>*/}

            {/* Action Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('hero.explore')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary-foreground/80 bg-card/10 text-primary-foreground hover:bg-card hover:text-primary font-semibold px-8 py-6 text-lg backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('hero.contact')}
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex justify-center shadow-md">
          <div className="w-1 h-3 bg-primary-foreground rounded-full mt-2 animate-pulse"></div>
        </div>
      </div> */}
    </section>
  );
};

export default memo(Hero);
