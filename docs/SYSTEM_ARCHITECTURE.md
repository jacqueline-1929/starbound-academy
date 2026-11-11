# Starbound Academy System Architecture

**Version:** 0.1 — local-first foundation  
**Date:** November 11, 2026  
**Audience:** engineers, curriculum authors, designers, security reviewers,
parents, and future accreditation reviewers  
**Status:** Architecture decision draft

> The game may be spectacular, but the learning record must remain simple,
> inspectable, portable, and trustworthy.

This document defines the software foundation for Starbound Academy. It turns
the academic, game, portfolio, avatar, and future community plans into a system
that can begin on one family computer and grow without requiring a rewrite of
the educational core.

It complements the
[World, Experience, and Pedagogy Design Bible](STARBOUND_ACADEMY_DESIGN_BIBLE.md),
[K–2 Curriculum and Pacing Guide](K2_CURRICULUM_AND_PACING_GUIDE.md), and
[K–2 Game Design Specification](K2_GAME_DESIGN_SPECIFICATION.md). Those documents
define what the experience teaches and feels like. This one defines how the
software is divided, how data moves, and what must remain dependable.

---

## 1. Executive decision

Starbound Academy will begin as a **local-first, offline-capable progressive web
application built as a modular monolith**.

- The first database is IndexedDB in the family’s browser, behind a repository
  interface so hosted storage can be added later.
- The application uses TypeScript, React, and an ordinary accessible HTML
  interface. Three.js owns only the 3D game surfaces.
- Child play, parent administration, and later lesson authoring are separate
  application shells with different routes and permissions.
- Four independently art-directed experience worlds—K–5, 6–8, 9–12, and the
  A.A. stage—load through one world-shell contract while sharing identity,
  evidence, portfolio, and progression services.
- Curriculum definitions are versioned content packages. Learner records never
  live inside lesson files or Three.js scenes.
- Attempts, evidence, saved creations, portfolio selections, and point awards
  are separate records with dates and provenance.
- A parent can export and restore a complete, validated family archive without
  an internet connection or Starbound account.
- A future hosted service will add adult accounts, encrypted synchronization,
  family sharing, institutions, and community features through the same domain
  interfaces. It will not replace the local app.
- WebGL2 is the initial 3D target. WebGPU may become an optional renderer later,
  but learning mechanics cannot depend on one graphics backend.

This is deliberately not a collection of microservices. One deployable app and
one coherent domain are easier to audit, test, back up, and operate. Services
should be extracted only when real load, security isolation, or team ownership
creates a demonstrated need.

---

## 2. What exists now

The present prototype is valuable product evidence. It already demonstrates:

- Robby and Tommy profiles;
- subject worlds and lessons;
- local progress and family-log records;
- JSON backup and restore;
- saved music projects;
- portfolio and starred-work concepts; and
- working Three.js learning scenes.

The prototype stores one large `starbound-state` object in `localStorage`, loads
Three.js from a public CDN, and presents child and parent views inside one page.
That is appropriate for proving the experience, but it is not the long-term
record system. The production foundation needs transactions, migrations,
schema validation, route-level access control, dependency locking, automated
tests, offline update handling, and explicit WebGL cleanup.

The migration must preserve existing JSON exports and import the current
`localStorage` record exactly once. The current prototype remains a recoverable
reference until migration tests prove record parity.

---

## 3. Architectural principles

### 3.1 Local-first, not local-only

Learning continues without a network. Local writes are immediate. Optional
hosted sync later moves durable records between devices, but never becomes a
prerequisite for beginning a lesson, saving a beat, or opening a textbook that
has already been downloaded.

### 3.2 One source of truth per concern

- content packages define what a lesson is;
- the domain layer defines what actions mean;
- the local database defines what happened on this device;
- a sync ledger defines what has been exchanged with a server;
- Three.js renders a view of lesson state; and
- summary screens derive progress rather than inventing it.

### 3.3 Evidence before points

A game cannot declare mastery merely because an animation ended. A player
action creates an attempt; an attempt may produce evidence; a rule or human
review may create a mastery assertion; and a separate ledger awards points.
Each step remains inspectable.

### 3.4 Content is data; mechanics are code

Stories, prompts, targets, standards, variations, difficulty rules, media, and
resource citations belong in validated content packages. Reusable mechanics—
such as note placement, number-line movement, magnet experiments, or phoneme
sorting—are tested code modules. A lesson composes mechanics rather than copying
their implementations.

### 3.5 Accessible HTML surrounds the canvas

Navigation, instructions, captions, controls, feedback, and alternatives use
semantic HTML. Canvas is never the only way to read essential information or
perform the assessed action. Each mechanic defines keyboard, touch, pointer,
audio, reduced-motion, and non-3D behavior where needed.

