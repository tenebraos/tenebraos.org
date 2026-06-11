# TenebraOS Website — PM Spec (build authority)

No file ships without PM sign-off. This document is the single source of truth for
structure, token names, shared components, and acceptance criteria.

## 1. Directory structure (final)

```
website/                      # repo root (not deployed)
├── PM-SPEC.md                # this file
├── README.md                 # backend dev
├── CHANGELOG.md              # PM, at close
├── QA-report.md              # QA agent
├── design-rationale.md       # UX engineer (≤500 words)
├── build.sh                  # backend dev — fish-compatible validation script
└── dist/                     # DEPLOY ROOT for Cloudflare Pages
    ├── index.html            # landing
    ├── keybinds.html         # keybind reference
    ├── docs.html             # documentation
    ├── _headers              # backend dev — security headers
    ├── _redirects            # backend dev — clean URLs
    ├── css/
    │   ├── design-tokens.css # UX engineer ONLY
    │   ├── motion.css        # UX engineer ONLY
    │   └── styles.css        # frontend dev — all component/layout CSS
    ├── js/
    │   ├── utils.js          # frontend dev — shared (nav toggle, clipboard)
    │   ├── keybinds-data.js  # backend dev — DATA ONLY (array of objects)
    │   ├── keybinds.js       # frontend dev — search/filter/keyboard logic
    │   └── docs.js           # frontend dev — scrollspy
    └── assets/
        ├── logo.svg          # frontend dev — placeholder mark
        └── screenshot-*.svg  # frontend dev — labeled SVG placeholders
```

CSS import order in every page: design-tokens.css → motion.css → styles.css.

## 2. Design token contract (UX defines VALUES; these NAMES are fixed)

Colors: `--bg-base`, `--bg-surface`, `--bg-surface-raised`, `--border-panel`,
`--border-panel-strong`, `--text-primary`, `--text-secondary`, `--text-muted`,
`--accent`, `--accent-dim`, `--accent-glow`, `--code-bg`, `--danger`.
Type: `--font-display`, `--font-body`, `--font-mono`; scale `--fs-xs` … `--fs-3xl`
plus `--fs-hero`; `--lh-tight`, `--lh-body`.
Space: `--sp-1` … `--sp-8` (4px base scale). Radius: `--r-sm`, `--r-md`.
Shadow: `--shadow-1`, `--shadow-2`. Breakpoints (documented as comments — CSS vars
can't be used in media queries): 375 / 768 / 1024 / 1280.

Hard requirements from the brief: near-black base in the #0A0A0F range (NOT
purple-navy), ONE accent (not green, not default cyan), display face is NOT
Inter/Roboto, mono for code + keybinds, body text contrast ≥ 4.5:1, accent on
base ≥ 4.5:1 where used as text. One signature element on all three pages, one
hero-only load animation, `prefers-reduced-motion` kills all motion.

## 3. Shared components (frontend implements once in styles.css, reuses)

- `site-nav`: fixed top bar — logo mark, page links (Home / Keybinds / Docs),
  active page indicated, collapses to hamburger < 768px (works without JS via
  checkbox hack or stays expanded; JS enhances).
- `site-footer`: page links, GitHub placeholder, license line, version stamp.
- `btn-primary` (download CTA) / `btn-ghost`.
- `panel`: bordered surface card (border + shadow, NOT gray fill).
- `section-header`: terminal-style rule + label (signature element candidate —
  final form is UX's call).
- `kbd`: keycap chip for keybinds.
- `badge`: category pill.
- `code block`: pre/code, mono, highlight.js (docs only).

## 4. Acceptance criteria

### All pages
- Loads with zero console errors; no horizontal scroll at 375/768/1280/1920.
- Nav + footer present and consistent; active page marked.
- Content fully readable with JS disabled.
- Visible focus states; logical tab order; reduced-motion respected.
- Placeholders wrapped in `<!-- TODO: ... -->` comments.

### index.html
- Hero: name, tagline, version (1.0.0), dominant styled download button —
  above the fold at 1280×800.
- "Why TenebraOS" 3–4 cards; features grid ≥ 10 real items (zram, zstd
  initramfs, masked networkd, nftables, sysctls, Limine, Snapper, Floorp,
  LocalSend/[tenebra] repo, branding); "Built for who?"; download CTA with
  SHA256 placeholder; footer.

### keybinds.html
- Table sourced from js/keybinds-data.js; ≥ 20 binds, ≥ 5 categories.
- Live search (matches bind + description), match highlighting, category pills
  (combinable with search), keyboard navigable, Enter copies bind.
- `<noscript>`: full static table still visible (data also rendered server-side…
  we're static — so: table is pre-rendered in HTML from the same data, JS only
  filters. Frontend must keep HTML table and data file in sync via build note.)

### docs.html
- Sidebar nav + scrollspy; ≥ 8 sections per brief (Getting Started, Installation,
  Configuration, Custom Repository, Noctalia Shell, Security, Troubleshooting,
  Contributing) with REAL technical content (no lorem ipsum).
- Code blocks in pre/code with highlight.js dark theme; Noctalia link external
  with `target="_blank" rel="noopener noreferrer"`; "Edit this page" placeholders.

### Deployment (backend)
- `_headers`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP
  (must allow highlight.js CDN + Google Fonts), Permissions-Policy.
- `_redirects`: /keybinds → /keybinds.html 200, /docs → /docs.html 200.
- `build.sh`: fish-compatible (NO bash-isms, printf over heredoc), validates HTML
  presence/structure, checks internal links, exits nonzero on failure.

## 5. Process

UX + Backend run in parallel (disjoint files — PM decision). Frontend starts only
after PM approves tokens + data. QA runs last; BLOCK findings return to the
owning dev. PM writes CHANGELOG.md at close.

## 6. Content facts (canonical — do not invent specs)

Arch fork of Omarchy · Hyprland 0.55+ (Lua config) · Noctalia shell (external,
docs.noctalia.dev) · Limine + Snapper boot snapshots · Floorp · NetworkManager
(networkd masked) · nftables default-deny inbound · kernel hardening sysctls
(kptr_restrict 2, ptrace_scope 1, etc.) · LUKS FDE · zram (zstd, min(ram/2,8G)) ·
zstd -T0 initramfs (~12MB) · sub-10s userspace boot · btrfs zstd:1 noatime ·
signed [tenebra] repo (incl. LocalSend) · target: ThinkPad T480-class + NVIDIA
desktops · version 1.0.0 · keybind source of truth: Super+RMB drag = resize,
Super+LMB drag = move, Super+L = lock (hyprlock), Super+T = terminal (kitty),
Super+B = Floorp, Super+F = file manager (nautilus), Super+Space = launcher
(noctalia), Print = region shot, Super+Print = full shot (grimblast), Super+W =
close window, ALT+Tab = cycle windows. The brief's seed list uses generic
Hyprland defaults — keep brief's list where it doesn't conflict, but the eleven
binds above are from the REAL config and win on conflict. Mark generic fills
with category-accurate plausible defaults.
```
