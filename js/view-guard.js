/* v446: repair .views / .view elements left with inline display:none. */
(function () {
  if (window.__v446) return;
  window.__v446 = "1";

  function paint(m) {
    try {
      var b = document.getElementById("__v446badge");
      if (!b) {
        b = document.createElement("div"); b.id = "__v446badge";
        b.style.cssText = "position:fixed;top:6px;left:6px;z-index:999999;" +
          "background:rgba(0,0,0,.88);color:#9fe;font:10px monospace;" +
          "padding:5px 8px;border-radius:8px;pointer-events:none";
        (document.body || document.documentElement).appendChild(b);
      }
      b.textContent = m;
    } catch (e) {}
  }

  /* v447: pick the view the URL actually asks for */
  function target() {
    var h = (location.hash || "").replace(/^#\/?/, "").toLowerCase().split(/[?&#]/)[0];
    if (h) {
      var v = document.getElementById("view-" + h);
      if (v) return v;
      var alt = document.querySelector('[data-view="' + h + '"]');
      if (alt) { try { alt.click(); } catch (e) {} return null; }
    }
    return document.getElementById("view-chat");
  }

  var boot = 0, placed = false;
  var pinned = "";
  try { pinned = (location.hash || "").replace(/^#\/?/, "").toLowerCase().split(/[?&#]/)[0]; } catch (e) {}
  function fix() {
    var app = document.getElementById("app");
    if (!app) return;
    if (getComputedStyle(app).display === "none") return;
    if (document.querySelector("#vadm.show, #admin.show, .adm.show")) return;

    var views = [].slice.call(document.querySelectorAll(".view"));
    if (!views.length) return;

    if (location.search.indexOf("v446debug") > -1) {
      paint("hash:" + (location.hash || "-") + " ticks:" + boot);
    }

    /* always: undo stale inline hiding */
    var box = document.querySelector(".views");
    if (box) box.style.display = "";
    var i, any = false;
    for (i = 0; i < views.length; i++) {
      views[i].style.display = "";
      if (views[i].classList.contains("show")) any = true;
    }

    /* v447b: honour the URL once at boot, then stay out of the way */
    /* v451: the URL must always mirror the visible view or reload cannot restore it */
    var live = null;
    for (i = 0; i < views.length; i++) {
      if (views[i].classList.contains("show")) {
        if (live) { live = null; break; }
        live = views[i].id.replace(/^view-/, "");
      }
    }
    if (live) {
      var want = "#/" + live;
      if (location.hash !== want) {
        try { history.replaceState(null, "", want); pinned = live; } catch (e) {}
      } else pinned = live;
    }

    /* v450: hold the boot route - something rewrites the hash right after load */
    if (pinned && boot < 6) {
      var cur = (location.hash || "").replace(/^#\/?/, "").toLowerCase().split(/[?&#]/)[0];
      if (cur && cur !== pinned) {
        try { history.replaceState(null, "", "#/" + pinned); } catch (e) {}
      }
    }

    if (!placed) {
      placed = true;
      var t = target();
      if (t && !t.classList.contains("show")) {
        for (i = 0; i < views.length; i++) views[i].classList.remove("show");
        t.classList.add("show");
      }
    }
    boot++;
  }

  function run() { try { fix(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  window.addEventListener("load", run);
  window.addEventListener("hashchange", function () { boot = 0; setTimeout(run, 0); });

  var iv = setInterval(function () {
    if (document.hidden) return;
    run();
    if (boot > 120) clearInterval(iv);   /* ~60s, then stop entirely */
  }, 500);
})();
