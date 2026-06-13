// TenebraOS — download.js
// Convenience layer: clicking the main "Download ISO" button also hands over
// the matching .sha256 checksum file.
//
// The checksum is generated client-side from the hash already printed on the
// page (.sha-row code) — that value is public and deterministic, so there is
// no network round trip and nothing the strict CSP or the cross-origin
// releases host has to special-case (a fetch() to releases.tenebraos.org would
// be blocked by both CSP default-src 'self' and missing CORS headers).
//
// Progressive enhancement: with JS off, the ISO still downloads via the
// anchor's href and the separate "Checksum file (.sha256)" link still works.
// CSP: external file, no inline JS — keep it that way.

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("download");
    if (!btn) {
      return;
    }

    var shaCode = document.querySelector(".sha-row code");
    var hash = shaCode ? shaCode.textContent.trim() : "";
    // Derive the ISO filename from the button's own href (last path segment),
    // so this stays correct across version bumps with no edits here.
    var href = btn.getAttribute("href") || "";
    var isoName = href.split("/").pop();
    if (!hash || !isoName) {
      return;
    }

    btn.addEventListener("click", function () {
      // The ISO download proceeds via the anchor's default action; we only
      // add the checksum alongside it. sha256sum -c expects: hash + 2 spaces
      // + filename.
      var body = hash + "  " + isoName + "\n";
      var blob = new Blob([body], { type: "text/plain" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = isoName + ".sha256";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    });
  });
})();
