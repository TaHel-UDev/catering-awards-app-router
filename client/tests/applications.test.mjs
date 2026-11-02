import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import * as domain from "../lib/application-forms.ts";

const form = { id: 4, name: "Предварительная заявка — гость", title: "Узнать об открытии регистрации", fields: domain.PRE_REGISTRATION_FIELDS, kind: "pre_registration", participant_type: "guest" };
const settings = { notification_emails: ["regular@example.com"], pre_registration_emails: ["info@example.com"], pre_registration_cc: ["copy@example.com"] };
const valid = { form_id: 4, name: "Иван", last_name: "Иванов", company: "Кейтеринг", city: "Тюмень", phone: "+7 (999) 123-45-67", email: "ivan@example.com", policy_accepted: true, source_name: "Гостям" };
const actionSource = await readFile(new URL("../app/actions/submit-application.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(actionSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;

function actionHarness({ config = form, recipients = structuredClone(settings), mailFails = false, saveFails = false, partialRejection = false } = {}) {
    const writes = [];
    const messages = [];
    const calls = [];
    const exports = {};
    vm.runInNewContext(compiled, {
        exports,
        require: (name) => {
            if (name === "@/lib/application-forms") return domain;
            if (name === "nodemailer") return { createTransport: () => ({ sendMail: async (message) => {
                messages.push(message);
                if (mailFails) throw new Error("Simulated SMTP outage");
                return { rejected: partialRejection ? ["copy@example.com"] : [] };
            } }) };
            throw new Error(`Unexpected dependency: ${name}`);
        },
        process: { env: { NEXT_PUBLIC_DIRECTUS_URL: "https://cms.example.com", DIRECTUS_ADMIN_TOKEN: "test-only", SMTP_FROM: "site@example.com" } },
        console: { error() {} },
        fetch: async (url, options) => {
            calls.push({ url, options });
            let data;
            if (url.endsWith("/items/forms/4")) data = config;
            else if (url.endsWith("/items/global_settings")) data = recipients;
            else if (url.endsWith("/items/applications")) {
                writes.push(JSON.parse(options.body));
                return { ok: !saveFails, json: async () => ({ data: { id: 42 } }) };
            } else if (url.endsWith("/items/applications/42")) {
                writes.push(JSON.parse(options.body));
                data = { id: 42 };
            } else throw new Error(`Unexpected CMS call: ${url}`);
            return { ok: true, json: async () => ({ data }) };
        },
    });
    return { submit: exports.submitApplication, writes, messages, calls, recipients };
}

test("guest identity comes from Directus; all six fields are saved and sent to To and Cc", async () => {
    const harness = actionHarness();
    const result = await harness.submit({ ...valid, participant_type: "nominee", form_name: "forged", notification_status: "sent" });
    assert.equal(result.success, true);
    assert.equal(harness.writes[0].participant_type, "guest");
    assert.equal(harness.writes[0].form_name, form.name);
    assert.equal(harness.writes[0].application_type, "pre_registration");
    for (const field of domain.PRE_REGISTRATION_FIELDS) assert.equal(harness.writes[0][field], valid[field]);
    assert.equal(harness.writes[0].notification_status, "pending");
    assert.equal(harness.writes[1].notification_status, "sent");
    const message = harness.messages[0];
    assert.deepEqual(message.to, ["info@example.com"]);
    assert.deepEqual(message.cc, ["copy@example.com"]);
    assert.match(message.subject, /Предварительная заявка — Гость/);
    for (const value of Object.values(valid).filter((value) => typeof value === "string")) assert.ok(message.text.includes(value), value);
    assert.equal(message.replyTo, valid.email);
    assert.ok(harness.calls.filter((call) => call.options.method === undefined).every((call) => call.options.cache === "no-store"));
});

test("all preliminary fields, valid phone/email, participant selection and consent are enforced on the server", async () => {
    for (const field of domain.PRE_REGISTRATION_FIELDS) {
        const harness = actionHarness();
        const result = await harness.submit({ ...valid, [field]: "" });
        assert.equal(result.success, false, field);
        assert.equal(harness.writes.length, 0);
    }
    for (const patch of [{ policy_accepted: false }, { email: "bad" }, { phone: "123" }, { name: "a".repeat(256) }]) {
        assert.equal((await actionHarness().submit({ ...valid, ...patch })).success, false);
    }
    const generic = actionHarness({ config: { ...form, participant_type: null } });
    assert.equal((await generic.submit(valid)).success, false);
    assert.equal((await generic.submit({ ...valid, participant_type: "nominee" })).success, true);
    assert.equal(generic.writes[0].participant_type, "nominee");
    assert.match(generic.messages[0].subject, /Номинант/);
});

test("email content escapes HTML, preserves Cyrillic names and rejects header injection", () => {
    const application = domain.buildApplication({ ...valid, name: '<script>alert("x")</script>', company: "Кухня & Сервис" }, form);
    const message = domain.buildApplicationEmail(application, settings);
    assert.ok(!message.html.includes("<script>"));
    assert.match(message.html, /&lt;script&gt;/);
    assert.match(message.html, /Кухня &amp; Сервис/);
    assert.throws(() => domain.buildApplication({ ...valid, email: "x@example.com\r\nBcc: evil@example.com" }, form));
});

test("SMTP failure retains one saved application and marks the failed notification", async () => {
    for (const options of [{ mailFails: true }, { partialRejection: true }]) {
        const harness = actionHarness(options);
        assert.equal((await harness.submit(valid)).success, true);
        assert.equal(harness.writes.length, 2);
        assert.equal(harness.writes[1].notification_status, "failed");
    }
    const failedSave = actionHarness({ saveFails: true });
    assert.equal((await failedSave.submit(valid)).success, false);
    assert.equal(failedSave.messages.length, 0);
});

test("regular forms retain their configured fields and existing recipient routing", async () => {
    const harness = actionHarness({ config: { ...form, kind: "standard", fields: ["name", "phone", "email"] } });
    assert.equal((await harness.submit(valid)).success, true);
    assert.equal(harness.writes[0].application_type, "standard");
    assert.equal(harness.writes[0].last_name, "");
    assert.equal(harness.writes[0].participant_type, null);
    assert.deepEqual(harness.messages[0].to, ["regular@example.com"]);
    assert.deepEqual(harness.messages[0].cc, []);
});

test("recipient edits take effect on the next submission and missing routing does not save a broken request", async () => {
    const harness = actionHarness();
    await harness.submit(valid);
    harness.recipients.pre_registration_emails = ["new@example.com"];
    await harness.submit(valid);
    assert.deepEqual(harness.messages[1].to, ["new@example.com"]);
    const missing = actionHarness({ recipients: { ...settings, pre_registration_emails: [] } });
    assert.equal((await missing.submit(valid)).success, false);
    assert.equal(missing.writes.length, 0);
});
