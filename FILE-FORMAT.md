# OSLF File Format

**Version 0.1, draft.** For people who build editors, publishing tools, validators and other software that reads or writes Spelling lessons. Lesson designers can start with [SPEC.md](SPEC.md), which defines the question types and parts of a lesson that this document encodes.

Copyright (c) 2026, playforge-coding. This document is licensed under [CC BY 4.0](LICENSES/CC-BY-4.0.txt). The schemas and examples it refers to are licensed under [BSD 3-Clause](LICENSES/BSD-3-Clause.txt).

## Contents

1. [Conventions](#1-conventions)
2. [Question type ids](#2-question-type-ids)
3. [Lesson files](#3-lesson-files)
4. [Profiles](#4-profiles)
5. [Rendering](#5-rendering)
6. [Conformance](#6-conformance)
7. [Security and privacy](#7-security-and-privacy)
8. [Open issues](#8-open-issues)
9. [Appendix A: Converting Spelling Creator files](#appendix-a-converting-spelling-creator-files)

## 1. Conventions

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, RECOMMENDED, MAY and OPTIONAL are to be read as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) when, and only when, they appear in all capitals.

A **producer** is software that writes OSLF files. A **consumer** is software that reads them, including renderers, editors and validators. Other terms (speller, partner, passage, answer key) are as in [SPEC.md](SPEC.md#words-used-here).

## 2. Question type ids

Each question type in [SPEC.md](SPEC.md#2-question-types) has a stable id, and each answer key kind ([SPEC.md, answer keys](SPEC.md#answer-keys)) has a stable value.

| Id                 | Type             | Default key  | Other key allowed         |
| ------------------ | ---------------- | ------------ | ------------------------- |
| `known`            | Known            | `exhaustive` |                           |
| `prior-knowledge`  | Prior knowledge  | `exhaustive` |                           |
| `math`             | Math             | `exhaustive` |                           |
| `semi-open`        | Semi-open        | `exhaustive` | `suggested` (provisional) |
| `tight-open`       | Tight open       | `none`       | `suggested`               |
| `would-you-rather` | Would you rather | `none`       |                           |
| `paraphrase`       | Paraphrase       | `none`       |                           |
| `broad-open`       | Broad open       | `none`       |                           |

The table is in the order a section asks the types ([SPEC.md](SPEC.md#the-order-of-the-types)). Renderers SHOULD list types in a printed legend in this order.

The key values mean:

| Value        | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| `exhaustive` | The key lists every accepted answer.                         |
| `suggested`  | The key lists example answers; other answers can be correct. |
| `none`       | There is no key.                                             |

## 3. Lesson files

### 3.1 Overview

A lesson file is a UTF-8 encoded JSON document ([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)) that validates against [schema/lesson.schema.json](schema/lesson.schema.json) and meets the rules in this section. The RECOMMENDED file name extension is `.oslf.json`. [examples/lighthouses.oslf.json](examples/lighthouses.oslf.json) is a complete example.

The same lesson can instead be written as XML: [XML-FORMAT.md](XML-FORMAT.md) defines that form, and the two serializations convert losslessly. Everything in this section describes the data model through its JSON form, and it binds the XML form too.

Fields marked REQUIRED below MUST be present. A producer MUST NOT write fields this document does not define, except inside `extensions` ([section 3.11](#311-extensions)).

### 3.2 Lesson

| Field                 | Type             | Notes                                                                                                             |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `oslf`                | string           | REQUIRED. The OSLF version the file follows. For this draft, `"0.1"`.                                             |
| `title`               | string           | REQUIRED.                                                                                                         |
| `id`                  | string           | OPTIONAL. A stable identifier for the lesson. A URI is RECOMMENDED.                                               |
| `language`            | string           | RECOMMENDED. A [BCP 47](https://www.rfc-editor.org/info/bcp47) tag such as `en` or `es-MX`.                       |
| `authors`             | array of Person  | OPTIONAL.                                                                                                         |
| `license`             | string           | OPTIONAL. An [SPDX](https://spdx.org/licenses/) identifier such as `CC-BY-4.0`, or a URL.                         |
| `created`, `modified` | string           | OPTIONAL. Dates or date-times in [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) form.                         |
| `ageRange`            | string           | OPTIONAL. Free text, such as `"14-16 years"`. It describes who the content suits, not how hard the questions are. |
| `profiles`            | array of string  | OPTIONAL. Ids of the profiles the author wrote the lesson against ([section 4](#4-profiles)).                     |
| `sources`             | array of Source  | OPTIONAL. ([section 3.9](#39-sources))                                                                            |
| `sections`            | array of Section | REQUIRED. At least one.                                                                                           |
| `extensions`          | object           | OPTIONAL. ([section 3.11](#311-extensions))                                                                       |

A Person is an object with a REQUIRED `name` and an OPTIONAL `url`.

### 3.3 Sections and blocks

| Field    | Type           | Notes                       |
| -------- | -------------- | --------------------------- |
| `id`     | string         | OPTIONAL.                   |
| `title`  | string         | OPTIONAL.                   |
| `blocks` | array of Block | REQUIRED. In reading order. |

Every block is an object with a REQUIRED `type` (`passage`, `spelling`, `image`, `question`, `vakt` or `heading`) and an OPTIONAL `id`. Where `id` is present on a section or block, it MUST be unique within the lesson. Consumers that need ids MAY assign them to blocks that have none.

### 3.4 Rich text

Passages, prompts, math working, captions and headings hold **rich text**: either a plain string, or an array of runs. A run is one of:

- a string: plain text.
- a text run: `{ "text": "...", "italic": true }`, where `bold`, `italic` and `underline` are OPTIONAL booleans. An OPTIONAL `ipa`, `alias` or `sayAs` (at most one of the three) fixes how read-aloud says the run's text, with the same meaning as a pronunciation, substitution or spell-out in spoken text ([Spoken text](#spoken-text)); the run displays as its `text` either way.
- a note: `{ "note": { "source": "...", "locator": "...", "text": "..." } }`. A footnote at this point in the text. `source` is the id of one of the lesson's sources, `locator` is a page or section within it such as `"p. 12"`, and `text` is a free-text note. At least one of `source` and `text` MUST be present. Notes are numbered in reading order across the whole lesson.
- a math run: `{ "math": { ... } }`. A formula ([section 3.5](#35-math)).
- a pause run: `{ "pause": "short" }` or `{ "pause": "long" }`. A pause in read-aloud, with the same meaning as a pause in spoken text ([Spoken text](#spoken-text)). It displays as nothing.

Rich text MUST NOT contain line breaks. Capitals in text carry no special meaning to the format.

### 3.5 Math

A math run puts a formula into rich text:

```json
{ "math": { "format": "asciimath", "source": "120 xx 3 = 360" } }
```

| Field     | Type        | Notes                                                                                                                                                                                                       |
| --------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`  | string      | REQUIRED. The notation `source` is written in: `"asciimath"` or `"tex"`.                                                                                                                                    |
| `source`  | string      | REQUIRED. The formula as the author wrote it, without delimiters. MUST NOT contain line breaks.                                                                                                             |
| `display` | boolean     | OPTIONAL, default `false`. When `false`, the formula sits inside the sentence around it. When `true`, it is shown on its own line.                                                                          |
| `spoken`  | spoken text | OPTIONAL. What read-aloud says for this formula, in place of speech generated from it. For when the generated speech is correct but awkward to hear, or says a word wrong. See [Spoken text](#spoken-text). |

The two formats are:

- **`asciimath`**: AsciiMath, as described at [asciimath.org](https://asciimath.org/) and as parsed by the AsciiMath input of [MathJax](https://www.mathjax.org/) version 4. AsciiMath has no formal grammar, and parsers disagree on edge cases, so where they differ, MathJax's result is the one this format means.
- **`tex`**: TeX math notation (the math-mode notation of LaTeX), as parsed by the TeX input of MathJax version 4. Producers SHOULD use only commands from MathJax's `base` and `ams` packages, since other tools are most likely to support those.

**No delimiters.** The math run is the only way to mark a formula. Consumers MUST NOT look for math delimiters such as `$...$`, `\(...\)` or backticks in text runs. A `$` in text is a dollar sign, so a passage can mention $2.50 safely.

**Unknown formats.** A consumer that meets a `format` it does not recognize, or cannot render, MUST show `source` as plain text in its place, and SHOULD keep the run unchanged when saving.

**Answers.** Answers are spelled by the speller, so `answers` hold plain strings and MUST NOT hold formulas. A math question's answer is written as text, such as `360` or `3/4`.

#### Spoken text

Spoken text is a plain string, or an array of runs for the few things plain words cannot say. A run is one of:

- a string: words to say.
- a pronunciation: `{ "text": "buoy", "ipa": "ˈbuːi" }`. The words in `text`, said the way `ipa` gives them in the [International Phonetic Alphabet](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet). A consumer whose speech engine cannot take IPA MUST say `text` unchanged instead.
- a substitution: `{ "text": "WWF", "alias": "World Wide Fund for Nature" }`. The run reads as `text` but is said as `alias`: plain words any engine can say.
- a spell-out: `{ "text": "REEF", "sayAs": "characters" }`. The characters of `text`, said one by one ("R, E, E, F"). `"characters"` is the only value `sayAs` takes.
- a pause: `{ "pause": "short" }` (about what a comma gives) or `{ "pause": "long" }` (clearly longer).

These runs are a deliberately small subset of [SSML](https://www.w3.org/TR/speech-synthesis11/): a pronunciation corresponds to SSML's `<phoneme alphabet="ipa">`, a substitution to its `<sub alias>`, a spell-out to its `<say-as interpret-as="characters">` and a pause to its `<break>`, and the [XML form](XML-FORMAT.md) writes them as exactly those elements. No other part of SSML is in OSLF, and `<audio>` is left out on purpose: speech never fetches anything ([section 7](#7-security-and-privacy)).

None of these abilities is confined to spoken text: in rich text, a text run MAY carry `ipa`, `alias` or `sayAs` (at most one of the three) and a pause run MAY appear anywhere ([section 3.4](#34-rich-text)), so a passage can fix how read-aloud says a name or spell a word out.

Two rules for consumers:

- Shown rather than spoken (a transcript, a tooltip), spoken text reads as its words: each string, each run's `text`, and nothing for a pause.
- A consumer that meets a run object it does not recognize MUST say its `text` where it has one, otherwise skip it, and SHOULD keep the run unchanged when saving.

### 3.6 Questions

| Field          | Type               | Notes                                                                                                                                                                                      |
| -------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`         | `"question"`       | REQUIRED.                                                                                                                                                                                  |
| `questionType` | string             | REQUIRED. An id from [section 2](#2-question-type-ids).                                                                                                                                    |
| `prompt`       | rich text          | REQUIRED.                                                                                                                                                                                  |
| `answerKey`    | string             | OPTIONAL. When absent, the type's default applies. When present, it MUST be a kind the type allows.                                                                                        |
| `answers`      | array of string    | REQUIRED when the key is `exhaustive` or `suggested`, and MUST be absent when it is `none`. `known` and `math` keys MUST hold at least one answer, and a `math` key MUST hold exactly one. |
| `working`      | array of rich text | OPTIONAL. `math` only. The steps to the answer, in order, one step per item.                                                                                                               |
| `threeBoard`   | boolean            | OPTIONAL. `semi-open` only.                                                                                                                                                                |
| `besides`      | string             | OPTIONAL. `semi-open` with an `exhaustive` key only. MUST match one of `answers`, ignoring case.                                                                                           |

Answers MUST be compared without regard to case.

A consumer that meets a `questionType` it does not know MUST NOT drop the question. It SHOULD show the prompt as an untyped question and keep the block unchanged when saving.

### 3.7 Other blocks

**Passage**: `{ "type": "passage", "paragraphs": [rich text, ...] }`. At least one paragraph.

**Spelling words**: `{ "type": "spelling", "words": [string, ...] }`. At least one word.

**Image**: `{ "type": "image", ... }` with the fields in [section 3.8](#38-images).

**VAKT activity**: `{ "type": "vakt", "text": string, "links": [Link, ...], "image": Image }`. `text` is REQUIRED and holds the activity without the "VAKT:" label. `links` and `image` are OPTIONAL. A Link has a REQUIRED `url` and an OPTIONAL `label`.

**Heading**: `{ "type": "heading", "text": rich text }`.

### 3.8 Images

| Field             | Type      | Notes                                                                                                                               |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src`             | string    | REQUIRED. An `https` URL, a `data:` URL holding the image, or a relative reference resolved against the lesson file's own location. |
| `alt`             | string    | RECOMMENDED.                                                                                                                        |
| `caption`         | rich text | OPTIONAL. MUST NOT hold the credit.                                                                                                 |
| `credit`          | Credit    | OPTIONAL, and REQUIRED when the image's license asks for attribution.                                                               |
| `width`, `height` | integer   | OPTIONAL. Pixel size of the image.                                                                                                  |
| `size`            | string    | OPTIONAL. `small`, `medium`, `large` or `full`.                                                                                     |
| `align`           | string    | OPTIONAL. `left`, `center` or `right`.                                                                                              |

A Credit is an object with OPTIONAL `text` (the credit line as printed), `author`, `license` (an SPDX identifier or URL), `licenseUrl` and `sourceUrl`. At least one field MUST be present. When `text` is absent, a consumer builds a credit line from the other fields.

### 3.9 Sources

A Source is an object with a REQUIRED `id` and OPTIONAL `title`, `author`, `publisher`, `year` and `url`, all strings. The `id` MUST be unique among the lesson's sources and match `^[A-Za-z0-9_-]{1,64}$`. Every `note.source` in the lesson MUST name a source in the list.

### 3.10 Links

Every URL in a lesson, other than an image `src`, MUST use the `https`, `http` or `mailto` scheme.

### 3.11 Extensions

The lesson, every section and every block MAY carry an `extensions` object. Each key in it MUST be a URI that names the extension and is controlled by whoever defines it, such as `https://example.org/oslf/reading-level`. Consumers MUST ignore extensions they do not understand. Editors SHOULD keep unknown extensions unchanged when they save a file.

### 3.12 Versioning

The `oslf` field holds the version as `MAJOR.MINOR`. Before 1.0, any draft may make breaking changes. From 1.0 on, a minor version only adds OPTIONAL fields and new values, and a consumer that supports `1.n` MUST read any `1.m` file where `m` is not greater than `n`.

A consumer that meets a file with a newer major version than it supports SHOULD refuse it and say why, rather than guess.

## 4. Profiles

A profile is the file form of a lesson shape ([SPEC.md, part 4](SPEC.md#4-lesson-shapes)). It is a JSON document that validates against [schema/profile.schema.json](schema/profile.schema.json). [examples/six-section.profile.json](examples/six-section.profile.json) is a complete example. Like a lesson, a profile can instead be written as XML ([XML-FORMAT.md section 7](XML-FORMAT.md#7-profiles)).

### 4.1 Profile files

| Field         | Type          | Notes                                                                              |
| ------------- | ------------- | ---------------------------------------------------------------------------------- |
| `oslfProfile` | string        | REQUIRED. The OSLF version, `"0.1"`.                                               |
| `id`          | string        | REQUIRED. A URI that identifies the profile. Lessons refer to profiles by this id. |
| `name`        | string        | REQUIRED.                                                                          |
| `version`     | string        | OPTIONAL. The profile's own version.                                               |
| `description` | string        | OPTIONAL.                                                                          |
| `publisher`   | Person        | OPTIONAL.                                                                          |
| `license`     | string        | OPTIONAL.                                                                          |
| `rules`       | array of Rule | REQUIRED.                                                                          |
| `extensions`  | object        | OPTIONAL. As in [section 3.11](#311-extensions).                                   |

### 4.2 Rules

Every rule has a REQUIRED `rule` (its kind), an OPTIONAL `id` that names it in messages, an OPTIONAL `description`, and a `severity` of `error` or `warning` (default `warning`). A validator reports every rule a lesson breaks, at the rule's severity.

Ranges are written `{ "min": n, "max": n }`, and either bound MAY be left out.

| Rule                    | Fields                                                         | A lesson breaks it when                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `section-count`         | `count`: range                                                 | the number of sections is out of range.                                                                                                                                 |
| `section-shape`         | `slots`: array of Slot; `allowOther`: boolean, default `false` | a section's blocks do not match the slots in order ([section 4.3](#43-section-shape)).                                                                                  |
| `spelling-words`        | `count`: range; `letters`: range; `uniqueInLesson`: boolean    | a spelling block has a number of words out of range, a word has a number of letters out of range, or (when `uniqueInLesson` is true) a word repeats in another section. |
| `answer-in-passage`     | `questionTypes`: array                                         | an answer to a question of one of those types does not appear, word for word and ignoring case, in a passage of the same section.                                       |
| `answer-not-in-passage` | `questionTypes`: array                                         | an answer to a question of one of those types does appear in a passage of the same section.                                                                             |
| `answer-reuse`          | `questionTypes`: array, default all                            | the same answer is used by two questions of those types anywhere in the lesson.                                                                                         |
| `prompt-gives-answer`   | `questionTypes`: array                                         | a question's prompt contains one of its own answers.                                                                                                                    |

The rules that look at answers only look at `exhaustive` answer keys. Suggested answers are examples, so they are never held to a rule.

A validator that meets a rule kind it does not know MUST report it as a warning saying the rule was not checked. It MUST NOT treat the lesson as passing that rule.

### 4.3 Section shape

A Slot matches a run of consecutive blocks. It has a `block` (a block type, or `"question"`), a `questionType` when `block` is `"question"` (one type id, or an array of them when any of several types may fill the slot), and a `count` range (default exactly 1). A slot with `count.min` of 0 is optional.

A section matches when its blocks can be split, in order, into one run per slot, each run holding a number of blocks within the slot's range. Headings are skipped when matching. When `allowOther` is true, blocks of a kind that no slot names are skipped as well.

## 5. Rendering

A consumer that renders a lesson for people to read or print:

- MUST NOT rely on color alone to show a question's type, and MUST mark each type some other way as well ([SPEC.md, printing](SPEC.md#never-color-alone)).
- MUST show a `suggested` answer key differently from an `exhaustive` one.
- MUST NOT show VAKT activities in the question legend or count them as questions.
- SHOULD list in the legend only the question types the lesson uses.
- SHOULD use the default colors, legend names and tags in [SPEC.md](SPEC.md#default-colors-and-tags) unless its user chooses others. A lesson file does not store colors.
- adds the labels "Spell:" and "VAKT:" itself, since they are not stored in the file, and MAY translate them.
- SHOULD render formulas in a form that screen readers can read, such as MathML.
- when it reads a lesson aloud, MUST use a formula's `spoken` text where one is given, and otherwise SHOULD generate speech from the formula (for example with MathJax's speech output) rather than reading out its source.
- when it reads a lesson aloud, MUST honor the pronunciations and pauses in rich text ([section 3.4](#34-rich-text)); where its engine cannot take IPA, it says the run's `text` unchanged.

## 6. Conformance

- A **conforming lesson file** validates against the lesson schema and meets every MUST in [section 3](#3-lesson-files).
- A **conforming producer** writes only conforming lesson files.
- A **conforming consumer** reads every conforming lesson file of the versions it claims, follows [section 3.5](#35-math) for formulas, [section 3.6](#36-questions) for unknown question types and [section 3.11](#311-extensions) for extensions, and, when it renders a lesson, meets [section 5](#5-rendering).
- A **conforming validator** checks profiles as [section 4](#4-profiles) describes.

Matching a profile is not part of conformance.

## 7. Security and privacy

- Consumers MUST NOT run anything found in a lesson file. Rich text is data, not markup, and MUST NOT be rendered as HTML.
- Formulas are data too. Consumers MUST NOT let a formula load extensions or other resources, run code, or create links. In MathJax, that means disabling commands such as TeX's `\require` and `\href`, for example with its `safe` extension.
- Speech MUST NOT fetch anything: neither spoken text nor rich text's pronunciations and pauses have a form that names a resource. A consumer that converts either into a speech engine's own markup, such as SSML, MUST escape the author's strings so they cannot act as markup.
- Consumers MUST check URL schemes ([section 3.10](#310-links)) before making a link clickable.
- Consumers SHOULD NOT fetch remote images without the user's knowledge where doing so would reveal that a lesson is being opened.
- Producers SHOULD NOT write account data, such as collaborators' email addresses, into a lesson file.

## 8. Open issues

Open questions about the question types themselves are in [SPEC.md](SPEC.md#open-questions). These are about the file format:

1. **Packaging.** Images can be URLs, `data:` URLs or relative files, but there is no single-file package for a lesson with its images (for example a ZIP holding the lesson and a media folder).
2. **Wording rules in profiles.** Profiles cannot yet check prompt wording, such as a would-you-rather prompt starting "Would you rather". Wording depends on the language, so these rules need a design that works across languages.
3. **Section metadata.** Should a section be able to say which profile slot or which level it is written for?
4. **Math references.** Both math formats are defined by what MathJax 4 does. Should a later version pin a narrower, written-down subset, so that tools that don't use MathJax can match it exactly?

## Appendix A: Converting Spelling Creator files

_Informative._ Spelling Creator lesson files (`"format": "spelling-creator-lesson"`, `"version": 1`) convert as follows.

| Spelling Creator                           | OSLF                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `doc.title`, `doc.ageRange`, `doc.sources` | `title`, `ageRange`, `sources`                                                                                              |
| section `name`                             | section `title`                                                                                                             |
| `text` block                               | `passage`, one paragraph per line of `text`, or per paragraph of `content`                                                  |
| footnote `{ sourceId, locator, note }`     | note `{ source, locator, text }`                                                                                            |
| `spelling` block, `words[].text`           | `spelling`, `words`                                                                                                         |
| `image` block                              | `image`; `caption` and `credit` (as `credit.text`)                                                                          |
| `vakt` block                               | `vakt`; `links[]` without their ids                                                                                         |
| question `single`                          | `known`, `answers: [answer]`                                                                                                |
| question `background`                      | `prior-knowledge`, `answers: [answer]`                                                                                      |
| question `number`                          | `math`, `answers: [answer]`, `steps[].text` as `working`                                                                    |
| question `multiple`                        | `semi-open`                                                                                                                 |
| question `multiple_open`                   | `semi-open` with `answerKey: "suggested"`                                                                                   |
| question `open`                            | `tight-open` or `broad-open`. The file does not say which, so a converter has to decide from the wording or ask the author. |
| question `paraphrase`                      | `paraphrase`                                                                                                                |
| question `wyr`                             | `would-you-rather`                                                                                                          |
