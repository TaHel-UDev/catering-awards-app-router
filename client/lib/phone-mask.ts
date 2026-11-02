import type { AppendFlags, Masked, MaskedDynamic } from "imask";

export const PHONE_MASK_OPTIONS = {
    mask: [
        { mask: "+0 (000) 000-00-00", lazy: true, eager: "remove" as const },
        { mask: "+000000000000000", lazy: true, eager: "remove" as const },
    ],
    eager: "remove" as const,
    prepare(value: string, masked: Masked, flags: AppendFlags) {
        // Normalize a Russian national prefix only at the start of new input.
        // Editing an existing number or moving its tail must not add digits back.
        if (!flags.input || flags.tail || masked.value || value.trimStart().startsWith("+")) return value;
        const digits = value.replace(/\D/g, "");
        if (digits.startsWith("8")) return "7" + digits.slice(1);
        if (digits.startsWith("9")) return "7" + digits;
        return value;
    },
    dispatch(appended: string, masked: MaskedDynamic) {
        const digits = (masked.value + appended).replace(/\D/g, "");
        return masked.compiledMasks[digits.startsWith("7") ? 0 : 1];
    },
};
