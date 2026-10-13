import { test, suite } from "node:test";
import {
  assertInvalidJson,
  assertValidJson,
  lessonWithBlocks,
  minimalLesson,
  question,
  validateLesson,
} from "./helpers.mjs";

function check(name, data, expectValid) {
  test(name, () => {
    if (expectValid) assertValidJson(validateLesson, data);
    else assertInvalidJson(validateLesson, data);
  });
}

function valid(name, data) {
  check(name, data, true);
}

function invalid(name, data) {
  check(name, data, false);
}

suite("lesson document", () => {
  valid("a minimal lesson", minimalLesson());
  valid(
    "all optional metadata",
    minimalLesson({
      id: "urn:example:lighthouses",
      language: "en",
      authors: [
        { name: "A Person", url: "https://example.org/" },
        { name: "B" },
      ],
      license: "CC-BY-4.0",
      created: "2026-01-01",
      modified: "2026-02-03T04:05:06Z",
      ageRange: "14-16 years",
      profiles: ["urn:oslf:example:six-section"],
      sources: [{ id: "src-1" }],
      extensions: { "https://example.org/oslf/reading-level": 3 },
    }),
  );

  invalid("missing oslf", { title: "T", sections: [{ blocks: [] }] });
  invalid("missing title", { oslf: "0.1", sections: [{ blocks: [] }] });
  invalid("missing sections", { oslf: "0.1", title: "T" });
  invalid("wrong oslf version", minimalLesson({ oslf: "0.2" }));
  invalid("oslf as a number", minimalLesson({ oslf: 0.1 }));
  invalid("empty title", minimalLesson({ title: "" }));
  invalid("no sections", minimalLesson({ sections: [] }));
  invalid("unknown top-level field", minimalLesson({ colour: "red" }));
  invalid("author without a name", minimalLesson({ authors: [{}] }));
  invalid(
    "author with an empty name",
    minimalLesson({ authors: [{ name: "" }] }),
  );
  invalid(
    "author url with a disallowed scheme",
    minimalLesson({ authors: [{ name: "A", url: "ftp://example.org/" }] }),
  );
  valid(
    "author url with mailto",
    minimalLesson({ authors: [{ name: "A", url: "mailto:a@example.org" }] }),
  );
  invalid("empty profile id", minimalLesson({ profiles: [""] }));
});

suite("sources", () => {
  valid(
    "a full source",
    minimalLesson({
      sources: [
        {
          id: "lighthouse",
          title: "Lighthouse",
          author: "Many",
          publisher: "Wikipedia",
          year: "2026",
          url: "https://en.wikipedia.org/wiki/Lighthouse",
        },
      ],
    }),
  );
  invalid("source without an id", minimalLesson({ sources: [{ title: "T" }] }));
  invalid(
    "source id with a space",
    minimalLesson({ sources: [{ id: "a b" }] }),
  );
  invalid(
    "source id over 64 characters",
    minimalLesson({ sources: [{ id: "x".repeat(65) }] }),
  );
  invalid(
    "source with an unknown field",
    minimalLesson({ sources: [{ id: "a", isbn: "123" }] }),
  );
  invalid(
    "source url with a disallowed scheme",
    minimalLesson({ sources: [{ id: "a", url: "javascript:alert(1)" }] }),
  );
});

suite("extensions", () => {
  valid(
    "extension keys that are URIs",
    minimalLesson({
      extensions: {
        "https://example.org/oslf/x": { any: "shape" },
        "urn:example:y": [1, 2],
      },
    }),
  );
  invalid(
    "extension key without a scheme",
    minimalLesson({ extensions: { foo: 1 } }),
  );
  invalid(
    "extension key starting with a digit",
    minimalLesson({ extensions: { "1https://example.org/": 1 } }),
  );
  valid(
    "extensions on a section and a block",
    minimalLesson({
      sections: [
        {
          blocks: [
            {
              type: "spelling",
              words: ["BEACON"],
              extensions: { "urn:example:x": true },
            },
          ],
          extensions: { "urn:example:x": true },
        },
      ],
    }),
  );
});

suite("sections and blocks", () => {
  valid(
    "section with id and title",
    minimalLesson({ sections: [{ id: "s1", title: "One", blocks: [] }] }),
  );
  invalid(
    "section without blocks",
    minimalLesson({ sections: [{ title: "One" }] }),
  );
  invalid(
    "section with an unknown field",
    minimalLesson({ sections: [{ blocks: [], level: 2 }] }),
  );
  invalid("block without a type", lessonWithBlocks({ words: ["BEACON"] }));
  invalid(
    "block with an unknown type",
    lessonWithBlocks({ type: "video", src: "x" }),
  );
});

