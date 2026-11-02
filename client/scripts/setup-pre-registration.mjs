import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tr = (translation) => [{ language: "ru-RU", translation }];
const field = (name, type, label, sort, meta = {}, schema) => ({
    field: name, type, meta: { interface: "input", width: "full", sort, translations: tr(label), ...meta },
    ...(schema ? { schema } : {}),
});
const participantChoices = [{ text: "Гость", value: "guest" }, { text: "Номинант", value: "nominee" }];
const kindChoices = [{ text: "Обычная заявка", value: "standard" }, { text: "Предварительная заявка", value: "pre_registration" }];
const definitions = {
    forms: [
        field("kind", "string", "Тип заявки", 6, { interface: "select-dropdown", options: { choices: kindChoices }, note: "Для предварительной заявки обязательны имя, фамилия, компания, город, телефон и email." }, { default_value: "standard" }),
        field("participant_type", "string", "Тип участия", 7, { interface: "select-dropdown", options: { choices: participantChoices, allowNone: true }, note: "Гость или номинант фиксируется для этой формы. Пустое поле — посетитель выбирает тип участия сам." }),
        field("submit_label", "string", "Текст кнопки отправки", 8),
        field("success_message", "text", "Сообщение после отправки", 9, { interface: "input-multiline" }),
    ],
    applications: [
        field("last_name", "string", "Фамилия", 4),
        field("company", "string", "Компания", 5),
        field("city", "string", "Город", 6),
        field("application_type", "string", "Тип заявки", 2, { interface: "select-dropdown", options: { choices: kindChoices }, display: "labels", display_options: { choices: kindChoices } }),
        field("participant_type", "string", "Гость / номинант", 3, { interface: "select-dropdown", options: { choices: participantChoices }, display: "labels", display_options: { choices: participantChoices } }),
        field("source_name", "string", "Откуда пришла заявка", 12),
        field("notification_status", "string", "Отправка письма", 13, {
            interface: "select-dropdown", readonly: true,
            options: { choices: [{ text: "Ожидает отправки", value: "pending" }, { text: "Отправлено", value: "sent" }, { text: "Ошибка отправки", value: "failed" }] },
            note: "При ошибке письма заявка остаётся в базе. Свяжитесь с участником по указанным контактам и проверьте почтовые настройки сайта.",
        }),
    ],
    global_settings: [
        field("pre_registration_emails", "json", "Предварительные заявки: получатели", 3, { interface: "tags", special: ["cast-json"], note: "Основные получатели (поле «Кому»). Эти адреса используются только для предварительных заявок." }),
        field("pre_registration_cc", "json", "Предварительные заявки: копия", 4, { interface: "tags", special: ["cast-json"], note: "Получатели копии письма (поле Cc). Изменения применяются к следующей заявке." }),
    ],
};
const locations = [
    { collection: "registrations_section", action: "guests_action_type", form: "guests_form", button: "guests_button", link: "guests_link", participant: "guest" },
    { collection: "registrations_section", action: "nominees_action_type", form: "nominees_form", button: "nominees_button", link: "nominees_link", participant: "nominee" },
    { collection: "hero_section", action: "action_type", form: "form", button: "registration_button", link: "registration_link", participant: null },
    { collection: "cta_section", action: "action_type", form: "form", button: "button_text", link: "button_link", participant: null },
];
const expandFormRule = (value) => {
    if (Array.isArray(value)) return value.map(expandFormRule);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
        if (item === "form" && key === "_eq") return ["_in", ["form", "pre_registration"]];
        if (item === "form" && key === "_neq") return ["_nin", ["form", "pre_registration"]];
        return [key, expandFormRule(item)];
    }));
};

