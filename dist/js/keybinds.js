// TenebraOS — keybinds.js
// Progressive enhancement for keybinds.html. The table is statically rendered
// in the HTML (same order as the KEYBINDS global from keybinds-data.js) so the
// page works with JS disabled. This file adds:
//   - live search across bind + description (case-insensitive)
//   - <mark> highlighting of the matched text
//   - category pills that COMBINE with the search text
//   - "n of 36 shown" live count + no-results state
//   - focusable rows: Enter (or the injected copy button) copies the bind
// Sync rule: if js/keybinds-data.js changes, the static table in
// keybinds.html must be regenerated to match (same order, same text).

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var table = document.getElementById("kb-table");
    var input = document.getElementById("kb-search");
    var pillsWrap = document.getElementById("kb-pills");
    var countEl = document.getElementById("kb-count");
    var emptyEl = document.getElementById("kb-empty");
    var liveEl = document.getElementById("kb-live");
    if (!table || !input || !pillsWrap || typeof KEYBINDS === "undefined") {
      return;
    }

    var rows = Array.prototype.slice.call(table.querySelectorAll(".kb-row"));
    var pills = Array.prototype.slice.call(pillsWrap.querySelectorAll(".pill"));
    var total = rows.length;
    var activeCategory = "all";
    var query = "";

    if (total !== KEYBINDS.length) {
      // Build-note guard: static table and data file drifted apart.
      console.warn(
        "keybinds: static table has " + total + " rows but KEYBINDS has " +
        KEYBINDS.length + " entries — regenerate the table in keybinds.html."
      );
    }

    /* ---- rendering helpers ---------------------------------------------- */
    function escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    // Wrap case-insensitive occurrences of `q` in <mark>, escaping everything.
    function highlight(text, q) {
      if (!q) {
        return escapeHtml(text);
      }
      var lower = text.toLowerCase();
      var needle = q.toLowerCase();
      var out = "";
      var pos = 0;
      var hit = lower.indexOf(needle, pos);
      while (hit !== -1) {
        out += escapeHtml(text.slice(pos, hit));
        out += "<mark>" + escapeHtml(text.slice(hit, hit + needle.length)) + "</mark>";
        pos = hit + needle.length;
        hit = lower.indexOf(needle, pos);
      }
      out += escapeHtml(text.slice(pos));
      return out;
    }

    // Re-render the kbd chips for a bind, highlighting matches per segment.
    function renderKeys(bind, q) {
      return bind.split(" + ").map(function (segment) {
        return "<kbd>" + highlight(segment, q) + "</kbd>";
      }).join('<span class="kb-plus">+</span>');
    }

    /* ---- filtering -------------------------------------------------------- */
    function applyFilter() {
      var shown = 0;
      rows.forEach(function (row, i) {
        var data = KEYBINDS[i] || {
          bind: row.getAttribute("data-bind") || "",
          description: row.querySelector(".kb-desc").textContent,
          category: row.getAttribute("data-category") || ""
        };
        var haystack = (data.bind + " " + data.description).toLowerCase();
        var matches =
          (activeCategory === "all" || data.category === activeCategory) &&
          (query === "" || haystack.indexOf(query) !== -1);

        var wasHidden = row.hidden;
        row.hidden = !matches;

        if (matches) {
          shown += 1;
          row.querySelector(".kb-keys").innerHTML = renderKeys(data.bind, query);
          row.querySelector(".kb-desc").innerHTML = highlight(data.description, query);
          if (wasHidden) {
            // filter transition — durations come from motion.css tokens
            row.classList.add("is-entering");
          }
        }
      });

      if (countEl) {
        countEl.textContent = shown + " of " + total + " shown";
      }
      if (emptyEl) {
        emptyEl.hidden = shown !== 0;
      }
    }

    table.addEventListener("animationend", function (event) {
      if (event.target.classList && event.target.classList.contains("kb-row")) {
        event.target.classList.remove("is-entering");
      }
    });

    input.addEventListener("input", function () {
      query = input.value.trim().toLowerCase();
      applyFilter();
    });

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        activeCategory = pill.getAttribute("data-category");
        pills.forEach(function (p) {
          p.setAttribute("aria-pressed", p === pill ? "true" : "false");
        });
        applyFilter();
      });
    });

    /* ---- copy-to-clipboard ------------------------------------------------ */
    function announce(message) {
      if (liveEl) {
        liveEl.textContent = message;
      }
    }

    function copyBind(row, button) {
      var bind = row.getAttribute("data-bind") || "";
      window.TenebraUtils.copyText(bind).then(function () {
        announce("Copied " + bind);
        if (button) {
          button.classList.add("is-copied");
          button.textContent = "copied";
          window.setTimeout(function () {
            button.classList.remove("is-copied");
            button.textContent = "copy";
          }, 1200);
        }
      }).catch(function () {
        announce("Copy failed — clipboard unavailable");
      });
    }

    rows.forEach(function (row) {
      var bind = row.getAttribute("data-bind") || "";

      // focusable row, Enter copies
      row.setAttribute("tabindex", "0");

      // injected copy button (after the .kb-keys span so re-renders keep it)
      var button = document.createElement("button");
      button.type = "button";
      button.className = "kb-copy";
      button.textContent = "copy";
      button.setAttribute("aria-label", "Copy keybind " + bind);
      row.querySelector(".kb-bind").appendChild(button);

      button.addEventListener("click", function () {
        copyBind(row, button);
      });

      row.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && event.target === row) {
          copyBind(row, button);
        }
      });
    });

    // initial state (count text is already correct in static HTML)
    applyFilter();
  });
})();
