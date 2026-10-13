import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { Ajv2020 } from "ajv/dist/2020.js";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strictTypes: false });
export const validateLesson = ajv.compile(
  readJson("schema/lesson.schema.json"),
);
export const validateProfile = ajv.compile(
  readJson("schema/profile.schema.json"),
);

function formatErrors(errors) {
  return (errors ?? [])
    .map((e) => `${e.instancePath || "/"} ${e.message}`)
    .join("; ");
}

export function assertValidJson(validate, data) {
  const valid = validate(data);
  assert.ok(valid, `expected valid, got: ${formatErrors(validate.errors)}`);
}

export function assertInvalidJson(validate, data) {
  assert.equal(validate(data), false, "expected the document to be rejected");
}

export function validateXml(xml, xsdRelativePath) {
  const result = spawnSync(
    "xmllint",
    ["--noout", "--nonet", "--schema", join(root, xsdRelativePath), "-"],
    { input: xml, encoding: "utf8" },
  );
  if (result.error) {
    throw new Error(
      `could not run xmllint (install libxml2): ${result.error.message}`,
    );
  }
  return { valid: result.status === 0, message: result.stderr.trim() };
}

export function assertValidXml(xml, xsdRelativePath) {
  const { valid, message } = validateXml(xml, xsdRelativePath);
  assert.ok(valid, `expected valid, got: ${message}`);
}

export function assertInvalidXml(xml, xsdRelativePath) {
  const { valid } = validateXml(xml, xsdRelativePath);
  assert.equal(valid, false, "expected the document to be rejected");
}

// JSON builders

export function minimalLesson(overrides = {}) {
  return {
    oslf: "0.1",
    title: "Lighthouses",
    sections: [{ blocks: [] }],
    ...overrides,
  };
}

export function lessonWithBlocks(...blocks) {
  return minimalLesson({ sections: [{ blocks }] });
}

export function question(questionType, props = {}) {
  return { type: "question", questionType, prompt: "A prompt.", ...props };
}

// XML builders

export function lessonXml({
  attributes = 'version="0.1"',
  head = "",
  body = "<section/>",
} = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<lesson xmlns="urn:oslf:lesson" ${attributes}>
  <title>Lighthouses</title>
  ${head}
  ${body}
</lesson>`;
}

export function sectionXml(blocks) {
  return lessonXml({ body: `<section>${blocks}</section>` });
}

export function profileXml({
  attributes = 'oslf-profile="0.1" id="urn:example:p"',
  body = "",
} = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<profile xmlns="urn:oslf:profile" ${attributes}>
  <name>Example profile</name>
  ${body}
</profile>`;
}
