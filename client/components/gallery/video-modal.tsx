"use client";

import { useEffect, useId, useRef } from "react";
import { ExternalLink, X } from "lucide-react";

interface VideoModalProps {
    title: string;
    embedUrl: string;
    originalUrl: string;
    onClose: () => void;
}

export default function VideoModal({ title, embedUrl, originalUrl, onClose }: VideoModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
        document.body.style.overflow = "hidden";

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus({ preventScroll: true });
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto border border-gold-500/25 bg-dark-900 p-0 text-white shadow-2xl backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        >
            <div>
                <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-7 md:py-5">
                    <h2 id={titleId} className="font-serif text-lg leading-snug md:text-2xl">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть видео"
                        className="flex size-11 shrink-0 items-center justify-center border border-white/15 text-neutral-300 transition-colors hover:border-gold-500/50 hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="aspect-video bg-black">
                    <iframe
                        src={embedUrl}
                        title={title}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                        allowFullScreen
                        className="h-full w-full border-0"
                    />
                </div>
                <div className="flex justify-end px-5 py-4 md:px-7">
                    <a
                        href={originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gold-300 transition-colors hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
                    >
                        Открыть в VK <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </dialog>
    );
}
