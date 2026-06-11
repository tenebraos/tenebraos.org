# TenebraOS — Design Rationale

UX engineer · tokens in `dist/css/design-tokens.css`, motion in `dist/css/motion.css`

## Accent: amber phosphor — `#FFB000`

The brief asked for heat or precision. Amber is both, and it has lineage on
each side of the "motorsport telemetry meets terminal glass" axis: it is the
phosphor color of amber CRT terminals *and* the color of sector flags, brake
glow, and warning telemetry on a pit wall. Against the near-black base
(`--bg-base: #0A0A0F`) it reads as instrumentation, not decoration — and it
sidesteps every cliché the brief banned (no green, no cyan, no purple-navy).

Contrast is computed, not eyeballed (WCAG relative luminance):

| Pair | Ratio |
|---|---|
| `--text-primary #E8EAED` on base | **16.39:1** |
| `--text-secondary #9BA3AF` on base | **7.76:1** |
| `--accent #FFB000` on base | **10.78:1** (9.40:1 on raised) |
| `--accent-dim #C28A00` on base | **6.52:1** |
| `--danger #FF5C5C` on base | **6.52:1** |
| `--text-muted #5C6470` on base | 3.30:1 — **decorative only**, never content |

Even the dim variant stays text-safe, so a frontend misuse can't create an
accessibility failure. `--accent-glow` is an rgba for box-shadows only.
Discipline rule: amber appears as *signal* — links, active nav, the download
CTA, kbd chips, the signature rule. Everything else is grayscale.

## Type pairing

- **Space Grotesk** (display) — a grotesque with machined, slightly aggressive
  letterforms; its quirky terminals keep the hero from reading as generic
  dev-dark-mode. Weights 500/700 only.
- **IBM Plex Sans** (body) — engineered for screens and documentation, neutral
  enough to disappear under Grotesk, and tonally "industrial spec sheet,"
  which suits an opinionated distro.
- **JetBrains Mono** (mono) — code blocks, keybind chips, and all signature
  labels. The mono face doing labels is what makes the chrome feel like a
  terminal rather than a marketing site.

Exact Google Fonts URL is documented in the header comment of
`design-tokens.css` for copy-paste.

## Signature element: `.sig-rule` — the sector marker

One element carries the identity across all three pages: a **2px solid amber
tick** (with a faint glow), a **mono uppercase label**, and a **dashed
hairline** running to the container edge — a telemetry sector flag on a track
line. It replaces every plain section heading rule on index, keybinds, and
docs, so the motif repeats wherever the eye rests between sections.

Pure CSS, zero extra markup: `<h2 class="sig-rule">Why TenebraOS</h2>`.
Implementation ships as a utility class at the bottom of `design-tokens.css`
with a usage comment (flex + `::before` tick + `::after` repeating-gradient
dash).

## Supporting decisions

Radii are near-sharp (2px/6px) — telemetry hardware, not SaaS cards. Shadows
skip gray blur (invisible on `#0A0A0F`) in favor of a 1px light edge ring, a
hard dark drop, and a trace of amber glow at level 2. The hero animation is a
staggered terminal type-in (≤660ms total) ending in a blinking block caret;
`prefers-reduced-motion` zeroes every duration token and statically reveals
the hero.
