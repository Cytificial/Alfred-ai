/* v446: recover a collapsed .views container. Never overrides deliberate hiding. */
(function () {
  if (window.__v446) return;
  window.__v446 = "1";

  function fix() {
    var app = document.getElementById("app");
    if (!app) return;
    if (getComputedStyle(app).display === "none") return;   /* another screen owns it */

    var box = document.querySelector(".views");
    if (!box) return;

    /* the container itself was left inline display:none - that is always a bug */
    if (box.style.display === "none") box.style.display = "";

    var views = [].slice.call(box.querySelectorAll(".view"));
    if (!views.length) return;

    /* v454: only rescue .view elements when nothing at all is showing, otherwise
       we would fight app.js which hides views on purpose (plans overlay) */
    var shown = false, i;
    for (i = 0; i < views.length; i++) {
      if (views[i].classList.contains("show") || views[i].style.display !== "none") { shown = true; break; }
    }
    if (shown) return;

    for (i = 0; i < views.length; i++) views[i].style.display = "";
    var c = document.getElementById("view-chat");
    if (c) c.classList.add("show");
  }

  function run() { try { fix(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.addEventListener("load", run);
  setInterval(run, 500);
})();
