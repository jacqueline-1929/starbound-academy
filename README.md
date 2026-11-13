# Starbound Academy

A private, device-first homeschool game world for Robby and Tommy.

The living product, curriculum, entertainment, progression, privacy, and
K–12-plus-A.A. vision is documented in the
[Starbound Academy World, Experience, and Pedagogy Design Bible](docs/STARBOUND_ACADEMY_DESIGN_BIBLE.md).

The long-range academic journey and the K–2 build order are documented in the
[Starbound Academy K–12 and Associate of Arts Education Plan](docs/K14_EDUCATION_PLAN.md).

The detailed first-band content, sequence, pacing, evidence, textbooks, media,
and research are documented in the
[K–2 Curriculum and Pacing Guide](docs/K2_CURRICULUM_AND_PACING_GUIDE.md).

The curriculum-to-game translation—world loops, subject mechanics, bosses,
difficulty, feedback, accessibility, evidence, and production order—is defined
in the
[K–2 Game Design Specification](docs/K2_GAME_DESIGN_SPECIFICATION.md).

The evidence, governance, course-review, and future credentialing bar is defined
in the
[Accreditation and Academic Quality Framework](docs/ACCREDITATION_AND_ACADEMIC_QUALITY_FRAMEWORK.md).

The long-term avatar, safe asynchronous community, and creator lesson library
are defined in the
[Avatar, Community, and Mod Ecosystem](docs/AVATAR_COMMUNITY_AND_MOD_ECOSYSTEM.md).

The local-first software foundation—parent and child applications, sign-in,
IndexedDB records, Three.js boundaries, offline behavior, backup, security, and
the path to hosted scale—is defined in the
[System Architecture](docs/SYSTEM_ARCHITECTURE.md).

The long journey is presented through four distinct experience worlds: the
K–5 Wonder Archipelago, Grades 6–8 Guild Realms, Grades 9–12 Constellation
Network, and the Associate of Arts Great Conversation. Identity, progress,
creations, and portfolio history continue across all four.

## Run locally

On a Mac, double-click **Start Starbound Academy.command** in this folder. It
starts the local school and opens **http://localhost:4173/** in your browser.
Always use that same address and browser profile: completed lessons, stars,
music, and portfolios are saved by browser address. Opening `dist/index.html`
directly as a `file://` URL shows a separate copy with separate storage.

Alternatively, serve the `dist` directory with a static web server at port
4173, then open http://localhost:4173/ in a modern browser. Export a backup
from **Family log** regularly, especially before clearing browser data.

The application is self-contained and is not coupled to ChatGPT or Sites hosting.

## Current vertical slices

Open **Story Nebula** for either learner:

- Robby begins with **The Short-A Snack Attack**, a five-part phonics lesson
  covering sound discrimination, phoneme–grapheme mapping, word building,
  transformation, controlled text, spelling, an always-open boss, and optional
  drawing.
- Tommy begins with **The Storm Core Trial**, a five-part high-velocity reading
  lesson covering prediction, causality, system relationships, relevant
  evidence, transfer, written defense, and optional story revision.

Open **Measure Moon** for either learner:

- Robby begins with **The Moon Bridge Equality Engine**, a five-part grade 1
  lesson that moves from direct comparison to whole/part/difference models,
  missing parts, relational equations, a bridge application, and a boss model.
- Tommy begins with **The Reactor Equality Paradox**, a five-part grade 2
  lesson that treats equality as sameness of value, preserves quantities while
  transforming expressions, varies the unknown's position, includes error
  analysis, and ends with a written mathematical argument.

The next mission after each initial slice is a playable sound adventure:

- Robby's **Beat Bridge** and Tommy's **Loop Reactor** ask children to listen,
  copy notes and rests, repair a missing beat, count, repeat equal loops, and
  remove one note from each loop. Normal/Hard/Master vary the number of loops;
  Tommy's array stays within the grade 2 limit of 25 objects.
- Robby's **Cat and the Sound Song** gives each printed phoneme a tappable,
  pitched voice cue (C/Do, A/So, T/Mi) and sings the sounds in order before
  saying the blended word. He then spells short-a CVC words, arranges a
  sentence, changes one initial sound, names a pet, and chooses an ending.
  Browser speech voices vary, so the pitch is a musical cue rather than a
  guaranteed concert note; clean phoneme modeling remains part of read-along.
- Tommy's **Cheesia and the Shadow Cape** is a series of short forest scenes.
  A little moss fox helps Cheesia first, and Tommy names it afterward. His
  route changes the next scene. Two ending choices resolve the same plant-needs
  problem, a written science reason completes the boss, and he can draw the
  fox for his inspectable portfolio page.

These four lessons are defined in `dist/sound-adventures.js`, with their
presentation in `dist/sound-adventures.css`. Each uses the guided lesson archive
and can be expanded through the same registration and five-stage functions.
Standards checked against [Florida's grade 1 mathematics course](https://www.cpalms.org/Public/PreviewCourse/Preview/10320),
[Florida's grade 2 mathematics benchmarks](https://resources.finalsite.net/images/v1745409382/escambiaschoolsorg/f8khantyjbmzjgnmuu0c/Mathematics_Standards_Grade_2_CPALMS.pdf),
[Florida's ELA standards](https://www.fldoe.org/core/fileparse.php/7539/urlt/elabeststandardsfinal.pdf),
and [Florida's K–2 science item specifications](https://www.fldoe.org/core/fileparse.php/5423/urlt/fl-item-spec-sci-k-2-wt-r2g.pdf).

Both slices autosave, support Normal/Hard/Master selection, record read-aloud
and hints separately from independent evidence, include an optional read-along
chapter, award difficulty-scaled points, and permit an immediate boss attempt.
The legacy backup JSON remains importable through **Family log → Import backup**.

## Grade journey progress

The world map and each subject page now show a learner-specific grade journey.
Each subject is divided into 36 dated evidence checkpoints across four arcs:
Launch, Build, Explore, and Exhibit. A completed lesson advances the relevant
subject bar immediately. The meter reports completed evidence, not a mastery
claim; mastery remains a separate parent review decision.

## Current prototype deployment

Publish the contents of `dist/` with any static host. The current prototype does
not require a server-side runtime; its records remain in browser storage and can
be moved with **Family log → Export backup** and **Import backup**. The planned
production foundation remains self-hostable while replacing this single-object
storage with a versioned local database and validated family archives.

## Learning records

Progress, writing samples, observations, and settings are stored in the browser. Use **Family log → Export backup** regularly. The exported JSON file can be imported later and the portfolio view can be printed to PDF.

## Curriculum approach

- Reading and writing: Common Core grade 1–2 foundations, with optional grade 3–5 stretch text.
- Mathematics: grade 1–2 arithmetic combined with Davydov-inspired comparison, measurement, equality, and generalized relationships.
- Science: NGSS K–3 forces, motion, matter, and investigation practices.

