/* v458: Plans overlay - fixed top bar, full-viewport takeover, no bleed. */
(function () {
  if (window.__plansNav) return; window.__plansNav = "1";

  var css = document.createElement("style");
  css.textContent = [
    "#view-pay{position:fixed !important;top:0 !important;left:0 !important;",
    "right:0 !important;bottom:0 !important;box-sizing:border-box !important;",
    "overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch;",
    "z-index:2147483000 !important;background:#080D17 !important;",
    "padding:80px 16px 110px !important;}",
    "#view-pay .pay-topbar{position:fixed !important;top:0 !important;left:0 !important;",
    "right:0 !important;z-index:2147483001;display:flex;align-items:center;gap:12px;",
    "padding:13px 16px;background:rgba(8,13,23,.97);backdrop-filter:blur(14px);",
    "border-bottom:1px solid rgba(255,255,255,.09);}",
    "#view-pay .pay-back2{display:inline-flex;align-items:center;gap:8px;height:40px;",
    "padding:0 16px;border-radius:999px;border:1px solid rgba(127,196,255,.35);",
    "background:rgba(127,196,255,.08);color:#cfe6ff;font:600 13px system-ui;",
    "cursor:pointer;white-space:nowrap;flex:0 0 auto;}",
    "#view-pay .pay-topbar h2{margin:0;font:600 17px system-ui;color:#eaf2ff;",
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    "#view-pay *{max-width:100%;box-sizing:border-box;}",
    "#view-pay .pv,#view-pay .pu{white-space:normal;overflow-wrap:anywhere;}",
    "body.plans-open #app{visibility:hidden !important;}",
    "body.plans-open .composer,body.plans-open #v161think,body.plans-open .toast,
    "body.plans-open #__v446badge{display:none !important;}"
  ].join("");
  (document.head || document.documentElement).appendChild(css);

  function close() {
    var pay = document.getElementById("view-pay");
    if (pay) pay.style.display = "none";
    try { document.body.style.overflow = ""; } catch (e) {}
    try { document.body.classList.remove("plans-open"); } catch (e) {}
    var s = document.getElementById("view-settings");
    if (s) { s.style.display = ""; s.classList.add("show"); }
    try { if (window.__closePlans) window.__closePlans(); } catch (e) {}
    try { location.hash = "#/settings"; } catch (e) {}
  }
  window.__closePlansOverlay = close;

  function build() {
    var pay = document.getElementById("view-pay");
    if (!pay) return;
    /* v459: reparent to <body> so the overlay outranks the whole app shell */
    if (pay.parentElement !== document.body && pay.parentElement) {
      document.body.appendChild(pay);
    }
    if (!pay.querySelector(".pay-topbar")) {
      var t = document.createElement("div");
      t.className = "pay-topbar";
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pay-back2";
      b.innerHTML = '<span aria-hidden="true">\u2190</span> Back';
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); close(); });
      var h = document.createElement("h2");
      h.textContent = "Plans";
      t.appendChild(b); t.appendChild(h);
      pay.appendChild(t);
    }
    /* v458: hide the app chrome underneath while Plans owns the screen */
    try {
      var open = getComputedStyle(pay).display !== "none";
      document.body.classList[open ? "add" : "remove"]("plans-open");
    } catch (e) {}
  }

  document.addEventListener("keydown", function (e) {
    var pay = document.getElementById("view-pay");
    if (e.key === "Escape" && pay && getComputedStyle(pay).display !== "none") close();
  });

  function run() { try { build(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  setInterval(run, 400);
})();
