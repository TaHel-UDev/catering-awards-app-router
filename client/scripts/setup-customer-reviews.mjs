import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const collection = "customer_reviews_section";
const translation = (label) => [{ language: "ru-RU", translation: label }];

const fields = [
    {
        field: "id", type: "integer",
        schema: { is_primary_key: true, has_auto_increment: true },
        meta: { hidden: true, readonly: true, interface: "input" },
    },
    {
        field: "enabled", type: "boolean", schema: { default_value: true },
        meta: { interface: "boolean", special: ["cast-boolean"], sort: 1, translations: translation("Показывать блок") },
    },
    {
        field: "title", type: "string",
        meta: { interface: "input", sort: 2, translations: translation("Заголовок") },
    },
    {
        field: "subtitle", type: "text",
        meta: { interface: "input-multiline", sort: 3, translations: translation("Подзаголовок") },
    },
    {
        field: "reviews", type: "json",
        meta: {
            interface: "inline-repeater-interface", special: ["cast-json"], sort: 4,
            translations: translation("Карточки отзывов"),
            note: "Добавляйте отзывы и перетаскивайте их, чтобы менять порядок на сайте. Текст показывается целиком.",
            options: {
                template: "{{company}} · {{author}}",
                fields: [
                    { field: "company", name: "Компания", type: "string", meta: { field: "company", type: "string", interface: "input", width: "full", required: true } },
                    { field: "author", name: "Автор", type: "string", meta: { field: "author", type: "string", interface: "input", width: "full", required: true } },
                    { field: "text", name: "Полный текст отзыва", type: "text", meta: { field: "text", type: "text", interface: "input-multiline", width: "full", required: true } },
                ],
            },
        },
    },
];

export const initialContent = {
    enabled: true,
    title: "Мнение заказчиков",
    subtitle: "Что говорят о премии «Кейтеринг года» представители крупных компаний-заказчиков.",
    reviews: [
        {
            company: 'X5 / Торговая сеть "Перекрёсток"',
            author: "Мария Каротам",
            text: "За 25 лет в событийной индустрии я видела, как меняются тренды, уходят игроки, появляются новые. А премия существует дольше, чем большинство компаний-участников. За ней стоят опыт „Кейтеринг Консалтинг“ и Кирилла Погодина. Это не маркетинг, а репутация, которую не купишь.",
        },
        {
            company: "Группа НЛМК",
            author: "Людмила Терехова",
            text: "Особенно интересно, что „Кейтеринг года“ представляет собственный взгляд на достижения компаний. Это не голосование за самых популярных, а профессиональное мнение людей, которые давно знают отрасль.",
        },
        {
            company: "Билайн",
            author: "Елена Константинова",
            text: "Для крупного бизнеса важно знать репутацию кейтеринговых компаний. Это является одним из ключевых факторов выбора поставщика. „Кейтеринг года“ уже много лет помогает ближе познакомиться с индустрией и увидеть её по-настоящему эффективных и самых креативных представителей.",
        },
        {
            company: "ГК Черкизово",
            author: "София Семенова",
            text: "„Кейтеринг года“ давно стала частью истории российского кейтеринга. Достаточно посмотреть, какие компании получали эту награду.",
        },
        {
            company: "ГК Росатом",
            author: "Мария Есаева",
            text: "Среди лауреатов „Кейтеринг года“ есть компании, которым мы уже доверяли свои мероприятия. А некоторые имена из этого списка стоит взять на заметку.",
        },
        {
            company: "ББР Банк",
            author: "Елена Лайс",
            text: "Для меня премия „Кейтеринг года“ — это в первую очередь возможность быть в центре индустрии. Также радует, что с 2011 года люди, стоящие у истоков проекта, до сих пор его развивают, вкладывают энергию и душу.",
        },
        {
            company: "Мэри Кэй",
            author: "Надежда Лебедева",
            text: "География лауреатов „Кейтеринг года“ впечатляет. Премия позволяет увидеть сильные кейтеринговые компании далеко за пределами Москвы.",
        },
        {
            company: "Альфа-Банк",
            author: "Анна Рогожкина",
            text: "На „Кейтеринг года“ можно лично познакомиться с руководителями известных кейтеринговых компаний со всей России. Для нас такие контакты особенно ценны.",
        },
    ],
};

async function setupCustomerReviews() {
    const url = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_ADMIN_TOKEN;
    if (!url || !token) throw new Error("Directus URL and admin token are required.");

    async function api(path, method = "GET", body) {
        const response = await fetch(url.replace(/\/+$/, "") + path, {
            method,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(`Directus ${method} ${path}: ${response.status} ${JSON.stringify(result.errors)}`);
        return result.data;
    }

    const collections = await api("/collections");
    if (!collections.some(item => item.collection === collection)) {
        await api("/collections", "POST", {
            collection,
            schema: {},
            meta: {
                singleton: true,
                icon: "format_quote",
                translations: translation('Блок "Отзывы заказчиков"'),
                note: "Отзывы заказчиков на главной странице, между лауреатами и фотоархивом.",
            },
            fields,
        });
    }

    const existingFields = await api(`/fields/${collection}`);
    for (const definition of fields) {
        if (!existingFields.some(item => item.field === definition.field)) {
            await api(`/fields/${collection}`, "POST", definition);
        }
    }

    const content = await api(`/items/${collection}`);
    if (!content?.id) await api(`/items/${collection}`, "PATCH", initialContent);

    const [galleryPermissions, existingPermissions, appPolicies] = await Promise.all([
        api("/permissions?filter[collection][_eq]=gallery_section&filter[action][_in]=read,update"),
        api(`/permissions?filter[collection][_eq]=${collection}`),
        api("/policies?filter[app_access][_eq]=true&fields=id"),
    ]);
    const editorPolicies = new Set(appPolicies.map(policy => policy.id));
    const fieldNames = fields.map(definition => definition.field);

    // Reuse the site's existing public read and editor access for public-facing blocks.
    for (const permission of galleryPermissions) {
        const { action, policy } = permission;
        const restricted = [permission.permissions, permission.validation, permission.presets]
            .some(rule => rule && Object.keys(rule).length > 0);
        if (restricted || !permission.fields?.includes("*")) continue;
        if (action === "update" && !editorPolicies.has(policy)) continue;
        if (existingPermissions.some(item => item.policy === policy && item.action === action)) continue;
        await api("/permissions", "POST", {
            collection, action, policy,
            fields: action === "read" ? fieldNames : fieldNames.filter(name => name !== "id"),
        });
    }

    const saved = await api(`/items/${collection}`);
    console.log(`Directus: ${collection} ready (${saved.reviews?.length ?? 0} reviews).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        await setupCustomerReviews();
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
