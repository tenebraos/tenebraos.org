// TenebraOS — icons.js
// Purpose-drawn inline SVG icon set for the landing page feature tiles.
// Plain <script> global (same pattern as keybinds-data.js) — NOT an ES module.
// CSP: no inline <script>, no style="" attributes — SVGs use presentation
// attributes only (stroke/fill), single color via stroke="currentColor".
// Icons are decorative: injected into <span data-icon="…" aria-hidden="true">
// placeholders; with JS disabled the cards read fine without them.

(function () {
  "use strict";

  // Shared shell: 32×32 viewBox, geometric line style, no fills except
  // where essential (none below), round caps/joins.
  function svg(inner) {
    return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" ' +
      'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      inner + "</svg>";
  }

  window.TENEBRA_ICONS = {
    // timer body + bolt — boot speed
    "boot-speed": svg(
      '<circle cx="16" cy="18" r="10"/>' +
      '<path d="M13 3h6"/><path d="M16 3v5"/>' +
      '<path d="M17.5 13 14 19h2.5l-2 5L18 18h-2.5z"/>'
    ),
    // shield + center line detail — security / hardening
    "security": svg(
      '<path d="M16 3.5l9 3.5v7.5c0 5.9-3.7 10.3-9 13-5.3-2.7-9-7.1-9-13V7z"/>' +
      '<path d="M16 8.5v15"/>'
    ),
    // brush handle + bristle head — wallpaper / theming
    "wallpaper": svg(
      '<path d="M26 4l2 2-9 9-2-2z"/>' +
      '<path d="M15.5 14.5c-2 .2-3.6 1.2-4.6 3-1 1.9-.8 4-3.4 5.3 1.8 1.1 4.9 1.2 7-.2 1.9-1.2 2.8-3.3 2.5-5.6z"/>'
    ),
    // document with folded corner + lines — notes
    "notes": svg(
      '<path d="M8 3h11l5 5v21H8z"/><path d="M19 3v5h5"/>' +
      '<path d="M12 14h8"/><path d="M12 18h8"/><path d="M12 22h5"/>'
    ),
    // clock with rewind arrow — snapshots / rollback
    "snapshots": svg(
      '<path d="M5.8 11.5A11 11 0 1 1 5 16"/>' +
      '<polyline points="4.5 5.5 5.8 11.5 11.8 10.2"/>' +
      '<path d="M16 10v6l4 3"/>'
    ),
    // sealed package box — signed repo
    "repo": svg(
      '<path d="M16 3l11 5.5v15L16 29 5 23.5v-15z"/>' +
      '<path d="M5 8.5L16 14l11-5.5"/><path d="M16 14v15"/>' +
      '<path d="M10.5 5.75l11 5.5"/>'
    ),
    // brick wall — firewall
    "firewall": svg(
      '<rect x="4" y="7" width="24" height="18" rx="1.5"/>' +
      '<path d="M4 13h24"/><path d="M4 19h24"/>' +
      '<path d="M16 7v6"/><path d="M10 13v6"/><path d="M22 13v6"/><path d="M16 19v6"/>'
    ),
    // tiled window panes — shell / compositor
    "shell": svg(
      '<rect x="4" y="6" width="24" height="20" rx="2"/>' +
      '<path d="M16 6v20"/><path d="M16 16h12"/>'
    ),
    // memory chip — zram
    "zram": svg(
      '<rect x="9" y="9" width="14" height="14" rx="2"/>' +
      '<rect x="13" y="13" width="6" height="6"/>' +
      '<path d="M12 5v4"/><path d="M20 5v4"/><path d="M12 23v4"/><path d="M20 23v4"/>' +
      '<path d="M5 12h4"/><path d="M5 20h4"/><path d="M23 12h4"/><path d="M23 20h4"/>'
    ),
    // arrow into tray — download
    "download": svg(
      '<path d="M16 4v15"/><polyline points="9.5 13 16 19.5 22.5 13"/>' +
      '<path d="M5 21v4a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-4"/>'
    ),
    // globe — browser
    "browser": svg(
      '<circle cx="16" cy="16" r="12"/><path d="M4 16h24"/>' +
      '<path d="M16 4c3.5 3.2 5.3 7.5 5.3 12S19.5 24.8 16 28c-3.5-3.2-5.3-7.5-5.3-12S12.5 7.2 16 4z"/>'
    ),
    // two opposing arrows — peer-to-peer transfer
    "transfer": svg(
      '<path d="M8 11h17"/><polyline points="20.5 6.5 25 11 20.5 15.5"/>' +
      '<path d="M24 21H7"/><polyline points="11.5 16.5 7 21 11.5 25.5"/>'
    )
  };

  // Inject into placeholders. Spans are aria-hidden in the markup already;
  // set it defensively here too since the icons are purely decorative.
  document.addEventListener("DOMContentLoaded", function () {
    var spans = document.querySelectorAll("[data-icon]");
    Array.prototype.forEach.call(spans, function (span) {
      var name = span.getAttribute("data-icon");
      if (window.TENEBRA_ICONS[name]) {
        span.innerHTML = window.TENEBRA_ICONS[name];
        span.setAttribute("aria-hidden", "true");
      }
    });
  });
})();
