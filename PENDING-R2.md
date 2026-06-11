
> **SUPERSEDED (2026-06-11):** releases are hosted on a VPS via nginx instead
> of R2 — see `deploy/VPS-SETUP.md`. This checklist is kept for reference
> only; do not action it.
# PENDING — R2 setup blocked on auth

These steps could not be automated: node/npm/wrangler are not installed and
`wrangler login` needs the user's browser. Everything else (upload script,
`wrangler.toml`, `release-config.json`, `_redirects`, README docs) is done.
Run these in order, then **delete this file**.

All commands are fish-compatible. Echo-style examples use the
`tenebra-release:` log prefix.

## 1. Install tooling

```fish
sudo pacman -S --needed nodejs npm
sudo npm install -g wrangler
wrangler --version    # sanity check
```

## 2. Authenticate (browser required)

```fish
wrangler login
wrangler whoami       # confirm the account
```

## 3. Create the bucket

```fish
wrangler r2 bucket create tenebraos-releases
```

## 4. Enable public access (dashboard)

Cloudflare dashboard → **R2 → tenebraos-releases → Settings →
Public access** → enable. Note the assigned `https://pub-<hash>.r2.dev`
URL — that is the fallback in `release-config.json` until the custom
domain is live.

## 5. Test upload (1 KB dummy + 200 check)

```fish
printf 'tenebra-release: r2 smoke test\n' > /tmp/r2-smoke-test.txt
wrangler r2 object put tenebraos-releases/smoke/r2-smoke-test.txt --file /tmp/r2-smoke-test.txt
# Replace <hash> with the pub URL from step 4 — expect 200:
curl -s -o /dev/null -w 'tenebra-release: smoke test HTTP %{http_code}\n' https://pub-<hash>.r2.dev/smoke/r2-smoke-test.txt
# Clean up:
wrangler r2 object delete tenebraos-releases/smoke/r2-smoke-test.txt
```

## 6. Custom domain

Dashboard → **R2 → tenebraos-releases → Settings → Custom domains** →
add `releases.tenebraos.org`. DNS is already on Cloudflare (Pages hosts the
site), so Cloudflare creates the record itself — just wait for the domain
status to show **Active**, then:

```fish
curl -s -o /dev/null -w 'tenebra-release: custom domain HTTP %{http_code}\n' -I https://releases.tenebraos.org
```

Once active, update `release-config.json`: set `base_url_status` from
`pending-dns` to `active`.

## 7. Real release upload

```fish
./scripts/upload-release.fish 1.0.0
# Then verify the three printed URLs return 200:
for f in tenebra-1.0.0-x86_64.iso tenebra-1.0.0-x86_64.iso.asc tenebra-1.0.0-x86_64.iso.sha256
    curl -s -o /dev/null -w "tenebra-release: $f HTTP %{http_code}\n" -I https://releases.tenebraos.org/1.0.0/$f
end
```

## 8. Done

Delete this file (`PENDING-R2.md`) and let the PM know R2 is live.