### 3.6 Version everything that affects interpretation

Every evidence record includes the app version, content version, mechanic
version, difficulty, supports used, and UTC time. Curriculum can improve without
silently changing the meaning of old work.

---

## 4. System map

```text
┌──────────────────────────────── Starbound client ───────────────────────────┐
│                                                                            │
│  Child app /play        Parent app /grownups       Studio /studio (later) │
│  world, missions,       plans, records, backup,    lesson authoring,      │
│  avatar, creations      portfolio, settings        preview, validation    │
│             │                    │                         │                │
│             └──────────── Accessible application shell ───┘                │
│                                      │                                     │
│  ┌──────────────────── Application services ────────────────────────────┐  │
│  │ sessions · lesson runtime · evidence · portfolio · points · media   │  │
│  │ planning · exports · content installation · sync orchestration      │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────── Domain core ─────────────────────────────────┐  │
│  │ learners · curriculum · attempts · mastery · artifacts · guardians  │  │
│  │ permissions · progression · portfolios · licenses · audit events    │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                 │ ports                                    │
│  ┌────────────────────── Local infrastructure ──────────────────────────┐  │
│  │ IndexedDB · blob store · Web Crypto · service worker · file export  │  │
│  │ Three.js/WebGL lab host · audio engine · downloaded content cache   │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │ optional sync adapter
                    ┌─────────────▼─────────────┐
                    │ Hosted platform (later)   │
                    │ modular API · PostgreSQL  │
                    │ object storage/CDN · jobs │
                    │ adult auth · audit · sync │
                    └───────────────────────────┘
```

The arrows point inward: interface and infrastructure depend on domain
contracts. The domain does not import React, IndexedDB, Three.js, or a future
cloud vendor.

---

## 5. Recommended application stack

| Concern | Initial choice | Reason |
|---|---|---|
| Language | TypeScript with strict settings | Makes content, records, and migrations explicit |
| Build | Vite with locked dependencies | Fast local work and ordinary static deployment |
| Interface | React + React Router | Mature accessible component and routing ecosystem |
| Validation | Zod at every file, database, and network boundary | Runtime data cannot be trusted merely because TypeScript compiled |
| Local database | IndexedDB through Dexie | Transactions, indexes, migrations, and testable repositories |
| 3D | Three.js, bundled and version-pinned | Rich WebGL scenes without a CDN runtime dependency |
| 2D and notation | DOM/SVG/Canvas chosen per mechanic | Music notation and diagrams should not require WebGL |
| Audio | Web Audio plus licensed human recordings | Precise loops and natural-language clips |
| Offline | Versioned service worker and content cache | App shell and installed lessons work without a network |
| Unit/component tests | Vitest + Testing Library | Domain and interface behavior |
| Journey tests | Playwright + automated accessibility checks | Child, parent, backup, restore, and offline flows |

React does not own the educational rules, and Three.js does not own React
state. Both call application services. This prevents a visual rewrite from
changing the learning record.

---

## 6. Parent and child applications

### 6.1 Shared family launcher

The root route presents large learner avatars plus a discreet **Grown-ups**
entry. It shows sync/backup health without exposing private details. A child can
choose a managed learner profile; an adult must unlock parent routes.

Child profiles do not need email addresses. For a two-child household, avatar
selection is the default. An optional picture sequence or short local PIN
prevents accidental profile switching, but it is not presented as strong
security.

### 6.2 Child shell: `/play/:learnerId`

The child interface has four stable destinations:

1. **Home** — continue, today’s invitations, downloads, and funny world event.
2. **Worlds** — the learner's age world, its islands or districts, open quests,
   earlier worlds, future challenge portals, and always-visible bosses.
3. **Create** — music, drawing, writing, labs, saved builds, and exhibitions.
4. **Me** — avatar, clothes, level, collections, and selected best work.

Mission routes preserve their location and can be paused safely. The browser
Back action has a predictable result. A checkpoint banner confirms saves without
interrupting play. External links, purchases, imports, exports, deletion,
community publishing, mod installation, privacy changes, and standards claims
are not child permissions.

### 6.3 Parent shell: `/grownups`

The parent interface uses a calm left navigation rather than the game world:

- **Overview:** current work, recent evidence, needs attention, and storage or
  backup warnings;
- **Learners:** profiles, accessibility, interests, difficulty range, and
  schedule;
- **Learning plan:** pacing, prerequisites, challenge doors, textbooks, and
  assigned or optional missions;
- **Evidence:** attempts, supports, explanations, mastery assertions, and
  standards coverage;
- **Portfolio:** dated artifacts, starred work, revisions, captions, and
  PDF/archive export;
