import { test, suite } from "node:test";
import {
  assertInvalidXml,
  assertValidXml,
  lessonXml,
  sectionXml,
} from "./helpers.mjs";

const XSD = "schema/lesson.xsd";

function valid(name, xml) {
  test(name, () => assertValidXml(xml, XSD));
}

function invalid(name, xml) {
  test(name, () => assertInvalidXml(xml, XSD));
}

suite("lesson document (XML)", () => {
  valid("a minimal lesson", lessonXml());
  valid(
    "all metadata attributes and head elements in order",
    lessonXml({
      attributes:
        'version="0.1" id="urn:example:l" language="en" license="CC-BY-4.0" created="2026-01-01" modified="2026-02-03T04:05:06Z" age-range="14-16 years"',
      head: `
        <author url="https://example.org/">A Person</author>
        <author>B Person</author>
        <profile ref="urn:oslf:example:six-section"/>
        <source id="lighthouse">
          <title>Lighthouse</title>
          <author>Many</author>
          <publisher>Wikipedia</publisher>
          <year>2026</year>
          <url>https://en.wikipedia.org/wiki/Lighthouse</url>
        </source>`,
    }),
  );
  valid(
    "an extension attribute and a trailing extension element",
    `<?xml version="1.0" encoding="UTF-8"?>
<lesson xmlns="urn:oslf:lesson" xmlns:x="https://example.org/oslf/x" version="0.1" x:level="3">
  <title>T</title>
  <section/>
  <x:level>3</x:level>
</lesson>`,
  );

  invalid("missing version", lessonXml({ attributes: "" }));
  invalid("wrong version", lessonXml({ attributes: 'version="0.2"' }));
  invalid(
    "missing title",
    `<?xml version="1.0"?><lesson xmlns="urn:oslf:lesson" version="0.1"><section/></lesson>`,
  );
  invalid(
    "empty title",
    `<?xml version="1.0"?><lesson xmlns="urn:oslf:lesson" version="0.1"><title/><section/></lesson>`,
  );
  invalid(
    "no section",
    `<?xml version="1.0"?><lesson xmlns="urn:oslf:lesson" version="0.1"><title>T</title></lesson>`,
  );
  invalid(
    "section before title",
    `<?xml version="1.0"?><lesson xmlns="urn:oslf:lesson" version="0.1"><section/><title>T</title></lesson>`,
  );
  invalid(
    "source after the sections",
    lessonXml({ body: '<section/><source id="a"/>' }),
  );
  invalid(
    "no namespace",
    `<?xml version="1.0"?><lesson version="0.1"><title>T</title><section/></lesson>`,
  );
  invalid(
    "wrong namespace",
    `<?xml version="1.0"?><lesson xmlns="urn:oslf:profile" version="0.1"><title>T</title><section/></lesson>`,
  );
  invalid("profile without ref", lessonXml({ head: "<profile/>" }));
  invalid("bibliography source without id", lessonXml({ head: "<source/>" }));
  invalid(
    "bibliography source with a bad id",
    lessonXml({ head: '<source id="a b"/>' }),
  );
  invalid(
    "bibliography source children out of order",
    lessonXml({
      head: '<source id="a"><url>https://example.org/</url><title>T</title></source>',
    }),
  );
});

suite("sections and blocks (XML)", () => {
  valid(
    "a section with id and title",
    lessonXml({ body: '<section id="s1"><title>One</title></section>' }),
  );
  valid(
    "one of every block kind",
    sectionXml(`
      <passage id="p1"><p>One paragraph.</p><p>Another.</p></passage>
      <spelling id="w1"><word>BEACON</word><word>HARBOR</word></spelling>
      <image src="media/pharos.png" size="large" align="center" width="800" height="600" id="img-1">
        <alt>A stone tower.</alt>
        <caption>An artist's idea of <i>Pharos</i>.</caption>
        <credit author="Example Author" license="CC0-1.0" license-url="https://example.org/l" source-url="https://example.org/s">Photo: Example Author</credit>
      </image>
      <question type="known" id="q1"><prompt>The island of ______.</prompt><answer>PHAROS</answer></question>
      <vakt id="v1">
        <text>Stand up and turn.</text>
        <link url="https://example.org/video">The video</link>
        <image src="media/turn.png"/>
      </vakt>
      <heading id="h1">WOULD YOU RATHER</heading>`),
  );
  valid(
    "an extension element after a section's blocks",
    lessonXml({
      body: '<section xmlns:x="https://example.org/x" x:kind="intro"><passage><p>Text.</p></passage><x:notes>Extra</x:notes></section>',
    }),
  );
  invalid("an unknown block element", sectionXml("<video src='x.mp4'/>"));
  invalid(
    "a section title after the blocks",
    lessonXml({
      body: "<section><passage><p>T.</p></passage><title>One</title></section>",
    }),
  );
  invalid("a passage with no paragraph", sectionXml("<passage/>"));
  invalid("a spelling block with no word", sectionXml("<spelling/>"));
  invalid("an empty word", sectionXml("<spelling><word/></spelling>"));
  invalid("an image without src", sectionXml("<image><alt>x</alt></image>"));
  invalid(
    "an unknown image size",
    sectionXml('<image src="a.png" size="huge"/>'),
  );
  invalid(
    "an unknown image align",
    sectionXml('<image src="a.png" align="top"/>'),
  );
  invalid("a zero image width", sectionXml('<image src="a.png" width="0"/>'));
  invalid(
    "a non-numeric image height",
    sectionXml('<image src="a.png" height="tall"/>'),
  );
  invalid(
    "image children out of order",
    sectionXml('<image src="a.png"><caption>C</caption><alt>A</alt></image>'),
  );
  invalid(
    "a vakt without text",
    sectionXml("<vakt><link url='https://example.org/'/></vakt>"),
  );
  invalid(
    "a vakt link without url",
    sectionXml("<vakt><text>T</text><link>Label</link></vakt>"),
  );
  invalid(
    "a vakt image before the links",
    sectionXml(
      '<vakt><text>T</text><image src="a.png"/><link url="https://example.org/"/></vakt>',
    ),
  );
});