suite("passage blocks", () => {
  valid(
    "plain string paragraphs",
    lessonWithBlocks({ type: "passage", paragraphs: ["One.", "Two."] }),
  );
  valid(
    "paragraph as an array of runs",
    lessonWithBlocks({
      type: "passage",
      id: "p1",
      paragraphs: [
        [
          "Plain, ",
          { text: "marked", bold: true, italic: true, underline: true },
          ".",
        ],
      ],
    }),
  );
  invalid("passage without paragraphs", lessonWithBlocks({ type: "passage" }));
  invalid(
    "passage with no paragraph",
    lessonWithBlocks({ type: "passage", paragraphs: [] }),
  );
  invalid(
    "paragraph holding a line break",
    lessonWithBlocks({ type: "passage", paragraphs: ["one\ntwo"] }),
  );
  invalid(
    "passage with an unknown field",
    lessonWithBlocks({ type: "passage", paragraphs: ["x"], align: "left" }),
  );
});

suite("rich text runs", () => {
  function passage(...runs) {
    return lessonWithBlocks({ type: "passage", paragraphs: [runs] });
  }

  valid("a text run with ipa", passage({ text: "FRESNEL", ipa: "freɪˈnɛl" }));
  valid(
    "a text run with an alias",
    passage({ text: "WWF", alias: "World Wide Fund for Nature" }),
  );
  valid(
    "a text run spelled out, with marks",
    passage("Spell ", { text: "REEF", sayAs: "characters", bold: true }, "."),
  );
  valid(
    "a note with a source",
    passage("Text.", { note: { source: "lighthouse" } }),
  );
  valid(
    "a note with free text",
    passage("Text.", { note: { text: "A remark." } }),
  );
  valid(
    "a note with source, locator and text",
    passage({
      note: { source: "lighthouse", locator: "p. 12", text: "See also." },
    }),
  );
  valid(
    "pause runs",
    passage("Wait", { pause: "short" }, { pause: "long" }, "go."),
  );
  invalid("an empty run array", passage());
  invalid("a text run with a line break", passage({ text: "one\ntwo" }));
  invalid("a text run with an empty ipa", passage({ text: "x", ipa: "" }));
  invalid(
    "a text run with an unknown mark",
    passage({ text: "x", strike: true }),
  );
  invalid(
    "a text run with an empty alias",
    passage({ text: "WWF", alias: "" }),
  );
  invalid(
    "a text run with another sayAs value",
    passage({ text: "360", sayAs: "digits" }),
  );
  invalid(
    "a text run with ipa and alias",
    passage({ text: "x", ipa: "x", alias: "y" }),
  );
  invalid(
    "a text run with ipa and sayAs",
    passage({ text: "x", ipa: "x", sayAs: "characters" }),
  );
  invalid(
    "a text run with alias and sayAs",
    passage({ text: "x", alias: "y", sayAs: "characters" }),
  );
  invalid("a note with only a locator", passage({ note: { locator: "p. 1" } }));
  invalid("a note with a bad source id", passage({ note: { source: "a b" } }));
  invalid("a pause with a bad value", passage({ pause: "medium" }));
  invalid(
    "a pause beside another field",
    passage({ pause: "short", text: "x" }),
  );
  invalid("an empty run object", passage({}));
});

