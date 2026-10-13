import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertValidJson,
  assertValidXml,
  readJson,
  root,
  validateLesson,
  validateProfile,
} from "./helpers.mjs";

test("example lesson JSON validates against the lesson schema", () => {
  assertValidJson(validateLesson, readJson("examples/lighthouses.oslf.json"));
});

test("example profile JSON validates against the profile schema", () => {
  assertValidJson(
    validateProfile,
    readJson("examples/six-section.profile.json"),
  );
});

test("example lesson XML validates against the lesson XSD", () => {
  const xml = readFileSync(join(root, "examples/lighthouses.oslf.xml"), "utf8");
  assertValidXml(xml, "schema/lesson.xsd");
});

test("example profile XML validates against the profile XSD", () => {
  const xml = readFileSync(
    join(root, "examples/six-section.profile.xml"),
    "utf8",
  );
  assertValidXml(xml, "schema/profile.xsd");
});

test("example XML files contain no DOCTYPE (XML-FORMAT.md section 3.1)", () => {
  for (const file of [
    "examples/lighthouses.oslf.xml",
    "examples/six-section.profile.xml",
  ]) {
    const xml = readFileSync(join(root, file), "utf8");
    assert.ok(!/<!DOCTYPE/i.test(xml), `${file} contains a DOCTYPE`);
  }
});

test("the lesson schemas agree on question type ids", () => {
  const jsonTypes = readJson("schema/lesson.schema.json").$defs.question
    .properties.questionType.enum;
  const xsd = readFileSync(join(root, "schema/lesson.xsd"), "utf8");
  const section = xsd.match(
    /<xs:simpleType name="questionType">[\s\S]*?<\/xs:simpleType>/,
  )[0];
  const xsdTypes = [
    ...section.matchAll(/<xs:enumeration value="([^"]+)"\/>/g),
  ].map((m) => m[1]);
  assert.deepEqual(xsdTypes, jsonTypes);
});

test("the profile schemas agree on question type ids with the lesson schema", () => {
  const lessonTypes = readJson("schema/lesson.schema.json").$defs.question
    .properties.questionType.enum;
  const profileTypes = readJson("schema/profile.schema.json").$defs.questionType
    .enum;
  assert.deepEqual(profileTypes, lessonTypes);
});