suite("questions (XML)", () => {
  function questionXml(attributes, children = "<prompt>P?</prompt>") {
    return sectionXml(`<question ${attributes}>${children}</question>`);
  }

  valid(
    "every question type id",
    sectionXml(
      [
        "known",
        "prior-knowledge",
        "math",
        "semi-open",
        "tight-open",
        "would-you-rather",
        "paraphrase",
        "broad-open",
      ]
        .map((t) => `<question type="${t}"><prompt>P?</prompt></question>`)
        .join(""),
    ),
  );
  valid(
    "answers and steps",
    questionXml(
      'type="math" answer-key="exhaustive"',
      "<prompt>How many?</prompt><answer>360</answer><step>Multiply.</step><step>Check.</step>",
    ),
  );
  valid(
    "semi-open attributes",
    questionXml(
      'type="semi-open" three-board="true" besides="ROCKS"',
      "<prompt>P?</prompt><answer>ROCKS</answer>",
    ),
  );
  invalid("no type", questionXml(""));
  invalid("an unknown type", questionXml('type="single"'));
  invalid("no prompt", questionXml('type="known"', "<answer>X</answer>"));
  invalid(
    "an answer before the prompt",
    questionXml('type="known"', "<answer>X</answer><prompt>P?</prompt>"),
  );
  invalid(
    "a step before the answers",
    questionXml(
      'type="math"',
      "<prompt>P?</prompt><step>S</step><answer>1</answer>",
    ),
  );
  invalid(
    "an empty answer",
    questionXml('type="known"', "<prompt>P?</prompt><answer/>"),
  );
  invalid(
    "an unknown answer-key",
    questionXml('type="known" answer-key="partial"'),
  );
  invalid(
    "a non-boolean three-board",
    questionXml('type="semi-open" three-board="yes"'),
  );
  invalid("an empty besides", questionXml('type="semi-open" besides=""'));
});

suite("rich text (XML)", () => {
  function p(content) {
    return sectionXml(`<passage><p>${content}</p></passage>`);
  }

  valid(
    "formatting marks",
    p("Plain <b>bold</b> <i>italic</i> <u>underline</u>."),
  );
  valid(
    "nested marks around a phoneme",
    p(
      '<b><i><u><phoneme alphabet="ipa" ph="freɪˈnɛl">FRESNEL</phoneme></u></i></b>',
    ),
  );
  valid(
    "a note with source and locator",
    p('Text.<note source="lighthouse" locator="p. 12">See also.</note>'),
  );
  valid("a bare note with only content", p("Text.<note>A remark.</note>"));
  valid(
    "a pause",
    p('Wait<break strength="medium"/> go<break strength="strong"/>.'),
  );
  valid(
    "a formula with spoken text",
    p(
      '<m format="tex" display="true"><source>\\frac{60}{5} = 12</source><spoken>60 divided by 5<break strength="medium"/>is <phoneme alphabet="ipa" ph="twɛlv">12</phoneme></spoken></m>',
    ),
  );
  valid(
    "rich text in prompts, captions, steps and headings",
    sectionXml(`
    <image src="a.png"><caption>The <i>Pharos</i> tower</caption></image>
    <question type="math"><prompt>Add <m format="asciimath"><source>1 + 1</source></m></prompt><answer>2</answer><step>Count: <b>two</b>.</step></question>
    <heading>Part <u>two</u></heading>`),
  );

  invalid("a phoneme without ph", p('<phoneme alphabet="ipa">X</phoneme>'));
  invalid("a phoneme without alphabet", p('<phoneme ph="ks">X</phoneme>'));
  invalid(
    "a phoneme with another alphabet",
    p('<phoneme alphabet="x-sampa" ph="ks">X</phoneme>'),
  );
  invalid("an empty ph", p('<phoneme alphabet="ipa" ph="">X</phoneme>'));
  invalid("a break without strength", p("<break/>"));
  invalid("an unknown break strength", p('<break strength="weak"/>'));
  invalid("the JSON pause names as strengths", p('<break strength="short"/>'));
  invalid("a note with a bad source id", p('<note source="a b"/>'));
  invalid("a formula without format", p("<m><source>1</source></m>"));
  invalid(
    "an unknown formula format",
    p('<m format="mathml"><source>1</source></m>'),
  );
  invalid("a formula without source", p('<m format="tex"></m>'));
  invalid("an empty formula source", p('<m format="tex"><source/></m>'));
  invalid(
    "spoken before source",
    p('<m format="tex"><spoken>one</spoken><source>1</source></m>'),
  );
  invalid(
    "a non-boolean display",
    p('<m format="tex" display="block"><source>1</source></m>'),
  );
  invalid(
    "a nested formula",
    p(
      '<m format="tex"><source>1</source><spoken><m format="tex"><source>1</source></m></spoken></m>',
    ),
  );
  invalid(
    "a note inside spoken text",
    p('<m format="tex"><source>1</source><spoken><note>x</note></spoken></m>'),
  );
  invalid("an unknown inline element", p("<em>x</em>"));
});
