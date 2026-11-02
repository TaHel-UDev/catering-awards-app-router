import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const collection = "hero_section";
const tr = (translation) => [{ language: "ru-RU", translation }];
const file = (name, label, mime, sort, note, image = false) => ({
    field: name, type: "uuid", schema: { is_nullable: true },
    meta: {
        interface: image ? "file-image" : "file", special: ["file"], group: "hero_background", width: "full", sort,
        translations: tr(label), note,
        options: { allowedMimeTypes: mime, filter: { type: { _in: mime } } },
    },
});

export const HERO_VIDEO_FIELDS = [
    {
        field: "hero_background", type: "alias",
        meta: { interface: "group-raw", special: ["alias", "no-data", "group"], translations: tr("Фон первого экрана"), sort: 3, width: "full" },
    },
    {
        field: "background_video_enabled", type: "boolean", schema: { default_value: false },
        meta: { interface: "boolean", special: ["cast-boolean"], group: "hero_background", sort: 1, translations: tr("Включить фоновое видео"), note: "Без звука, с автоматическим повтором. При выключении остаётся изображение-заставка или стандартный фон." },
    },
    file("background_video", "Основное видео (MP4)", ["video/mp4"], 2,
        "Для совместимости с Safari, iPhone, Android, Windows и macOS: MP4 с кодеком H.264, без звука. Рекомендуется 10–30 секунд, до 1920×1080 и до 10–15 МБ. MOV и MP4 с HEVC предварительно перекодируйте в H.264."),
    file("background_video_webm", "Дополнительный формат (WebM)", ["video/webm"], 3,
        "Необязательно. Тот же ролик в WebM (VP8/VP9) для браузеров, которые не могут воспроизвести MP4."),
    file("background_video_mobile", "Облегчённое видео для телефона (MP4)", ["video/mp4"], 4,
        "Необязательно. MP4/H.264, до 720p и 3–5 МБ. На узком экране пробуем этот файл первым; если его нет или он не воспроизводится — основное видео."),
    file("background_poster", "Изображение-заставка", ["image/jpeg", "image/png", "image/webp"], 5,
        "Показывается до запуска видео, при запрете автовоспроизведения, ошибке файла, экономии трафика и системной настройке уменьшения движения. Без изображения остаётся стандартный фон.", true),
    {
        field: "background_overlay", type: "integer", schema: { default_value: 70 },
        meta: { interface: "input", group: "hero_background", sort: 6, translations: tr("Затемнение фона (%)"), options: { min: 0, max: 90, step: 5 }, note: "От 0 до 90. Рекомендуется 60–75, чтобы заголовок и кнопки оставались читаемыми." },
    },
];

/** Defaults to a read-only plan. Applying adds schema only; it never enables video or changes content. */
export async function setupHeroVideo({ url, token, apply = false, fetcher = fetch }) {
    if (!url || !token) throw new Error("Set NEXT_PUBLIC_DIRECTUS_URL and the server-only DIRECTUS_ADMIN_TOKEN.");
    const request = async (path, method = "GET", body) => {
        const response = await fetcher(url.replace(/\/+$/, "") + path, {
            method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(`Directus ${method} ${path}: ${response.status} ${JSON.stringify(result.errors)}`);
        return result.data;
    };
    const [fields, relations] = await Promise.all([request(`/fields/${collection}`), request(`/relations/${collection}`)]);
    const missingFields = HERO_VIDEO_FIELDS.filter((definition) => !fields.some((field) => field.field === definition.field));
    const missingRelations = HERO_VIDEO_FIELDS.filter((field) => field.type === "uuid" && !relations.some((relation) => relation.field === field.field));
    if (apply) {
        for (const definition of missingFields) {
            const payload = structuredClone(definition);
            if (payload.field === "hero_background" && fields.some((field) => field.field === "tabs")) payload.meta.group = "tabs";
            await request(`/fields/${collection}`, "POST", payload);
        }
        for (const definition of missingRelations) {
            await request("/relations", "POST", {
                collection, field: definition.field, related_collection: "directus_files", schema: { on_delete: "SET NULL" },
            });
        }
    }
    return { applied: apply, fields: missingFields.map((field) => field.field), relations: missingRelations.map((field) => field.field) };
}

if (typeof process !== "undefined" && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        console.log(await setupHeroVideo({
            url: process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL,
            token: process.env.DIRECTUS_ADMIN_TOKEN, apply: process.argv.includes("--apply"),
        }));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
