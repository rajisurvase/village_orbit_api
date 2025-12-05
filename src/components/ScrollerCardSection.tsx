import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ScrollerCard {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface ScrollerCardSectionProps {
  cards: ScrollerCard[];
}

const ScrollerCardSection = ({ cards }: ScrollerCardSectionProps) => {
  const [selectedCard, setSelectedCard] = useState<ScrollerCard | null>(null);

  if (!cards || cards.length === 0) return null;

  return (
    <>
      {/* MAIN SECTION */}
      <section className="relative bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-y border-border overflow-hidden py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="overflow-hidden relative w-full flex items-center">
            <div className="animate-scroll-left flex gap-3 sm:gap-4 md:gap-6 whitespace-nowrap items-stretch">

              {[...cards, ...cards].map((card, index) => (
                <Card
                  key={`${card.id}-${index}`}
                  className="inline-flex flex-col shrink-0 w-64 sm:w-72 md:w-80 lg:w-96
                    bg-card/90 hover:shadow-xl backdrop-blur-md border border-border/40 
                    rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent
                    className="p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 h-full min-w-0 cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    {/* Top: image + title */}
                    <div className="flex flex-row items-center gap-3 sm:gap-4 min-w-0">
                      {card.image && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-left 
                        text-foreground break-words whitespace-normal min-w-0 line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-left 
                      whitespace-normal break-words min-w-0 line-clamp-3">
                      {card.description}
                    </p>

                  </CardContent>
                </Card>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* POPUP MODAL */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md relative text-center">

            {/* Close Button */}
            <button
              className="absolute right-3 sm:right-4 top-2 sm:top-3 text-2xl sm:text-3xl text-muted-foreground hover:text-foreground transition-colors touch-target"
              onClick={() => setSelectedCard(null)}
            >
              ×
            </button>

            {/* Image */}
            {selectedCard.image && (
              <img
                src={selectedCard.image}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl mx-auto border shadow-md object-cover"
                alt={selectedCard.title}
              />
            )}

            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mt-3 sm:mt-4 text-primary">
              {selectedCard.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed">
              {selectedCard.description}
            </p>

          </div>
        </div>
      )}
    </>
  );
};

export default memo(ScrollerCardSection);
