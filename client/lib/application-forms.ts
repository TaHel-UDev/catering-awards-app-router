import type { Application, Form, FormField, GlobalSettings, ParticipantType } from "./schema";

export const PRE_REGISTRATION_FIELDS: FormField[] = ["name", "last_name", "company", "city", "phone", "email"];
export const PARTICIPANT_LABELS: Record<ParticipantType, string> = { guest: "Гость", nominee: "Номинант" };
export const FIELD_LABELS: Record<FormField, string> = {
    name: "Имя", last_name: "Фамилия", company: "Компания", city: "Город",
    phone: "Контактный телефон", email: "Контактный email", social: "Соц. сеть / Telegram", comment: "Комментарий",
};

export function isFormAction(action: string | null | undefined) {
    return action === "form" || action === "pre_registration";
}

export function getFormFields(form: Form): FormField[] {
    return form.kind === "pre_registration" ? PRE_REGISTRATION_FIELDS : (form.fields || []).filter((field) => field in FIELD_LABELS);
}

export function isValidPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return /^\+?[\d\s()-]+$/.test(phone) && digits.length >= 10 && digits.length <= 15
        && (!digits.startsWith("7") || digits.length === 11);
}

export class ApplicationValidationError extends Error {}
export type ApplicationRecord = Omit<Application, "id" | "notification_status">;

export function buildApplication(input: unknown, form: Form): ApplicationRecord {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApplicationValidationError("Некорректные данные формы.");
    const data = input as Record<string, unknown>;
    const fields = getFormFields(form);
    if (fields.length && data.policy_accepted !== true) throw new ApplicationValidationError("Необходимо согласие на обработку персональных данных.");
    const result: ApplicationRecord = {
        form_name: form.name || "Форма сайта", application_type: form.kind === "pre_registration" ? "pre_registration" : "standard",
        participant_type: null, name: "", last_name: "", company: "", city: "", phone: "", email: "", social: "", comment: "", source_name: "",
    };
    for (const field of fields) {
        const value = typeof data[field] === "string" ? data[field].trim() : "";
        const limit = field === "comment" ? 4000 : 255;
        if (value.length > limit) throw new ApplicationValidationError(`Поле «${FIELD_LABELS[field]}» слишком длинное.`);
        if (!value && field !== "social" && field !== "comment") throw new ApplicationValidationError(`Заполните поле «${FIELD_LABELS[field]}».`);
        if (field === "email" && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) throw new ApplicationValidationError("Введите корректный email.");
        if (field === "phone" && !isValidPhone(value)) throw new ApplicationValidationError("Введите корректный номер телефона.");
        result[field] = value;
    }
    if (result.application_type === "pre_registration") {
        const participant = form.participant_type || data.participant_type;
        if (participant !== "guest" && participant !== "nominee") throw new ApplicationValidationError("Выберите тип участия: гость или номинант.");
        result.participant_type = participant;
    }
    if (typeof data.source_name === "string") result.source_name = data.source_name.trim().slice(0, 255);
    return result;
}

function emailList(value: unknown): string[] {
    const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;]/) : [];
    return [...new Set(list.filter((email): email is string => typeof email === "string")
        .map((email) => email.trim()).filter((email) => /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email)))];
}

export function buildApplicationEmail(application: ApplicationRecord, settings: GlobalSettings) {
    const preliminary = application.application_type === "pre_registration";
    const participant = application.participant_type ? PARTICIPANT_LABELS[application.participant_type] : "";
    const to = emailList(preliminary ? settings.pre_registration_emails : settings.notification_emails);
    const cc = preliminary ? emailList(settings.pre_registration_cc).filter((email) => !to.includes(email)) : [];
    if (!to.length) throw new Error("Не настроены получатели заявок в Directus.");
    const subject = (preliminary ? `Предварительная заявка — ${participant} | Кейтеринг года` : `Новая заявка: ${application.form_name}`).replace(/[\r\n]+/g, " ");
    const rows = [
        ["Тип заявки", preliminary ? "Предварительная заявка" : "Заявка"],
        ...(participant ? [["Тип участия", participant]] : []),
        ["Форма", application.form_name],
        ...Object.entries(FIELD_LABELS).filter(([field]) => preliminary ? PRE_REGISTRATION_FIELDS.includes(field as FormField) : Boolean(application[field as FormField]))
            .map(([field, label]) => [label, application[field as FormField]]),
        ["Источник", application.source_name || "Сайт"],
    ];
    const escape = (value: string | null) => (value || "—").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
    return {
        to, cc, subject, replyTo: application.email || undefined,
        text: rows.map(([label, value]) => `${label}: ${value || "—"}`).join("\n"),
        html: `<h2>${escape(subject)}</h2>${rows.map(([label, value]) => `<p><strong>${escape(label)}:</strong> ${escape(value).replace(/\n/g, "<br/>")}</p>`).join("")}`,
    };
}
