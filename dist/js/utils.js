// TenebraOS — utils.js
// Shared progressive enhancements: mobile nav toggle + clipboard helper.
// The site is fully usable without this file (nav uses a CSS checkbox hack;
// the keybind table is statically rendered). CSP: no inline JS anywhere.

(function () {
  "use strict";

  /* ---- Clipboard helper (used by keybinds.js) --------------------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error("Clipboard API unavailable"));
  }

  window.TenebraUtils = { copyText: copyText };

  /* ---- Mobile nav enhancement ------------------------------------------- */
  // The checkbox hack works with zero JS. This layer only adds:
  //   - aria-expanded kept in sync on the toggle
  //   - menu closes on Escape, on link click, and when resizing to desktop
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }

    function sync() {
      toggle.setAttribute("aria-expanded", toggle.checked ? "true" : "false");
    }

    function close() {
      if (toggle.checked) {
        toggle.checked = false;
        sync();
      }
    }

    toggle.setAttribute("aria-controls", "site-nav-links");
    links.id = "site-nav-links";
    sync();

    toggle.addEventListener("change", sync);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        close();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        close();
      }
    });
  });
})();