- **Learning Memories:** dated field trips, home experiments, performances,
  museum visits, nature observations, photos, recordings, and other learning
  that happened away from the screen;
- **Library:** downloaded content, textbooks, media, licenses, and source notes;
- **Lesson builder:** family-authored lessons using approved mechanics;
- **Data and backup:** export, restore preview, migration history, storage use,
  and deletion; and
- **Access and settings:** parent lock, devices, privacy, accessibility defaults,
  and future sync.

Every parent route is guarded, not merely hidden. Sensitive actions require a
recent adult unlock. Leaving the parent area or an inactivity timeout relocks
it. Child routes receive only learner-safe view models, not complete parent
records that CSS happens to conceal.

### 6.4 Authoring shell: `/studio` (later)

Studio is an adult permission. It previews content in a disposable learner
sandbox, validates required accessibility and evidence fields, and cannot edit
official packages in place. Publishing creates a new immutable content version.

---

## 7. Local sign-in and later accounts

### Phase 1: household unlock on one device

The first release has a local household vault rather than pretending a browser
is a remote identity provider.

1. An adult creates the household and an adult unlock phrase.
2. A key derived from that phrase encrypts sensitive local payloads and family
   exports with Web Crypto.
3. Only a salted verifier and encryption metadata are stored; the phrase is not.
4. Unlock creates a short-lived in-memory parent session.
5. Child profile selection remains fast and does not reveal the adult phrase.
6. Backup setup produces a printable recovery key and clearly explains that
   losing both phrase and recovery material makes encrypted data unrecoverable.

The operating-system account and browser profile remain part of the local
security boundary. A four-digit child PIN or hidden menu is only an accidental-
access guard; it is not protection against someone with device access.

### Phase 2: optional hosted identity and device sync

- Only adults create internet accounts.
- Passkeys through WebAuthn are the preferred sign-in method; email recovery is
  secondary and adult-only.
- The server verifies authentication and authorization. The client never grants
  itself a role.
- Browser sessions use secure, `HttpOnly`, same-site cookies rather than tokens
  exposed to application JavaScript.
- A learner remains a household-managed profile, not a social account.
- Household, educator, reviewer, and content-author roles are explicit and
  separately auditable.
- Device enrollment requires adult approval and recovery codes.

WebAuthn requires a secure context and a relying party; it belongs in hosted
identity rather than being used as decorative security in a purely local build.
Production hosting must use HTTPS. Localhost remains valid for development.

---

## 8. Local database and record model

IndexedDB replaces the single `localStorage` object. It is designed for larger
structured data and blobs and provides asynchronous, transactional operations.
All access occurs through repositories; components never open database tables
directly.

### 8.1 Core stores

| Store | Purpose |
|---|---|
| `households` | Family identity, locale, time zone, schema and policy versions |
| `adultAccess` | Salted local verifier, key-wrapping metadata, lock settings |
| `learners` | Managed learner profiles and accessibility preferences |
| `worldMemberships` | Current academic home world, entry history, visits, and parent-controlled presentation defaults |
| `contentPackages` | Installed package manifests, versions, hashes, trust and license state |
| `plans` | Assigned, optional, postponed, and completed learning invitations |
| `attempts` | Each bounded encounter with a mission, practice, boss, or creation |
| `evidence` | Atomic observations produced by actions, explanations, uploads, or adult notes |
| `masteryAssertions` | Rule- or reviewer-created claims tied to specific evidence |
| `artifacts` | Metadata for writing, images, recordings, beats, builds, and snapshots |
| `artifactRevisions` | Immutable revision history and parent/learner captions |
| `portfolioCollections` | Starred work, exhibits, ordering, reflections, and export selections |
| `learningMemories` | Dated off-platform experiences, subject links, captions, participants, and attached artifacts |
| `musicProjects` | Note grid, tempo, instrument mapping, theory targets, and versions |
| `drawingProjects` | Vector strokes, layers, tool state, prompts, previews, and revisions |
| `pointsLedger` | Append-only awards, reasons, reversals, and progression calculations |
| `avatarInventory` | Earned cosmetics and provenance |
| `customLessons` | Family-authored content packages and drafts |
| `resources` | Textbook, recording, video, license, attribution, and link metadata |
| `auditEvents` | Adult changes, imports, exports, reviews, deletions, and access events |
| `outbox` | Durable operations waiting for optional future sync |
| `syncState` | Per-device cursors, acknowledgements, and conflict status |

Binary payloads use a `BlobRepository`: IndexedDB blobs first, object storage
later. Metadata and hashes stay in the main stores. Large video libraries are
downloaded as replaceable content, not embedded in irreplaceable learner
backups.

