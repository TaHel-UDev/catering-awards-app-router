"use server";

import nodemailer from "nodemailer";
import { ApplicationValidationError, buildApplication, buildApplicationEmail } from "@/lib/application-forms";
import type { Form, GlobalSettings } from "@/lib/schema";

export async function submitApplication(input: unknown) {
    try {
        if (!input || typeof input !== "object" || !("form_id" in input) || !Number.isSafeInteger(input.form_id) || Number(input.form_id) < 1) {
            return { success: false, error: "Не найдена форма заявки. Обновите страницу." };
        }
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
        const token = process.env.DIRECTUS_ADMIN_TOKEN;
        if (!directusUrl || !token) throw new Error("Directus не настроен.");
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        // Recipient changes in Directus apply to the next submission.
        const [formRes, settingsRes] = await Promise.all([
            fetch(`${directusUrl}/items/forms/${input.form_id}`, { headers, cache: "no-store" }),
            fetch(`${directusUrl}/items/global_settings`, { headers, cache: "no-store" }),
        ]);
        if (!formRes.ok || !settingsRes.ok) throw new Error("Не удалось получить настройки формы.");
        const form: Form = (await formRes.json()).data;
        const settings: GlobalSettings = (await settingsRes.json()).data;
        if (!form) throw new Error("Форма не найдена.");
        const application = buildApplication(input, form);
        const email = buildApplicationEmail(application, settings);
        const saveRes = await fetch(`${directusUrl}/items/applications`, {
            method: "POST", headers,
            body: JSON.stringify({ ...application, notification_status: "pending" }),
        });
        if (!saveRes.ok) throw new Error("Не удалось сохранить заявку.");
        const savedId: number = (await saveRes.json()).data.id;
        let notificationStatus = "sent";
        try {
            const port = Number(process.env.SMTP_PORT || 465);
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST, port, secure: port === 465,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                connectionTimeout: 15000, socketTimeout: 20000,
            });
            const delivery = await transporter.sendMail({
                from: { name: "Премия «Кейтеринг года»", address: process.env.SMTP_FROM || process.env.SMTP_USER || "" },
                ...email,
            });
            if (delivery.rejected?.length) throw new Error("Почтовый сервер отклонил одного из получателей.");
        } catch (error) {
            // Keep the saved application; a retry from the visitor would create a duplicate.
            notificationStatus = "failed";
            console.error("Application email failed:", savedId, error);
        }
        try {
            const statusRes = await fetch(`${directusUrl}/items/applications/${savedId}`, {
                method: "PATCH", headers, body: JSON.stringify({ notification_status: notificationStatus }),
            });
            if (!statusRes.ok) console.error("Could not update application notification status:", savedId);
        } catch (error) {
            console.error("Application status update failed:", savedId, error);
        }
        return { success: true };
    } catch (error) {
        if (error instanceof ApplicationValidationError) return { success: false, error: error.message };
        console.error("Submit application error:", error);
        return { success: false, error: "Не удалось отправить заявку. Попробуйте позже." };
    }
}
