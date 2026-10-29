'use client'

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionHeader from "../shared/section-header";
import { GalleryPhotos, GallerySection } from "@/lib/schema";
import { getVkVideoEmbedUrl } from "@/lib/vk-video";
import Section from "../shared/section";
import { GalleryItem } from "./item";
import { Button } from "../shared/button";
import VideoModal from "./video-modal";

const VISIBLE_COUNT = 5;

export default function Gallery({ ...props }: GallerySection) {
    const [showAll, setShowAll] = useState(false);
    const [activeVideo, setActiveVideo] = useState<{ photo: GalleryPhotos; embedUrl: string } | null>(null);

    const photosList = props.photos || [];

    const sortedPhotos = [...photosList]
        .filter(photo => photo.year !== null)
        .sort((a, b) => b.year! - a.year!);

    const visiblePhotos = showAll ? sortedPhotos : sortedPhotos.slice(0, VISIBLE_COUNT);
    const hasMorePhotos = sortedPhotos.length > VISIBLE_COUNT;

    return (
        <Section className="bg-[#080808] relative" id="gallery">
            <div className="max-w-2xl mx-auto text-center">
                <SectionHeader
                    title={props.title || "Фотоархив"}
                    subtitle={props.subtitle || "История ярких моментов церемоний прошлых лет"}
                    align="center"
                />

                {sortedPhotos.length > 0 ? (
                    <>
                        <div className="flex flex-col items-center gap-0 mt-8 relative z-10">
                            {visiblePhotos.map((item, key) => {
                                const videoUrl = getVkVideoEmbedUrl(item.link);
                                const embedUrl = videoUrl ? getVkVideoEmbedUrl(item.embed_url) || videoUrl : null;
                                return (
                                    <GalleryItem
                                        key={`${item.link}-${key}`}
                                        photo={item}
                                        onPlay={embedUrl ? () => setActiveVideo({ photo: item, embedUrl }) : undefined}
                                    />
                                );
                            })}
                        </div>

                        {hasMorePhotos && (
                            <div className="mt-6">
                                <Button
                                    onClick={() => setShowAll(!showAll)}
                                    variant="outline"
                                    size="sm"
                                    className="border-gold-500/20 text-gold-500/80 hover:bg-gold-500/10 hover:text-gold-400 hover:border-gold-500/40 min-w-[160px]"
                                >
                                    {showAll ? (
                                        <>Свернуть <ChevronUp className="ml-2 w-4 h-4" /></>
                                    ) : (
                                        <>Показать все ({sortedPhotos.length}) <ChevronDown className="ml-2 w-4 h-4" /></>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-8 text-neutral-500 text-sm">
                        Фотографии скоро появятся.
                    </div>
                )}
            </div>
            {activeVideo && (
                <VideoModal
                    title={activeVideo.photo.title || "Видео церемонии"}
                    embedUrl={activeVideo.embedUrl}
                    originalUrl={activeVideo.photo.link!}
                    onClose={() => setActiveVideo(null)}
                />
            )}
        </Section>
    );
}
