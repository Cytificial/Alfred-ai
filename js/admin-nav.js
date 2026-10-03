/* v467: exactly one Admin row in the sidebar. */
(function () {
  if (window.__adminNav467) return;
  window.__adminNav467 = "1";

  function dedupe() {
    var rows = [].slice.call(document.querySelectorAll('.nav-item[data-view="admin"]'));
    if (rows.length < 2) return;
    /* keep the last injected row - the newer, fuller panel */
    rows.slice(0, rows.length - 1).forEach(function (r) {
      try { r.remove(); } catch (e) {}
    });
  }

  function run() { try { dedupe(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.addEventListener("load", run);

  var n = 0;
  var iv = setInterval(function () {
    if (document.hidden) return;
    if (++n > 30) { clearInterval(iv); return; }
    run();
  }, 700);
})();
