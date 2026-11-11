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

Serve the `dist` directory with any static web server, then open it in a modern browser.

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

Both slices autosave, support Normal/Hard/Master selection, record read-aloud
and hints separately from independent evidence, include an optional read-along
chapter, award difficulty-scaled points, and permit an immediate boss attempt.
The legacy backup JSON remains importable through **Family log → Import backup**.

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

