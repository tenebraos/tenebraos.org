# QA Report — TenebraOS Website Redesign + Deployment

QA pass on `/home/ameona/Projects/TenebraOS/website/` (site in `dist/`, infra at root).
Date: 2026-06-10. Tooling: build.sh, python3 (parsers, WCAG math, PNG pixel scan),
headless Firefox (fresh profile, `ui.prefersReducedMotion=1`), `fish -n`, `gh`.
All checks re-verified independently — no agent self-reports trusted.

## Carry-over checks (previous build standards)

| Check | Result | Notes |
|---|---|---|
| build.sh from website/ root | Pass | `RESULT: PASS (0 failures, 20 warnings)` — warnings are all TODO HTML comments (allowed) |
| No horizontal scroll 375/768/1280/1920, all 3 pages | Pass | 12 full-height (7000px) screenshots; image width == viewport width at every size; pixel scan of rightmost 2 columns found 0 non-background pixels on all 12 shots |
| Nav consistent on all 3 pages | Pass | Identical header markup (brand, checkbox-hack hamburger, 3 links) on all pages |
| Footer consistent on all 3 pages | Pass | Identical 3-column footer; index.html additionally carries the AI transparency line (intentional, homepage-only per spec) |
| Active page marked with aria-current | Pass | `aria-current="page"` on Home (index), Keybinds (keybinds), Docs (docs); styled (amber underline) and visually confirmed in screenshots |
| "Download ISO" above the fold at 1280×800 | Pass | Screenshot with reduced-motion forced: hero fully rendered, Download ISO button at ~y345–407 of 800 — comfortably above the fold |
| img/svg alt/aria treatment | Pass | Only `<img>` is the nav logo, `alt=""` (decorative, brand text adjacent) on all 3 pages; no inline `<svg>` in HTML |
| Injected icons aria-hidden | Pass | `<span data-icon>` placeholders are `aria-hidden="true"` in markup; icons.js re-sets it defensively and every SVG carries `aria-hidden="true" focusable="false"` |
| Static keybinds table matches js/keybinds-data.js | Pass | Programmatic HTML-parser comparison: 36 rows both sides, 7 categories, every row matches on bind + description + category + data-* attributes, same order. Pills cover all 7 categories + All |
| Docs sidebar anchors resolve (incl. wallpaper-engine, notes-apps) | Pass | All 25 `#` hrefs in docs.html resolve to existing ids, including new `#wallpaper-engine` and `#notes-apps`; no missing targets on index/keybinds |
| Internal links between pages resolve | Pass | Zero broken local hrefs on all 3 pages (css/js/assets/pages all exist) |
| No inline `<script>` or `style=""` (CSP) | Pass | 0 inline scripts, 0 style attributes, 0 on*= handlers in all HTML; icons.js injects SVG with presentation attributes only (the lone `style=` grep hit is a code comment); no `.style.` usage in any JS file |
| Focus-visible styles present | Pass | Global `:focus-visible` amber outline; specific rules for kb-search, kb-row, nav-toggle label, skip-link |
| Search input labeled | Pass | `<label for="kb-search">Search keybinds</label>` |
| Tab order logical | Pass | Source-order review: skip-link → nav (toggle, links) → main content → footer; no positive tabindex anywhere; rows get `tabindex="0"` in DOM order |
| Reduced-motion fully neutralized | Pass | motion.css `@media (prefers-reduced-motion: reduce)` zeroes all three duration tokens and sets `.hero-enter { animation: none; opacity: 1 }`; every transition/animation in styles.css composes `var(--dur-*)` (verified by grep — no hard-coded durations); `scroll-behavior: auto` under reduced motion |
| No lorem ipsum / stray placeholders | Pass | Zero "lorem" hits; all TODOs are HTML comments; screenshot SVG placeholder is explicitly labeled inside an SVG comment |

## Design system checks

