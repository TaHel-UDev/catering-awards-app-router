"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { directusAssetUrl, heroOverlayOpacity, heroVideoSources, type HeroMedia, type VideoSource } from "@/lib/hero-media";

type Connection = EventTarget & { saveData?: boolean };
type PlaybackMode = "static" | "mobile" | "desktop";
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

function playbackMode(): PlaybackMode {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection()?.saveData) return "static";
    return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function subscribe(listener: () => void) {
    const queries = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(max-width: 767px)")];
    for (const query of queries) {
        if (query.addEventListener) query.addEventListener("change", listener);
        else query.addListener(listener);
    }
    const network = connection();
    network?.addEventListener?.("change", listener);
    return () => {
        for (const query of queries) {
            if (query.removeEventListener) query.removeEventListener("change", listener);
            else query.removeListener(listener);
        }
        network?.removeEventListener?.("change", listener);
    };
}

function Poster({ src }: { src: string }) {
    const [failed, setFailed] = useState(false);
    return failed ? null : (
        <Image src={src} alt="" fill sizes="100vw" preload unoptimized className="object-cover" onError={() => setFailed(true)} />
    );
}

export default function HeroBackground({ media, suspended = false, assetBaseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "" }: { media: HeroMedia; suspended?: boolean; assetBaseUrl?: string }) {
    const mode = useSyncExternalStore(subscribe, playbackMode, () => "static" as const);
    const poster = directusAssetUrl(media.background_poster, assetBaseUrl);
    const sources = mode === "static" ? [] : heroVideoSources(media, mode === "mobile", assetBaseUrl);
    const hasMedia = poster || media.background_video_enabled;

    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-luxury-gradient" data-hero-background data-playback-mode={mode}>
            {poster && <Poster key={poster} src={poster} />}
            {sources.length > 0 && (
                <BackgroundVideo key={sources.map((source) => source.src).join("|")} sources={sources} suspended={suspended} />
            )}
            {hasMedia && (
                <>
                    <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${heroOverlayOpacity(media.background_overlay)})` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-950/20 via-transparent to-dark-950/60" />
                </>
            )}
        </div>
    );
}

function BackgroundVideo({ sources, suspended }: { sources: VideoSource[]; suspended: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [index, setIndex] = useState(0);
    const [blocked, setBlocked] = useState(false);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const source = sources[index];
    const skipSource = useCallback(() => setIndex((current) => current === index ? current + 1 : current), [index]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !source || blocked) return;
        let cancelled = false;
        let hasPlayed = false;
        let startupTimer: number | undefined;
        const clearStartupTimer = () => {
            window.clearTimeout(startupTimer);
            startupTimer = undefined;
        };
        const markPlaying = () => {
            hasPlayed = true;
            clearStartupTimer();
        };
        const rect = video.getBoundingClientRect();
        let visible = rect.bottom > 0 && rect.top < window.innerHeight;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;

        const updatePlayback = () => {
            if (cancelled) return;
            if (suspended || document.hidden || !visible) {
                video.pause();
                clearStartupTimer();
                return;
            }
            // Some codecs stall without emitting an error. Keep the poster and try the next source.
            if (!hasPlayed && startupTimer === undefined) {
                startupTimer = window.setTimeout(() => {
                    if (!cancelled && !hasPlayed) skipSource();
                }, 12000);
            }
            try {
                const promise = video.play();
                promise?.catch((error: unknown) => {
                    if (cancelled) return;
                    const name = error instanceof DOMException ? error.name : "";
                    if (name === "AbortError") return;
                    if (name === "NotAllowedError") setBlocked(true);
                    else skipSource();
                });
            } catch {
                skipSource();
            }
        };
        const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            updatePlayback();
        }) : null;
        observer?.observe(video);
        video.addEventListener("playing", markPlaying);
        document.addEventListener("visibilitychange", updatePlayback);
        updatePlayback();
        return () => {
            cancelled = true;
            clearStartupTimer();
            observer?.disconnect();
            video.removeEventListener("playing", markPlaying);
            document.removeEventListener("visibilitychange", updatePlayback);
            video.pause();
        };
    }, [source, blocked, suspended, skipSource]);

    if (!source || blocked) return null;
    return (
        <video
            key={source.src}
            ref={videoRef}
            src={source.src}
            autoPlay={!suspended}
            loop
            muted
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => setPlayingUrl(source.src)}
            onError={skipSource}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${playingUrl === source.src ? "opacity-100" : "opacity-0"}`}
        />
    );
}
