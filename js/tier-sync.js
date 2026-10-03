/* v470: the server is the only source of truth for a user's tier. */
(function () {
  if (window.__v470) return;
  window.__v470 = "1";

  function tok() {
    try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; }
  }

  function text(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v !== "object") return String(v);
    return v.name || v.tier || v.id || v.label || "";
  }

  function chatIsNew() {
    var c = document.getElementById("view-chat");
    if (!c) return false;
    return c.querySelectorAll(".msg").length === 0;
  }

  var greeted = false;

  function greet(t) {
    if (greeted || !t.greeting) return;
    if (!chatIsNew()) return;              /* existing chat/project: never greet */
    greeted = true;
    var c = document.getElementById("view-chat");
    if (!c) return;
    var host = c.querySelector(".thread, .msgs, #thread, #msgs") || c;
    var b = document.createElement("div");
    b.className = "msg v470-greet";
    b.style.cssText = "margin:10px 0;padding:14px 16px;border-radius:14px;"
      + "border:1px solid rgba(255,255,255,.12);opacity:.92;line-height:1.55";
    b.textContent = t.greeting;
    host.appendChild(b);
  }

  function apply(t) {
    var th = t.theme || {};

    /* 1. one source of truth for every plan reader, incl. the Modules card */
    try { localStorage.setItem("alfred_plan", JSON.stringify({ id: t.tier, name: t.name })); }
    catch (e) {}

    /* 2. tier accent on the app shell */
    var root = document.documentElement;
    if (th.accent) root.style.setProperty("--acc", th.accent);
    if (th.glow)   root.style.setProperty("--glow", th.glow);
    if (th.surface) root.style.setProperty("--surface", th.surface);
    root.dataset.tier = t.tier || "free";

    /* 3. header + icon change per tier - this is the persistent marker */
    var head = document.querySelector(".top-title, .hdr-title, #hdr-title");
    if (head) head.textContent = t.name || "Alfred";
    var badge = document.querySelector(".tier-badge");
    if (badge) {
      badge.textContent = t.name || "Free";
      badge.className = "tier-badge t-" + (t.tier || "free");
    }

    /* 4. greeting: brand-new chat only */
    greet(t);
  }

  function load() {
    var t = tok();
    if (!t) return;
    fetch("/api/entitlements", { credentials: "include",
                                 headers: { "X-Alfred-Token": t } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) apply(j); })
      .catch(function () {});
  }

  load();
  window.addEventListener("focus", load);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) load();
  });
})();
