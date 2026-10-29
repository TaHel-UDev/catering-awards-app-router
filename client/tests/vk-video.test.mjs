import assert from "node:assert/strict";
import test from "node:test";
import { getVkVideoEmbedUrl } from "../lib/vk-video.ts";

test("VK video links from supported domains open the same player", () => {
    for (const domain of ["vk.com", "vk.ru", "vkvideo.ru", "www.vk.com", "m.vk.ru"]) {
        const embed = new URL(getVkVideoEmbedUrl(`https://${domain}/video-39953043_456239437`));
        assert.equal(embed.origin, "https://vk.com");
        assert.equal(embed.pathname, "/video_ext.php");
        assert.equal(embed.searchParams.get("oid"), "-39953043");
        assert.equal(embed.searchParams.get("id"), "456239437");
        assert.equal(embed.searchParams.get("autoplay"), "1");
    }
});

test("albums, unrelated sites, malformed URLs and lookalike hosts remain links", () => {
    for (const link of [null, undefined, "", "invalid", "/video1_2", "javascript:alert(1)",
        "https://vk.com/album-39953043_313403036", "https://vk.ru/albums-39953043",
        "https://youtu.be/xFn-bo4a43U", "https://example.com/video-1_2",
        "https://vk.com.example.org/video-1_2", "https://user:pass@vk.com/video1_2",
        "https://vk.com/video_ext.php?oid=bad&id=2", "https://vk.com/video_ext.php?oid=1",
        "https://vk.com/video_ext.php?oid=1&id=2x"]) {
        assert.equal(getVkVideoEmbedUrl(link), null, String(link));
    }
});

test("preserves embed hash, private video access, playlist and quality", () => {
    const embed = new URL(getVkVideoEmbedUrl("https://vkvideo.ru/video_ext.php?oid=-1&id=2&hash=abc&access_key=secret&list=ln-test&hd=3&autoplay=0"));
    for (const [key, expected] of Object.entries({ hash: "abc", access_key: "secret", list: "ln-test", hd: "3", autoplay: "1" })) {
        assert.equal(embed.searchParams.get(key), expected);
    }
});

test("recognizes positive owner IDs and videos opened inside VK pages", () => {
    assert.equal(new URL(getVkVideoEmbedUrl("https://vk.com/video123_456/")).searchParams.get("oid"), "123");
    const embed = new URL(getVkVideoEmbedUrl("https://vk.com/videos-39953043?z=video-39953043_456239437%2Fclub39953043"));
    assert.equal(embed.searchParams.get("id"), "456239437");
    assert.equal(embed.searchParams.get("oid"), "-39953043");
});