suite("math runs", () => {
  function mathParagraph(math) {
    return lessonWithBlocks({ type: "passage", paragraphs: [[{ math }]] });
  }

  valid(
    "an asciimath formula",
    mathParagraph({ format: "asciimath", source: "120 xx 3 = 360" }),
  );
  valid(
    "a tex formula with display and spoken text",
    mathParagraph({
      format: "tex",
      source: "\\frac{60}{5} = 12",
      display: true,
      spoken: "60 divided by 5 is 12",
    }),
  );
  valid(
    "spoken text as runs",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [
        "60 divided by 5",
        { pause: "short" },
        "is 12",
        { text: "buoy", ipa: "ˈbuːi" },
      ],
    }),
  );
  valid(
    "a substitution run",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ text: "WWF", alias: "World Wide Fund for Nature" }],
    }),
  );
  valid(
    "a spell-out run",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: ["Spell it: ", { text: "REEF", sayAs: "characters" }],
    }),
  );
  invalid("a formula without a format", mathParagraph({ source: "1 + 1" }));
  invalid("a formula without a source", mathParagraph({ format: "tex" }));
  invalid(
    "a formula with an empty source",
    mathParagraph({ format: "tex", source: "" }),
  );
  invalid(
    "an unknown format",
    mathParagraph({ format: "mathml", source: "<math/>" }),
  );
  invalid(
    "a source holding a line break",
    mathParagraph({ format: "tex", source: "1\n+ 1" }),
  );
  invalid(
    "a formula with an unknown field",
    mathParagraph({ format: "tex", source: "x", delimiters: "$" }),
  );
  invalid(
    "empty spoken text",
    mathParagraph({ format: "tex", source: "x", spoken: "" }),
  );
  invalid(
    "an empty spoken run array",
    mathParagraph({ format: "tex", source: "x", spoken: [] }),
  );
  invalid(
    "a pronunciation without ipa",
    mathParagraph({ format: "tex", source: "x", spoken: [{ text: "buoy" }] }),
  );
  invalid(
    "a pronunciation without text",
    mathParagraph({ format: "tex", source: "x", spoken: [{ ipa: "ˈbuːi" }] }),
  );
  invalid(
    "a pronunciation with marks",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ text: "x", ipa: "x", bold: true }],
    }),
  );
  invalid(
    "a substitution without text",
    mathParagraph({ format: "tex", source: "x", spoken: [{ alias: "y" }] }),
  );
  invalid(
    "a substitution with an empty alias",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ text: "x", alias: "" }],
    }),
  );
  invalid(
    "a substitution beside ipa",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ text: "x", ipa: "x", alias: "y" }],
    }),
  );
  invalid(
    "a spell-out with another sayAs value",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ text: "360", sayAs: "digits" }],
    }),
  );
  invalid(
    "a spell-out without text",
    mathParagraph({
      format: "tex",
      source: "x",
      spoken: [{ sayAs: "characters" }],
    }),
  );
});

suite("spelling blocks", () => {
  valid(
    "a word list",
    lessonWithBlocks({ type: "spelling", words: ["BEACON", "HARBOR"] }),
  );
  invalid("no words field", lessonWithBlocks({ type: "spelling" }));
  invalid(
    "an empty word list",
    lessonWithBlocks({ type: "spelling", words: [] }),
  );
  invalid("an empty word", lessonWithBlocks({ type: "spelling", words: [""] }));
  invalid(
    "an unknown field",
    lessonWithBlocks({ type: "spelling", words: ["BEACON"], letters: 6 }),
  );
});

suite("heading blocks", () => {
  valid(
    "a plain heading",
    lessonWithBlocks({ type: "heading", text: "WOULD YOU RATHER" }),
  );
  valid(
    "a rich text heading",
    lessonWithBlocks({
      type: "heading",
      text: [{ text: "Part ", bold: true }, "two"],
    }),
  );
  invalid("a heading without text", lessonWithBlocks({ type: "heading" }));
});

suite("image blocks", () => {
  function image(fields) {
    return lessonWithBlocks({
      type: "image",
      src: "media/pharos.png",
      ...fields,
    });
  }

  valid("a relative src", image({}));
  valid("an https src", image({ src: "https://example.org/pharos.png" }));
  valid("a data: src", image({ src: "data:image/png;base64,iVBORw0KGgo=" }));
  valid(
    "all image fields",
    image({
      id: "img-1",
      alt: "A stone tower.",
      caption: ["An artist's idea of ", { text: "Pharos", italic: true }, "."],
      credit: {
        text: "Photo: Example Author (CC0)",
        author: "Example Author",
        license: "CC0-1.0",
        licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
        sourceUrl: "https://example.org/photo",
      },
      width: 800,
      height: 600,
      size: "large",
      align: "center",
    }),
  );
  invalid("no src", lessonWithBlocks({ type: "image", alt: "x" }));
  invalid("an empty src", image({ src: "" }));
  invalid("an http src", image({ src: "http://example.org/pharos.png" }));
  invalid("a file: src", image({ src: "file:///etc/passwd" }));
  invalid("a javascript: src", image({ src: "javascript:alert(1)" }));
  invalid("a zero width", image({ width: 0 }));
  invalid("a negative height", image({ height: -1 }));
  invalid("a fractional width", image({ width: 1.5 }));
  invalid("an unknown size", image({ size: "huge" }));
  invalid("an unknown align", image({ align: "top" }));
  invalid("an unknown field", image({ border: true }));
  invalid("an empty credit", image({ credit: {} }));
  invalid(
    "a credit licenseUrl with a disallowed scheme",
    image({ credit: { licenseUrl: "ftp://example.org/" } }),
  );
  valid("a credit with only text", image({ credit: { text: "Photo: A" } }));
});