### 8.2 Record rules

- IDs are generated on the client and never reused.
- Dates are recorded as ISO UTC instants; the family time zone controls display
  and school-day grouping.
- Mutable records carry a revision number. Immutable ledgers receive correction
  or reversal records rather than silent edits.
- Every attempt records `learnerId`, `lessonId`, `contentVersion`,
  `mechanicVersion`, difficulty, support state, start/end time, completion
  reason, and app version.
- Saved artifacts record their creator, source attempt, MIME type, byte size,
  checksum, creation time, revisions, and portfolio status.
- Points are calculated from the ledger. A cached total is never authoritative.
- Deleting a learner is a parent-only, previewed operation with a recoverable
  archive option.

### 8.3 Migrations

Database migrations are ordered, transactional, tested against real anonymized
backup fixtures, and recorded in `auditEvents`. Before a structural migration,
the system creates a recovery snapshot. A failed migration leaves the prior
version readable and opens recovery mode; it does not continue with a partly
converted record.

The first migration imports `starbound-state` and existing backup JSON, maps
entries and drafts to typed records, verifies counts and hashes, and then marks
the legacy source as imported. It does not delete the legacy data automatically.

---

## 9. Curriculum and lesson packages

Official curriculum, family lessons, and later community lessons share one
package format but different trust levels.

```text
package/
  manifest.json          identity, version, world/band, trust, license, prerequisites
  scope.json             subjects, outcomes, standards, sequence, pacing
  lessons/*.json         sections, prompts, variants, supports, evidence rules
  stories/*.json         text, vocabulary, decodability, narration mapping
  assets/manifest.json   hashes, sizes, formats, attribution, fallback
  assessments/*.json     scoring rules and reviewer requirements
```

At install and build time, packages are schema-validated. A lesson references a
registered mechanic by ID; it cannot inject arbitrary JavaScript. Official
packages are immutable. Editing one creates a derived family package with its
own ID, version, and source attribution.

Each lesson supports three named difficulty presentations—Normal, Hard, and
Master—but difficulty is a structured set of changes, not a multiplier. Content
specifies representation, text complexity, prompt support, transfer distance,
number range, distractor reasoning, and evidence threshold independently.

Textbooks and videos are supplemental resources linked to a lesson or concept.
Their metadata records source, license, age guidance, transcript/caption state,
download availability, and replacement history. A dead external link must not
make a core lesson impossible to complete.

### 9.1 Experience-world packages

The four major worlds are independently loadable presentation packages:

| World ID | Academic home | Required presentation distinction |
|---|---|---|
| `wonder` | K–5 | Island-scale exploration, large landmarks, narration, tactile mechanics, immediate feedback; separate Launch and Frontier regions |
| `guild` | 6–8 | Guild cities, expeditions, disciplinary tools, project boards, labs, archives, and strategic systems |
| `constellation` | 9–12 | Course campuses and stations, research and lab interfaces, simulations, specialization, schedules, and capstone spaces |
| `conversation` | A.A. | Collegiate forums, syllabi, credit maps, seminars, archives, fieldwork, citations, studios, and thesis spaces |

Each package supplies its own map topology, scene manifests, art and audio
tokens, navigation presentation, loading strategy, ambient cast, game-mode
registry, and performance budgets. It implements a shared `WorldShell`
contract for entering, leaving, restoring location, listing accessible places,
and opening a mission. It cannot redefine authentication, evidence, points,
portfolio, backup, accessibility policy, or permissions.

Routes use stable world IDs, for example
`/play/:learnerId/world/:worldId/place/:placeId`. A learner's home world affects
the default landing page but is not an authorization boundary. Earlier worlds
remain accessible, and future challenge portals resolve through curriculum and
evidence rules rather than character-level locks.

World assets are split by world, region, and destination so entering K–5 never
downloads four complete products. A small shared transition shell preserves the
avatar and navigation while a new world loads. Installed lesson content remains
usable offline even when another age world is not installed.

---

## 10. Lesson runtime and evidence flow

```text
Plan invitation
      ↓
Attempt opened ──→ autosaved checkpoints ──→ paused/resumed/finished
      ↓                                            ↓
Player actions ──→ mechanic events ─────────→ evidence candidates
                                                   ↓
                                      evidence validation/rules
                                                   ↓
                              mastery assertion or review request
                                                   ↓
                            points ledger + progress view + portfolio
```

Mechanics emit a small, versioned event vocabulary such as `placed`, `sorted`,
`predicted`, `tested`, `readWord`, `explained`, `revised`, or `created`. The
lesson runtime converts those events into evidence using the lesson’s declared
rules. Visual effects listen to the same outcome but cannot manufacture it.

