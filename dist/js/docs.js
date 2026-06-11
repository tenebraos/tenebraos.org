// TenebraOS — docs.js
// Documentation page enhancements:
//   - highlight.js init (script loaded from cdnjs with defer, before this file)
//   - scrollspy: IntersectionObserver marks the active sidebar link
// Scrolling itself is CSS (scroll-behavior: smooth, disabled under
// prefers-reduced-motion in styles.css) — no JS scrolling here.

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- syntax highlighting ---------------------------------------------- */
    if (typeof hljs !== "undefined") {
      hljs.highlightAll();
    }

    /* ---- scrollspy ---------------------------------------------------------- */
    var sidebar = document.querySelector(".docs-sidebar");
    if (!sidebar || !("IntersectionObserver" in window)) {
      return;
    }

    var links = Array.prototype.slice.call(
      sidebar.querySelectorAll('a[href^="#"]')
    );
    var linkById = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) {
        linkById[id] = link;
        sections.push(section);
      }
    });

    if (sections.length === 0) {
      return;
    }

    function setActive(id) {
      links.forEach(function (link) {
        if (link === linkById[id]) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    // Track which sections currently intersect the "reading band" (upper
    // third of the viewport); the topmost one wins.
    var visible = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) {
          setActive(sections[i].id);
          return;
        }
      }
    }, {
      rootMargin: "-15% 0px -65% 0px",
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Immediate feedback on click (observer catches up after the scroll).
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        setActive(link.getAttribute("href").slice(1));
      });
    });
  });
})();
