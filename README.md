# TenebraOS Website

Static marketing + documentation site for TenebraOS, deployed to Cloudflare
Pages. Zero build tooling: what lives in `dist/` is exactly what ships.

## Project layout

```
website/                      # repo root (NOT deployed)
├── PM-SPEC.md                # build authority — read before changing anything
├── README.md                 # this file
├── build.sh                  # pre-deploy validation gate (POSIX sh)
└── dist/                     # DEPLOY ROOT for Cloudflare Pages
    ├── index.html            # landing page
    ├── keybinds.html         # keybind reference
    ├── docs.html             # documentation
    ├── _headers              # Cloudflare Pages security headers (CSP etc.)
    ├── _redirects            # clean URLs (/keybinds, /docs)
    ├── css/
    │   ├── design-tokens.css # UX engineer only
    │   ├── motion.css        # UX engineer only
    │   └── styles.css        # frontend — components/layout
    ├── js/
    │   ├── utils.js          # frontend — shared helpers
    │   ├── keybinds-data.js  # backend — DATA ONLY (KEYBINDS array)
    │   ├── keybinds.js       # frontend — search/filter/keyboard logic
    │   └── docs.js           # frontend — scrollspy
    └── assets/               # logo + screenshot placeholders (SVG)
```

## Local development

No build step. Pick whichever you like:

- Open `dist/index.html` directly in a browser, or
- `npx serve dist`, or
- `python -m http.server -d dist`

A local server is recommended over `file://` so root-relative paths and the
clean-URL behavior are closer to production. (`_headers` and `_redirects` only
take effect on Cloudflare Pages itself.)

## Updating keybinds

1. Edit `dist/js/keybinds-data.js`. It is a plain `<script>` global
   (`const KEYBINDS = [...]`) — **not** an ES module — because the static
   table and the JS filter share it as a single source of truth.
2. **Important:** the table in `keybinds.html` is pre-rendered static HTML
   (so the page works with JS disabled). After changing the data file, the
   static table must be regenerated / kept in sync by hand — the frontend
   dev owns that sync. `build.sh` cannot catch drift between the two, so
   treat data edits as a two-file change.

Bind strings are human-readable ("Super + Shift + 1–9", "Super + Right Mouse
Drag"), descriptions are plain English — no Hyprland config syntax. The
canonical bind list lives in PM-SPEC.md section 6; real config binds always
win over generic Hyprland defaults.

## Updating docs

**Decision (backend, documented per PM process):** docs content lives directly
in `docs.html` as semantic HTML. There is no markdown pipeline and no build
step. Rationale: the PM has not approved Node tooling, so the default is the
zero-dependency choice — content is hand-maintained HTML, editable with any
text editor, deployable as-is. A markdown→HTML pipeline was considered and
rejected to honor the no-build-tool constraint.

To edit docs: change the section markup in `dist/docs.html` directly. Keep
sections as `<section id="...">` blocks so the sidebar scrollspy keeps working,
and keep code samples in `<pre><code>` for highlight.js.

## Deploying to Cloudflare Pages

The deploy root is `dist/` — never the repo root.

- **Dashboard:** Cloudflare Pages → your project → Create deployment →
  upload the `dist/` folder.
- **CLI:** `wrangler pages deploy dist/`

`_headers` (security headers, CSP) and `_redirects` (clean URLs) are picked up
automatically by Cloudflare Pages from the deploy root.

Note for contributors: the CSP in `_headers` forbids inline `<script>` tags and
inline `style=""` attributes — all JS must live in `dist/js/*.js` and all CSS
in `dist/css/*.css`.

## Pre-deploy gate

`build.sh` is the mandatory gate before any deploy:

```
sh build.sh
```

It verifies required files exist, every locally referenced css/js/asset path
resolves, internal page links work (including clean URLs), and no placeholder
"lorem ipsum" text shipped. TODO markers are listed as warnings only. Exit
code 0 = safe to deploy; 1 = fix failures first.

## Credits & lineage

The website documents TenebraOS, which stands on: **Omarchy** (TenebraOS's
installer is based on Omarchy's installer; the distribution itself is
independent), **Arch Linux**, **Hyprland**, **Noctalia**, **Limine**,
**Snapper**, **Floorp**, and **LocalSend**. Full credits live on the docs
page (Contributing → Credits & lineage).

## License

MIT — © 2026 Ameona. See `LICENSE`.

---

*Transparency: AI (Claude — Opus & Fable) was utilized as a tool in the
development of this distribution and its website.*

## Deployment

Release distribution lives in Cloudflare R2 (bucket `tenebraos-releases`,
public at `https://releases.tenebraos.org`); the site itself is Cloudflare
Pages with `dist/` as the deploy root (see `wrangler.toml`). All commands
below are fish-compatible.

### One-time setup (requires browser auth)

```fish
# 1. Install node + wrangler
sudo pacman -S --needed nodejs npm
sudo npm install -g wrangler

# 2. Authenticate (opens the browser)
wrangler login

# 3. Create the releases bucket
wrangler r2 bucket create tenebraos-releases
```

Then in the Cloudflare dashboard (DNS is already on Cloudflare since Pages
hosts the site): **R2 → tenebraos-releases → Settings → Public access** —
enable public access, and under **Custom domains** add
`releases.tenebraos.org`. Until the custom domain is live, the bucket's
`https://pub-<hash>.r2.dev` URL works as a fallback (see
`release-config.json` → `fallback_url_pattern`).

### Per-release

```fish
# 1. Build the ISO (produces tenebra-<version>-x86_64.iso + .asc in
#    ~/Projects/TenebraOS/tenebra-iso/release/)

# 2. Upload all three artifacts (iso, .asc, .sha256 — generated if missing)
./scripts/upload-release.fish 1.0.0

# 3. Verify the printed URLs return 200
for f in tenebra-1.0.0-x86_64.iso tenebra-1.0.0-x86_64.iso.asc tenebra-1.0.0-x86_64.iso.sha256
    printf '%s -> ' $f
    curl -s -o /dev/null -w '%{http_code}\n' -I https://releases.tenebraos.org/1.0.0/$f
end
```

The upload script hard-fails if the ISO or the `.asc` signature is missing —
unsigned releases never ship.

### Site deploy

Either push to GitHub (Pages auto-builds from the repo, deploy root `dist/`),
or deploy directly:

```fish
sh build.sh          # mandatory pre-deploy gate
wrangler pages deploy dist
```

### Hosting decision (2026-06-11)

Releases are served from a VPS via nginx (`deploy/VPS-SETUP.md` — nginx
configs, hardening, TLS split: site proxied w/ CF origin cert, releases
DNS-only w/ Lets Encrypt so the ISO bypasses the 512MB CDN cache cap
entirely). Per-release upload: `deploy/upload-release.fish <version>`
(rsync + remote checksum verify). The wrangler/R2 path in the section above
remains documented as a fallback. The site can stay on Cloudflare Pages or
move to the same VPS — both configs ship in `deploy/nginx/`.
