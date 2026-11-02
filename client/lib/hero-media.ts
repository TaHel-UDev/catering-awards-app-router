import type { HeroSection } from "./schema";

export type HeroMedia = Pick<HeroSection,
    "background_video_enabled" | "background_video" | "background_video_webm" |
    "background_video_mobile" | "background_poster" | "background_overlay"
>;
export type VideoSource = { src: string; type: "video/mp4" | "video/webm" };

export function directusAssetUrl(file: HeroSection["background_video"], baseUrl: string): string | null {
    const id = typeof file === "object" && file !== null ? file.id : file;
    if (typeof id !== "string" || !id.trim() || !baseUrl) return null;
    return `${baseUrl.replace(/\/+$/, "")}/assets/${encodeURIComponent(id.trim())}`;
}

export function heroVideoSources(media: HeroMedia, mobile: boolean, baseUrl: string): VideoSource[] {
    if (!media.background_video_enabled) return [];
    const files: [HeroSection["background_video"], VideoSource["type"]][] = [
        ...(mobile ? [[media.background_video_mobile, "video/mp4"] as [HeroSection["background_video"], "video/mp4"]] : []),
        [media.background_video, "video/mp4"],
        [media.background_video_webm, "video/webm"],
    ];
    const seen = new Set<string>();
    return files.flatMap(([file, type]) => {
        const src = directusAssetUrl(file, baseUrl);
        if (!src || seen.has(src)) return [];
        seen.add(src);
        return [{ src, type }];
    });
}

export function heroOverlayOpacity(value: number | null | undefined): number {
    return typeof value === "number" && Number.isFinite(value) ? Math.min(90, Math.max(0, value)) / 100 : 0.7;
}