suite("vakt blocks", () => {
  valid(
    "text only",
    lessonWithBlocks({ type: "vakt", text: "Stand up and turn." }),
  );
  valid(
    "with links and an image",
    lessonWithBlocks({
      type: "vakt",
      text: "Watch and copy the movement.",
      links: [
        { url: "https://example.org/video", label: "The video" },
        { url: "https://example.org/" },
      ],
      image: { src: "media/turn.png", alt: "A person turning." },
    }),
  );
  invalid("no text", lessonWithBlocks({ type: "vakt" }));
  invalid("empty text", lessonWithBlocks({ type: "vakt", text: "" }));
  invalid(
    "a link without a url",
    lessonWithBlocks({ type: "vakt", text: "x", links: [{ label: "y" }] }),
  );
  invalid(
    "a link with a disallowed scheme",
    lessonWithBlocks({
      type: "vakt",
      text: "x",
      links: [{ url: "ftp://example.org/" }],
    }),
  );
  invalid(
    "a vakt image block with a type field",
    lessonWithBlocks({
      type: "vakt",
      text: "x",
      image: { type: "image", src: "a.png" },
    }),
  );
});

suite("questions: shared rules", () => {
  valid(
    "a rich text prompt",
    lessonWithBlocks(
      question("known", {
        prompt: [
          "The word for lighthouse is ",
          { text: "phare", italic: true },
          " in ______.",
        ],
        answers: ["FRENCH"],
      }),
    ),
  );
  invalid(
    "an unknown question type",
    lessonWithBlocks(question("single", { answers: ["X"] })),
  );
  invalid(
    "no prompt",
    lessonWithBlocks({ type: "question", questionType: "broad-open" }),
  );
  invalid(
    "no questionType",
    lessonWithBlocks({ type: "question", prompt: "Why?" }),
  );
  invalid(
    "a prompt holding a line break",
    lessonWithBlocks(question("broad-open", { prompt: "one\ntwo" })),
  );
  invalid(
    "an unknown field",
    lessonWithBlocks(question("broad-open", { points: 2 })),
  );
  invalid(
    "an empty answer string",
    lessonWithBlocks(question("known", { answers: [""] })),
  );
  invalid(
    "an unknown answerKey value",
    lessonWithBlocks(
      question("known", { answers: ["X"], answerKey: "partial" }),
    ),
  );
});

suite("questions: known", () => {
  valid(
    "with answers",
    lessonWithBlocks(question("known", { answers: ["PHAROS"] })),
  );
  valid(
    "with several answers and an explicit exhaustive key",
    lessonWithBlocks(
      question("known", {
        answerKey: "exhaustive",
        answers: ["KEEPER", "LIGHTHOUSE KEEPER"],
      }),
    ),
  );
  invalid("without answers", lessonWithBlocks(question("known")));
  invalid(
    "with no answer",
    lessonWithBlocks(question("known", { answers: [] })),
  );
  invalid(
    "with a suggested key",
    lessonWithBlocks(
      question("known", { answerKey: "suggested", answers: ["X"] }),
    ),
  );
  invalid(
    "with a none key",
    lessonWithBlocks(question("known", { answerKey: "none", answers: ["X"] })),
  );
  invalid(
    "with working",
    lessonWithBlocks(question("known", { answers: ["X"], working: ["Step."] })),
  );
  invalid(
    "with besides",
    lessonWithBlocks(question("known", { answers: ["X"], besides: "X" })),
  );
  invalid(
    "with threeBoard",
    lessonWithBlocks(question("known", { answers: ["X"], threeBoard: true })),
  );
});

suite("questions: prior-knowledge", () => {
  valid(
    "with answers",
    lessonWithBlocks(question("prior-knowledge", { answers: ["AFRICA"] })),
  );
  invalid("without answers", lessonWithBlocks(question("prior-knowledge")));
  invalid(
    "with a suggested key",
    lessonWithBlocks(
      question("prior-knowledge", { answerKey: "suggested", answers: ["X"] }),
    ),
  );
});

