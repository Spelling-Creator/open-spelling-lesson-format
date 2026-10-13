# Open Spelling Lesson Format (OSLF)

**Version 0.1, draft, open for review.** Anything here may change before 1.0.

Copyright (c) 2026, playforge-coding. This document is licensed under [CC BY 4.0](LICENSES/CC-BY-4.0.txt).

## Who this is for

This document is for people who design Spelling lessons: practitioners, communication partners, parents and publishers. It gives the parts of a lesson and the kinds of question shared names and plain definitions, so that a lesson means the same thing to everyone who reads it.

If you build software for lessons, read this first, then [FILE-FORMAT.md](FILE-FORMAT.md), which says how to store all of it in a file.

## Why a standard

Lessons for spellers share a vocabulary: known questions, semi-opens, tight and broad opens, would-you-rather questions, VAKT activities. Nobody has written that vocabulary down. Most of us learned it from lessons we have seen, so the same name can mean different things to different people, and a lesson made in one place can be hard to use in another.

OSLF writes the vocabulary down. It doesn't say how to run a lesson, and it doesn't say what shape your lessons have to be. It isn't tied to any method, organization or publisher. If your lessons are built differently from someone else's, both can still use the same names, and each of you can describe your own shape (see [part 4](#4-lesson-shapes)).

## How to read it

1. Names the parts of a lesson.
2. defines the eight question types. The definitions are the standard. The advice under "Writing one" is guidance that you're free to ignore.
3. covers printing and sharing.
4. explains lesson shapes: how to describe the way your own lessons are built.
5. The draft ends with [open questions](#open-questions) we need practitioners to answer.

### Words used here

- **Speller**: the person answering the questions.
- **Partner**: whoever runs the lesson with the speller.
- **Designer**: whoever wrote the lesson.
- **Passage**: the text a section's questions are about.
- **Answer key**: the answers a lesson prints or stores for a question.

## 1. The parts of a lesson

A lesson has a title and one or more **sections**. Each section usually holds some of these, in whatever order the designer chooses:

- **Passage.** The text the section's questions are about, in one or more paragraphs. Many designers write the passage's harder vocabulary in capitals. That's a writing habit OSLF keeps exactly as written; it isn't a rule.
- **Image.** A picture for the section, with a caption if it needs one, and a credit when its license asks for one. Keep the caption and the credit apart: the caption says what the picture shows and may be read aloud; the credit is for the license.
- **Spelling words.** Words for the speller to spell, printed after "Spell:".
- **Questions.** Each of one of the eight types in [part 2](#2-question-types).
- **VAKT activity.** A regulation break: a movement or sensory activity that engages the visual, auditory, kinesthetic or tactile senses. It is addressed to the partner, and it's not a question: it has no answer, isn't scored, and doesn't go in the question legend. It is printed after "VAKT:", and may come with a link (a video, a song, a printable) or a picture. Example: "Stand up and turn slowly in a full circle, like the beam of a lighthouse sweeping across the sea."
- **Heading.** A short heading inside a section, such as one over a run of would-you-rather questions.

A lesson can also list its **sources**, the books, articles and websites its passages draw on, and cite them in footnotes.

## 2. Question types

### The example passage

The examples in this part come from a lesson about lighthouses. Its first passage reads:

> Long before electric lights, sailors looked for fires burning on hills and towers to find their way into port. More than 2,200 years ago, the city of Alexandria in Egypt built a towering lighthouse on the island of PHAROS, just outside its harbor.
>
> At night, a fire at the top warned ships away from dangerous rocks, reefs and sandbars. The tower was so famous that it was counted among the Seven WONDERS of the Ancient World. EARTHQUAKES damaged it over many centuries, and by the 1400s it lay in ruins.

The whole lesson is in [examples/lighthouses.oslf.json](examples/lighthouses.oslf.json).

### Answer keys

Every type says what its answer key means. There are three kinds:

- **Complete key.** The key lists every accepted answer. An answer that isn't in it is not correct.
- **Example key.** The key gives examples. Other answers can be right too, and the partner judges.
- **No key.** There is no right answer, or the answer is the speller's own.

When a key only gives examples, the printed lesson has to show that, so a speller who says something else isn't marked wrong.

### The eight types at a glance

| Type | Where the answer comes from | Answer key |
|---|---|---|
| Known | the passage | complete |
| Prior knowledge | what the speller already knows | complete |
| Math | a number in the passage, or a calculation | complete, one answer |
| Semi-open | a set of answers the lesson gives, usually a list in the passage | complete (examples allowed, provisionally) |
| Tight open | the speller's everyday world, quickly | none, or examples |
| Would you rather | the speller's own choice between options | none |
| Paraphrase | the passage, retold in the speller's words | none |
| Broad open | the speller's own reasoning, opinion or imagination | none |

### The order of the types

The types are listed in the order a section asks them. Each one asks a little more of the speller than the one before, so a section starts with facts the passage gives and builds up to the speller's own ideas. Ask your questions in this order. A section doesn't have to use every type, and a lesson shape can set how many of each it asks (see [part 4](#4-lesson-shapes)), but it should keep the order.

### Known

**What it is.** The answer is stated in the passage, and there is one right answer. A known question checks that the speller took in a fact the passage gives.

**Answer key.** Complete. Usually one answer, though the key can hold more than one form of it (PHAROS, THE ISLAND OF PHAROS).

**Example.** "Alexandria's lighthouse stood on the island of ______." Key: PHAROS.

**Writing one.**
- Quoting a sentence from the passage with the answer blanked out works well.
- Ask yourself whether a reasonable speller could give a different answer and be just as right. If they could, it isn't a known question.
- Check that no other question in the section prints this answer in its prompt.

**Not this.** "What were sailors looking for? PORT." Home, land and the harbor are just as fair, so the passage's word isn't the only right answer. Ask for a fact the passage states outright instead, or make it a tight open.

### Prior knowledge

**What it is.** The answer is a fact the speller brings from outside the passage. The passage doesn't state it.

**Answer key.** Complete. Usually one answer.

**Example.** "On which continent is Egypt?" Key: AFRICA.

**Writing one.**
- Link it to the passage's topic, but make sure the passage doesn't contain the answer. If it does, it's a known question.
- It has a right answer. A question with many right answers from everyday life is a tight open.

### Math

**What it is.** The answer is a number. It can be a number the passage states, asked as a fill-in-the-blank, or the result of a calculation in a word problem.

**Answer key.** Complete, with one answer. The answer can carry a unit (360 STEPS). A word problem can also carry its **working**: the steps to the answer, in order, so the partner can follow the speller's thinking.

**Examples.**
- Fill-in-the-blank: "The lighthouse was built more than ______ years ago." Key: 2,200.
- Word problem: "A keeper climbed the 120 steps to the lamp 3 times each night. How many steps was that each night?" Key: 360. Working: "120 steps times 3 climbs is 360 steps."

**Writing one.**
- Match the math to the speller, not to an age or grade. Presume competence.
- A word problem works best when it comes out of the section's own content.

### Semi-open

**What it is.** There are several right answers, the lesson sets out what they are, and the speller gives one of them. Most often the passage states a list, and the question asks for one item from it.

**Answer key.** Complete: the key lists every item of the list. If the passage names three things and the key accepts two, a speller who names the third has read the passage correctly and would be marked wrong.

**Example.** "A fire at the top warned ships away from dangerous ______. Name one thing the ships had to avoid." Key: ROCKS, REEFS, SANDBARS.

**Writing one.**
- Plan the semi-opens before you write the passage, and write the list into it: two to four items of the same kind, ideally one word each.
- Don't put the list in the prompt. "Ships avoided rocks, reefs and sandbars. Name one." hands the answer over.
- If a semi-open feels forced, the passage usually needs a real list. Fix the passage rather than the question.

**Three-board mark.** Some designers mark a semi-open "(3B)". OSLF lets you record the mark, but doesn't define it yet. See [open question 2](#open-questions).

**"Besides" line.** A follow-up printed under the question. It names one answer and asks for another: 'Besides "rocks"' asks for REEFS or SANDBARS.

**Provisional: example keys.** Some designers ask semi-opens whose answers are bounded by the topic but aren't a list in the passage, such as "Give a word that means the same as *beam*." (RAY, SHAFT). This draft allows a semi-open with an example key for these, but whether they belong here is [open question 1](#open-questions).

### Tight open

**What it is.** There's no single right answer. The speller answers quickly from their own world, usually in one word.

**Answer key.** None, or examples.

**Examples.** "Name something that gives off light." "Name something made of glass." (examples: WINDOW, BOTTLE, MIRROR)

**Writing one.**
- Name an everyday category that almost anyone can answer at once.
- Link the category to the lesson's theme lightly, but don't make the answer depend on the passage.
- Keep the load light. "Name a word that means very old" is a vocabulary puzzle, not a tight open.

### Would you rather

**What it is.** The speller chooses between two or more options the prompt offers. No option is right; the choice is theirs. Asking why is part of the same question.

**Answer key.** None. The options are in the prompt.

**Example.** "Would you rather keep a lighthouse on a lonely island or in a busy harbor?"

**Writing one.**
- Make every option appealing, or every option awful. A choice with an obvious winner asks nothing.
- The options can use the lesson's vocabulary. That's a good way to give the speller a reason to use new words.

### Paraphrase

**What it is.** The speller retells what the passage, or part of it, said, in their own words. It checks understanding of the passage, not the speller's opinion of it.

**Answer key.** None.

**Example.** "In your own words, explain why the lighthouse at Pharos was built."

**Not this.** "Why do you think lighthouses mattered so much?" asks for the speller's own view, so it's a broad open.

### Broad open

**What it is.** There's no single right answer. The speller gives an opinion, an explanation, a prediction or an idea of their own, often in a sentence or more.

**Answer key.** None.

**Examples.** "Why do you think people went to the trouble of building lighthouses, long before electric lights existed?" "If you designed a lighthouse, what pattern would you paint on it, and why?"

**Writing one.** A broad open can look back across the whole lesson, which makes it a good last question.

Tight opens and broad opens print in the same default color. What separates them is the load: a tight open asks for a quick answer from everyday life, and a broad open asks for reasoning or imagination. See [open question 3](#open-questions).

### When a question could be two types

- **Is the answer in the passage?** Then it's known, math or semi-open. If not, it's prior knowledge or one of the open types.
- **Could a reasonable speller give a different answer and be right?** If not, the key is complete. If so, it's an open type, or a semi-open with an example key.
- **Does it ask what the passage said, or what the speller thinks?** The first is paraphrase. The second is a broad open.

## 3. Printing and sharing

### Never color alone

Many designers print each question type in its own color. That's fine, but color can't be the only thing that shows the type: printers run out of ink, photocopies are gray, and some readers can't tell colors apart. Mark each type a second way too, for example:

- a short tag printed with the question (see the table below);
- a heading over each run of questions of one type;
- a legend that lists the types in the order each section asks them, when that order alone identifies them.

The question's own wording ("Would you rather...", "In your own words...") helps, but shouldn't be the only marker. And print example keys differently from complete keys, for example in italics or after "e.g.".

### Default colors and tags

You don't have to use these. They are the defaults, so that lessons from different places look alike.

| Type | Color | Tag | Legend name |
|---|---|---|---|
| Known | green `#2f9e44` | K | Known |
| Prior knowledge | blue `#1c7ed6` | PK | Prior knowledge |
| Math | purple `#7048e8` | M | Math |
| Semi-open | amber `#d68f00` | SO | Semi-open |
| Tight open | pink `#e64980` | TO | Tight open |
| Would you rather | grape `#9c36b5` | WYR | W.Y.R. |
| Paraphrase | brown `#a0522d` | P | Paraphrase |
| Broad open | pink `#e64980` | BO | Broad open |
| VAKT activity | red `#ee1111` | | (not in the legend) |
| Spelling words | teal `#0c8599` | | (not in the legend) |

A printed legend should list the types in the same order a section asks them, which is the order of this table, and only the types the lesson uses.

### Sharing a lesson

- **Credit images.** Many free images ask for a credit line. Keep it next to the image, apart from the caption.
- **List your sources.** Readers and other partners can then check the facts.
- **Remove personal details.** A lesson written for one speller may name them or describe them. Take that out before you share it.
- **Say how others may use it.** A license such as [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) lets other partners use and adapt your lesson as long as they credit you.

## 4. Lesson shapes

Many designers build every lesson the same way: a set number of sections, the same parts in each, and the same run of questions in the same order. OSLF calls that a **lesson shape**.

OSLF has no official shape. Your shape is yours, and so is everyone else's. Writing it down lets you share it with other partners, lets an editor check your lessons against it, and lets anyone see how your lessons differ from theirs without either being "wrong".

### What a shape can say

- how many sections a lesson has;
- what each section holds, in what order;
- how many questions of each type a section asks, as a number or a range;
- how many spelling words a section has, and how long they are;
- content rules, such as "known answers appear word for word in the passage" or "prior knowledge answers don't";
- for each rule, whether it's **firm** (a lesson that breaks it isn't finished) or a **habit** (worth a reminder, but fine to break).

### An example shape

This example is written in plain words. The same shape as a file is [examples/six-section.profile.json](examples/six-section.profile.json).

> **Six sections of fifteen questions.** Six sections. Each section has, in this order: an image (optional), a passage of one or two paragraphs, four spelling words of 6 to 9 letters, then 3 known, 1 prior knowledge, 2 math, 2 semi-open, 4 tight opens, any number of would-you-rather questions (optional), 1 paraphrase, 2 broad opens, and a VAKT activity (optional).
>
> Firm: known answers appear in the passage; prior knowledge answers don't; a semi-open prompt never contains its own answers.
>
> Habits: everything else, including the counts, and not reusing an answer word anywhere in the lesson.

### Writing down your own

Describe a section of yours the way the example does, from top to bottom, with a count or range for each part. Then list which rules are firm and which are habits. That's enough for someone else to understand your lessons, and enough for a tool builder to turn into a file (see [FILE-FORMAT.md](FILE-FORMAT.md#4-profiles)).

## Open questions

We need practitioners' answers to these before 1.0. Comments on anything else are welcome too.

1. **Example keys on semi-opens.** Some designers ask questions like "Give a word that means the same as *beam*", whose answers are bounded by the topic without being a list in the passage. Should these be semi-opens with an example key, tight opens with an example key, or a type of their own? We haven't found a published description of this kind of question.
2. **Three-board mark.** If you mark questions "(3B)": what does it ask of the speller, and does it apply to types other than semi-open?
3. **Tight and broad opens.** This draft separates them by how much they ask of the speller. Is that the line you draw, or is it answer length, or something else?
4. **Choice questions.** Do you ask questions where the partner offers a few options and one of them is right? No type covers them yet.
5. **Vocabulary.** Designers mark harder words in capitals. Should a lesson be able to mark vocabulary some other way, so that the marking survives translation?
6. **Anything missing.** Is there a kind of question, or a part of a lesson, that you use and don't see here?
