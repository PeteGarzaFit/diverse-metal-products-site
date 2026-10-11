# Diverse Metal Products — scroll-craft brief

## 1. Vibe
**User's words:** "Precision industrial" (chosen from offered options).
Dark steel, sparks, blueprint-grid overlays, machined edges catching light.
Feels exacting and high-tech, like watching a CNC machine work.

## 2. The scroll journey (in sequence)
Authored from the user's framing ("show the laser cutting using a TruLaser
1030, and the metal stamping process, elaborate on their existing services")
plus the real content pulled from diversemetalproducts.com/services.html and
/industries.html:

1. **Recognition** — every part starts as a flat sheet and a print
2. **Tension** — the stakes: tight tolerances, ISO 9001:2015, industries that
   cannot afford a bad part (oil & gas, defense/DOD)
3. **Turn (peak)** — laser cutting: the TruLaser 1030 traces and cuts the part
4. **Substance** — metal stamping: progressive, deep-drawn, fine-blanking dies
   forming the cut blank into a 3D part
5. **Range** — industries served, each with the real part DMP makes for it
6. **Trust** — value-added finishing (paint, grind, plate) + ISO compliance
7. **Commitment** — request a quote

## 3. Energy curve
Calm/technical open -> rising stakes -> sharp peak (laser cut) -> confident
settle (stamping) -> broad/open (industries) -> quiet/reassuring (finishing)
-> resolved close (quote).

## 4. Feeling curve (one line per act, emotion then cause)
```
1  Recognition   a flat steel sheet and a print, dimension lines drawn in, held still and quiet
2  Unease         the cost of a part that's wrong named plainly: DFARS specs, shale-shaker screens, ISO 9001:2015
3  Awe (PEAK)     the TruLaser 1030's cutting head traces a real path and the part falls out of the sheet, cut by the reader's own scroll
4  Confidence     a press descends in three dies and the flat cut blank becomes a dimensional stamped part
5  Breadth        the same process, nine different industries, each with its own real part
6  Reassurance    finishing and the compliance certificate, quiet and administrative
7  Resolve        the finished part at rest, one line, one way to reach them
```

## 5. The peak
**Sentence a visitor would say to a friend:** "the laser actually cut the
part open while I was scrolling, I watched the metal get traced and the
piece just dropped out."
Lives in Act 3. Gets the largest span, the quiet act (2) before it, and the
whole asset budget for this page (the hand-built SVG technical illustration
and the signature interaction).

## 6. Tell-someone sentence
"It's the site where you scroll and the laser actually cuts the metal open
in front of you, line by line, until the part falls free."

## 7. Range / aesthetic family
**Authored decision:** Technical/industrial, closer to **dense +
architectural** than premium-minimal softness — this is a B2B manufacturing
shop, not a lifestyle brand. One accent (a hot laser-cut orange/amber), near
black canvas, ink-on-paper technical-drawing panels where the illustrated
world appears. Not brutalist (DMP's own copy is warm and client-facing, not
anti-marketing), not maximalist (a 36-year-old Houston metal shop, not a
culture brand).

## 8. World
**Authored decision, driven by an asset constraint:** no real photography
exists for DMP (their live site uses generic stock Creative-Commons photos,
not their own shop), and the user explicitly ruled out spending on
AI-generated photoreal imagery this round. So the world is **world 8,
Technical drawing** from worlds.md: ink-weight line art, patent-drawing /
exploded-assembly style, dimension lines and leader callouts, on a warm
paper ground where it appears, set against a near-black canvas elsewhere.
This is the one non-photographic world the skill treats as premium rather
than cheap, and it is the natural home for the laser-cut signature move
("a line drawing that builds itself," specifically called out in
uniqueness.md §3 as pairing with this world).

Style preamble, reused verbatim for every hand-drawn SVG scene:
> Precise technical illustration in the style of a patent drawing or exploded
> assembly diagram. Fine consistent line weight (1.5-2px), no fills except
> flat spot color for the cut/formed part, ink on a warm paper ground where
> paper is the ground, dimension lines and leader callouts in the same
> line weight. Orthographic or isometric projection. Restrained, engineered,
> no shading, no gradients, no photographic render.

## 9. Structure: one world, or distinct scenes?
**User's words:** "one continuous world" — scroll flies through one factory
journey, raw sheet to shipped part.

**Authored adjustment, disclosed:** literal worldflight mode (SKILL.md /
worldflight.md) is built from crossfading video legs. This build has no
video (no photography, no paid AI generation this round), so true worldflight
is not available. The continuous-journey *feeling* is built instead with the
**filmic one-shot** grammar: `drift` carries one continuous ground across
every act (no hard section-colour cuts), the technical-drawing canvas and its
dimension-line motif persist across acts rather than resetting per section,
and the same cut part physically carries forward from the laser-cut act into
the stamping act. This is disclosed explicitly in the build report.

## 10. Signature move
**Live laser-cut reveal.** A hand-drawn SVG technical illustration of a real
DMP part (a shaker-screen backing plate) sits on the stage. A laser-path line,
labelled "TruLaser 1030 - fiber laser," is drawn with `stroke-dasharray` /
`stroke-dashoffset` driven directly from the act's `--sc-p`. As the reader
scrolls, the path actually draws itself across the plate, a bright kerf line
burns behind the laser head position, and once the path closes, the cut
piece's fill drops down and separates from the sheet along a short
scroll-driven offset, with a dimension callout annotating the real tolerance
DMP quotes. Nothing autoplays; the cut exists only at the scroll position
that drew it. No prior scroll-craft build in this workspace uses this device
(registry starts empty for this workspace).

## 11. What DMP already has
Only a generic Weebly logo and stock Creative-Commons photography on the live
site (industries.html credits Flickr Creative Commons photographers), no
usable real photography or video of their own shop, machines or parts, and
no brand kit. Real copy exists and is reused: full services and industries
text pulled from diversemetalproducts.com (see services.html, industries.html),
address (6614 Dixie Dr, Houston, TX 77087), phone (713-637-4187), ISO
9001:2015 compliance claim and certificate link.

## Authored silence
The act before the peak (Act 2, Tension) is deliberately quiet: plain type
over a held, static technical-drawing ground, no motion beyond cue fades, so
the laser actually starting in Act 3 has something to be a change from.

## Decision log
- Vibe, structure choice, signature-move seed, and "generate nothing /
  build with code instead of AI imagery" were answered directly by the user.
- Journey beats, feeling curve, peak sentence, aesthetic family extremity, and
  world choice are authored decisions, made necessary by the asset
  constraint above and recorded here rather than asked as a second interview
  round, per the user's pattern of picking the recommended option each time.
- **Mid-build correction, user's words: "white site not black."** The first
  pass built the technical-drawing world as dark-canvas-with-paper-insets
  (paper only inside the laser/stamp panels). That was a misreading of the
  world itself: worlds.md describes world 8 as "ink on warm paper ground,"
  i.e. the canvas IS the paper. Flipped the whole page to a light theme:
  warm paper canvas (`#EDE7D9`), dark ink text, a cool steel tone reserved
  for the literal sheet-metal panels (laser plate, stamp figure) so material
  and print read as two different things, and the laser-orange accent kept
  as the one accent colour throughout (and darkened to `--sc-accent-text`
  for small text, since the full-brightness accent did not clear 4.5:1 on
  paper). Re-measured contrast on body text, cards, both CTA treatments and
  the small accent-coloured labels after the flip; all now clear 4.5:1 (see
  report). This is strictly a better execution of the SAME world decision,
  not a new one.
