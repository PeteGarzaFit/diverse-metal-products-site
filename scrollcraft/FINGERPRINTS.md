# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| dmp-factory (Diverse Metal Products) | Filmic one-shot, no video (scrub swapped for pin + bespoke SVG everywhere a camera move would normally go, since the brief ruled out AI image/video generation) | Fixed minimal bar: wordmark + 3-item scrollspy rail + one CTA | `pin`, layered SVG/CSS parallax (grid + sheet + leader planes), kinetic greet headline, no video | 7 acts / 2 plain-flow: pin -> flow-in -> pin(peak) -> flow+reveal -> pan -> flow-in -> pin(close), ~14.2 total vh-equivalents | Pinned spotlight + magnetic CTA, resolves on a held statement + footer inside the stage | Live laser-cut reveal: SVG kerf path drawn live from the peak act's own `--sc-p` via `getPointAtLength`, laser head walks the exact path, cut piece drops free once the path closes | World 8, technical drawing (ink on warm paper), light canvas throughout, not dark | 5179 |

*(empty: your first build has nothing to clear, so build whatever the interview
points at. From the second onwards, this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **dmp-factory** claims: filmic one-shot built entirely without video (every
  camera-move beat done as pin + bespoke SVG/CSS instead); the technical-
  drawing world as a full light canvas (not dark-with-paper-insets); and the
  "line drawing that builds itself" signature move, specifically a laser kerf
  path walked by `getPointAtLength` off the peak act's own `--sc-p`. A later
  build should avoid reusing the ink-on-paper-canvas treatment and this exact
  draw-the-path mechanism.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
