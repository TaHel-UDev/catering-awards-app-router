"use client"

import { useState } from "react"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "./button"
import { submitApplication } from "@/app/actions/submit-application"
import { Form } from "@/lib/schema"

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: Form;
    sourceName?: string | null;
}

// Функция для форматирования телефона (Маска: +7 (999) 999-99-99)
const formatPhoneNumber = (value: string) => {
    if (!value) return value;

    // Очищаем все нецифровые символы
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length === 0) return '';

    // Если начинается с 7, 8 или 9 (если 9, автоматически подставляем 7)
    if (['7', '8', '9'].includes(phoneNumber[0])) {
        let numberPart = phoneNumber;
        // Если пользователь начал ввод с "9", добавляем "7" в начало
        if (phoneNumber[0] === '9') numberPart = '7' + phoneNumber;

        numberPart = numberPart.substring(1); // убираем код страны для форматирования
        let formattedNumber = '+7 ';

        if (numberPart.length === 0) return formattedNumber;
        if (numberPart.length < 4) return formattedNumber + '(' + numberPart;
        if (numberPart.length < 7) return formattedNumber + '(' + numberPart.slice(0, 3) + ') ' + numberPart.slice(3);
        if (numberPart.length < 9) return formattedNumber + '(' + numberPart.slice(0, 3) + ') ' + numberPart.slice(3, 6) + '-' + numberPart.slice(6);

        return formattedNumber + '(' + numberPart.slice(0, 3) + ') ' + numberPart.slice(3, 6) + '-' + numberPart.slice(6, 8) + '-' + numberPart.slice(8, 10);
    } else {
        // Если это другой код страны (не РФ), просто добавляем плюс
        return '+' + phoneNumber.slice(0, 15);
    }
};

export default function FormModal({ isOpen, onClose, config, sourceName }: FormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    // Стейт для управляемого инпута телефона
    const [phone, setPhone] = useState("");

    if (!isOpen) return null;

    const fields = config.fields || [];
    const hasFields = fields.length > 0;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!policyAccepted && hasFields) {
            setError("Необходимо согласие с политикой конфиденциальности");
            return;
        }

        // Валидация телефона (должно быть ровно 11 цифр для РФ номера)
        if (fields.includes("phone")) {
            const digitsOnly = phone.replace(/\D/g, '');
            // Если начинается с 7, ожидаем 11 символов. Если другой код - минимум 10.
            if ((digitsOnly.startsWith('7') && digitsOnly.length !== 11) || digitsOnly.length < 10) {
                setError("Пожалуйста, введите корректный номер телефона");
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            form_name: `${config.name}`,
            name: formData.get("name")?.toString() || "",
            phone: phone, // Берем отформатированный телефон из стейта
            email: formData.get("email")?.toString() || "",
            social: formData.get("social")?.toString() || "",
            comment: formData.get("comment")?.toString() || "",
        };

        const result = await submitApplication(data);

        setIsLoading(false);
        if (result.success) {
            setIsSuccess(true);
            // Очищаем форму после успеха
            setPhone("");
            setPolicyAccepted(false);

            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 5000);
        } else {
            setError(result.error || "Произошла ошибка");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg p-8 bg-[#0B0B0B] border border-white/10 rounded-2xl shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-serif text-white mb-2">Заявка отправлена</h3>
                        <p className="text-neutral-400">Мы свяжемся с вами в ближайшее время.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="mb-2">
                            {config.title && <h3 className="text-2xl font-serif text-white mb-2">{config.title}</h3>}
                            {config.subtitle && <p className="text-sm text-neutral-400">{config.subtitle}</p>}
                        </div>

                        {fields.includes("name") && (
                            <input name="name" type="text" placeholder="Ваше имя *" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors" />
                        )}
                        {fields.includes("phone") && (
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Телефон *"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                maxLength={18} // +7 (999) 999-99-99 = 18 символов
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        )}
                        {fields.includes("email") && (
                            <input name="email" type="email" placeholder="E-mail *" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors" />
                        )}
                        {fields.includes("social") && (
                            <input name="social" type="text" placeholder="Ссылка на соц. сеть / Telegram" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors" />
                        )}
                        {fields.includes("comment") && (
                            <textarea name="comment" placeholder="Ваш комментарий" rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors resize-none" />
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        {hasFields && (
                            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={policyAccepted}
                                        onChange={(e) => setPolicyAccepted(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-gold-500 checked:border-gold-500 transition-colors cursor-pointer"
                                    />
                                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors leading-relaxed">
                                    Я согласен с <a href="/privacy-policy.pdf" target="_blank" className="text-gold-500 hover:underline">политикой конфиденциальности</a> и даю согласие на обработку персональных данных.
                                </span>
                            </label>
                        )}

                        <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-4">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Отправить"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}