Bosses follow the same route. A child may attempt any visible boss immediately.
If the declared evidence threshold is met, credit is granted regardless of the
planned sequence. A failed boss attempt is saved as useful evidence without
punishment or false mastery.

---

## 11. Three.js and WebGL architecture

Three.js is a **rendering and interaction adapter**, not the application or
database. A reusable lab implements this lifecycle:

```ts
interface LearningLab {
  mount(host: HTMLElement, context: LabContext): Promise<void>;
  load(checkpoint?: LabCheckpoint): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  snapshot(): LabCheckpoint;
  capturePreview(): Promise<Blob>;
  dispose(): Promise<void>;
}
```

`LabContext` supplies read-only lesson configuration, learner-safe preferences,
asset access, an event dispatcher, audio/caption services, and a deterministic
random seed. It does not expose database objects or parent data.

### Runtime rules

- Keep at most one active high-power renderer per mission surface.
- Use one animation scheduler; pause when the tab is hidden, the mission is
  paused, or reduced-power mode is active.
- Cap device pixel ratio by performance tier instead of rendering every screen
  at its physical maximum.
- Keep simulation and answer state in serializable domain objects. The scene
  graph is a projection that can be rebuilt after a crash or WebGL context loss.
- Route pointer, touch, keyboard, switch, and gamepad actions into common
  commands.
- Place instructions, captions, focus order, feedback, and accessible control
  alternatives in the DOM.
- Listen for context loss, stop the loop safely, show a calm recovery state, and
  rebuild from the last checkpoint.
- Track and explicitly dispose geometries, materials, textures, render targets,
  controls, listeners, audio nodes, and the renderer when changing labs.
- Inspect renderer memory and draw-call statistics in development; fail budget
  checks before publishing oversized lessons.

### Asset pipeline

- Prefer glTF/GLB for 3D, compressed textures with fallbacks, SVG for diagrams,
  and sprite atlases where they reduce requests.
- Pin and bundle Three.js. Do not import production code from a public CDN.
- Each asset has a stable ID, content hash, size, dimensions, license,
  attribution, age/accessibility notes, and fallback.
- Load the world shell first, then the current mission, then optional polish.
- Release mission-only resources on exit while retaining a small shared world
  cache.
- Define low, standard, and high presentation tiers. Academic rules and awarded
  credit remain identical across tiers.

WebGL2 is the supported baseline. A `RendererAdapter` may later provide WebGPU,
but no content JSON, evidence rule, or simulation model names a graphics API.

---

## 12. Music and audio subsystem

Music projects are domain documents, not rendered audio files. They store tempo,
meter, measures, pitches, durations, rests, instruments, loop regions, colors,
theory concepts, and revision history. The notation view, grid, colored note
blocks, keyboard input, and audio sequencer all edit the same score model.

- Scheduling uses Web Audio ahead-of-time timing, not visual animation frames.
- A saved beat remains editable and can also export a preview audio file later.
- Human voice clips include speaker/language, dialect where relevant, license,
  transcript, translation, timing, and normalization metadata.
- Text-to-speech is a fallback and accessibility service, not a substitute for
  planned phonics sounds or natural Spanish models.
- Audio continues to provide captions/transcripts and a visual timing cue.
- The audio engine stops and disconnects nodes when a lesson closes.

### 12.1 Drawing and visual explanation

Drawing is a registered mechanic and a general creative studio, not a separate
button added to every screen. A lesson may open it for letter formation,
diagramming forces, showing a mathematical relationship, illustrating a story,
labeling a science observation, or making free art.

- Pointer Events provide one input model for mouse, touch, and stylus; pressure
  is optional and never required for credit.
- The saved source is a compact vector stroke document with prompt, tool,
  color, layer, undo, and revision data. A PNG preview is generated for fast
  galleries and portfolio export.
- Strokes autosave transactionally during the activity. Undo and redo do not
  destroy prior saved revisions after submission.
- The default tool tray stays small: draw, erase, undo, color, and done. Extra
  brushes or layers appear only in the art studio or when a lesson needs them.
- A drawing assessment records the explanation or declared features used for
  evidence; it does not score artistic polish or motor control unless that is
  the explicit, disclosed target.
- Keyboard-accessible placement, shape tools, upload, dictation, or adult
  scribing provide alternatives when freehand pointer drawing is inaccessible.

### 12.2 Learning Memories

**Learning Memories** is the bridge between the digital academy and real life.
An adult—or a child through a parent-approved capture flow—can add a field trip,
experiment, book conversation, performance, build, nature discovery, cooking
project, or other off-platform learning experience.

Each memory can include:

