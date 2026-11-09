"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CustomerReviewsSection } from "@/lib/schema";
import Section from "../shared/section";
import SectionHeader from "../shared/section-header";

const navigationButtonClass = "grid size-11 place-items-center border border-gold-400/30 text-gold-200 hover:bg-gold-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export default function CustomerReviews({ enabled, title, subtitle, reviews }: CustomerReviewsSection) {
    const [carouselRef, carousel] = useEmblaCarousel({
        align: "start",
        loop: true,
        breakpoints: { [reducedMotionQuery]: { duration: 0 } },
    }, [Autoplay({ delay: 5000, playOnInit: false })]);
    const [activeIndex, setActiveIndex] = useState(0);
    const manuallyNavigated = useRef(false);

    useEffect(() => {
        if (!carousel) return;
        const viewport = carousel.rootNode();
        let hovered = viewport.matches(":hover");
        let dragStartIndex: number | null = null;

        const syncIndex = () => setActiveIndex(carousel.selectedScrollSnap());
        const resumeAutoplay = () => {
            if (!manuallyNavigated.current && !hovered && dragStartIndex === null
                && carousel.scrollSnapList().length > 1 && !window.matchMedia(reducedMotionQuery).matches) {
                carousel.plugins().autoplay.play();
            }
        };
        const onMouseEnter = () => {
            hovered = true;
            carousel.plugins().autoplay.stop();
        };
        const onMouseLeave = () => {
            hovered = false;
            resumeAutoplay();
        };
        const onPointerDown = () => {
            dragStartIndex = carousel.selectedScrollSnap();
        };
        const onPointerUp = () => {
            if (dragStartIndex !== null && dragStartIndex !== carousel.selectedScrollSnap()) {
                manuallyNavigated.current = true;
            }
            dragStartIndex = null;
            resumeAutoplay();
        };
        const onReInit = () => {
            dragStartIndex = null;
            syncIndex();
            resumeAutoplay();
        };

        viewport.addEventListener("mouseenter", onMouseEnter);
        viewport.addEventListener("mouseleave", onMouseLeave);
        carousel.on("select", syncIndex).on("reInit", onReInit)
            .on("pointerDown", onPointerDown).on("pointerUp", onPointerUp);
        resumeAutoplay();

        return () => {
            viewport.removeEventListener("mouseenter", onMouseEnter);
            viewport.removeEventListener("mouseleave", onMouseLeave);
            carousel.off("select", syncIndex).off("reInit", onReInit)
                .off("pointerDown", onPointerDown).off("pointerUp", onPointerUp);
        };
    }, [carousel]);

    function navigate(direction: "previous" | "next") {
        if (!carousel) return;
        manuallyNavigated.current = true;
        carousel.plugins().autoplay.stop();
        if (direction === "previous") carousel.scrollPrev();
        else carousel.scrollNext();
    }

    const entries = reviews?.filter(review => review.company?.trim() && review.text?.trim()) ?? [];
    if (enabled === false || entries.length === 0) return null;

    return (
        <Section id="customer-reviews" noPadding className="bg-dark-950">
            <SectionHeader title={title?.trim() || "Мнение заказчиков"} subtitle={subtitle?.trim()} align="center" />
            <div ref={carouselRef} className="overflow-hidden">
                <ul className="flex gap-4 [touch-action:pan-y_pinch-zoom]">
                    {entries.map(({ company, author, text }, index) => (
                        <li
                            key={index}
                            aria-hidden={index !== activeIndex}
                            className="grid min-w-0 flex-[0_0_100%] overflow-hidden border border-gold-400/20 bg-[#101010] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                        >
                            <div className="@container flex min-w-0 flex-col justify-between gap-5 border-b border-gold-400/20 bg-linear-to-br from-gold-500/12 to-transparent p-6 md:border-r md:border-b-0 lg:p-10">
                                <Quote aria-hidden="true" className="size-7 shrink-0 text-gold-400" strokeWidth={1.5} />
                                <div>
                                    <h3 className={`wrap-break-word font-serif leading-tight font-semibold text-balance text-gold-200 ${(company?.trim().length ?? 0) > 18
                                        ? "text-2xl supports-[font-size:1cqi]:text-[length:clamp(1.375rem,9cqi,2.25rem)]"
                                        : "text-3xl supports-[font-size:1cqi]:text-[length:clamp(1.625rem,14cqi,3rem)]"}`}>
                                        {company?.trim()}
                                    </h3>
                                    {author?.trim() && (
                                        <p className="mt-3 flex items-center gap-3 text-sm font-medium text-neutral-300">
                                            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-gold-400/65" />
                                            <span className="min-w-0 wrap-break-word">{author}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <blockquote className="min-w-0 wrap-break-word whitespace-pre-line p-6 text-base leading-relaxed text-neutral-200 md:text-lg lg:p-10">
                                <p>{text?.trim()}</p>
                            </blockquote>
                        </li>
                    ))}
                </ul>
            </div>
            {entries.length > 1 && (
                <div role="group" aria-label="Навигация по отзывам заказчиков" className="mt-6 flex items-center justify-center gap-4">
                    <button type="button" className={navigationButtonClass} aria-label="Предыдущий отзыв заказчика" disabled={!carousel?.canScrollPrev()} onClick={() => navigate("previous")}>
                        <ChevronLeft aria-hidden="true" className="size-5" />
                    </button>
                    <p className="min-w-14 text-center text-sm text-neutral-300 tabular-nums">
                        <span className="sr-only">Отзыв </span>{activeIndex + 1} / {entries.length}
                    </p>
                    <button type="button" className={navigationButtonClass} aria-label="Следующий отзыв заказчика" disabled={!carousel?.canScrollNext()} onClick={() => navigate("next")}>
                        <ChevronRight aria-hidden="true" className="size-5" />
                    </button>
                </div>
            )}
        </Section>
    );
}