suite("questions: math", () => {
  valid(
    "with one answer",
    lessonWithBlocks(question("math", { answers: ["360"] })),
  );
  valid(
    "with working steps",
    lessonWithBlocks(
      question("math", {
        answers: ["360"],
        working: [
          "There are 60 seconds in a minute.",
          [
            "Multiply: ",
            { math: { format: "asciimath", source: "120 xx 3 = 360" } },
          ],
        ],
      }),
    ),
  );
  invalid(
    "with two answers",
    lessonWithBlocks(question("math", { answers: ["360", "361"] })),
  );
  invalid("without answers", lessonWithBlocks(question("math")));
  invalid(
    "with no answer",
    lessonWithBlocks(question("math", { answers: [] })),
  );
  invalid(
    "with a none key",
    lessonWithBlocks(question("math", { answerKey: "none", answers: ["1"] })),
  );
  invalid(
    "with working holding a line break",
    lessonWithBlocks(question("math", { answers: ["1"], working: ["a\nb"] })),
  );
});

suite("questions: semi-open", () => {
  valid(
    "exhaustive with besides and threeBoard",
    lessonWithBlocks(
      question("semi-open", {
        answers: ["ROCKS", "REEFS", "SANDBARS"],
        besides: "ROCKS",
        threeBoard: true,
      }),
    ),
  );
  valid(
    "suggested without besides",
    lessonWithBlocks(
      question("semi-open", {
        answerKey: "suggested",
        answers: ["RAY", "SHAFT"],
      }),
    ),
  );
  invalid("without answers", lessonWithBlocks(question("semi-open")));
  invalid(
    "with no answer",
    lessonWithBlocks(question("semi-open", { answers: [] })),
  );
  invalid(
    "with a none key",
    lessonWithBlocks(question("semi-open", { answerKey: "none" })),
  );
  invalid(
    "suggested with besides",
    lessonWithBlocks(
      question("semi-open", {
        answerKey: "suggested",
        answers: ["RAY"],
        besides: "RAY",
      }),
    ),
  );
  invalid(
    "with working",
    lessonWithBlocks(
      question("semi-open", { answers: ["X"], working: ["Step."] }),
    ),
  );
});

suite("questions: tight-open", () => {
  valid("with no key and no answers", lessonWithBlocks(question("tight-open")));
  valid(
    "with an explicit none key",
    lessonWithBlocks(question("tight-open", { answerKey: "none" })),
  );
  valid(
    "suggested with answers",
    lessonWithBlocks(
      question("tight-open", {
        answerKey: "suggested",
        answers: ["WINDOW", "BOTTLE"],
      }),
    ),
  );
  invalid(
    "suggested without answers",
    lessonWithBlocks(question("tight-open", { answerKey: "suggested" })),
  );
  invalid(
    "suggested with no answer",
    lessonWithBlocks(
      question("tight-open", { answerKey: "suggested", answers: [] }),
    ),
  );
  invalid(
    "answers without a key",
    lessonWithBlocks(question("tight-open", { answers: ["WINDOW"] })),
  );
  invalid(
    "an exhaustive key",
    lessonWithBlocks(
      question("tight-open", { answerKey: "exhaustive", answers: ["WINDOW"] }),
    ),
  );
  invalid(
    "a none key with answers",
    lessonWithBlocks(
      question("tight-open", { answerKey: "none", answers: ["WINDOW"] }),
    ),
  );
  invalid(
    "with threeBoard",
    lessonWithBlocks(question("tight-open", { threeBoard: true })),
  );
});

for (const type of ["would-you-rather", "paraphrase", "broad-open"]) {
  suite(`questions: ${type}`, () => {
    valid("bare", lessonWithBlocks(question(type)));
    valid(
      "with an explicit none key",
      lessonWithBlocks(question(type, { answerKey: "none" })),
    );
    invalid(
      "with answers",
      lessonWithBlocks(question(type, { answers: ["X"] })),
    );
    invalid(
      "with a suggested key",
      lessonWithBlocks(
        question(type, { answerKey: "suggested", answers: ["X"] }),
      ),
    );
    invalid(
      "with an exhaustive key",
      lessonWithBlocks(
        question(type, { answerKey: "exhaustive", answers: ["X"] }),
      ),
    );
    invalid("with besides", lessonWithBlocks(question(type, { besides: "X" })));
    invalid(
      "with working",
      lessonWithBlocks(question(type, { working: ["Step."] })),
    );
  });
}
