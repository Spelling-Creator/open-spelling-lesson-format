import { test, suite } from "node:test";
import { assertInvalidXml, assertValidXml, profileXml } from "./helpers.mjs";

const XSD = "schema/profile.xsd";

function valid(name, xml) {
  test(name, () => assertValidXml(xml, XSD));
}

function invalid(name, xml) {
  test(name, () => assertInvalidXml(xml, XSD));
}

suite("profile document (XML)", () => {
  valid("a minimal profile", profileXml());
  valid(
    "all metadata",
    `<?xml version="1.0" encoding="UTF-8"?>
<profile xmlns="urn:oslf:profile" oslf-profile="0.1" id="urn:example:p" version="1.2" license="BSD-3-Clause">
  <name>Example profile</name>
  <description>A profile for testing.</description>
  <publisher url="https://example.org/">A Publisher</publisher>
</profile>`,
  );
  valid(
    "an extension attribute and a trailing extension element",
    `<?xml version="1.0" encoding="UTF-8"?>
<profile xmlns="urn:oslf:profile" xmlns:x="https://example.org/x" oslf-profile="0.1" id="urn:example:p" x:channel="draft">
  <name>N</name>
  <x:notes>Extra</x:notes>
</profile>`,
  );

  invalid(
    "missing oslf-profile",
    profileXml({ attributes: 'id="urn:example:p"' }),
  );
  invalid(
    "wrong oslf-profile version",
    profileXml({ attributes: 'oslf-profile="1.0" id="urn:example:p"' }),
  );
  invalid("missing id", profileXml({ attributes: 'oslf-profile="0.1"' }));
  invalid("empty id", profileXml({ attributes: 'oslf-profile="0.1" id=""' }));
  invalid(
    "missing name",
    `<?xml version="1.0"?><profile xmlns="urn:oslf:profile" oslf-profile="0.1" id="urn:example:p"/>`,
  );
  invalid(
    "empty name",
    `<?xml version="1.0"?><profile xmlns="urn:oslf:profile" oslf-profile="0.1" id="urn:example:p"><name/></profile>`,
  );
  invalid(
    "description before name",
    `<?xml version="1.0"?><profile xmlns="urn:oslf:profile" oslf-profile="0.1" id="urn:example:p"><description>D</description><name>N</name></profile>`,
  );
  invalid(
    "wrong namespace",
    `<?xml version="1.0"?><profile xmlns="urn:oslf:lesson" oslf-profile="0.1" id="urn:example:p"><name>N</name></profile>`,
  );
});

suite("rules (XML)", () => {
  valid(
    "one rule of every defined kind",
    profileXml({
      body: `
        <rule kind="section-count" id="six-sections"><count min="6" max="6"/></rule>
        <rule kind="section-shape" id="order" allow-other="true">
          <slot block="image" min="0" max="1"/>
          <slot block="passage" min="1" max="2"/>
          <slot block="spelling"/>
          <slot block="question" question-type="known" min="3" max="3"/>
          <slot block="question" question-type="tight-open broad-open"/>
          <slot block="vakt" min="0"/>
        </rule>
        <rule kind="spelling-words" unique-in-lesson="true"><count min="4" max="4"/><letters min="6" max="9"/></rule>
        <rule kind="answer-in-passage" severity="error" question-types="known"/>
        <rule kind="answer-not-in-passage" severity="error" question-types="prior-knowledge"/>
        <rule kind="prompt-gives-answer" severity="warning" question-types="semi-open"/>
        <rule kind="answer-reuse" question-types="known math semi-open"/>`,
    }),
  );
  valid(
    "a rule kind this version does not define",
    profileXml({ body: '<rule kind="custom-wording"/>' }),
  );
  valid(
    "a rule description child",
    profileXml({
      body: '<rule kind="section-count"><description>Six sections.</description><count min="6"/></rule>',
    }),
  );
  valid(
    "an extension element inside a rule",
    profileXml({
      body: '<rule kind="custom-wording" xmlns:x="https://example.org/x" x:lang="en"><x:pattern>^Would you rather</x:pattern></rule>',
    }),
  );

  invalid("a rule without a kind", profileXml({ body: "<rule/>" }));
  invalid("an empty rule kind", profileXml({ body: '<rule kind=""/>' }));
  invalid(
    "an unknown severity",
    profileXml({
      body: '<rule kind="section-count" severity="info"><count/></rule>',
    }),
  );
  invalid(
    "an empty question-types list",
    profileXml({ body: '<rule kind="answer-reuse" question-types=""/>' }),
  );
  invalid(
    "an unknown question type in question-types",
    profileXml({
      body: '<rule kind="answer-reuse" question-types="known single"/>',
    }),
  );
  invalid(
    "a non-boolean unique-in-lesson",
    profileXml({
      body: '<rule kind="spelling-words" unique-in-lesson="yes"/>',
    }),
  );
  invalid(
    "a negative range bound",
    profileXml({ body: '<rule kind="section-count"><count min="-1"/></rule>' }),
  );
  invalid(
    "a non-numeric range bound",
    profileXml({
      body: '<rule kind="section-count"><count max="six"/></rule>',
    }),
  );
  invalid(
    "a description after the ranges",
    profileXml({
      body: '<rule kind="section-count"><count min="6"/><description>D</description></rule>',
    }),
  );
});

suite("slots (XML)", () => {
  function slot(attributes) {
    return profileXml({
      body: `<rule kind="section-shape"><slot ${attributes}/></rule>`,
    });
  }

  valid("a bare block slot", slot('block="passage"'));
  valid(
    "a question slot with several types",
    slot('block="question" question-type="known math"'),
  );
  invalid("a slot without a block", slot('min="1"'));
  invalid("a heading slot", slot('block="heading"'));
  invalid("an unknown block kind", slot('block="video"'));
  invalid(
    "an empty question-type list",
    slot('block="question" question-type=""'),
  );
  invalid(
    "an unknown question type",
    slot('block="question" question-type="single"'),
  );
  invalid("a negative min", slot('block="passage" min="-1"'));
  invalid(
    "a slot before the ranges",
    profileXml({
      body: '<rule kind="section-shape"><slot block="passage"/><count min="1"/></rule>',
    }),
  );
});
