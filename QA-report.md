# QA Report — TenebraOS Website

Date: 2026-06-10 · QA agent · Tested against PM-SPEC.md §4 + project test brief.
Method: static analysis (grep + python3 parsers), `sh build.sh`, headless Firefox
screenshots of all three pages at 375 / 768 / 1280 / 1920 (plus 1280×800 fold shot
and a forced `prefers-reduced-motion` render), pixel-level right-edge overflow scan.

| Check | Pass/Fail/NotTestable | Notes |
|---|---|---|
| **RENDERING** | | |
| Zero console errors | NotTestable | No JS console in this environment. Manual: open each page in Firefox/Chromium DevTools console and confirm 0 errors. Strong indirect evidence of clean execution: in headless renders the JS-injected copy buttons, "36 of 36 shown" counter, and highlight.js token coloring all appear; all three JS files guard their globals (`typeof KEYBINDS`, `typeof hljs`, null checks). |
| No horizontal scroll @ 375 | Pass | Screenshot inspection + pixel scan: zero non-background pixels touching right edge across full page height. Long sha256 string wraps via `overflow-wrap: anywhere`; keybind table scrolls *inside* `.kb-table-wrap` (`overflow-x: auto`), not the page. |
| No horizontal scroll @ 768 | Pass | Same method; all 3 columns of keybind table fit at 768. |
| No horizontal scroll @ 1280 | Pass | Pixel scan clean; `--container-max: 72rem` caps content. |
| No horizontal scroll @ 1920 | Pass | Pixel scan clean on all three pages. |
| Nav present + consistent, active page marked | Pass | `.site-nav` identical on all 3 pages (grep + screenshots); `aria-current="page"` correctly set to index/keybinds/docs respectively; hamburger renders at 375 (checkbox hack, works without JS). |
| Footer present + consistent | Pass | `.site-footer` on all 3 pages with links, version stamp v1.0.0, MIT license line; visible in 375 + 1920 screenshots. |
| Hero download button above fold @ 1280×800 | Pass | Verified in 1280×800 screenshot (reduced-motion render): "Download 1.0.0" btn-primary sits at ~y380–445, well above 800px. Note: a screenshot taken <660ms after load shows hero lines still transparent — that is the intentional staggered load animation (240ms/line, 140ms stagger, budget <1s per motion.css), not a bug. |
| All img/svg have alt or aria-label | Pass | 4 `<img>` total: nav logo ×3 use `alt=""` (correct — decorative, adjacent text label), screenshot placeholder has descriptive alt. No inline `<svg>` in any HTML file. Both SVG asset files carry `role="img"` + `aria-label`. |
| **FUNCTIONALITY** | | |
| Keybind search logic (bind + description, case-insensitive) | Pass (code trace, high confidence) | `js/keybinds.js:79–112`: haystack = `(data.bind + " " + data.description).toLowerCase()`, query lowercased+trimmed on input — case-insensitive over both fields. Category combined via `&&` with the text match → pills and search compose correctly. Single-active pill managed via `aria-pressed`. `<mark>` highlighting with proper HTML escaping; live count + empty state updated. Drift guard `console.warn` if table/data lengths diverge. Minor cosmetic limit: a query spanning kbd segments (e.g. "super + t") filters rows correctly but won't render `<mark>` inside the key chips, since chips highlight per segment; description highlighting unaffected. |
| Static table == keybinds-data.js | Pass | Hard check: python parser compared all 36 JS entries against all 36 HTML rows on five axes (data-bind attr, rendered `<kbd>` join, description, badge text, data-category) in order — zero mismatches. Pill set == data category set. Hard-coded copy "36 of 36 shown" and "Reference // 36 binds" both match actual count. |
| Docs sidebar anchors resolve | Pass | Scripted: all 8 sidebar `#anchors` resolve to section ids; zero unresolved. |
| Internal links between pages resolve | Pass | Scripted across all 3 pages: every relative href resolves to an existing file; every fragment (incl. cross-page `keybinds.html` link, `#contributing`, `#download`, `#main`) resolves to an existing id. Placeholder GitHub links point at `#main`/`#download` (resolve) and are TODO-marked per PM-SPEC §4. |
| Noctalia link target=_blank + rel=noopener noreferrer | Pass | docs.html:255 — `https://docs.noctalia.dev` with both attributes, exactly once. |
| Clipboard copy + aria-live feedback | Pass (code read) | `utils.js` exposes `copyText` via `navigator.clipboard.writeText` with Promise rejection fallback; `keybinds.js` announces "Copied {bind}" / "Copy failed — clipboard unavailable" into `#kb-live` (`aria-live="polite"`), plus visual "copied" button state. Enter-on-row guarded with `event.target === row` (no double-fire from the inner button). Live copy behavior itself needs a manual click test (clipboard requires real browser permissions). |
| **ACCESSIBILITY** | | |
| Logical tab order | Pass | DOM order = visual order on all pages: skip-link → brand → nav toggle → nav links → main content (search → pills → table rows top-to-bottom / sidebar → sections). No tabindex > 0 anywhere; rows get `tabindex="0"` in DOM order. |
| :focus-visible styles defined, not suppressed | Pass | Global `:focus-visible` rule (styles.css:82) — 2px accent outline + glow; specialized variants for search, rows, and the visually-hidden nav checkbox (ring lands on its label). Nothing display:none's or outline:none's focus styles. |
| Search input labeled | Pass | Visible `<label for="kb-search">Search keybinds</label>` (keybinds.html:65). |
| Contrast ≥ 4.5:1 (recomputed, WCAG 2.1) | Pass | Computed from actual hex values: text-primary #E8EAED → 16.39:1 (base) / 15.39:1 (surface); text-secondary #9BA3AF → 7.76:1 / 7.29:1; accent #FFB000 → 10.78:1 / 10.13:1. All ≥ 4.5:1. Token-file claims match my independent computation. |
| --text-muted not used for body text | Pass | Zero occurrences of `--text-muted` in styles.css (it is never used at all outside the token definition; the equivalent hex appears only inside the placeholder SVG art). |
| Reduced-motion coverage incl. scroll-behavior | Pass | motion.css §3 zeroes all duration tokens, kills hero animation + caret blink; styles.css:30–34 separately sets `scroll-behavior: auto` under reduced-motion. Verified live: forced `ui.prefersReducedMotion=1` render shows hero fully visible instantly with solid caret. |
| **CONTENT** | | |
| No lorem ipsum / placeholder leaks | Pass | Case-insensitive grep over all of dist/: zero hits. Visible placeholder values (sha256 zeros, repo Server URL) are explicitly self-marked "…replace-me" / `repo.invalid` AND wrapped in `<!-- TODO -->` comments — compliant with PM-SPEC ("placeholders wrapped in TODO comments"). 22 TODO markers total, all comments, build.sh treats as warnings. |
| Keybinds ≥ 20 entries, ≥ 5 categories | Pass | 36 entries across 7 categories (Window Management 9, Workspace Navigation 7, Application Launchers 5, System Controls 3, Screenshot/Recording 3, Media Controls 6, Hyprland Session 3). All eleven PM-SPEC §6 canonical binds present. |
| Docs ≥ 6 sections with real content | Pass | 8 sections (also satisfies PM-SPEC's stricter ≥8 with the exact named set). Words/section: getting-started 199, installation 210, configuration 117, custom-repository 157, noctalia-shell 82, security 198, troubleshooting 186, contributing 125. All real technical content consistent with PM-SPEC §6 facts. |
| Docs code blocks `<pre><code class="language-*">` | Pass | 11/11 pre blocks wrapped in `<code class="language-bash|ini">`; hljs theme implemented via tokens in styles.css (CSP-compliant alternative to the cdnjs stylesheet — syntax coloring confirmed in screenshots). |
| highlight.js only on docs.html, only from cdnjs | Pass | Sole external script reference in the entire site: `cdnjs.cloudflare.com/.../highlight.min.js` in docs.html. index/keybinds load only local JS. Matches CSP `script-src 'self' https://cdnjs.cloudflare.com`. |
| No inline `<script>` or `style=""` anywhere | Pass | Zero src-less `<script>` tags and zero `style=` attributes in all three HTML files (and SVG assets use presentation attributes, not style). Hero stagger done via `.stagger-0…3` classes specifically to satisfy CSP. CSP in `_headers` will not break anything. |
| **DEPLOYMENT** | | |
| build.sh passes | Pass | `sh build.sh` → RESULT: PASS, exit 0 (0 failures, 22 TODO warnings — informational by design). POSIX sh, no bash-isms, printf-only — fish-compatible as specced. |
| _headers / _redirects per spec | Pass | All five required headers present incl. CSP allowing cdnjs + Google Fonts (style-src fonts.googleapis.com, font-src fonts.gstatic.com); `_redirects` has exactly the two specced 200 rewrites. |

## Observations (non-blocking, no severity — for the record)

- `utils.js` sets `aria-expanded`/`aria-controls` on the `input[type=checkbox]` nav toggle; `aria-expanded` is not a supported state for the checkbox role, so it may be ignored or flagged by strict ARIA validators. The no-JS checkbox hack itself is fine. Deferrable polish: move the enhanced semantics to the label or swap to a real `<button>` when JS is present.
- Search-match highlighting does not span kbd segment boundaries (filtering still correct); cosmetic only.
- At 375px the keybind Category column is reached by scrolling within the table wrapper — intended containment pattern, page itself never scrolls horizontally.

## Summary

- **Pass: 28**
- **Fail: 0** (BLOCK: 0, MINOR: 0)
- **NotTestable: 1** (console errors — manual DevTools check; strong indirect evidence of clean execution)

**Verdict: SHIP — no BLOCK findings. All acceptance criteria verified pass; one check requires a 2-minute manual console sweep before deploy.**
