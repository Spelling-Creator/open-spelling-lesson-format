# Open Spelling Lesson Format (OSLF)

Shared names and plain definitions for the parts of a Spelling lesson: the passages, spelling words, question types and activities that partners write for nonspeaking spellers. OSLF is open and isn't tied to any method.

**Status: 0.1 draft, open for review.** Nothing here is stable yet.

## Why

Lessons for spellers share a vocabulary: known questions, semi-opens, tight and broad opens, would-you-rather questions, VAKT activities. Nobody has written that vocabulary down. Most of us learned it from lessons we have seen, so the same name can mean different things to different people, and a lesson made in one place can be hard to use in another.

## Where to start

**If you design lessons**, read [SPEC.md](SPEC.md). It defines the eight question types with examples and advice, covers printing and sharing, and explains how to write down the shape your own lessons follow. Then tell us what you think, especially about its [open questions](SPEC.md#open-questions).

**If you build tools**, read SPEC.md first, then [FILE-FORMAT.md](FILE-FORMAT.md), which defines the data model, the JSON lesson file, profiles (lesson shapes as files) and what a conforming tool must do. [XML-FORMAT.md](XML-FORMAT.md) defines the equivalent XML form of lessons and profiles.

## Files

| Path | What it is |
|---|---|
| [SPEC.md](SPEC.md) | The standard, for lesson designers. |
| [FILE-FORMAT.md](FILE-FORMAT.md) | The data model and JSON form, for tool builders. |
| [XML-FORMAT.md](XML-FORMAT.md) | The XML form of lessons and profiles. |
| [schema/lesson.schema.json](schema/lesson.schema.json) | JSON Schema for lesson files. |
| [schema/lesson.xsd](schema/lesson.xsd) | XML Schema for lesson files. |
| [schema/profile.schema.json](schema/profile.schema.json) | JSON Schema for profiles. |
| [schema/profile.xsd](schema/profile.xsd) | XML Schema for profiles. |
| [examples/lighthouses.oslf.json](examples/lighthouses.oslf.json) | An example lesson. |
| [examples/lighthouses.oslf.xml](examples/lighthouses.oslf.xml) | The same lesson, as XML. |
| [examples/six-section.profile.json](examples/six-section.profile.json) | An example lesson shape, as a profile. |
| [examples/six-section.profile.xml](examples/six-section.profile.xml) | The same profile, as XML. |

## Principles

- **No method names.** OSLF describes lessons, not methods, and doesn't claim what any method requires.
- **Never color alone.** Every question type must be identifiable without color.
- **Your shape is yours.** Section counts and question order belong to lesson shapes that anyone can publish. None is official.

## License

Copyright (c) 2026, playforge-coding.

| Files | License |
|---|---|
| [SPEC.md](SPEC.md), [FILE-FORMAT.md](FILE-FORMAT.md), [XML-FORMAT.md](XML-FORMAT.md), [README.md](README.md) | [Creative Commons Attribution 4.0 International](LICENSES/CC-BY-4.0.txt) (CC BY 4.0) |
| [schema/](schema/), [examples/](examples/) | [BSD 3-Clause](LICENSES/BSD-3-Clause.txt) |

The schemas and examples use a code license so that tools can copy them into their own source code and tests on the same terms as other code.
