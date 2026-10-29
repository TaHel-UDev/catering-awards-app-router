import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const collection = "laureates_section";
const translations = (translation) => [{ language: "ru-RU", translation }];
const field = (name, type, label, sort, extra = {}) => ({
    field: name,
    type,
    meta: { interface: "input", width: "full", sort, translations: translations(label), ...extra.meta },
    ...(extra.schema ? { schema: extra.schema } : {}),
});

const fields = [
    {
        field: "id", type: "integer",
        schema: { is_primary_key: true, has_auto_increment: true },
        meta: { hidden: true, readonly: true, interface: "input" },
    },
    field("enabled", "boolean", "Показывать блок", 1, {
        schema: { default_value: true }, meta: { interface: "boolean", special: ["cast-boolean"] },
    }),
    field("title", "string", "Заголовок", 2),
    field("subtitle", "text", "Подзаголовок", 3, { meta: { interface: "input-multiline" } }),
    field("companies", "json", "Лауреаты", 4, {
        meta: {
            interface: "inline-repeater-interface", special: ["cast-json"],
            note: "Добавляйте, удаляйте и перетаскивайте компании для изменения порядка. Выделенные названия будут ярче и жирнее.",
            options: {
                template: "{{name}}",
                fields: [
                    {
                        field: "name", name: "Название компании", type: "string",
                        meta: { field: "name", type: "string", interface: "input", width: "full", required: true, options: { placeholder: "Название компании" } },
                    },
                    {
                        field: "highlighted", name: "Выделить ярче и жирнее", type: "boolean",
                        meta: { field: "highlighted", type: "boolean", interface: "boolean", width: "full", options: { label: "Выделить ярче и жирнее" } },
                    },
                ],
            },
        },
    }),
    field("cities", "text", "Строка городов", 5, {
        meta: { interface: "input-multiline", note: "Любое количество городов, без ссылок. Например: Москва · Санкт-Петербург · Новосибирск. В бегущей строке переносы заменяются разделителями; в обычном режиме Enter задаёт новую строку." },
    }),
    field("cities_font_size", "integer", "Города: размер шрифта на компьютере (px)", 6, {
        schema: { default_value: 18 },
        meta: { width: "half", options: { min: 10, max: 32, step: 1 }, note: "От 10 до 32 px. Влияет и на бегущую строку, и на обычный текст." },
    }),
    field("cities_mobile_font_size", "integer", "Города: размер шрифта на телефоне (px)", 7, {
        schema: { default_value: 16 },
        meta: { width: "half", options: { min: 10, max: 32, step: 1 }, note: "От 10 до 32 px. Влияет и на бегущую строку, и на обычный текст." },
    }),
    field("cities_marquee", "boolean", "Города: бегущая строка", 8, {
        schema: { default_value: true },
        meta: { interface: "boolean", special: ["cast-boolean"], note: "Выключите для обычного текста с переносами строк." },
    }),
    field("cities_scroll_duration", "integer", "Города: длительность прохода (сек)", 9, {
        schema: { default_value: 60 },
        meta: { options: { min: 10, max: 180, step: 1 }, note: "От 10 до 180 секунд. Чем больше число, тем медленнее прокрутка." },
    }),
];

const initialContent = {
    enabled: true,
    title: "Лауреаты, вошедшие в историю премии",
    subtitle: "Среди обладателей награды «Кейтеринг года» разных лет",
    companies: [
        ["Ad Gustum Catering", true], ["BOSCO Банкет", false], ["Dellos Catering", false],
        ["Даймонд Кейтеринг", true], ["Favorit Catering", false], ["Magnifique Catering Group", false],
        ["Novikov Catering", true], ["Азбука Вкуса", false], ["Вкус Жизни кейтеринг", false],
        ["Кейтеринг от Анны Сидевич", true], ["Кейтеринг службы гостиницы «Метрополь»", false],
        ["КейтерингБЮРО", false], ["Ла Маре", true], ["Максим", false], ["ШЕФ Кейтеринг", false],
        ["ЮСТА Кейтеринг", true],
    ].map(([name, highlighted]) => ({ name, highlighted })),
    cities: [
        "Астрахань", "Великий Новгород", "Волгоград", "Воронеж", "Екатеринбург", "Ижевск", "Иркутск", "Казань",
        "Калуга", "Киев", "Краснодар", "Красноярск", "Липецк", "Минск", "Нижний Новгород", "Новороссийск",
        "Новосибирск", "Пермь", "Псков", "Пятигорск", "Рязань", "Санкт-Петербург", "Сочи", "Ставрополь",
        "Сургут", "Тюмень", "Ульяновск", "Хабаровск", "Чебоксары", "Череповец", "Ярославль",
    ].join(" · "),
    cities_font_size: 18,
    cities_mobile_font_size: 16,
    cities_marquee: true,
    cities_scroll_duration: 60,
};

