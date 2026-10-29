import { GalleryPhotos } from "@/lib/schema";
import { ExternalLink, Play } from "lucide-react";
import Link from "next/link";

interface GalleryItemProps {
    photo: GalleryPhotos;
    onPlay?: () => void;
}

export function GalleryItem({ photo, onPlay }: GalleryItemProps) {
    const className = "group relative w-full py-3 md:py-4 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-6 hover:border-gold-500/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400";
    const content = (
        <>
            <div className="flex items-center gap-4 md:gap-6 w-full">
                <span className="font-serif text-xl md:text-2xl text-white/25 group-hover:text-gold-500/40 transition-colors duration-300 w-14 md:w-20 text-right shrink-0">
                    {photo.year}
                </span>
                <span className="text-sm md:text-base text-neutral-400 group-hover:text-neutral-300 transition-colors text-left leading-tight">
                    {photo.title}
                </span>
            </div>

            <div className="flex items-center gap-2 text-gold-500/50 group-hover:text-gold-400 transition-colors text-xs uppercase tracking-widest pl-20 md:pl-0 shrink-0">
                <span className="hidden md:inline">{onPlay ? "Смотреть видео" : "Смотреть"}</span>
                <span className="md:hidden">{onPlay ? "Смотреть видео" : "Открыть"}</span>
                {onPlay ? (
                    <Play className="w-3 h-3" aria-hidden="true" />
                ) : (
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" aria-hidden="true" />
                )}
            </div>
        </>
    );

    return onPlay ? (
        <button type="button" onClick={onPlay} aria-haspopup="dialog" className={`${className} cursor-pointer`}>
            {content}
        </button>
    ) : (
        <Link href={photo.link || "/"} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
        </Link>
    );
}