| Check | Result | Notes |
|---|---|---|
| Tokens match spec | Pass | `--bg-base #080810`, `--bg-surface #0F0F1A`, `--border-panel #1E1E2E`, `--accent #D4860A`, `--text-primary #E8E8F0`, `--text-secondary #8888A8` — all exact |
| Contrast — recomputed (WCAG 2.1) | Pass | My computations: #D4860A on #080810 = **6.85:1**, on #0F0F1A = **6.54:1**; #E8E8F0 = 16.37:1 / 15.62:1; #8888A8 = 5.83:1 / 5.56:1; #C4B5A0 on #0B0B14 = 9.76:1; bg-base on accent (button) = 6.85:1. Everything used as text clears 4.5:1, so the shipped #D4860A is correct — the #E09520 lightening fallback (8.07:1) was not needed. The in-file precomputed comments match my numbers (one trivial discrepancy: comment says accent-on-raised 6.21:1; accent on **surface** is 6.54:1 — both pass, comment refers to raised #151522, which checks out) |
| Eyebrow signature on all 3 pages | Pass | `.eyebrow` rule: `border-left: 2px solid var(--accent)`, mono uppercase amber. Usage: index ×4, keybinds ×1 (+page header), docs ×12. Visually confirmed in screenshots on all three pages |
| Cards: 1px border, 8px radius, no shadow, hover→accent | Pass | `.card { border: 1px solid var(--border-panel); border-radius: var(--r-md /*8px*/) }`, hover → `--accent-glow`; **zero** `box-shadow` declarations anywhere in dist/css; shadow tokens explicitly `none` |
| Fonts with display=swap on all pages | Pass | Identical Google Fonts link (Geist, Geist Mono, Inter + Space Grotesk fallback) with `display=swap` on all 3 pages; preconnect to both fonts hosts |

## Content checks (factual corrections)

