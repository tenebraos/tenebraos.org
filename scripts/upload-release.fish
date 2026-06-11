#!/usr/bin/env fish
# upload-release.fish — push a TenebraOS release (ISO + GPG signature +
# checksum) to the Cloudflare R2 bucket "tenebraos-releases".
#
# Usage:
#   ./scripts/upload-release.fish <version> [path-to-release-dir]
#   e.g. ./scripts/upload-release.fish 1.0.0
#
# Artifact naming (real release pattern, all three required to ship):
#   tenebra-<version>-x86_64.iso          the ISO
#   tenebra-<version>-x86_64.iso.asc      GPG detached ARMORED signature
#   tenebra-<version>-x86_64.iso.sha256   checksum (generated here if missing)
#
# Environment:
#   TENEBRA_R2_BASE   public base URL used for the printed links
#                     (default: https://releases.tenebraos.org)

set -l GPG_FINGERPRINT 12EBEDBECF16FEBA7793CF1D6126981E362E2446

function log
    printf 'tenebra-r2: %s\n' "$argv"
end

function die
    printf 'tenebra-r2: ERROR: %s\n' "$argv" >&2
    exit 1
end

# --- arguments ---------------------------------------------------------------
if test (count $argv) -lt 1; or test (count $argv) -gt 2
    printf 'tenebra-r2: usage: ./scripts/upload-release.fish <version> [path-to-release-dir]\n' >&2
    printf 'tenebra-r2: example: ./scripts/upload-release.fish 1.0.0\n' >&2
    exit 1
end

set -l rel_version $argv[1]
set -l release_dir $HOME/Projects/TenebraOS/tenebra-iso/release
if test (count $argv) -ge 2
    set release_dir $argv[2]
end

set -l bucket tenebraos-releases
set -l base_url https://releases.tenebraos.org
if set -q TENEBRA_R2_BASE; and test -n "$TENEBRA_R2_BASE"
    set base_url $TENEBRA_R2_BASE
end

test -d "$release_dir"; or die "release dir not found: $release_dir"

set -l iso_name tenebra-$rel_version-x86_64.iso
set -l asc_name $iso_name.asc
set -l sha_name $iso_name.sha256

set -l iso_path $release_dir/$iso_name
set -l asc_path $release_dir/$asc_name
set -l sha_path $release_dir/$sha_name

# --- preflight: never upload unsigned or incomplete releases ------------------
if not test -f "$iso_path"
    die "ISO not found: $iso_path — build the release ISO first"
end

if not test -f "$asc_path"
    printf 'tenebra-r2: ERROR: GPG signature not found: %s\n' "$asc_path" >&2
    printf 'tenebra-r2: refusing to upload an unsigned release.\n' >&2
    printf 'tenebra-r2: sign it first (armored, detached, .asc):\n' >&2
    printf 'tenebra-r2:   gpg --local-user %s --armor --detach-sign %s\n' $GPG_FINGERPRINT "$iso_path" >&2
    exit 1
end

if not test -f "$sha_path"
    log "checksum missing — generating $sha_name"
    # cd into the dir so the checksum file contains a bare filename,
    # not an absolute path (required for `sha256sum -c` on the user side).
    pushd "$release_dir"; or die "could not cd into $release_dir"
    if not sha256sum $iso_name > $sha_name
        popd
        die "sha256sum failed for $iso_name"
    end
    popd
end

log "release dir : $release_dir"
log "artifacts   : $iso_name + .asc + .sha256"

# --- wrangler ----------------------------------------------------------------
if not command -q wrangler
    printf 'tenebra-r2: ERROR: wrangler not found on PATH.\n' >&2
    printf 'tenebra-r2: install and authenticate first:\n' >&2
    printf 'tenebra-r2:   sudo pacman -S --needed nodejs npm\n' >&2
    printf 'tenebra-r2:   sudo npm install -g wrangler\n' >&2
    printf 'tenebra-r2:   wrangler login\n' >&2
    printf 'tenebra-r2: see PENDING-R2.md at the website repo root.\n' >&2
    exit 1
end

# --- upload --------------------------------------------------------------------
for name in $iso_name $asc_name $sha_name
    log "uploading $name -> r2://$bucket/$rel_version/$name"
    wrangler r2 object put $bucket/$rel_version/$name --file $release_dir/$name
    or die "upload failed for $name"
end

log "all three artifacts uploaded for version $rel_version"
log "public URLs:"
for name in $iso_name $asc_name $sha_name
    printf 'tenebra-r2:   %s/%s/%s\n' $base_url $rel_version $name
end
log "verify each URL returns 200 before announcing the release"
