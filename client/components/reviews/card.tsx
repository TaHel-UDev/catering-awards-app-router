"use client"

import { ReviewItem } from "@/lib/schema";
import { ChevronDown, ChevronUp } from "lucide-react";

const PREVIEW_LENGTH = 140;
const CARD_HEIGHT = 300;

const getPreview = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length <= PREVIEW_LENGTH) return { preview: trimmed, hasMore: false };
    return {
        preview: trimmed.slice(0, PREVIEW_LENGTH).trim() + "…",
        hasMore: true
    };
};

interface ReviewCardProps {
    review: ReviewItem;
    isExpanded: boolean;
    onToggle: () => void;
}

export function ReviewCard({ review, isExpanded, onToggle }: ReviewCardProps) {
    // На случай, если в Directus забудут заполнить текст
    const safeText = review.text || "";
    const { preview, hasMore } = getPreview(safeText);

    return (
        <div className="embla__slide min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_50%] px-2 md:px-4">
            <div
                className="bg-white/5 backdrop-blur-md border border-white/10 p-5 md:p-6 flex flex-col"
                style={{ minHeight: CARD_HEIGHT, height: CARD_HEIGHT }}
            >
                <blockquote className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                        <p className="text-neutral-200 leading-relaxed font-serif whitespace-pre-line text-sm md:text-base">
                            &quot;{isExpanded ? safeText : preview}&quot;
                        </p>
                        {hasMore && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                                className="mt-2 inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm font-medium border-b border-gold-400/40 hover:border-gold-400 transition-colors"
                            >
                                {isExpanded ? (
                                    <>Свернуть <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Читать далее <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </blockquote>

                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-1 text-center shrink-0">
                    <cite className="font-bold text-white not-italic text-sm">{review.name}</cite>
                    <div className="text-xs text-gold-400 font-medium">{review.company}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{review.city}</div>
                </div>
            </div>
        </div>
    );
}