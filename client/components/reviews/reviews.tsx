"use client"

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "../shared/section-header";
import { ReviewsSection } from "@/lib/schema";
import Section from "../shared/section";
import { ReviewCard } from "./card";

export default function Reviews({ ...props }: ReviewsSection) {
    const [expandedId, setExpandedId] = useState<string | number | null>(null);

    // Защита от пустого массива из базы
    const reviewsList = props.reviews || [];

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            containScroll: "trimSnaps",
        },
        [
            Autoplay({
                delay: 5000,
                stopOnMouseEnter: true,
                stopOnInteraction: false,
            }),
        ]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollSnapList = emblaApi?.scrollSnapList() ?? [];
    const slideCount = scrollSnapList.length;

    // Если отзывов нет, скрываем секцию вообще (или можно вывести заглушку)
    if (reviewsList.length === 0) return null;

    return (
        <Section className="bg-[#080808] relative pb-6 md:pb-24" id="reviews">
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <SectionHeader
                    title={props.title || "Отзывы участников"}
                    subtitle={props.subtitle || "Мнения профессионалов индустрии о премии"}
                    align="center"
                />

                <div className="mt-12 relative">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex touch-pan-y [touch-action:pan-y_pinch-zoom]">
                            {reviewsList.map((review, key) => (
                                <ReviewCard
                                    key={key}
                                    review={review}
                                    isExpanded={expandedId === key}
                                    onToggle={() => setExpandedId((prev) => (prev === key ? null : key))}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                            className="p-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Назад"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                            className="p-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Вперёд"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {slideCount > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {scrollSnapList.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={`h-2 rounded-full transition-all ${index === selectedIndex
                                        ? "bg-gold-500 w-6"
                                        : "w-2 bg-white/30 hover:bg-white/50"
                                        }`}
                                    aria-label={`Отзыв ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
}