- a required experience date, separately recorded from upload time;
- title and short account in the child’s or adult’s words;
- one or more learners and subject/concept tags;
- photos, drawings, audio, short video, scans, or documents;
- an optional child reflection, adult observation, and follow-up question;
- source or location as optional parent-controlled text; and
- links to outcomes only when an adult has enough evidence to make that link.

Original media is preserved in the family archive; lightweight derivatives and
thumbnails serve the interface. Public or portfolio exports remove embedded
location metadata by default. A memory can be starred into a portfolio and can
support a human-reviewed mastery assertion, but an upload alone does not
automatically prove mastery.

The feature lives in **Create → Memories** for a child and has a fuller parent
view under **Learning Memories**. The child home and world map do not gain new
persistent navigation. A small contextual invitation—such as “Save what you
discovered?”—appears only after relevant offline activities or when an adult
starts the capture flow.

---

## 13. Offline operation and updates

The service worker caches a small versioned app shell and explicitly installed
content. It does not indiscriminately cache the whole internet or third-party
video pages.

- Core navigation, profiles, downloaded textbooks, installed lessons, saved
  creations, and backup work offline.
- Network status never blocks a local database write.
- External media has a transcript, summary, or local lesson fallback.
- New app assets install in the background but activate only at a safe
  checkpoint. The child is never refreshed mid-attempt.
- The prior app shell remains until the new shell and database migration pass
  health checks.
- Content packages update independently of application code and old versions
  remain available while evidence refers to them.
- Storage pressure is visible to adults. Replaceable caches are cleared before
  learner artifacts.

Service workers require HTTPS in production; browsers make a secure-context
exception for localhost development.

---

## 14. Backup, restore, and portfolio portability

Backups are a product feature, not an emergency developer tool.

### Family archive

An export is a versioned archive containing:

- a manifest and checksums;
- family and learner records;
- plans, attempts, evidence, mastery, and point ledgers;
- portfolio collections and artifact metadata;
- Learning Memories, irreplaceable artifact blobs, music projects, and drawing
  source documents;
- custom lessons and source/license metadata; and
- app, database, content, and export-format versions.

The archive is encrypted by default. Restore first opens a preview showing
learners, record counts, date range, required space, version compatibility, and
conflicts. Nothing is overwritten until validation succeeds. Restore into a new
household is always available for recovery testing.

### Portfolio exports

Portfolio output is separate from full backup. It creates a human-readable PDF
or web binder plus selected original files. Every item includes learner,
completion date, lesson and outcome, difficulty, support disclosure where
appropriate, learner reflection, adult note, revision history, and source
provenance. It excludes internal security and sync records.

**Starring is the capture action.** On a completed assignment, the child or
adult presses one star. The system immediately creates a dated, immutable
portfolio snapshot in the background—there is no second screenshot question
and no permanent screenshot control crowding the page. A brief confirmation
offers **View** and **Undo**.

The snapshot service asks the active mechanic for its canonical visual state:

- a 3D lab renders one deliberate frame from its saved checkpoint;
- a drawing stores its vector source and a PNG preview;
- music stores notation, loop settings, and an optional short audio preview;
- writing uses a styled page render plus the editable text revision; and
- an ordinary lesson creates a completion card with the relevant answer,
  creation, explanation, and world state.

The snapshot supplements rather than replaces structured evidence. It records
the source attempt, content and mechanic versions, difficulty, completion time,
snapshot time, and checksum. Later changes create a new portfolio revision; they
do not silently alter the starred picture. Learning Memories use the same star
flow.

The parent dashboard reminds the family to verify a backup on a schedule. A
backup that has never been test-restored is shown as unverified.

---

## 15. Future synchronization and hosted scale

The hosted platform begins as a modular API with PostgreSQL, object storage,
CDN delivery for public curriculum assets, and a job runner for exports,
transcoding, package validation, and notifications. It uses the same domain IDs
and schemas as the local client.

### Sync protocol

1. A local transaction saves the record and an outbox operation together.
2. When online and enrolled, the device sends an idempotent operation ID.
3. The server authenticates the adult/device, authorizes the household, and
   records the operation or reports a conflict.
4. The client advances a durable cursor only after acknowledgement.
5. Remote operations enter an inbox, validate, then apply transactionally.

Conflict rules are defined by record type:

- attempts, evidence, artifacts, and ledgers merge by immutable ID;
- settings use revision checks and show meaningful conflicts;
- plans retain both edits until an adult resolves incompatible changes;
- official content is immutable by version; and
- artifact edits create revisions rather than overwriting prior work.

Every hosted row is scoped by household or organization, and authorization is
checked server-side on every request. Object URLs are short-lived. Backups remain
possible even if the hosted service is unavailable.

