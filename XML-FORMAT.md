# OSLF XML Serialization

**Version 0.1, draft.** For people who build software that reads or writes Spelling lessons. This document defines the XML form of OSLF lesson files. The data model and its JSON form are in [FILE-FORMAT.md](FILE-FORMAT.md); lesson designers can start with [SPEC.md](SPEC.md).

Copyright (c) 2026, playforge-coding. This document is licensed under [CC BY 4.0](LICENSES/CC-BY-4.0.txt). The schemas and examples it refers to are licensed under [BSD 3-Clause](LICENSES/BSD-3-Clause.txt).

## Contents

1. [Overview](#1-overview)
2. [Conventions](#2-conventions)
3. [Document rules](#3-document-rules)
4. [Elements](#4-elements)
5. [Rich text](#5-rich-text)
6. [Speech and SSML](#6-speech-and-ssml)
7. [Profiles](#7-profiles)
8. [Correspondence with the JSON form](#8-correspondence-with-the-json-form)
9. [Conformance](#9-conformance)
10. [Security](#10-security)

## 1. Overview

A lesson is one data model with two serializations. The JSON form ([FILE-FORMAT.md section 3](FILE-FORMAT.md#3-lesson-files)) and the XML form defined here carry the same lesson, and converting between them MUST lose nothing except collapsible whitespace ([section 3.3](#33-whitespace)). Every rule of the data model, such as which answer keys a question type allows or what a `known` question's answers must be, applies to the XML form unchanged. This document only defines how the model is written as XML.

An XML lesson file is a well-formed [XML 1.0](https://www.w3.org/TR/xml/) document, encoded in UTF-8, that validates against [schema/lesson.xsd](schema/lesson.xsd) and meets this document. The XSD checks structure only; passing it is necessary, not sufficient. The RECOMMENDED file name extension is `.oslf.xml`, served as `application/xml`.

[examples/lighthouses.oslf.xml](examples/lighthouses.oslf.xml) is the same lesson as the JSON example, in this form.

Profiles have an XML form too, defined in [section 7](#7-profiles).

## 2. Conventions

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, RECOMMENDED, MAY and OPTIONAL are to be read as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) when, and only when, they appear in all capitals. Producer, consumer and the lesson terms are as in [FILE-FORMAT.md](FILE-FORMAT.md#1-conventions).

## 3. Document rules

### 3.1 Namespace and root

Every element of a lesson file is in the namespace `urn:oslf:lesson`, and its root element is `<lesson>`; a profile's namespace and root are in [section 7](#7-profiles). The namespaces do not change between versions: an attribute on the root says which version of OSLF the file follows, `"0.1"` for this draft (`version` on `<lesson>`).

An OSLF file MUST NOT contain a document type declaration (DOCTYPE). See [section 10](#10-security).

### 3.2 Names

Names map mechanically between the forms: a JSON camelCase name becomes the same name in lowercase with hyphens (`ageRange` and `age-range`, `answerKey` and `answer-key`, `threeBoard` and `three-board`, `licenseUrl` and `license-url`). Short machine values are attributes; human text is element content. Booleans are written `true` or `false`.

The exceptions are few and listed in [section 8](#8-correspondence-with-the-json-form). In a lesson: the JSON `oslf` field is the `version` attribute, a block's JSON `type` is the element's name, a referenced profile id is the `ref` attribute of `<profile>`, and `working` items are `<step>` elements. In a profile: a rule's JSON `rule` field is the `kind` attribute, and a slot's `count` is flattened to `min` and `max` attributes.

### 3.3 Whitespace

XML whitespace means space, tab, carriage return and line feed. U+00A0, the no-break space, is not whitespace and always survives.

- In an element that holds text or rich text (`title`, `p`, `prompt`, `heading`, `caption`, `alt`, `step`, `spoken`, `word`, `answer`, `text`, `link`, `note`, `phoneme`, `sub`, `say-as`, `source`, `credit`, the fields of a bibliography `<source>`, and a profile's `name`, `description` and `publisher`), each run of whitespace reads as one space, and whitespace at the very start and end of the element's content is dropped. A paragraph can therefore wrap across lines in the file and still read as one line of text.
- In an element that holds only other elements (`lesson`, `section`, `passage`, `spelling`, `image`, `question`, `vakt`, `m`, `profile`, `rule`), whitespace between children is ignored.

Because runs of whitespace collapse, two texts that differ only in the width of their whitespace are the same text. Converting a lesson between JSON and XML preserves everything else exactly.

### 3.4 Extensions

An extension is an element or attribute from any namespace other than the document's own OSLF namespace. Extensions MAY appear on `<lesson>`, on `<section>`, on any block element, and in a profile on `<profile>` and `<rule>`: extension attributes anywhere on the element, extension elements after the defined children. Consumers MUST ignore extensions they do not understand, and editors SHOULD keep them unchanged when saving. In the JSON form an extension is keyed by a URI; in XML the extension's namespace plays that role. How an extension's own content maps between the two forms is the extension's business to define.

## 4. Elements

### 4.1 The lesson

```xml
<?xml version="1.0" encoding="UTF-8"?>
<lesson xmlns="urn:oslf:lesson" version="0.1" language="en"
        license="BSD-3-Clause" age-range="14-16 years">
  <title>Lighthouses</title>
  <author url="https://example.org/">A Person</author>
  <profile ref="urn:oslf:example:six-section"/>
  <source id="lighthouse">
    <title>Lighthouse</title>
    <publisher>Wikipedia</publisher>
    <url>https://en.wikipedia.org/wiki/Lighthouse</url>
  </source>
  <section id="first-lighthouses">
    <title>The First Lighthouses</title>
    <!-- blocks -->
  </section>
</lesson>
```

`<lesson>` carries the lesson's scalar fields as attributes: `version` (REQUIRED), `id`, `language`, `license`, `created`, `modified` and `age-range`. Its children come in this order: one `<title>` (REQUIRED), then any `<author>` elements, `<profile>` elements and `<source>` elements, then the `<section>` elements (at least one).

- `<author>`: the person's name as content, with an OPTIONAL `url` attribute.
- `<profile>`: a REQUIRED `ref` attribute holding a profile id.
- `<source>`: a REQUIRED `id` attribute, and OPTIONAL `<title>`, `<author>`, `<publisher>`, `<year>` and `<url>` children, in that order.

### 4.2 Sections

`<section>` has an OPTIONAL `id` attribute, an OPTIONAL `<title>` first child, and then the blocks in reading order.

### 4.3 Blocks

The element's name is the block's kind.

**`<passage id?>`**: one or more `<p>` children, each one paragraph of rich text.

**`<spelling id?>`**: one or more `<word>` children.

**`<image>`**: attributes `src` (REQUIRED), `size`, `align`, `width`, `height` and `id`; then OPTIONAL `<alt>`, `<caption>` (rich text) and `<credit>` children, in that order. `<credit>` holds the printed credit line as its content when there is one, and the structured fields as `author`, `license`, `license-url` and `source-url` attributes.

**`<question>`**: attributes `type` (REQUIRED, a question type id), `answer-key`, `three-board`, `besides` and `id`; then one `<prompt>` (rich text), any `<answer>` elements, and any `<step>` elements (rich text, the math working, in order).

```xml
<question type="semi-open" besides="ROCKS">
  <prompt>A fire at the top warned ships away from dangerous ______.
    Name one thing the ships had to avoid.</prompt>
  <answer>ROCKS</answer>
  <answer>REEFS</answer>
  <answer>SANDBARS</answer>
</question>
```

**`<vakt id?>`**: one `<text>` child holding the activity (without the "VAKT:" label), then any `<link>` children (a REQUIRED `url` attribute, the label as content), then an OPTIONAL `<image>`.

**`<heading id?>`**: rich text.

## 5. Rich text

Inside `<p>`, `<prompt>`, `<heading>`, `<caption>` and `<step>`, text mixes with these elements:

- **Formatting**: `<b>`, `<i>` and `<u>`.
- **A pronunciation**: `<phoneme alphabet="ipa" ph="freɪˈnɛl">FRESNEL</phoneme>`. This is a text run with `ipa`: it displays as its content and is said as `ph` gives it. `alphabet` is REQUIRED and always `ipa`.
- **A substitution**: `<sub alias="World Wide Fund for Nature">WWF</sub>`. A text run with `alias`: it displays as its content and is said as `alias` gives it. `alias` is REQUIRED.
- **A spell-out**: `<say-as interpret-as="characters">REEF</say-as>`. A text run with `sayAs`: it displays as its content, said one character at a time. `interpret-as` is REQUIRED and always `characters`.
- **A note**: `<note source="lighthouse" locator="p. 12">free text</note>`. Both attributes and the content are OPTIONAL, but a note needs `source` or content.
- **A formula**: `<m>` ([section 5.1](#51-formulas)).
- **A pause**: `<break strength="medium"/>` or `<break strength="strong"/>` ([section 6](#6-speech-and-ssml)).

A text run's marks wrap its text with `<b>` outermost, then `<i>`, then `<u>`, and one of `<phoneme>`, `<sub>` or `<say-as>` innermost, holding only text (a run carries at most one of the three). A producer MUST write that order; a consumer MUST accept any nesting of these elements and read off the set of marks it finds.

### 5.1 Formulas

```xml
<m format="asciimath"><source>120 xx 3 = 360</source></m>

<m format="tex" display="true">
  <source>\frac{60}{5} = 12</source>
  <spoken>60 divided by 5<break strength="medium"/>is 12</spoken>
</m>
```

`<m>` carries `format` (REQUIRED, `asciimath` or `tex`) and `display` (OPTIONAL boolean, default `false`). Its REQUIRED `<source>` child holds the formula's source without delimiters, and its OPTIONAL `<spoken>` child holds the spoken text: plain words mixed with `<phoneme>`, `<sub>`, `<say-as>` and `<break>` elements ([section 6](#6-speech-and-ssml)). Note that whitespace around a `<break>` inside `<spoken>` is content ([section 3.3](#33-whitespace)): write `5<break strength="medium"/>is` rather than spacing it out, unless the spaces are meant.

## 6. Speech and SSML

`<phoneme>`, `<sub>`, `<say-as>` and `<break>` have the form of [SSML](https://www.w3.org/TR/speech-synthesis11/)'s elements of the same names, but they live in the OSLF namespace so that a lesson file needs only one. To hand spoken text to an SSML engine, wrap it in `<speak>`, move the elements to the SSML namespace, and escape every text node so author text cannot act as markup ([FILE-FORMAT.md section 7](FILE-FORMAT.md#7-security-and-privacy)).

`strength` takes exactly two values, and they correspond to the JSON pauses: `medium` is the JSON `short`, `strong` is the JSON `long`. No other SSML strength or `interpret-as` is valid OSLF, and no other part of SSML is.

## 7. Profiles

A profile ([FILE-FORMAT.md section 4](FILE-FORMAT.md#4-profiles)) can also be written as XML. Its namespace is `urn:oslf:profile`, its root is `<profile>`, and a conforming file validates against [schema/profile.xsd](schema/profile.xsd), which checks structure only, with the profile rules of FILE-FORMAT.md applying on top. The RECOMMENDED extension is `.profile.xml`. The document rules of [section 3](#3-document-rules) apply here as everywhere.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<profile xmlns="urn:oslf:profile" oslf-profile="0.1"
         id="urn:oslf:example:six-section" version="0.1">
  <name>Example: six sections of fifteen questions</name>
  <rule kind="spelling-words" unique-in-lesson="true">
    <count min="4" max="4"/>
    <letters min="6" max="9"/>
  </rule>
  <rule kind="section-shape" id="section-order">
    <slot block="passage" min="1" max="2"/>
    <slot block="question" question-type="known" min="3" max="3"/>
  </rule>
  <rule kind="answer-in-passage" severity="error" question-types="known"/>
</profile>
```

`<profile>` carries `oslf-profile` (REQUIRED, the OSLF version this file follows), `id` (REQUIRED), `version` (the profile's own version) and `license` as attributes. Its children in order: one `<name>` (REQUIRED), then OPTIONAL `<description>` and `<publisher url?>` (the publisher's name as content), then the `<rule>` elements.

A `<rule>` carries its kind in the `kind` attribute (the JSON `rule` field), with `id` and `severity` beside it. Its kind's fields follow the usual split:

- lists and switches are attributes: `question-types` holds one or more question type ids separated by spaces, and `allow-other` and `unique-in-lesson` are booleans;
- a range is an empty child element named after the field, with OPTIONAL `min` and `max`: `<count min="6" max="6"/>`, `<letters min="6"/>`;
- a rule's own `description` is an OPTIONAL first child element;
- `section-shape` holds its `<slot>` children in order.

A `<slot>` is one line: `block` (REQUIRED), `question-type` (one or more type ids, space separated), and the slot's count flattened onto the slot as `min` and `max`, since a slot has exactly one range.

The XSD leaves `kind` an open string, exactly as the JSON schema leaves `rule` one, so a profile using a rule kind this version does not define still validates. The FILE-FORMAT rule stands: a validator that meets a kind it does not know reports a warning saying the rule was not checked.

Reading back into JSON: `question-types` on a rule always becomes an array, and `question-type` on a slot becomes a string when it holds one id and an array when it holds several.

## 8. Correspondence with the JSON form

### 8.1 Lessons

| JSON                                                           | XML                                                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `oslf`                                                         | the `version` attribute of `<lesson>`                                                           |
| `title`                                                        | `<title>`                                                                                       |
| `id`, `language`, `license`, `created`, `modified`, `ageRange` | attributes of `<lesson>` (`age-range`)                                                          |
| `authors[]`, `{ name, url }`                                   | `<author url?>` with the name as content                                                        |
| `profiles[]`                                                   | `<profile ref="…"/>` elements                                                                   |
| `sources[]`                                                    | `<source id>` with `<title>`, `<author>`, `<publisher>`, `<year>`, `<url>`                      |
| a section's `title`, `blocks`                                  | `<section>`: a `<title>` child, then the blocks                                                 |
| a block's `type`                                               | the element's name                                                                              |
| a passage's `paragraphs[]`                                     | `<p>` elements                                                                                  |
| a spelling block's `words[]`                                   | `<word>` elements                                                                               |
| image fields                                                   | `src`, `size`, `align`, `width`, `height` attributes; `<alt>`, `<caption>`, `<credit>` children |
| credit `text`; `author`, `license`, `licenseUrl`, `sourceUrl`  | `<credit>` content; its attributes                                                              |
| `questionType`                                                 | the `type` attribute of `<question>`                                                            |
| `answerKey`, `threeBoard`, `besides`                           | `answer-key`, `three-board`, `besides` attributes                                               |
| `answers[]`                                                    | `<answer>` elements                                                                             |
| `working[]`                                                    | `<step>` elements                                                                               |
| a VAKT block's `text`, `links[]`, `image`                      | `<text>`; `<link url>` with the label as content; `<image>`                                     |
| a text run's `bold`, `italic`, `underline`                     | `<b>`, `<i>`, `<u>` around the text                                                             |
| a text run's `ipa`                                             | `<phoneme alphabet="ipa" ph="…">`, innermost                                                    |
| a text run's `alias`                                           | `<sub alias="…">`, innermost                                                                    |
| a text run's `sayAs`                                           | `<say-as interpret-as="characters">`, innermost                                                 |
| a note's `source`, `locator`, `text`                           | `<note source? locator?>` with the text as content                                              |
| a math run                                                     | `<m format display?>` with `<source>` and `<spoken>`                                            |
| a pause, `short` / `long`                                      | `<break strength="medium"/>` / `<break strength="strong"/>`                                     |
| spoken text                                                    | the content of `<spoken>`                                                                       |
| `extensions`                                                   | elements and attributes from other namespaces                                                   |

### 8.2 Profiles

| JSON                             | XML                                                   |
| -------------------------------- | ----------------------------------------------------- |
| `oslfProfile`                    | the `oslf-profile` attribute of `<profile>`           |
| `id`, `version`, `license`       | attributes of `<profile>`                             |
| `name`                           | `<name>`                                              |
| `description`                    | `<description>`                                       |
| `publisher`, `{ name, url }`     | `<publisher url?>` with the name as content           |
| `rules[]`                        | `<rule>` elements                                     |
| a rule's `rule`                  | the `kind` attribute                                  |
| a rule's `id`, `severity`        | attributes                                            |
| a rule's `description`           | a `<description>` child                               |
| `count`, `letters` ranges        | `<count min? max?/>`, `<letters min? max?/>` children |
| `questionTypes[]`                | the `question-types` attribute, space separated       |
| `allowOther`, `uniqueInLesson`   | `allow-other`, `unique-in-lesson` attributes          |
| `slots[]`                        | `<slot>` elements                                     |
| a slot's `block`, `questionType` | `block`, `question-type` attributes                   |
| a slot's `count`                 | `min` and `max` attributes on the `<slot>`            |
| `extensions`                     | elements and attributes from other namespaces         |

## 9. Conformance

- A **conforming XML lesson file** is well-formed, has no DOCTYPE, validates against [schema/lesson.xsd](schema/lesson.xsd), and meets this document and the data model rules of [FILE-FORMAT.md section 3](FILE-FORMAT.md#3-lesson-files). A **conforming XML profile** does the same against [schema/profile.xsd](schema/profile.xsd) and [FILE-FORMAT.md section 4](FILE-FORMAT.md#4-profiles).
- A consumer MAY support either serialization or both, and SHOULD say which it supports. The rendering, conformance and security rules of FILE-FORMAT.md apply whichever form a lesson or profile arrives in.
- A converter between the forms MUST preserve the data model. Only whitespace collapsing ([section 3.3](#33-whitespace)) may change a text.

## 10. Security

- A consumer MUST reject an OSLF file that contains a DOCTYPE, or parse it with doctype processing off. It MUST NOT resolve external entities, external DTDs or XInclude: these turn opening a lesson or a profile into reading local files or making network requests.
- Everything in [FILE-FORMAT.md section 7](FILE-FORMAT.md#7-security-and-privacy) applies: rich text is data and is never rendered as HTML, author text is escaped before it enters any speech markup, URL schemes are checked before a link is clickable.
