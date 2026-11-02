import assert from "node:assert/strict";
import test from "node:test";
import { directusAssetUrl, heroVideoSources, heroOverlayOpacity } from "../lib/hero-media.ts";
import { HERO_VIDEO_FIELDS, setupHeroVideo } from "../scripts/setup-hero-video.mjs";

const base = "https://cms.example.com/";
const media = { background_video_enabled: true, background_video: "desktop", background_video_mobile: { id: "mobile" }, background_video_webm: "webm" };

test("supports both Directus IDs and expanded file objects without leaking arbitrary URLs", () => {
    assert.equal(directusAssetUrl({ id: "video-id" }, base), "https://cms.example.com/assets/video-id");
    assert.equal(directusAssetUrl("video id", base), "https://cms.example.com/assets/video%20id");
    for (const value of [null, undefined, "", {}, { id: 42 }]) assert.equal(directusAssetUrl(value, base), null);
    assert.equal(directusAssetUrl("file", ""), null);
});

test("prefers mobile MP4, falls back to desktop MP4 then WebM, and never downloads disabled videos", () => {
    assert.deepEqual(heroVideoSources(media, false, base).map((source) => source.src.split("/").at(-1)), ["desktop", "webm"]);
    assert.deepEqual(heroVideoSources(media, true, base).map((source) => source.src.split("/").at(-1)), ["mobile", "desktop", "webm"]);
    assert.deepEqual(heroVideoSources({ ...media, background_video_mobile: "desktop" }, true, base).map((source) => source.type), ["video/mp4", "video/webm"]);
    assert.deepEqual(heroVideoSources({ ...media, background_video_enabled: false }, true, base), []);
    assert.deepEqual(heroVideoSources({}, false, base), []);
});

test("overlay defaults remain readable and reject non-finite values", () => {
    assert.equal(heroOverlayOpacity(null), 0.7);
    assert.equal(heroOverlayOpacity(NaN), 0.7);
    assert.equal(heroOverlayOpacity(500), 0.9);
    assert.equal(heroOverlayOpacity(-50), 0);
    assert.equal(heroOverlayOpacity(65), 0.65);
});

test("CMS setup is read-only by default; application is additive, disabled and repeatable", async () => {
    const fields = [{ field: "tabs" }];
    const relations = [];
    const writes = [];
    const fetcher = async (url, options) => {
        const path = new URL(url).pathname;
        if (options.method === "POST") {
            const body = JSON.parse(options.body);
            writes.push({ path, body });
            (path === "/relations" ? relations : fields).push(body);
            return { ok: true, json: async () => ({ data: body }) };
        }
        assert.ok(path === "/fields/hero_section" || path === "/relations/hero_section");
        return { ok: true, json: async () => ({ data: path.startsWith("/fields") ? fields : relations }) };
    };
    const options = { url: base, token: "test-only", fetcher };
    const plan = await setupHeroVideo(options);
    assert.equal(plan.applied, false);
    assert.equal(writes.length, 0);
    await setupHeroVideo({ ...options, apply: true });
    assert.equal(writes.length, HERO_VIDEO_FIELDS.length + 4);
    assert.equal(fields.find((field) => field.field === "background_video_enabled").schema.default_value, false);
    assert.equal(fields.find((field) => field.field === "hero_background").meta.group, "tabs");
    assert.equal(fields.find((field) => field.field === "background_video").meta.options.allowedMimeTypes[0], "video/mp4");
    const count = writes.length;
    await setupHeroVideo({ ...options, apply: true });
    assert.equal(writes.length, count);
    assert.ok(writes.every((write) => !write.path.startsWith("/items")));
});
