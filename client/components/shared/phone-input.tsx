"use client";

import { IMaskInput } from "react-imask";
import { PHONE_MASK_OPTIONS } from "@/lib/phone-mask";

interface PhoneInputProps {
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    required?: boolean;
}

export default function PhoneInput({ value, onValueChange, className, required }: PhoneInputProps) {
    return (
        <IMaskInput
            {...PHONE_MASK_OPTIONS}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required={required}
            value={value}
            onAccept={(accepted) => onValueChange(accepted)}
            placeholder="+7 (___) ___-__-__"
            className={className}
        />
    );
}