export async function setupPreRegistration({ url, token, recipients = { to: [], cc: [] } }) {
    if (!url || !token) throw new Error("Directus URL and server admin token are required.");
    const api = async (path, method = "GET", body) => {
        const response = await fetch(url.replace(/\/$/, "") + path, {
            method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(`Directus ${method} ${path}: ${response.status} ${JSON.stringify(result.errors)}`);
        return result.data;
    };
    for (const [collection, fields] of Object.entries(definitions)) {
        const existing = await api(`/fields/${collection}`);
        for (const definition of fields) {
            if (!existing.some((item) => item.field === definition.field)) await api(`/fields/${collection}`, "POST", definition);
        }
    }
    const fieldsField = await api("/fields/forms/fields");
    const choices = fieldsField.meta.options.choices;
    for (const [value, text] of [["last_name", "Фамилия"], ["company", "Компания"], ["city", "Город"]]) {
        if (!choices.some((choice) => choice.value === value)) choices.push({ text, value });
    }
    await api("/fields/forms/fields", "PATCH", { meta: { options: { ...fieldsField.meta.options, choices } } });

    const forms = await api("/items/forms");
    const selected = {};
    for (const participant of ["guest", "nominee", null]) {
        const key = participant || "any";
        let form = forms.find((form) => form.kind === "pre_registration" && (form.participant_type || null) === participant);
        if (!form) form = await api("/items/forms", "POST", {
            name: `Предварительная заявка — ${participant === "guest" ? "гость" : participant === "nominee" ? "номинант" : "выбор участия"}`,
            title: "Узнать об открытии регистрации",
            subtitle: "Оставьте предварительную заявку, и мы сообщим вам о старте регистрации.",
            fields: ["name", "last_name", "company", "city", "phone", "email"],
            kind: "pre_registration", participant_type: participant,
            submit_label: "Отправить заявку", success_message: "Мы сообщим вам, когда откроется регистрация.",
        });
        selected[key] = form.id;
    }
    for (const location of locations) {
        const action = await api(`/fields/${location.collection}/${location.action}`);
        if (!action.meta.options.choices.some((choice) => choice.value === "pre_registration")) {
            await api(`/fields/${location.collection}/${location.action}`, "PATCH", { meta: {
                options: { ...action.meta.options, choices: [...action.meta.options.choices, { text: "Регистрация закрыта — предварительная заявка", value: "pre_registration" }] },
                note: "Для закрытой регистрации выберите предварительную форму ниже и задайте текст кнопки «Узнать об открытии регистрации».",
            } });
        }
        const data = await api(`/items/${location.collection}`);
        const hasLink = data[location.action] === "link" && data[location.link] && data[location.link] !== "/";
        const hasForm = ["form", "pre_registration"].includes(data[location.action]) && data[location.form];
        if (!hasLink && !hasForm) await api(`/items/${location.collection}`, "PATCH", {
            [location.action]: "pre_registration", [location.form]: selected[location.participant || "any"],
            [location.button]: "Узнать об открытии регистрации",
        });
    }
    for (const collection of [...new Set(locations.map((location) => location.collection))]) {
        const fields = await api(`/fields/${collection}`);
        for (const item of fields.filter((item) => item.field.endsWith("_form") && item.meta?.conditions)) {
            const conditions = expandFormRule(item.meta.conditions);
            if (JSON.stringify(conditions) !== JSON.stringify(item.meta.conditions)) await api(`/fields/${collection}/${item.field}`, "PATCH", { meta: { conditions } });
        }
    }
    const settings = await api("/items/global_settings");
    const patch = {};
    if (!settings.pre_registration_emails?.length && recipients.to.length) patch.pre_registration_emails = recipients.to;
    if (!settings.pre_registration_cc?.length && recipients.cc.length) patch.pre_registration_cc = recipients.cc;
    if (Object.keys(patch).length) await api("/items/global_settings", "PATCH", patch);

    // Allow the existing content editors to manage recipients and review applications.
    const editorPermissions = await api("/permissions?filter[collection][_eq]=forms");
    for (const policy of [...new Set(editorPermissions.filter((permission) => permission.action === "update").map((permission) => permission.policy))]) {
        for (const collection of ["global_settings", "applications"]) {
            const permissions = await api(`/permissions?filter[collection][_eq]=${collection}`);
            for (const action of ["read", "update"]) {
                if (!permissions.some((permission) => permission.policy === policy && permission.action === action)) await api("/permissions", "POST", { collection, action, policy, permissions: {}, fields: ["*"] });
            }
        }
    }
    return { forms: selected };
}

if (typeof process !== "undefined" && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const result = await setupPreRegistration({ url: process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL, token: process.env.DIRECTUS_ADMIN_TOKEN });
        console.log("Pre-registration configured:", result.forms);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
