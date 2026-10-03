(function () {
  if (window.__pwReveal) return;
  window.__pwReveal = "1";

  var EYE_OPEN =
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/>' +
    '<circle cx="12" cy="12" r="2.6"/></svg>';
  var EYE_SHUT =
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/>' +
    '<circle cx="12" cy="12" r="2.6"/><path d="M3.5 3.5l17 17"/></svg>';

  function decorate(inp) {
    if (!inp || inp.dataset.pwDone) return;
    inp.dataset.pwDone = "1";
    var wrap = inp.closest(".inp-wrap") || inp.parentElement;
    if (!wrap) return;
    if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";

    if (inp.tagName === "INPUT" && inp.type !== "password") inp.type = "password";

    var b = document.createElement("button");
    b.type = "button";
    b.className = "pw-eye";
    b.setAttribute("aria-label", "Show password");
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = EYE_OPEN;
    b.style.cssText = "position:absolute;right:4px;top:50%;transform:translateY(-50%);" +
      "width:42px;height:42px;border:0;border-radius:11px;background:transparent;" +
      "color:#8fb8e8;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "z-index:6;-webkit-tap-highlight-color:transparent";

    b.addEventListener("click", function (ev) {
      ev.preventDefault();
      var show = inp.type === "password";
      inp.type = show ? "text" : "password";
      inp.classList.toggle("showing", show);
      b.innerHTML = show ? EYE_SHUT : EYE_OPEN;
      b.setAttribute("aria-label", show ? "Hide password" : "Show password");
      b.setAttribute("aria-pressed", show ? "true" : "false");
      inp.focus();
      try {
        var n = inp.value.length;
        if (inp.setSelectionRange) inp.setSelectionRange(n, n);
      } catch (e) {}
    });
    wrap.appendChild(b);
  }

  function scan() {
    var ps = document.querySelectorAll('input.pw, input.pw-revealed, input[type="password"]');
    for (var i = 0; i < ps.length; i++) decorate(ps[i]);
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("hashchange", scan);
})();
