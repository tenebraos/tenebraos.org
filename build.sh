#!/bin/sh
# build.sh — TenebraOS website pre-deploy validation gate.
# POSIX sh only (no bash-isms, no heredocs, printf over echo -e) so it runs
# cleanly on systems whose interactive shell is fish. Run as: sh build.sh
#
# Checks:
#   1. Required files exist in dist/.
#   2. Every local css/js/asset path referenced via src= / href= in the three
#      HTML pages exists on disk.
#   3. Internal page links resolve (including /keybinds and /docs clean URLs).
#   4. No literal "lorem ipsum" anywhere in dist/ (case-insensitive).
#   5. TODO markers are listed as warnings (do not fail the build).
#
# Exits 1 on any hard failure, 0 on pass.

set -u

DIST="$(dirname "$0")/dist"
FAILURES=0
WARNINGS=0

fail() {
    printf 'FAIL: %s\n' "$1"
    FAILURES=$((FAILURES + 1))
}

ok() {
    printf '  ok: %s\n' "$1"
}

warn() {
    printf 'WARN: %s\n' "$1"
    WARNINGS=$((WARNINGS + 1))
}

printf '== TenebraOS website validation ==\n'
printf 'dist root: %s\n\n' "$DIST"

if [ ! -d "$DIST" ]; then
    fail "dist/ directory not found at $DIST"
    printf '\n== RESULT: FAIL (%s failure(s)) ==\n' "$FAILURES"
    exit 1
fi

# ---------------------------------------------------------------------
# 1. Required files
# ---------------------------------------------------------------------
printf -- '-- required files --\n'
for f in index.html keybinds.html docs.html _headers _redirects; do
    if [ -f "$DIST/$f" ]; then
        ok "$f present"
    else
        fail "required file missing: dist/$f"
    fi
done

# ---------------------------------------------------------------------
# 2 + 3. Referenced local assets and internal links resolve
# ---------------------------------------------------------------------
printf '\n-- referenced assets and internal links --\n'
for page in index.html keybinds.html docs.html; do
    if [ ! -f "$DIST/$page" ]; then
        warn "skipping link check for missing page: $page"
        continue
    fi

    refs=$(grep -oE '(src|href)="[^"]+"' "$DIST/$page" 2>/dev/null \
        | sed -e 's/^[a-z]*="//' -e 's/"$//' | sort -u)

    checked=0
    for ref in $refs; do
        # Skip external / non-file references.
        case "$ref" in
            http://*|https://*|//*|mailto:*|tel:*|data:*|javascript:*|\#*)
                continue
                ;;
        esac

        # Strip query string and fragment.
        path=$(printf '%s' "$ref" | sed -e 's/[?#].*$//')
        [ -z "$path" ] && continue

        # Resolve relative to dist root (all pages live at the root).
        case "$path" in
            /*) target="$DIST$path" ;;
            *)  target="$DIST/$path" ;;
        esac

        checked=$((checked + 1))
        if [ -e "$target" ]; then
            :
        elif [ -f "$target.html" ]; then
            # Clean URL (/keybinds, /docs) rewritten by _redirects.
            :
        else
            fail "$page references missing file: $ref"
        fi
    done
    ok "$page: $checked local reference(s) checked"
done

# ---------------------------------------------------------------------
# 4. No placeholder lorem ipsum text
# ---------------------------------------------------------------------
printf '\n-- placeholder text --\n'
lorem=$(grep -r -i -l 'lorem ipsum' "$DIST" 2>/dev/null)
if [ -n "$lorem" ]; then
    for f in $lorem; do
        fail "literal 'lorem ipsum' found in: $f"
    done
else
    ok "no 'lorem ipsum' in dist/"
fi

# ---------------------------------------------------------------------
# 5. TODO markers (warn only)
# ---------------------------------------------------------------------
printf '\n-- TODO markers (informational) --\n'
todos=$(grep -r -n 'TODO' "$DIST" 2>/dev/null)
if [ -n "$todos" ]; then
    printf '%s\n' "$todos" | while IFS= read -r line; do
        printf 'WARN: TODO: %s\n' "$line"
    done
    # Count separately (the while loop above runs in a subshell under sh).
    todo_count=$(printf '%s\n' "$todos" | grep -c .)
    WARNINGS=$((WARNINGS + todo_count))
else
    ok "no TODO markers in dist/"
fi

# ---------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------
printf '\n'
if [ "$FAILURES" -gt 0 ]; then
    printf '== RESULT: FAIL (%s failure(s), %s warning(s)) ==\n' "$FAILURES" "$WARNINGS"
    exit 1
fi
printf '== RESULT: PASS (0 failures, %s warning(s)) ==\n' "$WARNINGS"
exit 0
