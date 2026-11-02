import assert from "node:assert/strict";
import test from "node:test";
import IMask from "imask";
import { PHONE_MASK_OPTIONS } from "../lib/phone-mask.ts";

function phone(value = "") {
    const mask = IMask.createMask(PHONE_MASK_OPTIONS);
    mask.resolve(value, { input: true });
    return mask;
}

test("formats pasted Russian numbers with +7, 7, 8 or without the country code", () => {
    for (const value of ["+7 (999) 123-45-67", "79991234567", "8 (999) 123-45-67", "9991234567"]) {
        assert.equal(phone(value).value, "+7 (999) 123-45-67");
    }
});

test("backspace never gets stuck at a separator and clears the country code too", () => {
    for (const value of ["+7 (999) 999-99-", "+7 (999) 999-99-99", "+7 (999) ", "+7", "+375291234567"]) {
        const mask = phone(value);
        for (let step = 0; mask.value && step < 20; step++) {
            const before = mask.value;
            mask.splice(before.length - 1, 1, "", "LEFT");
            assert.ok(mask.value.length < before.length, `Backspace stuck at ${JSON.stringify(before)}`);
        }
        assert.equal(mask.value, "");
    }
});

test("deleting digits removes trailing punctuation instead of adding it back", () => {
    const mask = phone("+7 (999) 123-45");
    mask.splice(mask.value.length - 1, 1, "", "LEFT");
    assert.equal(mask.value, "+7 (999) 123-4");
    mask.splice(mask.value.length - 1, 1, "", "LEFT");
    assert.equal(mask.value, "+7 (999) 123");
});

test("replacing selected digits in the middle preserves the rest of the number", () => {
    const mask = phone("+7 (999) 123-45-67");
    mask.splice(9, 3, "555");
    assert.equal(mask.value, "+7 (999) 555-45-67");
    mask.splice(4, 3, "800");
    assert.equal(mask.value, "+7 (800) 555-45-67");
});

test("replacing all text supports another national prefix or country", () => {
    const mask = phone("+442079460958");
    mask.splice(0, mask.value.length, "89991234567");
    assert.equal(mask.value, "+7 (999) 123-45-67");
    mask.splice(0, mask.value.length, "+375291234567");
    assert.equal(mask.value, "+375291234567");
});

test("international numbers keep their country code", () => {
    for (const value of ["+442079460958", "+375291234567", "+998901234567", "+8613812345678"]) {
        assert.equal(phone(value).value, value);
    }
});
