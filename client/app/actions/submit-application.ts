"use server"

import nodemailer from "nodemailer";

export async function submitApplication(formData: any) {
    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
        const directusToken = process.env.DIRECTUS_ADMIN_TOKEN;

        // 1. Получаем глобальные почты из Directus
        const settingsRes = await fetch(`${directusUrl}/items/global_settings`, {
            headers: { "Authorization": `Bearer ${directusToken}` },
            next: { revalidate: 3600 }
        });
        const settingsData = await settingsRes.json();
        const emails = settingsData?.data?.notification_emails;

        // 2. Сохраняем заявку в Directus
        const saveRes = await fetch(`${directusUrl}/items/applications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${directusToken}`
            },
            body: JSON.stringify(formData),
        });

        if (!saveRes.ok) {
            throw new Error("Не удалось сохранить заявку в базу");
        }

        if (emails && emails.length > 0) {
            const targetEmails = Array.isArray(emails) ? emails.join(',') : emails;

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: true, // true для 465 порта
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Формируем HTML письма
            const htmlContent = `
                <h2>Новая заявка: ${formData.form_name}</h2>
                <p><strong>Имя:</strong> ${formData.name || '-'}</p>
                <p><strong>Телефон:</strong> ${formData.phone || '-'}</p>
                <p><strong>Email:</strong> ${formData.email || '-'}</p>
                <p><strong>Соц. сеть:</strong> ${formData.social || '-'}</p>
                <p><strong>Комментарий:</strong><br/> ${formData.comment || '-'}</p>
            `;

            await transporter.sendMail({
                from: `"Сайт" <${process.env.SMTP_FROM}>`,
                to: targetEmails,
                subject: `Новая заявка с сайта: ${formData.form_name}`,
                html: htmlContent,
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Submit application error:", error);
        return { success: false, error: "Не удалось отправить заявку. Попробуйте позже." };
    }
}