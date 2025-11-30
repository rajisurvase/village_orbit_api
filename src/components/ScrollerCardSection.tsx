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
      <section className="relative bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-y border-border overflow-hidden py-8">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden relative w-full flex items-center">
            <div className="animate-scroll-left flex gap-6 whitespace-nowrap items-stretch">

              {[...cards, ...cards].map((card, index) => (
                <Card
                  key={`${card.id}-${index}`}
                  className="inline-flex flex-col shrink-0 w-72 sm:w-80 md:w-96 lg:w-[28rem]
                    bg-card/90 hover:shadow-xl backdrop-blur-md border border-border/40 
                    rounded-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent
                    className="p-5 flex flex-col gap-4 h-full min-w-0 cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    {/* Top: image + title */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 min-w-0">
                      {card.image && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h3 className="font-semibold text-lg md:text-xl text-center sm:text-left 
                        text-foreground break-words whitespace-normal min-w-0">
                        {card.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm md:text-base text-muted-foreground text-center sm:text-left 
                      whitespace-normal break-words min-w-0">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md relative text-center">

            {/* Close Button */}
            <button
              className="absolute right-4 top-3 text-3xl text-gray-600 hover:text-black"
              onClick={() => setSelectedCard(null)}
            >
              ×
            </button>

            {/* Image */}
            {selectedCard.image && (
              <img
                src={selectedCard.image}
                className="w-28 h-28 rounded-xl mx-auto border shadow-md object-cover"
              />
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold mt-4 text-green-800">
              {selectedCard.title}
            </h2>

            {/* Description */}
            <p className="text-gray-700 mt-3 text-base leading-relaxed">
              {selectedCard.description}
            </p>

          </div>
        </div>
      )}
    </>
  );
};

export default memo(ScrollerCardSection);
