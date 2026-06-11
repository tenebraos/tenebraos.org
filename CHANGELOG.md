# CHANGELOG — TenebraOS Website

## 1.0.0 — 2026-06-10 (initial build)

Multi-agent build: PM (coordination, spec, sign-off), UX engineer (design system),
backend dev (data + deploy config), frontend dev (pages), QA (test suite).
QA verdict: **SHIP — 28 pass / 0 fail / 1 not-testable.** PM sign-off granted.

### Built

- **Design system** — amber phosphor accent `#FFB000` on near-black `#0A0A0F`
  (all text/accent contrast ≥ 4.5:1, independently recomputed by QA);
  Space Grotesk / IBM Plex Sans / JetBrains Mono; signature element `.sig-rule`
  ("sector marker": glowing amber tick + mono label + dashed track-line) on all
  pages; staggered terminal type-in hero animation (<1s, landing only);
  full `prefers-reduced-motion` kill.
- **index.html** — hero with dominant 1.0.0 download CTA, 4 "Why TenebraOS"
  panels, 11-item features grid, "Built for who?", download section with SHA256
  placeholder, shared nav/footer.
- **keybinds.html** — 36 binds / 7 categories, static table pre-rendered from
  `js/keybinds-data.js` (works JS-free; parser-verified in exact sync), live
  search + category pills (combinable), match highlighting, keyboard navigation,
  Enter/button copy-to-clipboard with aria-live feedback.
- **docs.html** — 8 sections of real technical content (Getting Started,
  Installation, Configuration, Custom Repository, Noctalia Shell [external link],
  Security, Troubleshooting, Contributing), sticky sidebar with IntersectionObserver
  scrollspy, token-matched local highlight.js theme (script from cdnjs).
- **Deploy config** — `_headers` (XFO, nosniff, Referrer-Policy,
  Permissions-Policy, CSP with **no `unsafe-inline` anywhere**),
  `_redirects` (clean `/keybinds`, `/docs`), `build.sh` validation gate
  (sh/fish-compatible; link checker, lorem-ipsum guard, TODO lister), README.

### Decisions of record

- Docs content = hand-maintained semantic HTML (markdown pipeline rejected:
  zero-dependency constraint, no PM-approved Node tooling).
- CSP-driven deviations approved: hero stagger via `.stagger-N` utility classes
  (inline styles forbidden); highlight.js *theme* implemented locally in
  styles.css with tokens (cdnjs stylesheets not in style-src; script still CDN).
- Internal links use `.html`-suffixed relative paths so local `file://` dev works;
  Cloudflare's `_redirects` provides the clean URLs in production.
- Keybinds sourced from the real TenebraOS config (PM-SPEC §6) — real binds
  override the brief's generic seeds (e.g. Super+T terminal, Super+W close,
  Super+RMB drag-resize).

### Deferred (minor polish, non-blocking)

1. `aria-expanded` sits on the nav checkbox input — unsupported ARIA pairing;
   move state announcement to the label or drop it.
2. Search match highlighting doesn't render inside `<kbd>` chips for queries
   spanning key segments (filtering correct; cosmetic only).
3. Manual QA step before deploy: 2-minute DevTools console sweep on all three
   pages (no JS console available in the build environment; indirect evidence
   of clean execution is strong).
4. Replace TODO placeholders: download URL, GitHub URLs, real SHA256, signing-key
   fingerprint URL, "edit this page" URLs, license confirmation, real screenshots
   (current: labeled dark SVG placeholders).

### Deploy

`./build.sh` → upload `dist/` to Cloudflare Pages (or `wrangler pages deploy dist/`).
Target domain: tenebraos.org.

### 1.0.1 — 2026-06-10 (post-review fixes, PM-applied)

- Replaced placeholder logo with the real TenebraOS mark (from fastfetch logo,
  recolored to accent amber #FFB000, transparent PNG) — nav + favicon, all pages.
- Removed "Tokyo Night-leaning" claims: the distro themes dynamically from the
  wallpaper/background colors. Feature renamed to "dynamic theming".
- Corrected lineage: the distro is independent; only the installer is based
  on Omarchy's installer, and the distro borrows ideas from it. Hero, meta
  description, and "Arch with opinions" card updated.

### 1.0.2 — 2026-06-10 (content corrections, PM-applied)

- Docs/Configuration: added "Important" callout — set up monitors.lua first
  (resolution, refresh, scale, position; reload Hyprland after editing).
- Docs/Requirements: storage recommendation 40GB → 128GB (usable system with
  room for packages, snapshots, and data).
- No public repos yet: all "GitHub" links/buttons now point to the docs
  Contributing section ("Source & credits"); Contributing rewritten with a
  Source-availability note and a Credits & lineage list (Omarchy installer
  heritage, Arch, Hyprland, Noctalia, Limine/Snapper/Floorp/LocalSend).
  TODO markers swapped to "repository URL when source is published".
- Homepage footer: AI transparency note — Claude (Opus & Fable) utilized in
  the development of the build and site.
- styles.css: .callout-important and .footer-ai-note (token-only).

### 2.0.0 — 2026-06-10 (redesign + release infra session)

- **Redesign (WS-C):** Fedora-adjacent modular system — palette #D4860A amber
  on #080810 (contrast 6.85:1, QA-recomputed), Geist/Inter/Geist Mono, amber
  2px left-rule eyebrow signature on all pages, 12 purpose-drawn inline SVG
  icons (js/icons.js), rebuilt landing modules (left-aligned hero "Darkness,
  compiled.", WHY tiles, 10-card features grid, BUILT FOR, RELEASE + verify
  accordion), restyled keybinds/docs; new docs sections: Wallpaper Engine
  (Steam pre-installed, WE is a paid app — corrected) and Notes Apps
  (Joplin/Obsidian pre-installed — corrected); Noctalia external callout.
- **License (WS-A):** tenebra-iso relicensed GPL-3.0 (archiso releng-derived
  configs); MIT notice preserved in LICENSE.MIT; GitHub API reports gpl-3.0.
- **Release infra (WS-B):** scripts/upload-release.fish (real artifact names,
  fish-reserved-variable bug fixed), wrangler.toml (dist output),
  /download redirect, release-config.json (real sha256 + fingerprint),
  README Deployment section. R2 bucket/test/custom-domain pending user
  wrangler auth — see PENDING-R2.md.
- Fork-language audit: zero distro-level "fork" claims; installer attribution
  uses the approved "based on Omarchy's installer" form everywhere.
- Known nit (deferred): /download rewrite cannot carry the #download fragment.
- QA: QA-report-redesign.md — SHIP, 1 MINOR (fixed in this entry).

### 2.0.1 — 2026-06-11 (VPS hosting kit)

- deploy/: nginx configs for tenebraos.org (proxied, origin cert, headers +
  clean URLs translated from the Pages files, real /download 302) and
  releases.tenebraos.org (grey-cloud, certbot, autoindex, Range/resume,
  rate-limited ISOs); VPS-SETUP.md runbook (provider/egress guidance, DNS
  proxy split = the CDN cache-cap answer, hardening to distro standards);
  upload-release.fish (rsync + remote sha256 verify; live-tested fail paths).
- release-config.json: host=vps-nginx, R2 fallback dropped.
- PENDING-R2.md marked superseded.
