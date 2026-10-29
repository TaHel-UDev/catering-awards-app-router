const VK_HOSTS = new Set([
    "vk.com", "www.vk.com", "m.vk.com",
    "vk.ru", "www.vk.ru", "m.vk.ru",
    "vkvideo.ru", "www.vkvideo.ru", "m.vkvideo.ru",
]);

/** Only VK videos become embeds. Albums and other external links stay links. */
export function getVkVideoEmbedUrl(link: string | null | undefined): string | null {
    if (!link) return null;

    let url: URL;
    try {
        url = new URL(link);
    } catch {
        return null;
    }

    if (!VK_HOSTS.has(url.hostname) || !["https:", "http:"].includes(url.protocol) || url.username || url.password) {
        return null;
    }

    let owner: string;
    let video: string;

    if (url.pathname === "/video_ext.php") {
        owner = url.searchParams.get("oid") || "";
        video = url.searchParams.get("id") || "";
        if (!/^-?\d+$/.test(owner) || !/^\d+$/.test(video)) return null;
    } else {
        const match = url.pathname.match(/^\/video(-?\d+)_(\d+)\/?$/)
            || url.searchParams.get("z")?.match(/^video(-?\d+)_(\d+)(?:$|[/?])/);
        if (!match) return null;
        [, owner, video] = match;
    }

    const embed = new URL("https://vk.com/video_ext.php");
    embed.searchParams.set("oid", owner);
    embed.searchParams.set("id", video);
    // Preserve VK's embed hash and private-link parameters when supplied.
    for (const key of ["hash", "access_key", "list", "hd"]) {
        const value = url.searchParams.get(key);
        if (value) embed.searchParams.set(key, value);
    }
    if (!embed.searchParams.has("hd")) embed.searchParams.set("hd", "2");
    embed.searchParams.set("autoplay", "1");
    return embed.toString();
}