| Check | Result | Notes |
|---|---|---|
| Wallpaper Engine feature card | Pass | "Steam comes pre-installed. To use Wallpaper Engine, own and install it through Steam…" — purchase/ownership requirement stated; no "out of the box" anywhere in dist/ (grep = 0 hits); never implies WE is free or pre-installed |
| Notes feature card | Pass | Card titled "Notes — Pre-installed"; mentions both Joplin and Obsidian, local-by-default |
| docs.html Wallpaper Engine section | Pass | Section after Configuration (sidebar item 04, directly following 03 Configuration); 4-step Steam guide (launch Steam → purchase → install via Library → launch) plus `.callout-link` bordered callout stating paid app ~$3.99 USD |
| docs.html Notes Apps section | Pass | Joplin and Obsidian both "ship pre-installed"; zero AUR/Flatpak language anywhere near notes (grep = 0 hits) |
| Noctalia callout box | Pass | `.callout-link` bordered panel (1px border + 2px amber left rule), link to https://docs.noctalia.dev with `target="_blank" rel="noopener noreferrer"` and visually-hidden "(opens in a new tab)" |
| Omarchy language | **Fail — MINOR** (PM to adjudicate) | Full inventory of every mention: ① dist/index.html:190 — "The installer **draws from Omarchy's approach**, but TenebraOS is its own distro…" → approved pattern. ② dist/docs.html:470 — "TenebraOS's installer **is based on Omarchy's installer**. The distribution itself is independent." → approved pattern. ③ **README.md:102–103 — "…stands on: Omarchy (the installer is a fork of the Omarchy installer; the distro borrows ideas but is independent)"** → NOT an approved pattern ("fork of the Omarchy installer" ≈ forbidden "fork of Omarchy" phrasing, even though scoped to the installer). ④ CHANGELOG.md:70–71 — "the INSTALLER is forked from Omarchy" → literal "forked from Omarchy" hit, but CHANGELOG.md was outside the specified grep scope (dist/*.html, js/*.js, README.md); listed for completeness. js/*.js: zero hits. Shipped site pages (dist/) are clean; violations are repo-docs only |
| Download/verify commands | Pass | Real `sha256sum -c tenebra-1.0.0-x86_64.iso.sha256` and `gpg --verify tenebra-1.0.0-x86_64.iso.asc tenebra-1.0.0-x86_64.iso` on both index (verify accordion) and docs; fingerprint `12EB EDBE CF16 FEBA 7793 CF1D 6126 981E 362E 2446` present on both pages and matches release-config (spaces stripped) |
| AI transparency line in homepage footer | Pass | "Transparency: AI (Claude — Opus & Fable) was utilized in the development of this build…" in index.html footer-bottom |
| icons.js validity + cross-check | Pass | 12 icons, every one parses as valid XML (python3 xml.etree), viewBox="0 0 32 32", `stroke="currentColor"`, no fills, no style attributes. Both directions: all 11 `data-icon` names used in HTML exist in the map; 1 map entry (`download`) is unused — harmless dead weight, noted informationally |

## Infra checks

| Check | Result | Notes |
|---|---|---|
| GitHub license gpl-3.0 | Pass | `gh repo view tenebraos/tenebra-iso --json licenseInfo` → `"key":"gpl-3.0"` (GNU GPLv3) |
| wrangler.toml | Pass | Present at root with `pages_build_output_dir = "dist"`, name `tenebraos-site` |
| dist/_redirects rules | Pass (with note) | `/keybinds` and `/docs` 200-rewrites present; `/download → /index.html#download 200` present. Note: in a 200 rewrite the `#download` fragment is server-side-meaningless — visitors to /download get the homepage top, not the download section. Works, but a 301 would honor the fragment. MINOR, flagged for awareness only |
| dist/_headers unchanged | Pass | `git diff --stat dist/_headers` is empty (file staged `A`, no worktree modification). Caveat: the repo has **zero commits** (branch main unborn), so the baseline is the git index, not a commit — content manually verified to match the hardened version (full CSP incl. cdnjs script-src for highlight.js, XFO DENY, nosniff, Referrer-Policy, Permissions-Policy) |
| release-config.json | Pass | Valid JSON; `sha256` `1082dd4a…93d640` exactly matches `~/Projects/TenebraOS/tenebra-iso/release/tenebra-1.0.0-x86_64.iso.sha256`; same hash in index.html (full in download section, prefix in hero meta); fingerprint matches site pages |
| upload-release.fish: executable + syntax | Pass | `-rwxr-xr-x`; `fish -n` clean |
| upload-release.fish: bogus version 9.9.9 | Pass | Exit 1 with clear error: "ISO not found: …/tenebra-9.9.9-x86_64.iso — build the release ISO first" |
| upload-release.fish: 1.0.0 run | Pass | Passes artifact preflight (ISO + .asc + .sha256 all found), then stops at wrangler check, exit 1, "wrangler not found on PATH" with install instructions referencing PENDING-R2.md; **nothing uploaded** (wrangler genuinely not installed — verified) |
| R2 bucket / public URL / test upload | NotTestable | **pending-user-auth** — wrangler not installed and `wrangler login` needs the user's browser. Steps fully documented in PENDING-R2.md (install → login → bucket create → public access → smoke test → custom domain → real upload). Not a failure |

## Failures summary

| # | Severity | Finding |
|---|---|---|
| 1 | MINOR | README.md:102–103 Omarchy lineage sentence uses "the installer is a fork of the Omarchy installer" instead of the approved "installer is based on Omarchy's installer" pattern. (CHANGELOG.md:70 has a literal "forked from Omarchy" but is outside the specified grep scope.) Shipped site pages (dist/) use only approved phrasing. One-line fix in README; PM to adjudicate whether installer-scoped "fork" wording is acceptable. Not user-facing on the deployed site, hence MINOR rather than BLOCK. |

Informational (no severity): unused `download` entry in the icons.js map; `/download` 200-rewrite fragment won't scroll to the section; repo has no commits yet so the `_headers` diff baseline is the index; `git status` shows untracked infra files (PENDING-R2.md, icons.js, release-config.json, scripts/, wrangler.toml) — commit before deploy.

## Verdict

**SHIP — with one MINOR fix.** The deployed artifact (dist/) is clean across all
carry-over, design-system, content, and accessibility checks: zero regressions,
contrast independently recomputed and passing (shipped #D4860A is correct, no
lightening needed), keybinds table in exact parity with its data file, all factual
corrections (Wallpaper Engine paid/Steam, Notes pre-installed, Noctalia callout)
verified in place, CSP-clean markup, no horizontal scroll at any tested width.
The single failure is repo-documentation Omarchy phrasing in README.md (plus an
out-of-scope CHANGELOG hit) — one-sentence fix, does not block the site deploy.
R2 items remain pending-user-auth per PENDING-R2.md.
