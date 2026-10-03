/* v461: Plans overlay chrome - fixed bar, full-viewport takeover. */
(function () {
  if (window.__payNav461) return;
  window.__payNav461 = "1";

  function addCss() {
    if (document.getElementById("payNavCss")) return;
    var s = document.createElement("style");
    s.id = "payNavCss";
    s.textContent = [
      'body.plans-open #app{visibility:hidden !important;}',
      '#view-pay{position:fixed !important;top:0 !important;left:0 !important;',
      'right:0 !important;bottom:0 !important;box-sizing:border-box !important;',
      'overflow-y:auto !important;overflow-x:hidden !important;',
      '-webkit-overflow-scrolling:touch;z-index:2147483000 !important;',
      'background:#080D17 !important;padding:84px 16px 120px !important;}',
      '#view-pay .paybar{position:fixed !important;top:0 !important;left:0 !important;',
      'right:0 !important;z-index:2147483001;display:flex;align-items:center;gap:12px;',
      'padding:13px 16px;background:#0B1220;border-bottom:1px solid rgba(255,255,255,.09);}',
      '#view-pay .paybar b{display:inline-flex;align-items:center;gap:8px;height:40px;',
      'padding:0 16px;border-radius:999px;border:1px solid rgba(127,196,255,.35);',
      'background:rgba(127,196,255,.08);color:#cfe6ff;font:600 13px system-ui;',
      'cursor:pointer;white-space:nowrap;}',
      '#view-pay .paybar h2{margin:0;font:600 17px system-ui;color:#eaf2ff;}',
      '#view-pay *{max-width:100%;box-sizing:border-box;}',
      '#view-pay .pv,#view-pay .pu{white-space:normal;overflow-wrap:anywhere;}'
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  function close() {
    var pay = document.getElementById("view-pay");
    if (pay) pay.style.display = "none";
    try { document.body.style.overflow = ""; } catch (e) {}
    document.body.classList.remove("plans-open");
    var s = document.getElementById("view-settings");
    if (s) { s.style.display = ""; s.classList.add("show"); }
    try { if (window.__closePlans) window.__closePlans(); } catch (e) {}
    try { location.hash = "#/settings"; } catch (e) {}
  }
  window.__closePlansOverlay = close;

  function tick() {
    addCss();
    var pay = document.getElementById("view-pay");
    if (!pay) return;
    if (!pay.querySelector(".paybar")) {
      var bar = document.createElement("div");
      bar.className = "paybar";
      var b = document.createElement("b");
      b.innerHTML = '<span aria-hidden="true">\u2190</span> Back';
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); close(); });
      var h = document.createElement("h2");
      h.textContent = "Plans";
      bar.appendChild(b); bar.appendChild(h);
      pay.appendChild(bar);
    }
    var open = true;
    try { open = window.getComputedStyle(pay).display !== "none"; } catch (e) {}
    document.body.classList[open ? "add" : "remove"]("plans-open");
  }

  document.addEventListener("keydown", function (e) {
    var pay = document.getElementById("view-pay");
    if (e.key === "Escape" && pay && window.getComputedStyle(pay).display !== "none") close();
  });

  function start() {
    tick();
    setInterval(tick, 350);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
