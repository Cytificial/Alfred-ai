/* v168: restore the login gate after a demo-view swap; never override real auth */
(function () {
  if (window.__v168) return;
  window.__v168 = true;

  var API = "http://" + location.hostname + ":8082";
  var RECOVERY_KEY = "v168_gate_reload";
  var realFetch = window.fetch;
  var loginInFlight = 0, recovering = false;

  function token() {
    try { return localStorage.getItem("alfred_token") || ""; }
    catch (e) { return ""; }
  }
  function visible(el) {
    if (!el || !el.getClientRects().length) return false;
    var s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden";
  }
  function loginRoute() {
    return /^#\/?login(?:[/?]|$)/i.test(location.hash || "");
  }
  function gateVisible() {
    return Array.prototype.some.call(
      document.querySelectorAll('input[type="password"]'), visible);
  }
  function composerVisible() {
    return Array.prototype.some.call(
      document.querySelectorAll(
        ".composer,#composer,[data-composer],textarea[placeholder*='message' i],[contenteditable='true']"
      ), visible);
  }
  function hideCredits() {
    try {
      document.querySelectorAll(
        "#v160cr,[id*='credit' i],[class*='credit' i],[id*='usage' i],[class*='usage' i]"
      ).forEach(function (e) { e.style.setProperty("display", "none", "important"); });
      document.querySelectorAll("span,div,section,aside").forEach(function (e) {
        var t = (e.textContent || "").trim();
        if (t.length > 40 || !/⚡/.test(t) || !/(…|\.{3})/.test(t)) return;
        for (var n = e; n && n !== document.body; n = n.parentElement) {
          var r = n.getBoundingClientRect();
          if (r.width >= 140 && r.width <= 500 && r.height >= 28 && r.height <= 130) {
            n.style.setProperty("display", "none", "important");
            break;
          }
        }
      });
    } catch (e) {}
  }

  function probe(sent, retried) {
    return realFetch(API + "/api/usage", {
      credentials: "include",
      headers: { "X-Alfred-Token": sent }
    }).then(function (r) {
      if (r.status !== 401) return r.ok ? true : null;
      var current = token();
      if (current !== sent) return retried ? null : probe(current, true);
      try {
        localStorage.removeItem("alfred_token");
        localStorage.removeItem("alfred_authed");
      } catch (e) {}
      hideCredits();
      return false;
    }).catch(function () { return null; });
  }

  function recoverGate() {
    if (recovering) return;
    recovering = true;
    var deadline = Date.now() + 5000;

    function inspect() {
      if (Date.now() > deadline) { recovering = false; return; }
      if (loginInFlight || !loginRoute() || gateVisible() || !composerVisible()) {
        setTimeout(inspect, 250);
        return;
      }
      probe(token(), false).then(function (valid) {
        if (valid === false && loginRoute() && composerVisible() && !gateVisible()) {
          try {
            if (!sessionStorage.getItem(RECOVERY_KEY)) {
              sessionStorage.setItem(RECOVERY_KEY, "1");
              location.reload();       /* same #/login; boots the real gate */
              return;
            }
          } catch (e) { location.reload(); return; }
          hideCredits();
        }
        recovering = false;
      });
    }
    setTimeout(inspect, 300);
  }

  /* refill the one-reload budget after the gate is genuinely visible */
  var gateSince = 0;
  setInterval(function () {
    if (loginRoute() && gateVisible()) {
      if (!gateSince) gateSince = Date.now();
      if (Date.now() - gateSince > 1200) {
        try { sessionStorage.removeItem(RECOVERY_KEY); } catch (e) {}
      }
    } else gateSince = 0;
  }, 250);

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var p = realFetch.apply(this, arguments);

    if (url.indexOf("/api/auth/login") !== -1) {
      try { sessionStorage.removeItem(RECOVERY_KEY); } catch (e) {}
      loginInFlight++;
      p.then(function (r) {
        return r.clone().json().then(function (j) {
          if (j && j.ok && j.token) {
            try { sessionStorage.removeItem(RECOVERY_KEY); } catch (e) {}
          } else recoverGate();
        }, recoverGate);
      }).catch(function () {}).then(function () {
        loginInFlight = Math.max(0, loginInFlight - 1);
      });
    }

    if (/\/api\/chat(?:\/stream)?(?:[?#]|$)/.test(url)) {
      p.then(function (r) {
        if (r.status === 401) recoverGate();
      }).catch(function () {});
    }
    return p;
  };
})();