/** Additive and repeatable: existing content and permissions are never overwritten. */
export async function setupLaureates({ url, token }) {
    if (!url || !token) throw new Error("Set DIRECTUS_URL (or NEXT_PUBLIC_DIRECTUS_URL) and DIRECTUS_ADMIN_TOKEN.");
    const request = async (path, method = "GET", body) => {
        const response = await fetch(`${url.replace(/\/$/, "")}${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(`Directus ${method} ${path}: ${response.status} ${JSON.stringify(result.errors)}`);
        return result.data;
    };

    const collections = await request("/collections");
    if (!collections.some((item) => item.collection === collection)) {
        await request("/collections", "POST", {
            collection,
            schema: {},
            meta: {
                singleton: true, icon: "workspace_premium", sort: 5,
                translations: translations('Блок "Лауреаты"'),
                note: "После победителей, перед фотоархивом. Все тексты и выделение компаний редактируются здесь.",
            },
            fields,
        });
        for (const item of collections.filter((item) => !item.collection.startsWith("directus_") && !item.meta?.group && item.meta?.sort >= 5)) {
            await request(`/collections/${item.collection}`, "PATCH", { meta: { sort: item.meta.sort + 1 } });
        }
    }

    const existingFields = await request(`/fields/${collection}`);
    for (const definition of fields) {
        if (!existingFields.some((item) => item.field === definition.field)) {
            await request(`/fields/${collection}`, "POST", definition);
        }
    }

    // Match the existing gallery's public read and editor CRUD permissions.
    const galleryPermissions = await request("/permissions?filter[collection][_eq]=gallery_section");
    const permissions = await request(`/permissions?filter[collection][_eq]=${collection}`);
    for (const permission of galleryPermissions) {
        if (!permissions.some((item) => item.policy === permission.policy && item.action === permission.action)) {
            const template = { ...permission };
            delete template.id;
            await request("/permissions", "POST", { ...template, collection });
        }
    }

    const content = await request(`/items/${collection}`);
    if (!content?.id) await request(`/items/${collection}`, "PATCH", initialContent);

    const galleryField = await request("/fields/gallery_section/photos");
    const repeaterFields = galleryField.meta.options.fields;
    if (!repeaterFields.some((item) => item.field === "embed_url")) {
        await request("/fields/gallery_section/photos", "PATCH", {
            meta: {
                options: {
                    ...galleryField.meta.options,
                    fields: [...repeaterFields, {
                        field: "embed_url", name: "Ссылка на VK-плеер (необязательно)", type: "string",
                        meta: {
                            field: "embed_url", type: "string", interface: "input", width: "full",
                            note: "Обычно определяется автоматически. При необходимости вставьте src из кода встраивания VK: https://vk.com/video_ext.php?oid=…&id=…&hash=…",
                            options: { placeholder: "https://vk.com/video_ext.php?oid=…&id=…&hash=…" },
                        },
                    }],
                },
            },
        });
    }

    return { collection, content: await request(`/items/${collection}`) };
}

if (typeof process !== "undefined" && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const result = await setupLaureates({
            url: process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL,
            token: process.env.DIRECTUS_ADMIN_TOKEN,
        });
        console.log(`Directus: ${result.collection} ready (${result.content.companies?.length || 0} companies).`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
