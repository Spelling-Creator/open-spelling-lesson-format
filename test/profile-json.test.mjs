import { test, suite } from "node:test";
import {
  assertInvalidJson,
  assertValidJson,
  validateProfile,
} from "./helpers.mjs";

function minimalProfile(overrides = {}) {
  return {
    oslfProfile: "0.1",
    id: "urn:example:profile",
    name: "Example profile",
    rules: [],
    ...overrides,
  };
}

function profileWithRule(rule) {
  return minimalProfile({ rules: [rule] });
}

function check(name, data, expectValid) {
  test(name, () => {
    if (expectValid) assertValidJson(validateProfile, data);
    else assertInvalidJson(validateProfile, data);
  });
}

function valid(name, data) {
  check(name, data, true);
}

function invalid(name, data) {
  check(name, data, false);
}

suite("profile document", () => {
  valid("a minimal profile", minimalProfile());
  valid(
    "all optional metadata",
    minimalProfile({
      version: "1.2",
      description: "A profile for testing.",
      publisher: { name: "A Publisher", url: "https://example.org/" },
      license: "BSD-3-Clause",
      extensions: { "https://example.org/oslf/x": true },
    }),
  );

  invalid("missing oslfProfile", {
    id: "urn:example:p",
    name: "N",
    rules: [],
  });
  invalid("missing id", { oslfProfile: "0.1", name: "N", rules: [] });
  invalid("missing name", {
    oslfProfile: "0.1",
    id: "urn:example:p",
    rules: [],
  });
  invalid("missing rules", {
    oslfProfile: "0.1",
    id: "urn:example:p",
    name: "N",
  });
  invalid("wrong oslfProfile version", minimalProfile({ oslfProfile: "1.0" }));
  invalid("empty id", minimalProfile({ id: "" }));
  invalid("empty name", minimalProfile({ name: "" }));
  invalid("unknown top-level field", minimalProfile({ author: "A" }));
  invalid("publisher without a name", minimalProfile({ publisher: {} }));
  invalid(
    "publisher url with a disallowed scheme",
    minimalProfile({ publisher: { name: "P", url: "ftp://example.org/" } }),
  );
  invalid(
    "extension key without a scheme",
    minimalProfile({ extensions: { foo: 1 } }),
  );
});

suite("rules in general", () => {
  valid(
    "a rule kind this version does not define",
    profileWithRule({ rule: "custom-wording", pattern: "^Would you rather" }),
  );
  valid(
    "rule id, severity and description",
    profileWithRule({
      rule: "section-count",
      id: "six-sections",
      severity: "error",
      description: "Six sections.",
      count: { min: 6, max: 6 },
    }),
  );
  invalid("a rule without a kind", profileWithRule({ id: "x" }));
  invalid("an empty rule kind", profileWithRule({ rule: "" }));
  invalid(
    "an unknown severity",
    profileWithRule({ rule: "section-count", count: {}, severity: "info" }),
  );
});

suite("section-count rules", () => {
  valid(
    "a closed range",
    profileWithRule({ rule: "section-count", count: { min: 6, max: 6 } }),
  );
  valid(
    "an open-ended range",
    profileWithRule({ rule: "section-count", count: { min: 1 } }),
  );
  valid(
    "an empty range",
    profileWithRule({ rule: "section-count", count: {} }),
  );
  invalid("without a count", profileWithRule({ rule: "section-count" }));
  invalid(
    "a negative bound",
    profileWithRule({ rule: "section-count", count: { min: -1 } }),
  );
  invalid(
    "a fractional bound",
    profileWithRule({ rule: "section-count", count: { min: 1.5 } }),
  );
  invalid(
    "a range with an unknown field",
    profileWithRule({ rule: "section-count", count: { exactly: 6 } }),
  );
});

suite("section-shape rules", () => {
  valid(
    "slots of every block kind",
    profileWithRule({
      rule: "section-shape",
      allowOther: true,
      slots: [
        { block: "image", count: { min: 0, max: 1 } },
        { block: "passage", count: { min: 1, max: 2 } },
        { block: "spelling" },
        { block: "question", questionType: "known", count: { min: 3, max: 3 } },
        { block: "question", questionType: ["tight-open", "broad-open"] },
        { block: "vakt", count: { min: 0 } },
      ],
    }),
  );
  invalid("without slots", profileWithRule({ rule: "section-shape" }));
  invalid(
    "with no slot",
    profileWithRule({ rule: "section-shape", slots: [] }),
  );
  invalid(
    "a slot without a block",
    profileWithRule({ rule: "section-shape", slots: [{ count: { min: 1 } }] }),
  );
  invalid(
    "a heading slot",
    profileWithRule({ rule: "section-shape", slots: [{ block: "heading" }] }),
  );
  invalid(
    "a question slot without a questionType",
    profileWithRule({ rule: "section-shape", slots: [{ block: "question" }] }),
  );
  invalid(
    "a questionType on a non-question slot",
    profileWithRule({
      rule: "section-shape",
      slots: [{ block: "passage", questionType: "known" }],
    }),
  );
  invalid(
    "an unknown question type in a slot",
    profileWithRule({
      rule: "section-shape",
      slots: [{ block: "question", questionType: "single" }],
    }),
  );
  invalid(
    "an empty questionType array",
    profileWithRule({
      rule: "section-shape",
      slots: [{ block: "question", questionType: [] }],
    }),
  );
  invalid(
    "a slot with an unknown field",
    profileWithRule({
      rule: "section-shape",
      slots: [{ block: "passage", optional: true }],
    }),
  );
});

suite("spelling-words rules", () => {
  valid("with no fields", profileWithRule({ rule: "spelling-words" }));
  valid(
    "with count, letters and uniqueInLesson",
    profileWithRule({
      rule: "spelling-words",
      count: { min: 4, max: 4 },
      letters: { min: 6, max: 9 },
      uniqueInLesson: true,
    }),
  );
  invalid(
    "a letters range with a negative bound",
    profileWithRule({ rule: "spelling-words", letters: { min: -2 } }),
  );
});

for (const kind of [
  "answer-in-passage",
  "answer-not-in-passage",
  "prompt-gives-answer",
]) {
  suite(`${kind} rules`, () => {
    valid(
      "with questionTypes",
      profileWithRule({ rule: kind, questionTypes: ["known"] }),
    );
    invalid("without questionTypes", profileWithRule({ rule: kind }));
    invalid(
      "with no question type",
      profileWithRule({ rule: kind, questionTypes: [] }),
    );
    invalid(
      "with an unknown question type",
      profileWithRule({ rule: kind, questionTypes: ["single"] }),
    );
  });
}

suite("answer-reuse rules", () => {
  valid("without questionTypes", profileWithRule({ rule: "answer-reuse" }));
  valid(
    "with questionTypes",
    profileWithRule({
      rule: "answer-reuse",
      questionTypes: ["known", "math", "semi-open"],
    }),
  );
  invalid(
    "with no question type",
    profileWithRule({ rule: "answer-reuse", questionTypes: [] }),
  );
});
