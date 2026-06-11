#!/usr/bin/env fish
# tenebra-release: upload a TenebraOS release (ISO + .asc + .sha256) to the VPS.
# Usage: ./upload-release.fish 1.0.0 [release-dir]
#
# Expects an ssh config host named "tenebra-vps", e.g. in ~/.ssh/config:
#   Host tenebra-vps
#     HostName <vps-ip-or-name>
#     User deploy
#     IdentityFile ~/.ssh/tenebra_vps
# Override the host with TENEBRA_VPS_HOST, the remote path with
# TENEBRA_VPS_PATH, and the public base URL with TENEBRA_RELEASE_BASE.

# NOTE: $version is a RESERVED read-only fish variable — never use it here.
set rel_version $argv[1]
if test (count $argv) -ge 2
    set rel_dir $argv[2]
else
    set rel_dir "$HOME/Projects/TenebraOS/tenebra-iso/release"
end

set vps_host (set -q TENEBRA_VPS_HOST; and echo $TENEBRA_VPS_HOST; or echo "tenebra-vps")
set vps_path (set -q TENEBRA_VPS_PATH; and echo $TENEBRA_VPS_PATH; or echo "/var/www/releases")
set base_url (set -q TENEBRA_RELEASE_BASE; and echo $TENEBRA_RELEASE_BASE; or echo "https://releases.tenebraos.org")

if test -z "$rel_version"
    printf 'tenebra-release: usage: %s <version> [release-dir]\n' (status filename)
    exit 1
end

set iso_file  "$rel_dir/tenebra-$rel_version-x86_64.iso"
set asc_file  "$iso_file.asc"
set sha_file  "$iso_file.sha256"

if not test -f "$iso_file"
    printf 'tenebra-release: ERROR — ISO not found: %s\n' "$iso_file"
    exit 1
end

if not test -f "$asc_file"
    printf 'tenebra-release: ERROR — GPG signature missing: %s\n' "$asc_file"
    printf 'tenebra-release: sign it first:\n'
    printf '  gpg --armor --detach-sign -u 12EBEDBECF16FEBA7793CF1D6126981E362E2446 %s\n' "$iso_file"
    exit 1
end

if not test -f "$sha_file"
    printf 'tenebra-release: generating %s\n' "$sha_file"
    pushd "$rel_dir"
    sha256sum (basename "$iso_file") > (basename "$sha_file")
    popd
end

printf 'tenebra-release: uploading %s to %s:%s/%s/\n' "$rel_version" "$vps_host" "$vps_path" "$rel_version"
ssh "$vps_host" "mkdir -p $vps_path/$rel_version"; or exit 1
rsync -avP --chmod=F644 "$iso_file" "$asc_file" "$sha_file" "$vps_host:$vps_path/$rel_version/"; or exit 1

printf 'tenebra-release: verifying remote checksum (this reads the whole ISO once)\n'
set remote_sum (ssh "$vps_host" "cd $vps_path/$rel_version && sha256sum -c (basename $sha_file) 2>/dev/null && echo VERIFIED")
if string match -q '*VERIFIED*' -- "$remote_sum"
    printf 'tenebra-release: remote checksum VERIFIED\n'
else
    printf 'tenebra-release: WARNING — remote checksum verification failed or unavailable; check manually\n'
end

printf 'tenebra-release: done.\n'
printf 'ISO:    %s/%s/tenebra-%s-x86_64.iso\n'        "$base_url" "$rel_version" "$rel_version"
printf 'SIG:    %s/%s/tenebra-%s-x86_64.iso.asc\n'    "$base_url" "$rel_version" "$rel_version"
printf 'SHA256: %s/%s/tenebra-%s-x86_64.iso.sha256\n' "$base_url" "$rel_version" "$rel_version"
