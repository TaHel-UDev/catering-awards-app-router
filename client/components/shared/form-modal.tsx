"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import PhoneInput from "./phone-input";
import { submitApplication } from "@/app/actions/submit-application";
import { FIELD_LABELS, PARTICIPANT_LABELS, getFormFields, isValidPhone } from "@/lib/application-forms";
import type { Form, FormField } from "@/lib/schema";

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: Form;
    sourceName?: string | null;
}

const INPUT_CLASS = "w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none";
const AUTOCOMPLETE: Partial<Record<FormField, string>> = {
    name: "given-name", last_name: "family-name", company: "organization", city: "address-level2", phone: "tel", email: "email",
};

export default function FormModal(props: FormModalProps) {
    return props.isOpen ? <FormDialog key={props.config.id} {...props} /> : null;
}

function FormDialog({ onClose, config, sourceName }: FormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [phone, setPhone] = useState("");
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const preliminary = config.kind === "pre_registration";
    const fields = getFormFields(config);
    const participantLabel = config.participant_type ? PARTICIPANT_LABELS[config.participant_type] : null;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus({ preventScroll: true });
        };
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isLoading) return;
        if (fields.includes("phone") && !isValidPhone(phone)) {
            setError("Пожалуйста, введите корректный номер телефона.");
            return;
        }
        setIsLoading(true);
        setError(null);
        const values = Object.fromEntries(new FormData(event.currentTarget));
        try {
            const result = await submitApplication({ ...values, form_id: config.id, phone, policy_accepted: policyAccepted, source_name: sourceName || "Сайт" });
            if (result.success) setIsSuccess(true);
            else setError(result.error || "Не удалось отправить заявку.");
        } catch {
            setError("Не удалось отправить заявку. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-none border border-white/10 bg-[#0B0B0B] p-0 text-white shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
        >
            <div className="relative p-6 sm:p-8">
                <button type="button" onClick={onClose} aria-label="Закрыть форму" className="absolute right-3 top-3 flex size-11 items-center justify-center text-neutral-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-gold-500">
                    <X className="size-5" aria-hidden="true" />
                </button>
                {isSuccess ? (
                    <div role="status" className="flex flex-col items-center py-10 text-center">
                        <CheckCircle2 className="mb-5 size-14 text-gold-400" aria-hidden="true" />
                        <h2 id={titleId} className="mb-3 font-serif text-3xl">Заявка получена</h2>
                        <p className="leading-relaxed text-neutral-400">{config.success_message || (preliminary ? "Мы сообщим вам, когда откроется регистрация." : "Мы свяжемся с вами в ближайшее время.")}</p>
                        <Button type="button" onClick={onClose} className="mt-8">Готово</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="pr-8">
                            {preliminary && <p className="mb-3 text-xs uppercase tracking-widest text-gold-400">Предварительная заявка{participantLabel ? ` · ${participantLabel}` : ""}</p>}
                            <h2 id={titleId} className="mb-3 font-serif text-2xl leading-snug sm:text-3xl">{config.title || "Оставить заявку"}</h2>
                            {config.subtitle && <p className="text-sm leading-relaxed text-neutral-400">{config.subtitle}</p>}
                        </div>
                        {preliminary && !config.participant_type && (
                            <fieldset className="flex flex-wrap gap-x-6 gap-y-3 rounded-none border border-gold-500/20 p-4">
                                <legend className="px-1 text-sm text-neutral-300">Я хочу участвовать как *</legend>
                                {(["guest", "nominee"] as const).map((participant) => (
                                    <label key={participant} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-200">
                                        <input type="radio" name="participant_type" value={participant} required className="accent-gold-400" />
                                        {PARTICIPANT_LABELS[participant]}
                                    </label>
                                ))}
                            </fieldset>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {fields.map((field) => {
                                const required = field !== "comment" && field !== "social";
                                return (
                                    <label key={field} className={`flex flex-col gap-2 text-sm text-neutral-300 ${field === "comment" || field === "social" ? "sm:col-span-2" : ""}`}>
                                        <span>{FIELD_LABELS[field]}{required ? " *" : ""}</span>
                                        {field === "comment" ? (
                                            <textarea name={field} rows={3} maxLength={4000} className={`${INPUT_CLASS} resize-none`} />
                                        ) : field === "phone" ? (
                                            <PhoneInput value={phone} onValueChange={setPhone} required={required} className={INPUT_CLASS} />
                                        ) : (
                                            <input
                                                name={field}
                                                type={field === "email" ? "email" : "text"}
                                                autoComplete={AUTOCOMPLETE[field]}
                                                required={required}
                                                maxLength={255}
                                                className={INPUT_CLASS}
                                            />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                        {fields.length > 0 && (
                            <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-neutral-400">
                                <input type="checkbox" required checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-gold-400" />
                                <span>Я согласен с <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="text-gold-400 underline underline-offset-2">политикой конфиденциальности</a> и даю согласие на обработку персональных данных.</span>
                            </label>
                        )}
                        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                        <Button type="submit" fullWidth disabled={isLoading} className="min-h-12" aria-busy={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Отправка…</> : (config.submit_label || "Отправить заявку")}
                        </Button>
                    </form>
                )}
            </div>
        </dialog>
    );
}
