/* v370-viewfix: ensure only one .view has .show at a time.
 * Root cause: app.js line ~1067 only adds .show without removing it
 * from siblings, causing overlapping absolute-positioned views to fight.
 * Fix: MutationObserver enforces the invariant globally.
 */
(function () {
  "use strict";
  var VIEWS = ["view-chat", "view-explore", "view-modules", "view-history", "view-settings"];
  var enforcing = false;

  function onlyOne(keepId) {
    VIEWS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === keepId) {
        el.classList.add("show");
      } else {
        el.classList.remove("show");
        if (el.style.display) el.style.display = "";
      }
    });
  }

  function activeNavView() {
    var nav = document.querySelector(".nav-item.active[data-view]");
    return nav ? "view-" + nav.getAttribute("data-view") : null;
  }

  function enforce() {
    if (enforcing) return;
    var shown = [];
    VIEWS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.classList.contains("show")) shown.push(id);
    });
    if (shown.length <= 1) return;
    enforcing = true;
    onlyOne(activeNavView() || shown[shown.length - 1]);
    enforcing = false;
  }

  // Intercept nav clicks — enforce right after app.js's own handler runs.
  document.addEventListener("click", function (e) {
    var nav = e.target.closest(".nav-item[data-view]");
    if (!nav) return;
    var target = "view-" + nav.getAttribute("data-view");
    setTimeout(function () { onlyOne(target); }, 0);
  }, true);

  // Watch for ANY code path that adds .show.
  function start() {
    var wrap = document.querySelector(".views");
    if (!wrap) return setTimeout(start, 120);
    new MutationObserver(enforce).observe(wrap, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });
    onlyOne(activeNavView() || "view-chat");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
