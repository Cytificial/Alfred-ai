/* v471: the single Admin row. Opens the standalone portal, nothing else. */
(function () {
  if (window.__v471) return;
  window.__v471 = "1";

  function build() {
    if (document.getElementById("v471-admin")) return;
    var a = document.createElement("a");
    a.className = "nav-item";
    a.id = "v471-admin";
    a.setAttribute("data-view", "admin");
    a.setAttribute("data-v471", "1");
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
      + ' stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M12 3l7.5 4v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V7z"/>'
      + '<path d="M9.5 12.2l1.9 1.9 3.4-3.6"/></svg><span>Admin</span>';

    a.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.open("/admin.html", "_blank");
    });

    var host = document.querySelector(".nav, .side-nav, .sidebar nav, aside")
            || document.querySelector(".nav-item")?.parentElement;
    if (host) host.appendChild(a);
  }

  function run() {
    try {
      build();
      /* one Admin row. Always. */
      [].slice.call(document.querySelectorAll('.nav-item[data-view="admin"]'))
        .forEach(function (el, i, all) {
          if (all.length > 1 && el.id !== "v471-admin") el.remove();
        });
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.addEventListener("load", run);
  window.addEventListener("hashchange", function () { setTimeout(run, 0); });

  var n = 0, iv = setInterval(function () {
    if (document.hidden) return;
    if (++n > 40) { clearInterval(iv); return; }
    run();
  }, 600);
})();
