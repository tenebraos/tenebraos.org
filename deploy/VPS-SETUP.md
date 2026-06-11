# TenebraOS — VPS Hosting Runbook

Hosts the website (`tenebraos.org`) and release downloads
(`releases.tenebraos.org`) on a single VPS with nginx. Supersedes the R2 plan
(`PENDING-R2.md` is obsolete once this is live).

## 0. Provider

Pick by **included egress**, not CPU — the ISO is 4.8GB/download. Hetzner
CX/CAX (20TB included), Netcup, or OVH are the right shape. Avoid per-GB
egress billing (AWS/GCP/Azure). Any distro with nginx works; commands below
assume Arch (pacman) — translate to apt if you pick Debian.

## 1. DNS plan (this is the caching answer)

| Record | Target | Cloudflare proxy |
|---|---|---|
| `tenebraos.org` (A/AAAA) | VPS IP | **Proxied (orange)** — CDN + shield for the site |
| `www` (CNAME → tenebraos.org) | — | Proxied |
| `releases` (A/AAAA) | VPS IP | **DNS only (grey)** — Cloudflare never touches the ISO |

Why grey for releases: the free-plan cache caps at 512MB/object, so a 4.8GB
ISO can never be cached — proxying it would just relay every download through
Cloudflare for zero benefit. DNS-only serves it straight from the VPS.
Tradeoff: the releases record exposes the VPS IP. Acceptable here.

## 2. Base hardening (the distro's own standards)

```sh
# as root, first login
useradd -m -G wheel deploy
passwd deploy
install -d -m 700 /home/deploy/.ssh
# put your pubkey in /home/deploy/.ssh/authorized_keys (mode 600, owner deploy)

# sshd: key-only, no root (same drop-in the distro ships)
printf '%s\n' 'PermitRootLogin no' 'PasswordAuthentication no' \
  'KbdInteractiveAuthentication no' > /etc/ssh/sshd_config.d/20-hardening.conf
systemctl reload sshd     # keep your session open; test a fresh login first!

# firewall: default-deny inbound, allow ssh + http/https
# (adapt /etc/nftables.conf from tenebra-hardening; add: tcp dport {22,80,443} accept)
pacman -S nftables
systemctl enable --now nftables

pacman -Syu              # and keep a weekly update habit
```

## 3. nginx + content

```sh
pacman -S nginx git certbot certbot-nginx rsync
install -d /var/www/releases /var/www/acme /etc/nginx/ssl

# the site deploys straight from the public repo
git clone https://github.com/tenebraos/tenebraos.org /var/www/tenebraos.org

# configs from this directory
cp deploy/nginx/tenebraos.org.conf deploy/nginx/releases.tenebraos.org.conf \
   /etc/nginx/conf.d/    # (or sites-available + symlink, per your layout)
```

Make sure the rsync/deploy user can write `/var/www/releases`:
`chown -R deploy:deploy /var/www/releases`.

## 4. TLS — two different paths on purpose

- **Site (proxied):** Cloudflare dashboard → SSL/TLS → Origin Server →
  Create Certificate (15-year). Save as
  `/etc/nginx/ssl/tenebraos.org.origin.pem` + `.key` (mode 600). Set the zone
  SSL mode to **Full (strict)**. (certbot can't easily issue for an
  orange-clouded name via HTTP-01; the origin cert sidesteps that.)
- **Releases (grey):** plain Let's Encrypt:
  `certbot --nginx -d releases.tenebraos.org` — auto-renews via the systemd
  timer (`systemctl enable --now certbot-renew.timer`).

Then: `nginx -t && systemctl enable --now nginx`.

## 5. Deploys

- **Site update:** push to GitHub, then on the VPS:
  `cd /var/www/tenebraos.org && git pull`
  (Later: a GitHub Action that ssh-runs that one line on push.)
- **Release upload:** from the build machine:
  `./deploy/upload-release.fish 1.0.0`
  — rsyncs ISO + .asc + .sha256, then re-verifies the checksum **on the VPS**
  so a wire corruption can't ship.

## 6. Verify (after first deploy)

```sh
curl -sI https://tenebraos.org | grep -Ei 'content-security|x-frame'
curl -sI https://tenebraos.org/keybinds | head -1          # 200 via clean URL
curl -sI https://releases.tenebraos.org/1.0.0/tenebra-1.0.0-x86_64.iso | grep -Ei 'accept-ranges|content-length'
curl -s -r 0-1023 -o /dev/null -w '%{http_code}\n' \
  https://releases.tenebraos.org/1.0.0/tenebra-1.0.0-x86_64.iso  # expect 206 (resume works)
```

Flip `base_url_status` in `release-config.json` to `"active"` when live, and
remove the Cloudflare Pages files if Pages is fully retired (`_headers`,
`_redirects` are harmless but inert under nginx — the nginx configs carry
their rules).