Microservices are not an initial scale strategy. Database indexes, static asset
delivery, background jobs, read models, and horizontal API instances should be
exhausted before splitting the domain across networks.

---

## 16. Security and child privacy

- Collect the minimum child data needed to teach and document learning.
- Do not require child email, advertising identifiers, precise location,
  contacts, or public profiles.
- Keep secrets and provider keys off the client. Build-time values in JavaScript
  are public.
- Use a restrictive Content Security Policy; bundle executable dependencies;
  avoid `eval`; sanitize authored rich text; and verify package hashes.
- Encrypt sensitive local payloads and archives; use TLS and managed encryption
  for hosted data.
- Separate authentication, authorization, and child profile selection.
- Reauthenticate adults for export, deletion, device enrollment, publishing,
  and privacy changes.
- Log adult administrative actions without creating surveillance of ordinary
  child play.
- Lock dependencies and review licenses and vulnerabilities before releases.
- Define retention, correction, export, and deletion workflows before hosted
  accounts or school use.
- Treat future COPPA, FERPA, Florida student-privacy, accessibility, and school
  procurement review as requirements to be mapped with qualified counsel—not as
  claims inferred from technical features.

No analytics, crash reporter, video embed, speech service, or AI service receives
child content by default. Diagnostics are local first; any remote telemetry is
adult opt-in, minimized, disclosed, and stripped of lesson responses and
artifact content.

---

## 17. Resilience and failure behavior

| Failure | Required behavior |
|---|---|
| Browser closes mid-lesson | Resume from the last transactional checkpoint |
| WebGL context is lost | Pause, preserve state, rebuild scene, offer accessible fallback |
| Network disappears | Continue locally; queue optional sync without warnings to the child |
| Media source fails | Use transcript, local explanation, or alternate resource |
| Storage is nearly full | Alert parent; remove replaceable caches before artifacts |
| Database migration fails | Reopen recovery mode with untouched snapshot |
| Content package is corrupt | Quarantine it; retain the prior valid version |
| Sync sends twice | Idempotent operation produces one result |
| Two devices edit an artifact | Preserve both revisions and request adult merge if needed |
| App code crashes | Error boundary records local diagnostics and returns to safe checkpoint |
| Hosted service closes | Local app, archives, and exported portfolio remain usable |

Recovery paths are tested. “We have backups” is not accepted until restore has
been exercised against representative family archives.

---

## 18. Navigation and interface performance

- Every durable destination has a route and a useful title.
- Child navigation stays stable across subjects and age worlds; each world
  changes geography, art, information density, and game families without
  changing the meaning of Home, Worlds, Create, and Me.
- Parent pages use plain labels and progressive disclosure. Standards codes and
  diagnostic detail are available without dominating the overview.
- Resume cards say what will happen next, estimated active time, and whether
  sound, reading, materials, or adult help are needed.
- Unsaved creative work autosaves and visibly confirms the checkpoint.
- Modal dialogs are reserved for short decisions, not full lessons or reports.
- Lists virtualize only when necessary; pagination and search operate through
  database indexes rather than loading the entire family history.
- Initial child shell, mission transition, and input-response budgets are
  measured on a representative low-power device, not only a developer laptop.

---

## 19. Future community and mod boundary

Community and creator packages are a disabled module until identity, moderation,
privacy, and governance requirements are ready. The learning app must not need
community services to function.

- Publishing is adult-mediated; learners use pseudonymous display identities.
- Communication uses bounded reactions, showcases, and structured prompts—not
  follower counts, feeds optimized for attention, advertising, or direct
  messages.
- Community packages contain declarative content and approved mechanics, never
  arbitrary scripts.
- Packages are scanned, schema-checked, permission-declared, versioned, reviewed,
  and revocable.
- Community lessons cannot issue official credit directly. They may create
  evidence that a parent, educator, or approved rule reviews.
- The official catalog, family library, and community workshop remain visually
  and technically distinct.

---

## 20. Proposed source layout

```text
src/
  app/                 boot, routes, dependency wiring, error boundaries
  child/               child shell, world, mission, create, avatar
  worlds/              shared shell contract plus wonder, guild,
                       constellation, and conversation packages
  parent/              dashboard, plans, evidence, portfolio, data, settings
  studio/              authoring and validation (later)
  domain/              pure models, policies, events, scoring, progression
  application/         use cases and orchestration
  content/             schemas, package loader, registry, migrations
  data/
    ports/             repository and blob interfaces
    indexeddb/         Dexie schema, migrations, local repositories
    sync/              outbox, inbox, conflict rules (later)
  labs/
    runtime/           lab host, input, checkpoints, resource tracking
    three/             renderer adapter and shared Three.js utilities
    mechanics/         phonics, math, science, notation, drawing, Spanish
  media/               audio, narration, captions, resource resolver
  memories/            off-platform capture, media derivatives, dated journal
  portfolio/           star workflow, snapshots, binder and exports
  security/            local vault, sessions, authorization policies
  service-worker/      offline shell, content cache, update coordination
  ui/                  accessible shared components and design tokens
  observability/       local diagnostics and health checks
content/               versioned official curriculum packages
public/                static install assets and fallbacks
tests/                 fixtures, migrations, journeys, accessibility, restore
```

Feature folders may import domain contracts and shared UI. They do not reach
into another feature’s database implementation.

---

## 21. Quality gates

A release is not ready unless it passes:

- schema and content-package validation;
- unit tests for domain policies, difficulty, points, and evidence rules;
- database migration tests from every supported version;
- backup round-trip and corruption tests;
- starred-work snapshot tests for DOM, drawing, music, and Three.js activities;
- Learning Memories date, media, privacy-metadata, and archive tests;
- child and parent authorization journey tests;
- offline start, pause, resume, and update tests;
- keyboard, screen-reader, captions, contrast, reduced-motion, and zoom checks;
- WebGL lifecycle and resource-budget tests;
- low-power device performance smoke tests;
- license and attribution validation for assets and media; and
- portfolio provenance and date verification.

Academic evidence rules receive the same review discipline as code. A mechanic
cannot ship merely because it is enjoyable; it must also state what it measures,
what could confound that measurement, and what evidence it records.

---

## 22. Delivery sequence

### Foundation 0 — freeze and prove the prototype

- preserve a tagged copy and sample family backup;
- document current fields and behavior;
- create parity journeys for profiles, lessons, beats, logs, and portfolios.

### Foundation 1 — application shell

- add TypeScript, Vite, React routing, strict validation, and tests;
- create distinct child and parent shells;
- bundle and pin dependencies while preserving the current visual prototype.

### Foundation 2 — durable local records

- add IndexedDB repositories and migrations;
- import `starbound-state` and JSON backups;
- implement the attempt → evidence → mastery → points pipeline;
- ship encrypted, validated archive export and restore preview.

### Foundation 3 — lesson and lab runtime

- validate content packages;
- introduce the `LearningLab` contract, checkpoints, resource tracker, and
  accessible fallbacks;
- migrate one complete phonics lesson first, then one lesson per subject.

### Foundation 4 — parent controls and portfolio

- add household unlock and route authorization;
- build learning plan, evidence inspector, starred-work binder, and dated export;
- add backup health and storage management.

### Foundation 5 — installable offline app

- add service-worker update safety, downloadable content, offline tests, and
  performance tiers.

### Later — hosted sync, institutions, and community

- introduce adult hosted identity and device enrollment;
- add sync through existing repositories and conflict policies;
- validate school/organization requirements before institutional roles;
- add community and mod systems only after their separate safety gates pass.

Each foundation ends with a usable local product. Hosted work never blocks the
family version.

---

## 23. Architecture decisions that remain open

These choices should wait for evidence rather than block the local foundation:

- hosted cloud and database provider;
- whether encrypted local search needs a specialized index;
- exact natural-voice recording and narration production workflow;
- school information system and single-sign-on integrations;
- institutional tenancy and educator-review roles;
- AI model location, consent, data boundary, and evaluation requirements;
- marketplace payment model, if a creator marketplace is ever appropriate; and
- WebGPU adoption based on device support and measurable educational benefit.

An architecture decision record should be added when each choice is made,
including alternatives, consequences, owner, date, and conditions for reversal.

---

## 24. Definition of a successful foundation

The first architecture milestone is successful when Robby or Tommy can open the
app offline, choose a profile, complete and resume a versioned lesson, save a
creation, and see points awarded from inspectable evidence; when an adult can
unlock a separate parent area, understand what happened, star the dated work,
export a readable portfolio, create an encrypted backup, and restore it into a
fresh browser; and when changing or losing a Three.js scene cannot lose the
learning record.

That is the durable spine. Richer worlds, adaptive difficulty, AI, community,
and institutional scale can then grow around it without owning it.

---

## 25. Technical references

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
  — structured client storage, indexes, asynchronous transactions, and blobs.
- [MDN: Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
  — passkeys, public-key authentication, relying parties, and secure contexts.
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
  — offline request control, lifecycle, caching, and HTTPS requirements.
- [Three.js: Cleanup](https://threejs.org/manual/pages/cleanup.html) and
  [How to dispose of objects](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)
  — explicit GPU resource ownership and disposal.
- [Three.js: WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer)
  — renderer lifecycle, WebGL2 context, diagnostics, disposal, and context
  recovery hooks.

