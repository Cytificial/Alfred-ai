/* v215 CLEANUP: radars, tap probe, bounce historian retired - v202 reload-net stays */
try { window.__v141 = "1"; window.__v142 = "1"; window.__v187 = "1"; window.__v199 = "1"; window.__v200 = "1"; window.__v201 = "1"; } catch (e) {}
try { window.__v155b = "1"; } catch (e) {}
/* ===== v203: BOOT CONDUCTOR — one owner of loading→login/app. No reloads. ===== */
(function () {
  if (window.__v203) return; window.__v203 = "1";
  try { window.__v199 = "1"; window.__v200 = "1"; window.__v201 = "1"; window.__v202 = "1"; } catch (e) {}
  try { window.__v137c = "1"; window.__v140 = "1"; window.__v144 = "1"; window.__v153a = "1";
        window.__v163f = "1"; window.__v166 = "1"; window.__v166b = "1"; window.__v168 = "1"; } catch (e) {}
  try { sessionStorage.setItem("v170off", "1"); } catch (e) {}
  try { sessionStorage.removeItem("v200log"); } catch (e) {}

  /* v206: conductor OWNS the splash — always show it, every load */
  try {
    var _lo = document.getElementById("loading");
    if (_lo) {
      _lo.classList.add("show"); _lo.style.display = "";
      _lo.style.opacity = "1"; _lo.style.transition = "";
      ["app", "login", "register"].forEach(function (id) {
        var sc = document.getElementById(id);
        if (sc) { sc.classList.remove("show"); sc.style.display = "none"; }
      });
    }
  } catch (e) {}
  try { var _b = document.getElementById("v199badge"); if (_b) _b.remove(); } catch (e) {}

  function el(id) { return document.getElementById(id); }
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function wipeTok() { try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {} }

  var SCREENS = ["loading", "login", "register", "app"];
  function show(id) {
    SCREENS.forEach(function (sid) {
      var sc = el(sid); if (!sc) return;
      if (sid === id) { sc.classList.add("show"); sc.style.display = ""; }
      else { sc.classList.remove("show"); sc.style.display = (sid === "loading") ? "none" : ""; }
    });
  }

  window.__v203authed = false;
  var done = false, shown = false, decided = false, routeSeq = 0, landing = false;
  var T0 = Date.now();
  function go(authed, instant) {
    done = true; window.__v203authed = !!authed;
    var seq = ++routeSeq;
    function land() {
      if (seq !== routeSeq) return;
      landing = true;                        /* v208: splash is mine until landed */
      var lo = el("loading");
      function finish() {
        if (seq !== routeSeq) return;
        if (authed) { show("app"); try { if ((location.hash || "").indexOf("chat") === -1) location.hash = "#/chat"; } catch (e) {} }
        else show("login");
        try { lo.style.opacity = ""; lo.style.transition = ""; } catch (e) {}
        shown = true; window.__v203shown = true; landing = false;
      }
      if (lo && lo.classList.contains("show")) {
        var exitDone = false, exitTimer = null;
        function endExit(ev) {
          if (ev && (ev.target !== lo || ev.animationName !== "zoomOut")) return;
          if (exitDone) return;
          exitDone = true;
          clearTimeout(exitTimer);
          lo.removeEventListener("animationend", endExit);
          lo.classList.remove("exit");
          try { lo.style.opacity = ""; lo.style.transition = ""; } catch (e) {}
          finish();
        }
        lo.addEventListener("animationend", endExit);
        try { lo.style.opacity = ""; lo.style.transition = ""; } catch (e) {}
        lo.classList.remove("exit");
        void lo.offsetWidth;
        lo.classList.add("exit");
        exitTimer = setTimeout(function () { endExit(); }, 1100);
      } else finish();
    }
    if (instant || shown) { land(); return; }
    var poll = setInterval(function () {
      var barDone = window.__v207barFin && (Date.now() - T0 >= 400);
      var tooLong = Date.now() - T0 > 3000;
      if (seq !== routeSeq) { clearInterval(poll); return; }
      if (barDone || tooLong) {
        clearInterval(poll);
        setTimeout(land, 2000);              /* v210: hold at 100% for 2 seconds */
      }
    }, 60);
  }

  /* v207: wall-clock glide — reaches 100% exactly at route time, always */
  (function () {
    var fill = el("fill"), pct = el("pct");
    if (!fill || !pct) return;
    var f2 = fill.cloneNode(true), p2 = pct.cloneNode(true);
    fill.parentNode.replaceChild(f2, fill);
    pct.parentNode.replaceChild(p2, pct);
    fill = f2; pct = p2;
    try { fill.style.transition = "width 90ms linear"; } catch (e) {}
    function paint(v) {
      fill.style.width = v + "%";
      pct.textContent = (v < 10 ? "0" : "") + Math.round(v) + "%";
      if (v >= 97) { try { var st = document.getElementById("status"); if (st) st.textContent = "Neural sanctuary ready"; } catch (er) {} }
    }
    var gi = setInterval(function () {
      var lf = document.getElementById("fill"), lp = document.getElementById("pct");
      if (lf && lf !== fill) { fill = lf; try { fill.style.transition = "width 90ms linear"; } catch (e) {} }
      if (lp && lp !== pct) pct = lp;
      var t = Math.min(1, (Date.now() - T0) / 1400);
      var v = t < 0.85 ? (t / 0.85) * 92 : 92 + ((t - 0.85) / 0.15) * 8;
      paint(v);
      if (t >= 1) {
        paint(100); window.__v207barFin = true; clearInterval(gi);
        try {
          var bar = el("bar"), status = el("status");
          var statusP = document.querySelector(".status");
          var logo = document.querySelector(".logo");
          if (bar) bar.classList.add("done");
          if (status) status.textContent = "Neural sanctuary ready";
          if (statusP) statusP.classList.add("ready");
          if (logo) logo.classList.add("flare");
        } catch (e) {}
      }
    }, 60);
  })();

  function expiredNote() {
    try {
      var card = document.querySelector("#login .card");
      if (!card || card.querySelector(".v207-note")) return;
      var d = document.createElement("p");
      d.className = "v207-note";
      d.style.cssText = "margin:0 0 10px;color:#ff9db1;font-size:13px;text-align:left";
      d.textContent = "Your session expired — sign in to continue.";
      card.insertBefore(d, card.firstChild);
    } catch (e) {}
  }
  function bootDecide(ok) {
    if (decided || window.__v203authed) return;
    decided = true;
    if (ok && tok()) { go(true); return; }
    var hadTok = !!tok();
    wipeTok();
    if (hadTok) expiredNote();
    go(false);
  }
  try {
    fetch("/api/auth/me", { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.status === 200; })
      .catch(function () { return false; })
      .then(function (ok) { bootDecide(ok); });
  } catch (e) { bootDecide(false); }
  setTimeout(function () { bootDecide(false); }, 3500);

  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var pr = of.apply(this, arguments);
    if (/\/api\/auth\/(login|register)(\?|$)/.test(s)) {
      pr.then(function (r) {
        try { r.clone().json().then(function (j) {
          if (j && j.ok && j.token) { window.__v203authed = true; decided = true; go(true, true); }
        }).catch(function () {}); } catch (e) {}
      }).catch(function () {});
    }
    if (s.indexOf("/api/auth/logout") > -1) pr.then(function () { window.__v203authed = false; }).catch(function () {});
    return pr;
  };

  /* v207: splash guard + login-flash guard */
  var ticks = 0;
  var iv = setInterval(function () {
    ticks++;
    var lo = el("loading");
    if (landing) return;                     /* v208: fade in progress — hands off */
    if (!shown) {
      if (lo && !lo.classList.contains("show")) { lo.classList.add("show"); lo.style.display = ""; lo.style.opacity = "1"; }
      return;
    }
    if (window.__v203authed) {
      var lg = el("login");
      if (lg && lg.classList.contains("show")) show("app");   /* no old layer may flash login */
    }
    if (lo && lo.classList.contains("show")) show(window.__v203authed ? "app" : "login");
    if (ticks > 400) clearInterval(iv);
  }, 150);
})();

try { window.__v190 = "1"; } catch (e) {}
try { window.__v188 = "1"; } catch (e) {}
try { window.__v176 = "1"; } catch (e) {}
/* ===== v178 KILLSWITCH: v170 gate + v171 badge retired — old login page owns auth ===== */
try { window.__v170 = "1"; window.__v171 = "1"; window.__v170b = "1"; window.__v171b = "1"; } catch (e) {}

/* ===== v170: AlfredAuth — ONE auth owner. Fail-closed overlay gate. ===== */
(function(){
  try{ if(sessionStorage.getItem("v170off")==="1") return; }catch(e){}
  window.__v170="1";
  /* stand down the layers that fight over auth (SSE v152/v154, logout v122,
     OAuth v124, security v128, plan UI v160a all stay alive) */
  window.__v137c="1"; window.__v140="1"; window.__v144="1"; window.__v153a="1";
  window.__v163f="1"; window.__v166="1"; window.__v166b="1"; window.__v168="1";
  console.log("[v170] AlfredAuth live");

  function SS(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
  function SSS(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
  function SSR(k){ try{ sessionStorage.removeItem(k); }catch(e){} }
  function TOK(){ try{ return localStorage.getItem("alfred_token")||""; }catch(e){ return ""; } }
  function wipe(){ try{ localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); }catch(e){} }
  function ge(id){ return document.getElementById(id); }

  /* nobody may write "signed in" without a token */
  try{
    var _set=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
      if(k==="alfred_authed"){ var t=""; try{ t=this.getItem("alfred_token")||""; }catch(e){} if(!t) return; }
      return _set.call(this,k,v);
    };
  }catch(e){}

  var signed=false, busy=false, mode="login", g=null, err=null, btn=null, nameBox=null, modeEl=null;
  function fail(m){ if(!err) return; err.textContent=m||""; err.style.display=m?"block":"none"; }
  function showGate(m){ signed=false; SSR("v170boot2"); if(g) g.style.display="flex"; if(m) fail(m); }
  function hideGate(){ if(g) g.style.display="none"; fail(""); }

  function apply(u){
    signed=true;
    try{ localStorage.setItem("alfred_authed","1"); }catch(e){}
    try{ if(u&&u.name) localStorage.setItem("alfred_name",u.name); }catch(e){}
    try{ localStorage.setItem("alfred_plan", JSON.stringify({id:((u&&u.plan)||"free").toLowerCase()})); }catch(e){}
    hideGate();
    var h = String(location.hash || "").toLowerCase();
    if (!h || h === "#" || h === "#/" || h.indexOf("login") !== -1) {
      try { location.hash = "#/chat"; } catch (e) {}
    }

  }

  function probe(){
    var sent=TOK();
    fetch("/api/auth/me",{credentials:"include",headers:{"X-Alfred-Token":sent}})
      .then(function(r){ return r.status===200? r.json(): null; })
      .then(function(j){
        if(j&&j.ok&&j.user){ apply(j.user); }
        else if(TOK()===sent){
          if(signed){ wipe(); showGate("Session ended — sign in again"); }
          else { wipe(); if(g&&g.style.display==="none") showGate(""); }
        }
      }).catch(function(){});
  }

  function submit(){
    if(busy||!btn) return;
    var em=ge("ga-email").value.trim(), pw=ge("ga-pass").value;
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return fail("Enter a valid email.");
    if(pw.length<8) return fail("Password must be at least 8 characters.");
    var body={email:em,password:pw,remember:!!ge("ga-rem").checked};
    if(mode==="register"){ body.name=ge("ga-name").value.trim(); if(body.name.length<2) return fail("Enter your name."); }
    busy=true; btn.disabled=true; btn.textContent="One moment..."; fail("");
    fetch(mode==="register"?"/api/auth/register":"/api/auth/login",{
      method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},body:JSON.stringify(body)
    }).then(function(r){ return r.json().catch(function(){ return {}; }); })
    .then(function(j){
      if(j&&j.ok&&j.token){
        try{ localStorage.setItem("alfred_token",j.token); }catch(e){}
        try{ localStorage.setItem("alfred_authed","1"); }catch(e){}
        if(j.user) apply(j.user); else location.reload();
      } else fail((j&&j.error)||"That did not work. Try again.");
    }).catch(function(){ fail("Network hiccup — try again."); })
    .then(function(){ busy=false; if(btn){ btn.disabled=false; btn.textContent=mode==="register"?"Join":"Enter Alfred"; } });
  }

  function build(){
    if(ge("alfred-gate")) return;
    var st=document.createElement("style");
    st.textContent=
      "#alfred-gate{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:radial-gradient(1200px 700px at 50% 18%,#0c1a3a 0%,#050a18 60%,#03060f 100%);font-family:system-ui,-apple-system,Roboto,sans-serif}"
      +".ga-card{width:min(92vw,380px);background:rgba(10,20,44,.94);border:1px solid rgba(110,170,255,.22);border-radius:22px;padding:26px 22px;box-shadow:0 24px 80px rgba(0,0,0,.55);text-align:center;color:#eaf4ff}"
      +".ga-logo{width:64px;height:64px;line-height:64px;margin:0 auto 10px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#22d3ee);font-weight:800;font-size:30px;color:#fff;box-shadow:0 0 30px rgba(59,130,246,.5)}"
      +".ga-title{font-size:20px;font-weight:800;letter-spacing:4px}.ga-sub{font-size:12px;color:#9db8e8;margin:4px 0 16px}"
      +".ga-in{width:100%;box-sizing:border-box;margin:8px 0;padding:12px 14px;border-radius:12px;border:1px solid rgba(120,180,255,.28);background:rgba(255,255,255,.06);color:#eaf4ff;font-size:15px;outline:none}"
      +".ga-in:focus{border-color:#5ec8ff}.ga-rem{display:flex;align-items:center;gap:8px;font-size:13px;color:#b9c9ec;margin:8px 2px;text-align:left}"
      +".ga-btn{width:100%;margin:12px 0 4px;padding:13px;border:0;border-radius:26px;background:linear-gradient(90deg,#3b82f6,#06b6d4);color:#fff;font-size:16px;font-weight:700;cursor:pointer}.ga-btn:disabled{opacity:.6}"
      +".ga-err{display:none;color:#ff9db1;font-size:13px;margin:6px 0;min-height:16px}.ga-alt{color:#7fc4ff;font-size:13px;margin:8px 0 2px;cursor:pointer}"
      +".ga-or{color:#8fa6cf;font-size:11px;margin:14px 0 8px;letter-spacing:1px}.ga-row{display:flex;gap:10px;justify-content:center}"
      +".ga-prov{padding:9px 14px;border-radius:20px;border:1px solid rgba(120,180,255,.3);background:rgba(255,255,255,.05);font-size:13px;color:#dce9ff;cursor:pointer}";
    (document.head||document.documentElement).appendChild(st);
    g=document.createElement("div"); g.id="alfred-gate";
    g.innerHTML=
      '<div class="ga-card"><div class="ga-logo">A</div><div class="ga-title">ALFRED AI</div>'
     +'<div class="ga-sub">Your Mind, Amplified.</div>'
     +'<input id="ga-name" class="ga-in" type="text" placeholder="Your name" style="display:none" autocomplete="name">'
     +'<input id="ga-email" class="ga-in" type="email" placeholder="Email address" autocomplete="username">'
     +'<input id="ga-pass" class="ga-in" type="password" placeholder="Password" autocomplete="current-password">'
     +'<label class="ga-rem"><input id="ga-rem" type="checkbox"> Remember me</label>'
     +'<button id="ga-btn" class="ga-btn" type="button">Enter Alfred</button>'
     +'<div id="ga-err" class="ga-err"></div>'
     +'<div class="ga-alt" id="ga-mode">New here? Join Alfred</div>'
     +'<div class="ga-or">or continue with</div><div class="ga-row">'
     +'<div class="ga-prov" data-p="google">Google</div>'
     +'<div class="ga-prov" data-p="github">GitHub</div>'
     +'<div class="ga-prov" data-p="discord">Discord</div></div></div>';
    (document.body||document.documentElement).appendChild(g);
    err=ge("ga-err"); btn=ge("ga-btn"); nameBox=ge("ga-name"); modeEl=ge("ga-mode");
    btn.onclick=submit;
    g.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); submit(); } });
    modeEl.onclick=function(){
      mode=mode==="login"?"register":"login";
      nameBox.style.display=mode==="register"?"block":"none";
      btn.textContent=mode==="register"?"Join":"Enter Alfred";
      modeEl.textContent=mode==="register"?"Have an account? Enter Alfred":"New here? Join Alfred";
      fail("");
    };
    [].slice.call(document.querySelectorAll(".ga-prov")).forEach(function(p){
      p.onclick=function(){
        location.href=location.protocol+"//"+location.hostname+":8081/oauth/"+p.getAttribute("data-p");
      };
    });
  }

  var OF=window.fetch;
  window.fetch=function(u,o){
    var s=(typeof u==="string")?u:((u&&u.url)||"");
    var p=OF.apply(this,arguments);
    try{
      if(s.indexOf("/api/auth/logout")>-1)
        p.then(function(r){ if(r.ok){ wipe(); showGate(""); } }).catch(function(){});
      if(s.indexOf(":8082/api/chat")>-1)
        p.then(function(r){ if(r.status===401) probe(); }).catch(function(){});
    }catch(e){}
    return p;
  };

  function boot(){ /* v185: gate never built — old login page owns auth */ probe(); }
  if(document.body) boot();
  else document.addEventListener("DOMContentLoaded",boot);
  setInterval(probe,10000);
  window.addEventListener("hashchange",probe);
})();

/* ===== v166b: admission lockout + view sync (demo gate dies here) ===== */
window.__v137c="1"; window.__v140="1"; window.__v141="1"; window.__v142="1"; window.__v144="1"; window.__v153a="1";
(function () {
  if (window.__v166b) return; window.__v166b = "1";

  /* 1) nobody may write "signed in" without a token — demo writers neutered */
  var _set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === "alfred_authed") {
      var t = ""; try { t = this.getItem("alfred_token") || ""; } catch (e) {}
      if (!t) return;                       /* no token -> write silently dropped */
    }
    return _set.call(this, k, v);
  };

  var API = "http://" + location.hostname + ":8082";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function composerUp() { var c = document.querySelector(".composer"); return !!(c && c.offsetWidth > 0); }
  function hidePill() { var p = document.getElementById("v160cr"); if (p) p.style.display = "none"; }

  /* 2) view sync: chat view while signed out = stale render -> one guarded reload */
  function sync() {
    var sent = tok();   /* v167: stale-401 guard */
    fetch(API + "/api/usage", { credentials: "include", headers: { "X-Alfred-Token": sent } })
      .then(function (r) {
        if (r.status !== 401) return r.ok ? r.json() : null;
        hidePill();
        if (tok() === sent) { try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {} }
        if (composerUp()) {
          try { location.hash = "#/login"; } catch (e) {}   /* v167: no reload - hash only */
        }
        return null;
      }).catch(function () {});
  }
  sync(); setTimeout(sync, 900); setInterval(sync, 5000);
})();

/* ===== v166: the one session state machine (retires v163f admission; usage validates cookie OR token) ===== */
window.__v163f = "1";
(function () {
  if (window.__v166) return; window.__v166 = "1";
  var API = "http://" + location.hostname + ":8082";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function wipe() { try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {} }

  function usage() {
    var sent = tok();   /* v167: a late 401 can never erase a fresh login */
    return fetch(API + "/api/usage", { credentials: "include", headers: { "X-Alfred-Token": sent } })
      .then(function (r) {
        if (r.status === 401) { if (tok() === sent) wipe(); return null; }
        return r.ok ? r.json() : null;
      })
      .catch(function () { return null; });
  }

  function gateVisible() {
    var p = document.querySelector("input[type='password']");
    return !!(p && p.offsetWidth && p.offsetHeight);
  }

  var routing = false;
  function enforce(j) {
    if (routing) return;
    var h = location.hash || "#/login";
    if (j) {                                   /* signed in: #/login or bare -> chat */
      if (h === "#/login" || h === "" || h === "#") {
        routing = true; location.replace("/#/chat");
        setTimeout(function () { routing = false; }, 800);
      }
    } else {                                   /* signed out: force the gate */
      if (h !== "#/login" && h !== "") {
        routing = true; location.replace("/#/login");
        setTimeout(function () { routing = false; }, 800);
      }
    }
  }

  function check() { usage().then(enforce); }
  check(); setTimeout(check, 700);
  setInterval(check, 8000);
  window.addEventListener("hashchange", check);

  /* correct sign-in: verify the fresh token, then walk in */
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/login") > -1)
        p.then(function (r) {
          return r.ok ? r.clone().json().catch(function () { return null; }) : null;
        }).then(function (j) {
          if (j && j.ok && j.token) {
            try { localStorage.setItem("alfred_token", j.token);
                  localStorage.setItem("alfred_authed", "1"); } catch (e) {}
            setTimeout(check, 250);
          }
        }).catch(function () {});
      if (s.indexOf("/api/auth/logout") > -1)
        p.then(function () { wipe();
          setTimeout(function () { location.replace("/#/login"); }, 350); }).catch(function () {});
    } catch (e) {}
    return p;
  };
})();

/* ===== v163f: one plan machine + instant admission (retires the fighters) ===== */
window.__v159="1"; window.__v161a="1"; window.__v162="1"; window.__v158c2="1"; window.__v161e="1"; window.__v163a="1"; window.__v163b="1";
(function () {
  if (window.__v163f) return; window.__v163f = "1";
  var API = "http://" + location.hostname + ":8082";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  var userTyped = false, admitted = false, bootId = "free", planNode = null;

  /* repair a plan store broken by older patches (plain string instead of JSON) */
  try {
    var cache = localStorage.getItem("alfred_plan_cache");
    if (cache) localStorage.setItem("alfred_plan", cache);
    else {
      var raw = localStorage.getItem("alfred_plan") || "";
      if (raw && raw.charAt(0) !== "{") {
        var fixed = JSON.stringify({ id: raw.toLowerCase(), name: raw });
        localStorage.setItem("alfred_plan", fixed); localStorage.setItem("alfred_plan_cache", fixed);
      }
    }
    bootId = (JSON.parse(localStorage.getItem("alfred_plan") || "{}").id) || "free";
  } catch (e) {}

  /* ANY gate interaction blocks auto-admit — no more mid-typing walk-ins */
  function touch() { userTyped = true; }
  ["input","focus","keydown","click","submit"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "BUTTON" || t.tagName === "FORM")) touch();
      else if (t && t.closest && t.closest("input,button,form")) touch();
    }, true);
  });

  function gateUp() {
    var p = document.querySelector("input[type='password']");
    if (!p || !p.offsetWidth || !p.offsetHeight) return false;
    var card = p;
    for (var i = 0; i < 5 && card; i++) {
      if (card.querySelector && card.querySelector("input[type=email],input[placeholder*='@' i]") &&
          /sign in/i.test(card.textContent || "")) return true;
      card = card.parentElement;
    }
    return false;
  }
  function goIn(t) {
    if (admitted || userTyped) return;
    admitted = true;
    try { sessionStorage.setItem("v159adm", t.slice(0, 8)); } catch (e) {}
    if (location.hash === "#/chat") {
      if (!sessionStorage.getItem("v163rl")) {
        try { sessionStorage.setItem("v163rl", "1"); } catch (e) {}
        /* v203: no reload */
      }
    } else location.replace("/#/chat");
  }
  function usage(cb) {
    fetch(API + "/api/usage", { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) {
        if (r.status === 401) {
          try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {}
          return null;
        }
        return r.ok ? r.json() : null;
      }).then(cb).catch(function () { cb(null); });
  }

  /* header-only plan label fix — one cached text node, cheap, terminates */
  function findPlanNode() {
    planNode = null;
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = (n.nodeValue || "").trim();
        if (/^(Free|Pro|Ultra)$/.test(v)) {
          var r = n.parentElement.getBoundingClientRect();
          if (r.top > -10 && r.top < 170 && r.width < innerWidth * 0.9) { planNode = n; return; }
        }
      }
    } catch (e) {}
  }
  function fixLabels(plan) {
    try {
      if (!planNode || !planNode.isConnected) findPlanNode();
      if (planNode && planNode.nodeValue.trim().toLowerCase() !== plan.toLowerCase())
        planNode.nodeValue = plan;
    } catch (e) {}
  }

  function applyPlan(j) {
    if (!j || !j.ok || !j.plan) return;
    var name = String(j.plan), id = name.toLowerCase();
    if (!/^(free|pro|ultra)$/.test(id)) return;
    var store = JSON.stringify({ id: id, name: name });
    try {
      localStorage.setItem("alfred_plan_cache", store);
      if (localStorage.getItem("alfred_plan") !== store) localStorage.setItem("alfred_plan", store);
    } catch (e) {}
    fixLabels(name);                    /* no reload — the app re-renders natively */
  }
  function boot() {
    usage(function (j) {
      if (!j) return;
      applyPlan(j);
      if (gateUp() && !userTyped) goIn(tok());
    });
  }
  boot(); setTimeout(boot, 600);
  setInterval(function () { usage(applyPlan); }, 8000);

  var tmo = 0;
  new MutationObserver(function () {
    clearTimeout(tmo);
    tmo = setTimeout(function () {
      var p = ""; try { p = (JSON.parse(localStorage.getItem("alfred_plan") || "{}").name) || ""; } catch (e) {}
      if (p) fixLabels(p);
    }, 150);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  /* logout: really log out, land on the gate */
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/logout") > -1)
        p.then(function () {
          userTyped = false;
          try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {}
          setTimeout(function () { location.replace("/"); }, 350);
        }).catch(function () {});
    } catch (e) {}
    return p;
  };
})();

/* ===== v163a: verified-token admission — instant, gate-aware, no delays ===== */
window.__v159 = "1"; window.__v161a = "1";
(function () {
  if (window.__v163a) return; window.__v163a = "1";
  var done = false;
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function isGate() {
    var p = document.querySelector("input[type='password']");
    if (!p || !p.offsetWidth || !p.offsetHeight) return false;
    var card = p.parentElement;
    for (var i = 0; i < 5 && card; i++) {
      if (card.querySelector &&
          card.querySelector('input[type="email"],input[placeholder*="@" i]') &&
          /sign in/i.test(card.textContent || "")) return true;
      card = card.parentElement;
    }
    return false;                                  /* settings modals etc. — never touched */
  }
  function check() {
    if (done) return;
    var t = tok(); if (!t) return;
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": t } })
      .then(function (r) {
        if (r.status === 401) {
          try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {}
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (j && j.ok && isGate()) {
          done = true;
          try { sessionStorage.setItem("v159adm", t.slice(0, 8)); } catch (e) {}
          location.replace("/#/chat");               /* the proven magic-link path */
        }
      }).catch(function () {});
  }
  check(); setTimeout(check, 500);
})();

/* ===== v162: native plan store + native thinking card (retires all text fighters) ===== */
window.__v158c2 = "1"; window.__v161e = "1";          /* retire the swap layers — war over */
(function () {
  if (window.__v162) return; window.__v162 = "1";
  var css = document.createElement("style");
  css.textContent = "#v158cr{display:none !important}" +
    "#v161think{position:fixed;left:50%;transform:translateX(-50%);bottom:112px;z-index:9998;" +
    "display:none;align-items:center;gap:9px;padding:9px 16px;border-radius:999px;" +
    "background:rgba(10,22,46,.85);border:1px solid rgba(130,190,255,.4);color:#cfe6ff;" +
    "font-size:13px;backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(0,8,30,.5);}" +
    "#v161think i{width:7px;height:7px;border-radius:50%;background:#7cc4ff;display:inline-block;" +
    "animation:v162t 1s infinite alternate;}" +
    "#v161think i:nth-child(2){animation-delay:.2s}#v161think i:nth-child(3){animation-delay:.4s}" +
    "@keyframes v162t{from{opacity:.25}to{opacity:1;transform:translateY(-3px)}}";
  (document.head || document.documentElement).appendChild(css);
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  /* THE fix: write the plan in the app's own JSON format -> app renders Ultra itself */
  function setNativePlan(plan) {
    if (!plan) return;
    var p = String(plan).toLowerCase();
    try {
      localStorage.setItem("alfred_plan", JSON.stringify({ id: p, name: plan }));
      window.dispatchEvent(new StorageEvent("storage",
        { key: "alfred_plan", newValue: localStorage.getItem("alfred_plan") }));
    } catch (e) {}
  }
  setInterval(function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) setNativePlan(j.plan); })
      .catch(function () {});
  }, 8000);
  /* native thinking card: the app's own .proc inside the new ai message (line 418) */
  var chip = document.createElement("div"); chip.id = "v161think";
  chip.innerHTML = "<span><i></i><i></i><i></i></span><span class='v162tt'>Thinking…</span>";
  (document.body || document.documentElement).appendChild(chip);
  var words = ["Thinking…", "Consulting the engines…", "Composing…"];
  var rot = null, obs = null, fail = null, wi = 0;
  function nativeProc() {
    var list = document.querySelectorAll(".msg.ai .proc");
    for (var i = list.length - 1; i >= 0; i--)
      if (list[i].querySelector(".proc-title") && list[i].offsetParent !== undefined) return list[i];
    return null;
  }
  function hide() {
    chip.style.display = "none"; clearInterval(rot);
    if (obs) { try { obs.disconnect(); } catch (e) {} obs = null; }
    if (fail) { clearTimeout(fail); fail = null; }
    var n = nativeProc(); if (n) n.style.display = "";
  }
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    if (!(o && o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
          s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1))
      return of.apply(this, arguments);
    hide();
    var n = nativeProc(), usingNative = false;
    if (n) { usingNative = true; n.style.display = "flex"; }
    else chip.style.display = "flex";
    rot = setInterval(function () {
      wi = (wi + 1) % words.length;
      chip.querySelector(".v162tt").textContent = words[wi];
      if (usingNative) { var t = document.querySelector(".proc-title"); if (t) t.textContent = words[wi]; }
    }, 1400);
    var bub = null;
    try { var d = document.querySelector(".v129-dots"); if (d) bub = d.closest(".bubble"); } catch (e) {}
    if (bub && !bub.dataset.v162w) {
      bub.dataset.v162w = "1";
      obs = new MutationObserver(function () {
        if ((bub.textContent || "").replace(/▌/g, "").trim().length > 1) hide();
      });
      obs.observe(bub, { childList: true, characterData: true, subtree: true });
    }
    fail = setTimeout(hide, 45000);
    return of.apply(this, arguments).then(function (res) {
      setTimeout(hide, 400); return res;
    }).catch(function (e) { hide(); throw e; });
  };
})();

/* ===== v161a: instant admission + logout + toast killer (retires v159a/v159b delays) ===== */
window.__v159 = "1"; window.__v159b = "1";
(function () {
  if (window.__v161a) return; window.__v161a = "1";
  var tried = false, gone = false;
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function gateVisible() {
    var p = document.querySelector("input[type='password']");
    return !!(p && p.offsetWidth && p.offsetHeight);
  }
  function check() {
    if (tried || gone) return;
    var t = tok(); if (!t) return;
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": t } })
      .then(function (r) {
        if (r.status === 401) { gone = true;
          try { localStorage.removeItem("alfred_token"); localStorage.removeItem("alfred_authed"); } catch (e) {}
          return null; }
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (j && j.ok && gateVisible() && !tried) {
          tried = true;
          try { sessionStorage.setItem("v159adm", t.slice(0, 8)); } catch (e) {}
          location.replace("/#/chat");               /* instant — beats any typing race */
        }
      }).catch(function () {});
  }
  check(); setTimeout(check, 400);
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/logout") > -1)
        p.then(function () { gone = true; setTimeout(function () { location.replace("/"); }, 400); })
         .catch(function () {});
    } catch (e) {}
    return p;
  };
  var tk = 0;
  function killToast() {
    var els = document.querySelectorAll("div,span");
    for (var i = 0; i < els.length; i++)
      if ((els[i].textContent || "").trim().indexOf("tap Sign In once to continue") > -1) {
        var c = els[i];
        while (c && c !== document.body && c.parentElement &&
               getComputedStyle(c).position !== "fixed") c = c.parentElement;
        if (c && c !== document.body) c.remove();
      }
  }
  new MutationObserver(function () { clearTimeout(tk); tk = setTimeout(killToast, 150); })
    .observe(document.documentElement, { childList: true, subtree: true });
  killToast();
})();

/* ===== v158a: real login gate + real logout (prepended — outruns the demo handler) ===== */
(function () {
  if (window.__v158a) return; window.__v158a = "1";
  window.__v153a = "1";
  var native = window.fetch.bind(window);
  var _f = window.fetch;
  var busy = false;
  window.fetch = function (u, o) {              /* logout must really log out */
    var p = _f.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/logout") > -1)
        p.then(function () { try { localStorage.removeItem("alfred_token");
          localStorage.removeItem("alfred_authed"); } catch (e) {} }).catch(function () {});
    } catch (e) {}
    return p;
  };
  function cardOf(el) {
    while (el && el !== document.body) {
      if (el.querySelector && el.querySelector('input[type="password"]')) return el;
      el = el.parentElement;
    }
    return null;
  }
  function signInBtn(card) {
    var bs = card.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      var t = (bs[i].textContent || "").trim();
      if (/^sign in/i.test(t) && !/google|github|discord/i.test(t)) return bs[i];
    }
    return null;
  }
  function err(card, msg) {
    var e = card.querySelector(".v158err");
    if (!e) { e = document.createElement("div"); e.className = "v158err";
      e.style.cssText = "color:#ffb4a8;font-size:13px;margin-top:10px;text-align:center;";
      var b = signInBtn(card);
      if (b && b.parentNode) b.parentNode.insertBefore(e, b.nextSibling); else card.appendChild(e); }
    e.textContent = msg;
  }
  function go(card) {
    if (busy) return;
    var em = card.querySelector('input[type="email"]') ||
             card.querySelector('input[placeholder*="@" i]');
    var pw = card.querySelector('input[type="password"]');
    var btn = signInBtn(card);
    if (!em || !pw || !btn) return;
    var email = (em.value || "").trim(), pass = pw.value || "";
    var rem = card.querySelector('input[type="checkbox"]');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err(card, "Enter your email address."); return; }
    if (!pass) { err(card, "Enter your password."); return; }
    busy = true; btn.disabled = true; err(card, "");
    native("/api/auth/login", { method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: pass, remember: !!(rem && rem.checked) })
    }).then(function (r) { return r.json().then(function (j) { return { j: j }; }); })
    .then(function (x) {
      if (!(x.j && x.j.ok && x.j.token)) {
        err(card, (x.j && x.j.error) || "Email or password is incorrect.");
        busy = false; btn.disabled = false; return;
      }
      try { localStorage.setItem("alfred_token", x.j.token);
            localStorage.setItem("alfred_authed", "1");
            if (x.j.user && x.j.user.name) localStorage.setItem("alfred_name", x.j.user.name);
            sessionStorage.setItem("v157rl", "1"); sessionStorage.setItem("v158in", "1"); } catch (e) {}
      native("http://" + location.hostname + ":8082/api/usage",
        { credentials: "include", headers: { "X-Alfred-Token": x.j.token } })
        .then(function (u) { busy = false; btn.disabled = false;
          if (u.ok) { /* v203: no reload */ }
          else err(card, "Signed in, but verification failed - try again."); })
        .catch(function () { busy = false; btn.disabled = false;
          err(card, "Network hiccup - try again."); });
    })
    .catch(function () { busy = false; btn.disabled = false;
      err(card, "Network hiccup - try again."); });
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var btn = t.closest("button");
    if (!btn) return;
    var card = cardOf(btn);
    if (!card || signInBtn(card) !== btn) return;
    ev.preventDefault(); ev.stopPropagation();
    if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    go(card);
  }, true);
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" || !ev.target || ev.target.tagName !== "INPUT") return;
    var card = cardOf(ev.target);
    if (!card || !signInBtn(card)) return;
    ev.preventDefault(); ev.stopPropagation();
    if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    go(card);
  }, true);
  document.addEventListener("submit", function (ev) {
    var f = ev.target;
    if (f && f.querySelector && f.querySelector('input[type="password"]') && signInBtn(f)) {
      ev.preventDefault(); ev.stopPropagation(); go(f);
    }
  }, true);
})();

window.__v152 = "1"; /* v154 retires v152 */
/* ===== v150: debug kill-switch (cleanup) — disables all debug layers ===== */
(function () {
  ["__v134","__v137b","__v137c","__v140","__v141","__v142"].forEach(function (k) {
    try { window[k] = "1"; } catch (e) {}
  });
})();

/* ===== v137: token bridge (prepended = innermost wrapper) ===== */
(function () {
  var _f = window.fetch;
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    if (s.indexOf("/api/auth/") > -1 || s.indexOf(":8082/") > -1) {
      o.headers = o.headers || {};
      if (!o.headers["X-Alfred-Token"]) o.headers["X-Alfred-Token"] = tok();
      if (!o.credentials) o.credentials = "same-origin";
    }
    var p = _f.call(this, u, o);
    try {
      if (/\/api\/auth\/(login|register)/.test(s)) {
        p = p.then(function (r) {
          try {
            return r.clone().json().then(function (j) {
              if (j && j.ok && j.token) { try { localStorage.setItem("alfred_token", j.token); } catch (e) {} }
              return r;
            }).catch(function () { return r; });
          } catch (e) { return r; }
        });
      }
      if (/\/api\/auth\/logout/.test(s)) {
        p.then(function () { try { localStorage.removeItem("alfred_token"); } catch (e) {} }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();


(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ============ USER IDENTITY ============ */
  var USER = { name: localStorage.getItem("alfred_name") || "" };
  function userName() { return USER.name || "Fred"; }
  function initial(n) { n = (n || "").trim(); return n ? n.charAt(0).toUpperCase() : "F"; }
  function titleCase(s) { return s.replace(/\w\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }); }
  function saveName(n) { USER.name = n; localStorage.setItem("alfred_name", n); applyIdentity(); }
  function applyIdentity() {
    var wn = $("#welcome-msg");
    if (wn) wn.textContent = "Hello " + userName() + "! \uD83D\uDC4B\nI'm your AI companion. How can I help you today?";
    var un = $("#user-name"); if (un) un.textContent = userName();
    var ua = $("#user-avatar"); if (ua) ua.textContent = initial(userName());
  }
  applyIdentity();

  /* ============ LOADING ============ */
  var fill = $("#fill"), pct = $("#pct"), bar = $("#bar"),
      statusEl = $("#status"), statusP = $(".status"),
      logo = $(".logo"), loading = $("#loading"),
      particles = $("#particles"), DURATION = 6500;
  var COLORS = ["rgba(140,200,255,.9)","rgba(255,170,90,.75)","rgba(255,120,180,.65)","rgba(120,255,220,.7)"];
  for (var i = 0; i < 16; i++) {
    var s = document.createElement("span");
    s.className = "particle";
    s.style.left = ((i * 61) % 92 + 4) + "%";
    s.style.bottom = ((i * 37) % 70 + 8) + "%";
    s.style.width = s.style.height = (2 + (i % 3)) + "px";
    s.style.background = COLORS[i % COLORS.length];
    s.style.animationDelay = (i * 0.9) + "s";
    s.style.animationDuration = (9 + (i % 5) * 2) + "s";
    particles.appendChild(s);
  }
  var t0 = null;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function tick(now) {
    if (t0 === null) t0 = now;
    var p = Math.min(1, (now - t0) / DURATION);
    var v = Math.round(100 * easeOut(p));
    fill.style.width = v + "%";
    pct.textContent = String(v).padStart(2, "0") + "%";
    bar.setAttribute("aria-valuenow", v);
    if (p < 1) { requestAnimationFrame(tick); return; }
    bar.classList.add("done");
    statusEl.textContent = "Neural sanctuary ready";
    statusP.classList.add("ready");
    logo.classList.add("flare");
    setTimeout(exitLoading, 1300);
  }
  /* v209: native splash driver retired — the conductor owns the bar */
  function exitLoading() {
    loading.classList.add("exit");
    loading.addEventListener("animationend", function (e) {
      if (e.target !== loading || e.animationName !== "zoomOut") return;
      loading.style.display = "none";
      showScreen("login");
    });
  }

  /* ============ SCREENS & AUTH ============ */
  var current = null;
  function showScreen(id) {
    var el = document.getElementById(id);
    if (!el || el === current) return;
    if (current) {
      current.classList.add("leave");
      var from = current;
      from.addEventListener("animationend", function h(ev) {
        if (ev.animationName !== "screenOut") return;
        from.classList.remove("show", "leave");
        from.removeEventListener("animationend", h);
      });
    }
    current = el;
    el.classList.add("show");
  }
  $$("[data-goto]").forEach(function (a) {
    a.addEventListener("click", function (ev) { ev.preventDefault(); showScreen(a.getAttribute("data-goto")); });
  });
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!USER.name) {
      var em = ($("#login-form input[type=email]").value || "").split("@")[0].replace(/[._\-+]+/g, " ").trim();
      saveName(em ? titleCase(em) : "Fred");
    }
    showScreen("app");
  });
  $("#register-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = ($("#reg-name").value || "").trim();
    saveName(n ? titleCase(n) : "Fred");
    showScreen("app");
  });
  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.7a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.2 3.9M6.1 6.3A16.9 16.9 0 0 0 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.1-.9"/></svg>';
  $$(".eye").forEach(function (btn) {
    btn.innerHTML = EYE;
    btn.addEventListener("click", function () {
      var pw = btn.parentElement.querySelector(".pw");
      var hidden = !pw.classList.contains("showing");
      pw.classList.toggle("showing", hidden);   /* v197: type NEVER changes */
      btn.innerHTML = hidden ? EYE_OFF : EYE;
    });
  });

  /* ============ APP SHELL ============ */
  var sidebar = $("#sidebar"), scrim = $("#scrim"), app = $("#app");
  function drawer(open) { sidebar.classList.toggle("open", open); scrim.classList.toggle("on", open); }
  $("#burger").addEventListener("click", function () { drawer(true); });
  scrim.addEventListener("click", function () { drawer(false); });
  $$(".nav-item").forEach(function (item) {
    item.addEventListener("click", function () {
      $$(".nav-item").forEach(function (n) { n.classList.remove("active"); });
      item.classList.add("active");
      $$(".view").forEach(function (v) { v.classList.remove("show"); });
      document.getElementById("view-" + item.getAttribute("data-view")).classList.add("show");
      drawer(false);
    });
  });
  $("#welcome-time").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  $(".msg").classList.add("done");
  app.insertAdjacentHTML("beforeend", '<div class="toast" id="toast"></div>');
  var toast = $("#toast");
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  var scroll = $("#chat-scroll"), hero = $("#hero"),
      form = $("#composer"), input = $("#msg-input"), send = $("#send"),
      rail = $("#rail");
  function isDesk() { return window.matchMedia("(min-width:900px)").matches; }
  function nowTime() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
  function smooth() { scroll.scrollTo({ top: scroll.scrollHeight, behavior: "smooth" }); }

  function addMsg(kind, text) {
    var av = kind === "user"
      ? '<span class="msg-av u-av">' + initial(userName()) + "</span>"
      : '<span class="msg-av"><img src="assets/brand-192.png?v=3" alt=""/></span>';
    var m = document.createElement("div");
    m.className = "msg " + kind;
    if (kind === "user") {
      m.innerHTML = av + '<div class="bubble"><p></p><time>' + nowTime() + "</time></div>";
      m.querySelector("p").textContent = text;
    } else {
      m.innerHTML = av + '<div class="bubble"><div class="skel"><i></i><i></i><i></i></div><p hidden></p><time>' + nowTime() + "</time></div>";
    }
    scroll.appendChild(m);
    smooth();
    return m;
  }

  var ACTIONS = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    regen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zm0 0 4-7a2.4 2.4 0 0 1 2.3 3l-.6 3H19a1.8 1.8 0 0 1 1.7 2.3l-1.4 5A1.8 1.8 0 0 1 17.6 20H7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg)"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zm0 0 4-7a2.4 2.4 0 0 1 2.3 3l-.6 3H19a1.8 1.8 0 0 1 1.7 2.3l-1.4 5A1.8 1.8 0 0 1 17.6 20H7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.3M8.2 13.2l7.6 4.3"/></svg>'
  };
  function addActions(m, promptText) {
    var row = document.createElement("div");
    row.className = "msg-actions";
    ["copy", "regen", "up", "down", "share"].forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ma-btn"; b.innerHTML = ACTIONS[k];
      b.addEventListener("click", function () {
        if (k === "copy") {
          if (navigator.clipboard) navigator.clipboard.writeText(m.querySelector("p").textContent);
          showToast("Copied to clipboard");
        } else if (k === "regen") {
          if (!BUSY) runPipeline(promptText);
        } else if (k === "share") {
          if (navigator.share) navigator.share({ title: "ALFRED AI", text: m.querySelector("p").textContent });
          else showToast("Sharing coming soon");
        } else {
          var was = b.classList.contains("on");
          $$(".ma-btn", row).forEach(function (x) { x.classList.remove("on"); });
          if (!was) b.classList.add("on");
          showToast(k === "up" ? "Glad you liked it!" : "I'll do better next time");
        }
      });
      row.appendChild(b);
    });
    m.querySelector(".bubble").appendChild(row);
  }

  /* ============ THINKING VIZ ============ */
  var ICONS = {
    think: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" opacity=".6"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L7 20"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  var PROCS = {
    think: { cls: "", icon: "think", title: "Thinking...",
      caps: ["Analyzing your question with multiple AI models", "Connecting ideas across my neural layers", "Weighing the best way to explain this", "Polishing the answer for you"] },
    image: { cls: "t-image", icon: "image", title: "Creating image...",
      caps: ["Imagining the composition", "Painting light and color", "Rendering fine details", "Adding the final glow"] },
    search: { cls: "t-search", icon: "search", title: "Searching web...",
      caps: ["Scanning trusted sources", "Reading the results", "Cross-checking facts", "Synthesizing what I found"] }
  };
  var ANSWER = {
    think: "Absolutely! Here's a simple explanation:\n\nQuantum computing uses the principles of quantum mechanics (such as superposition and entanglement) to process information in a fundamentally different way than classical computers.\n\nInstead of bits that are either 0 or 1, it uses qubits, which can be 0, 1, or both at the same time. This allows it to solve certain problems much faster \u2014 especially complex ones like drug discovery, optimization, and cryptography.",
    image: "Here's a stunning futuristic cityscape for you! \uD83C\uDF06\n\nTowering spires, flying vehicles and neon reflections at sunset \u2014 just say the word if you'd like another mood or style.",
    search: "Here's what I found:\n\nMost sources agree on the essentials \u2014 and I've cross-checked the key facts across several of them. A deeper breakdown with citations lands once I'm wired to live data in a later part."
  };
  function intentOf(t) {
    t = t.toLowerCase();
    if (t.indexOf("create an image") === 0 || t.indexOf("create a") === 0 || t.indexOf("image") !== -1) return "image";
    if (t.indexOf("search") === 0) return "search";
    return "think";
  }

  var PROC_HTML =
    '<div class="proc">' +
      '<div class="proc-orb"><span class="proc-glass"></span><span class="proc-pulse"></span><span class="proc-core"></span></div>' +
      '<div class="proc-txt"><span class="proc-title">Thinking...</span><span class="proc-cap"></span></div>' +
      '<button class="proc-hide" type="button"><span class="ph-tx">Hide process</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>' +
    '</div>';

  function clearRail() {
    if (rail) { rail.classList.remove("on"); rail.innerHTML = ""; }
    app.classList.remove("rail-mode");
  }

  function mountViz(m, kind) {
    var P = PROCS[kind], el = null, inline = false, capTimer = null;
    try {
      if (false && rail) {
        app.classList.add("rail-mode");
        rail.innerHTML = PROC_HTML;
        rail.classList.add("on");
        el = rail.querySelector(".proc");
      } else {
        m.querySelector(".msg-av").insertAdjacentHTML("afterend", PROC_HTML);
        el = m.querySelector(".proc");
        inline = true;
      }
      el.querySelector(".proc-core").innerHTML = ICONS[P.icon];
      el.querySelector(".proc-title").textContent = P.title;
      var cap = el.querySelector(".proc-cap"), tx = el.querySelector(".ph-tx"), ci = 0;
      cap.textContent = P.caps[0];
      capTimer = setInterval(function () {
        cap.classList.add("fade");
        setTimeout(function () {
          ci = (ci + 1) % P.caps.length;
          cap.textContent = P.caps[ci];
          cap.classList.remove("fade");
        }, 200);
      }, 1400);
      el.querySelector(".proc-hide").addEventListener("click", function () {
        var c = el.classList.toggle("collapsed");
        tx.textContent = c ? "Show" : "Hide process";
      });
    } catch (e) { el = null; }
    return { hide: function () {
      try { clearInterval(capTimer); } catch (e) {}
      if (inline && el && el.parentNode) el.remove();
      clearRail();
    } };
  }

  /* ============ HEARTBEAT STATE MACHINE (cannot hang) ============ */
  var THINK_MS = 1600, STREAM_MS = 2000;
  var ST = null, BUSY = false;

  function setBusy(b) {
    BUSY = b;
    send.classList.toggle("stop", b);
    send.innerHTML = b ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2"/></svg>'
                       : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.6 21.8 12 3.4 3.4 3.3 10l13 2-13 2z"/></svg>';
  }

  function endStream() {
    var m = ST.m, kind = ST.kind, prompt = ST.prompt, vi = ST.vi;
    m.classList.remove("streaming");
    try { vi.hide(); } catch (e) {}
    m.classList.add("done");
    if (kind === "image") {
      var img = document.createElement("div");
      img.className = "gen-img";
      img.innerHTML = '<img src="assets/cityy.jpg" alt="Generated cityscape"/>';
      m.querySelector(".bubble").insertBefore(img, m.querySelector("time"));
      setTimeout(function () { img.classList.add("reveal"); }, 60);
    }
    addActions(m, prompt);
    app.classList.add("finished");
    setTimeout(function () { app.classList.remove("finished"); }, 4500);
    smooth();
    ST = null; setBusy(false);
  }

  function pump() {
    if (!ST) return;
    try {
      if (ST.phase === "think") {
        if (ST.stop || Date.now() - ST.t0 >= THINK_MS) {
          ST.phase = "stream"; ST.t0 = Date.now();
          ST.m.classList.add("streaming");
        }
      } else if (ST.phase === "stream") {
        var m = ST.m;
        var skel = m.querySelector(".skel"); if (skel) skel.remove();
        var p = m.querySelector("p"); p.hidden = false;
        var frac = ST.stop ? 1 : Math.min(1, (Date.now() - ST.t0) / STREAM_MS);
        p.textContent = ST.full.slice(0, Math.round(ST.full.length * frac));
        scroll.scrollTop = scroll.scrollHeight;
        if (frac >= 1) endStream();
      }
    } catch (e) { try { endStream(); } catch (e2) { ST = null; setBusy(false); } }
  }
  setInterval(pump, 90);

  function runPipeline(promptText) {
    if (BUSY) return;
    var kind = intentOf(promptText);
    BUSY = true; setBusy(true);
    hero.classList.add("gone");
    addMsg("user", promptText);
    var m = addMsg("ai", "");
    if (PROCS[kind].cls) m.classList.add(PROCS[kind].cls);
    var vi = mountViz(m, kind);
    ST = { t0: Date.now(), phase: "think", m: m, kind: kind, prompt: promptText, full: ANSWER[kind], vi: vi, stop: false };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (ST) { ST.stop = true; return; }   /* send = stop / fast-forward */
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    runPipeline(text);
  });

  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () { input.value = c.getAttribute("data-fill"); input.focus(); });
  });

  function newChat() {
    ST = null; setBusy(false);
    clearRail();
    $$(".proc").forEach(function (p) { p.remove(); });
    $$(".msg").forEach(function (m, i) { if (i > 0) m.remove(); });
    hero.classList.remove("gone");
    input.value = "";
    $$(".nav-item").forEach(function (n) { n.classList.toggle("active", n.getAttribute("data-view") === "chat"); });
    $$(".view").forEach(function (v) { v.classList.remove("show"); });
    document.getElementById("view-chat").classList.add("show");
    drawer(false);
  }
  $("#new-chat").addEventListener("click", newChat);
  $("#top-newchat").addEventListener("click", newChat);
})();

/* ===== v26: Neural Constellation (History) + persistence ===== */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var KEY = "alfred_history";
  var POS = [[38,13,"#5ec8ff",1],[84,26,"#3b82f6",0],[19,34,"#e879f9",0],[24,60,"#8b5cf6",0],[84,54,"#22d3ee",0],[48,84,"#a78bfa",0],[74,78,"#f59e0b",0]];

  var DEMO = [
    { t: "General Chat", ts: Date.now() - 3600e3,    cat: "General",  prev: "Hello, can you help me with a...", n: 24, msgs: [] },
    { t: "Code Help", ts: Date.now() - 7 * 864e5,     cat: "Code",     prev: "Fix this async bug in my fetch call", n: 18, msgs: [] },
    { t: "Image Generation", ts: Date.now() - 3 * 864e5, cat: "Image",  prev: "Create a neon city at night", n: 12, msgs: [] },
    { t: "Research", ts: Date.now() - 2 * 864e5,      cat: "Research", prev: "Summarize quantum error correction", n: 31, msgs: [] },
    { t: "Meals & Plans", ts: Date.now() - 5 * 864e5, cat: "Life",     prev: "Plan my week of high-protein meals", n: 9, msgs: [] },
    { t: "Research", ts: Date.now() - 2 * 864e5,      cat: "Research", prev: "Compare fusion reactor designs", n: 22, msgs: [] },
    { t: "Personal", ts: Date.now() - 2 * 864e5,      cat: "Personal", prev: "Draft a message to my coach", n: 7, msgs: [] }
  ];

  function read() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return a.length ? a : []; } catch (e) { return []; }
  }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 12))); } catch (e) {} }
  function timeLabel(ts) {
    var d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today, " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    var days = Math.round((now - d) / 864e5);
    if (days <= 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    var w = Math.round(days / 7); return w + (w > 1 ? " weeks ago" : " week ago");
  }
  function guess(t) {
    t = t.toLowerCase();
    if (t.indexOf("image") > -1) return "Image";
    if (t.indexOf("code") > -1 || t.indexOf("bug") > -1) return "Code";
    if (t.indexOf("search") > -1 || t.indexOf("research") > -1) return "Research";
    if (t.indexOf("plan") > -1 || t.indexOf("meal") > -1) return "Life";
    return "General";
  }

  var LIST = [], SEL = 0, nodesEl, linksEl;
  function build() {
    var real = read();
    LIST = real.concat(DEMO.slice(0, Math.max(0, 7 - real.length)));
    nodesEl = $("#const-nodes"); linksEl = $("#const-links");
    if (!nodesEl) return;
    nodesEl.innerHTML = "";
    var ns = "http://www.w3.org/2000/svg";
    linksEl.innerHTML = "";
    var cx = 50, cy = 46;
    LIST.forEach(function (item, i) {
      var p = POS[i % POS.length];
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", p[0]); line.setAttribute("y2", p[1]);
      line.setAttribute("stroke", p[2]); line.setAttribute("opacity", ".3");
      linksEl.appendChild(line);
    });
    [[8,72,60,18],[92,30,58,74]].forEach(function (a, k) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", "M" + a[0] + " " + a[1] + " Q 50 " + (k ? 96 : 18) + " " + a[2] + " " + a[3]);
      path.setAttribute("stroke", k ? "rgba(230,140,255,.5)" : "rgba(120,200,255,.5)");
      linksEl.appendChild(path);
    });
    LIST.forEach(function (item, i) {
      var p = POS[i % POS.length];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "const-node" + (p[3] ? " big" : "") + (i === SEL ? " sel" : "");
      b.style.left = p[0] + "%"; b.style.top = p[1] + "%";
      b.style.setProperty("--c", p[2]);
      if (p[0] > 68) b.classList.add("left");
      b.style.animationDelay = (i * 0.6) + "s";
      b.innerHTML = '<i class="cn-halo" style="--c:' + p[2] + '"></i>' + '<i class="cn-ring" style="--c:' + p[2] + '"></i>' + '<span class="cn-dot" style="--c:' + p[2] + '"></span>' +
                    '<span class="cn-lbl"><b></b><i></i></span>';
      b.querySelector(".cn-lbl b").textContent = item.t;
      b.querySelector(".cn-lbl i").textContent = timeLabel(item.ts);
      b.addEventListener("click", function () { SEL = i; select(); });
      nodesEl.appendChild(b);
    });
    select();
  }
  function select() {
    $$(".const-node", nodesEl).forEach(function (n, i) { n.classList.toggle("sel", i === SEL); });
    var it = LIST[SEL] || DEMO[0];
    $("#hc-title").textContent = it.t;
    $("#hc-time").textContent = timeLabel(it.ts);
    $("#hc-prev").textContent = (it.prev || "").slice(0, 60) + ((it.prev || "").length > 60 ? "..." : "");
    $("#hc-cat").textContent = it.cat || "General";
    $("#hc-count").textContent = it.n || 0;
  }
  var hint = $("#hist-hint");
  if (hint) hint.addEventListener("click", function () {
    POS.push(POS.shift()); build();
  });
  var view = $("#hc-view");
  if (view) view.addEventListener("click", function () {
    var it = LIST[SEL];
    if (it && it.msgs && it.msgs.length) restore(it);
    var chatNav = document.querySelector('.nav-item[data-view="chat"]');
    if (chatNav) chatNav.click();
  });
  function restore(it) {
    var scroll = $("#chat-scroll"), hero = $("#hero");
    if (!scroll) return;
    $$(".msg", scroll).forEach(function (m, i) { if (i > 0) m.remove(); });
    if (hero) hero.classList.add("gone");
    it.msgs.forEach(function (mm) {
      var name = (localStorage.getItem("alfred_name") || "Fred").charAt(0).toUpperCase();
      var av = mm.k === "user"
        ? '<span class="msg-av u-av">' + name + "</span>"
        : '<span class="msg-av"><img src="assets/brand-192.png?v=3" alt=""/></span>';
      var el = document.createElement("div");
      el.className = "msg " + (mm.k === "user" ? "user" : "ai") + " done";
      el.innerHTML = av + '<div class="bubble"><p></p><time>' + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + "</time></div>";
      el.querySelector("p").textContent = mm.t;
      scroll.appendChild(el);
    });
    scroll.scrollTop = scroll.scrollHeight;
  }

  build();

  /* save every finished answer as a history node */
  var scroll2 = $("#chat-scroll");
  if (scroll2) new MutationObserver(function () {
    $$(".msg.ai.done", scroll2).forEach(function (ai) {
      if (ai.hasAttribute("data-saved")) return;
      var prev = ai.previousElementSibling;
      if (!prev || !prev.classList.contains("user")) return;
      ai.setAttribute("data-saved", "1");
      var title = prev.querySelector("p").textContent.trim();
      var msgs = [];
      $$(".msg", scroll2).forEach(function (m) {
        var p = m.querySelector("p");
        if (p && p.textContent.trim()) msgs.push({ k: m.classList.contains("user") ? "user" : "ai", t: p.textContent });
      });
      var real = read();
      real.unshift({ t: title.slice(0, 34) || "New Conversation", ts: Date.now(), cat: guess(title), prev: title, n: msgs.length, msgs: msgs });
      write(real);
      build();
    });
  }).observe(scroll2, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
})();

/* ===== v31: cinematic starfield + aspect-aware constellation ===== */
(function () {
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  var sky = document.getElementById("sky");
  var view = document.getElementById("view-history");
  if (!stage || !nodes || !sky || !view) return;
  var ctx = sky.getContext("2d"), W = 0, H = 0, stars = [], shoot = null, t = 0, raf = 0, run = false;
  var par = { x: 0, y: 0, tx: 0, ty: 0 };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PORTRAIT = [[48,16],[76,30],[24,33],[78,52],[22,56],[60,72],[42,84]];
  var WIDE     = [[38,13],[84,26],[19,34],[84,54],[24,60],[84,72],[48,84]];

  function layout() {
    var r = stage.getBoundingClientRect(); if (!r.width) return;
    var L = (r.width / r.height) < 0.95 ? PORTRAIT : WIDE;
    var ns = nodes.querySelectorAll(".const-node");
    for (var i = 0; i < ns.length && i < L.length; i++) {
      var n = ns[i], p = L[i];
      n.style.left = p[0] + "%"; n.style.top = p[1] + "%";
      if (p[0] > 62) n.classList.add("left"); else n.classList.remove("left");
    }
  }

  function size() {
    var r = stage.getBoundingClientRect(); if (!r.width) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    W = Math.round(r.width); H = Math.round(r.height);
    sky.width = Math.round(W * dpr); sky.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var COL = ["236,244,255","186,216,255","255,226,192","214,190,255","168,236,255"];
    var n = Math.min(300, Math.max(120, Math.round(W * H / 3800)));
    stars = [];
    for (var i = 0; i < n; i++) {
      var d = Math.random();
      stars.push({ x: Math.random()*W, y: Math.random()*H, z:.3+(1-d)*.7, r:.3+(1-d)*.55+Math.random()*.25,
                   c: COL[(Math.random()*COL.length)|0], tw: Math.random()*6.283, sp:.5+Math.random()*1.4 });
    }
    return true;
  }

  function frame() {
    if (!run) return;
    t += .016;
    par.x += (par.tx - par.x) * .05; par.y += (par.ty - par.y) * .05;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], a = .3 + .7 * (.5 + .5 * Math.sin(s.tw + t * s.sp));
      var px = s.x + par.x * s.z * 15, py = s.y + par.y * s.z * 15, rr = s.r * s.z;
      ctx.fillStyle = "rgba(" + s.c + "," + (a * s.z).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.283); ctx.fill();
      if (rr > 1.05) {
        ctx.fillStyle = "rgba(" + s.c + "," + (.2 * a * s.z).toFixed(3) + ")";
        ctx.fillRect(px - rr * 5, py - .4, rr * 10, .8);
        ctx.fillRect(px - .4, py - rr * 5, .8, rr * 10);
      }
    }
    if (!reduce) {
      if (!shoot && Math.random() < .003) shoot = { x: Math.random()*W*.7, y: Math.random()*H*.4, vx: 3+Math.random()*3, vy: 1.1+Math.random()*1.2, life: 1 };
      if (shoot) {
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= .014;
        var lf = Math.max(shoot.life, 0);
        var g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx*18, shoot.y - shoot.vy*18);
        g.addColorStop(0, "rgba(255,255,255," + (.9*lf).toFixed(3) + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.7; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx*18, shoot.y - shoot.vy*18); ctx.stroke();
        if (shoot.life <= 0 || shoot.x > W + 80) shoot = null;
      }
    }
    ctx.globalCompositeOperation = "source-over";
    if (!reduce) raf = requestAnimationFrame(frame);
  }

  function start() { if (run) return; if (!size()) return; layout(); run = true; frame(); }
  function stop() { run = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  var rt = 0;
  function schedule() { clearTimeout(rt); rt = setTimeout(function () { if (run) { size(); layout(); } }, 150); }
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", function () { setTimeout(schedule, 150); });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(stage);

  var on = view.classList.contains("show");
  new MutationObserver(function () {
    var now = view.classList.contains("show");
    if (now === on) return; on = now;
    if (now) start(); else stop();
  }).observe(view, { attributes: true, attributeFilter: ["class"] });
  if (on) start();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else if (on) start();
  });
  window.addEventListener("pointermove", function (e) {
    par.tx = (e.clientX / window.innerWidth - .5) * 2; par.ty = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });
  window.addEventListener("deviceorientation", function (e) {
    if (e.gamma == null) return;
    par.tx = Math.max(-1, Math.min(1, e.gamma / 40));
    par.ty = Math.max(-1, Math.min(1, ((e.beta || 0) - 40) / 40));
  }, { passive: true });
})();

/* ===== v37: constellation mesh — nodes connected to each other ===== */
(function () {
  var svg = document.getElementById("const-links");
  var nodes = document.getElementById("const-nodes");
  var stage = document.querySelector(".const-stage");
  var view = document.getElementById("view-history");
  if (!svg || !nodes || !stage || svg.dataset.mesh) return;
  svg.dataset.mesh = "1";
  var PAIRS = [[0,1],[1,3],[3,5],[5,6],[6,4],[4,2],[2,0]];
  var tm = 0;

  function draw() {
    var ns = nodes.querySelectorAll(".const-node");
    var r = stage.getBoundingClientRect();
    if (ns.length < 2 || !r.width) return;
    var old = svg.querySelectorAll("line.mesh");
    for (var i = 0; i < old.length; i++) old[i].remove();
    var pts = [];
    for (var j = 0; j < ns.length; j++) {
      var b = ns[j].getBoundingClientRect();
      pts.push([(b.left + b.width / 2 - r.left) / r.width * 100,
                (b.top + b.height / 2 - r.top) / r.height * 100]);
    }
    for (var k = 0; k < PAIRS.length; k++) {
      var a = pts[PAIRS[k][0]], c = pts[PAIRS[k][1]];
      if (!a || !c) continue;
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("class", "mesh");
      ln.setAttribute("x1", a[0]); ln.setAttribute("y1", a[1]);
      ln.setAttribute("x2", c[0]); ln.setAttribute("y2", c[1]);
      svg.appendChild(ln);
    }
  }
  function soon() { clearTimeout(tm); tm = setTimeout(draw, 180); }

  new MutationObserver(soon).observe(nodes, { attributes: true, subtree: true, attributeFilter: ["style", "class"] });
  if (view) new MutationObserver(function () { setTimeout(draw, 300); }).observe(view, { attributes: true, attributeFilter: ["class"] });
  nodes.addEventListener("transitionend", draw, true);
  window.addEventListener("resize", soon);
  draw(); setTimeout(draw, 900);
})();

/* ===== v44: world plates — real elements, zero layout contact ===== */
(function () {
  ["view-chat", "view-explore", "view-modules", "view-settings"].forEach(function (id) {
    var v = document.getElementById(id);
    if (!v || v.querySelector(".world")) return;
    var w = document.createElement("span");
    w.className = "world"; w.setAttribute("aria-hidden", "true");
    v.insertBefore(w, v.firstChild);
  });
})();



/* ===== v48: sky picker — tap a world, the scene cross-fades ===== */
(function () {
  var stage = document.querySelector(".const-stage");
  if (!stage || stage.querySelector(".sky-picker")) return;
  var scene = stage.querySelector(".scene");
  if (!scene) {                                   /* fallback: create it */
    scene = document.createElement("span");
    scene.className = "scene"; scene.setAttribute("aria-hidden", "true");
    stage.insertBefore(scene, stage.firstChild);
  }
  var SCENES = [
    ["history-sky.jpg",  "Nebula"],
    ["nebula-plate.png", "Galaxy"],
    ["chat-sky.jpg",     "Void"],
    ["explore-sky.jpg",  "Dawn"],
    ["modules-sky.jpg",  "Foundry"],
    ["settings-sky.jpg", "Dome"]
  ];
  var bar = document.createElement("div");
  bar.className = "sky-picker"; bar.setAttribute("role", "tablist");
  SCENES.forEach(function (sc, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "sky-chip" + (i === 0 ? " on" : "");
    b.title = sc[1]; b.setAttribute("aria-label", sc[1]);
    b.style.backgroundImage = "url('../assets/gen/" + sc[0] + "')";
    b.addEventListener("click", function () {
      if (scene.dataset.cur === sc[0]) return;
      scene.dataset.cur = sc[0];
      bar.querySelectorAll(".sky-chip").forEach(function (c) { c.classList.remove("on"); });
      b.classList.add("on");
      scene.style.opacity = "0";
      setTimeout(function () {
        scene.style.backgroundImage = "url('../assets/gen/" + sc[0] + "')";
        scene.style.opacity = "1";
      }, 420);
    });
    bar.appendChild(b);
  });
  stage.appendChild(bar);
})();



/* ===== v50: worlds engine v2 — instant local world, online upgrade ===== */
(function () {
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  var scene = stage && stage.querySelector(".scene");
  if (!stage || !nodes || !scene || stage.dataset.worlds2) return;
  stage.dataset.worlds2 = "1";

  var LOCAL = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }

  var CATS = [
    ["code|debug|error|javascript|python|css|html|api", "dark futuristic code forge interior, floating amber holographic glyphs, deep blue shadows"],
    ["research|paper|study|learn|science",              "vast ancient observatory library at night, drifting light particles, deep teal and violet"],
    ["meal|food|recipe|plan",                           "dark cozy dinner table under warm candlelight, deep shadows, cinematic"],
    ["image|draw|art|design|paint",                     "dark artist studio with floating holographic canvases, magenta and cyan glow"],
    ["personal|diary|note|idea",                        "dark serene study with a single warm lamp, deep blue night through the window"]
  ];
  var BASE = ", photorealistic, volumetric glow, near-black edges, cinematic, no text, no watermark";

  function worldFor(title){
    var t = (title||"").toLowerCase(), p = "vast dark nebula, deep blue and violet gas clouds, scattered stars";
    for (var i=0;i<CATS.length;i++) if (new RegExp(CATS[i][0]).test(t)) { p = CATS[i][1]; break; }
    return { prompt: p + BASE, seed: hash(title||"world") % 9999 };
  }
  function url(w){ return "https://image.pollinations.ai/prompt/" + encodeURIComponent(w.prompt) + "?width=768&height=1024&nologo=true&seed=" + w.seed; }

  var pill = document.createElement("span");
  pill.className = "world-pill"; pill.setAttribute("aria-hidden","true");
  pill.textContent = "◈ conjuring this world…"; pill.style.display = "none";
  stage.appendChild(pill);

  var token = 0;
  function show(title){
    var my = ++token;
    /* 1) instant local world — same title always maps to the same sky */
    scene.style.backgroundImage = "url('../assets/gen/" + LOCAL[hash(title||"x") % LOCAL.length] + "')";
    scene.style.opacity = "";
    /* 2) background upgrade to the unique generated world */
    var u = url(worldFor(title));
    pill.style.display = "block";
    var im = new Image();
    im.onload = function(){ if (my !== token) return;
      scene.style.backgroundImage = "url('" + u + "')"; pill.style.display = "none"; };
    im.onerror = function(){ if (my === token) pill.style.display = "none"; };
    setTimeout(function(){ if (my === token) pill.style.display = "none"; }, 20000);
    im.src = u;
  }

  nodes.addEventListener("click", function(ev){
    var n = ev.target.closest(".const-node"); if (!n) return;
    var b = n.querySelector(".cn-lbl b");
    show(b ? b.textContent : "");
  });

  document.addEventListener("click", function(ev){
    if (!ev.target.closest("#hc-view")) return;
    var t = (document.getElementById("hc-title")||{}).textContent || "Chat";
    var v = document.getElementById("view-chat"), w = v && v.querySelector(".world");
    if (!w) return;
    w.style.backgroundImage = "url('../assets/gen/" + LOCAL[hash(t) % LOCAL.length] + "')";
    w.classList.add("world-live");
    var chip = v.querySelector(".world-chip");
    if (!chip){ chip = document.createElement("span"); chip.className = "world-chip"; v.appendChild(chip); }
    chip.textContent = "◈ " + t;
  });
})();

/* ===== v51: world globes — nodes become realistic planets ===== */
(function () {
  var nodes = document.getElementById("const-nodes");
  if (!nodes || nodes.dataset.globes) return;
  nodes.dataset.globes = "1";

  var LOCAL = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  var CATS = [
    ["code|debug|error|javascript|python|css|html|api", "dark futuristic code forge interior, floating amber holographic glyphs, deep blue shadows"],
    ["research|paper|study|learn|science",              "vast ancient observatory library at night, drifting light particles, deep teal and violet"],
    ["meal|food|recipe|plan",                           "dark cozy dinner table under warm candlelight, deep shadows, cinematic"],
    ["image|draw|art|design|paint",                     "dark artist studio with floating holographic canvases, magenta and cyan glow"],
    ["personal|diary|note|idea",                        "dark serene study with a single warm lamp, deep blue night through the window"]
  ];
  var BASE = ", photorealistic, volumetric glow, cinematic, no text, no watermark";
  function worldUrl(title){
    var t=(title||"").toLowerCase(), p="vast dark nebula, deep blue and violet gas clouds, scattered stars";
    for (var i=0;i<CATS.length;i++) if (new RegExp(CATS[i][0]).test(t)) { p=CATS[i][1]; break; }
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(p+BASE)
         + "?width=512&height=512&nologo=true&seed=" + (hash(title||"w") % 9999);
  }

  var globes = [];
  nodes.querySelectorAll(".const-node").forEach(function (n) {
    if (n.querySelector(".cn-world")) return;
    var b = n.querySelector(".cn-lbl b");
    var title = b ? b.textContent : "world";
    var g = document.createElement("span");
    g.className = "cn-world"; g.setAttribute("aria-hidden","true");
    g.style.backgroundImage = "url('../assets/gen/" + LOCAL[hash(title) % LOCAL.length] + "')";
    n.insertBefore(g, n.firstChild);
    globes.push({ el:g, title:title, done:false });
  });

  /* each globe upgrades to its own generated world, one at a time, gently */
  var view = document.getElementById("view-history"), started = false;
  function upgrade(i){
    if (i >= globes.length) return;
    var it = globes[i];
    var im = new Image();
    im.onload = function(){ it.done = true; it.el.style.backgroundImage = "url('" + im.src + "')"; };
    im.src = worldUrl(it.title);
    setTimeout(function(){ upgrade(i+1); }, 2600);   /* one world at a time */
  }
  if (view) new MutationObserver(function () {
    if (view.classList.contains("show") && !started) { started = true; upgrade(0); }
  }).observe(view, { attributes:true, attributeFilter:["class"] });
})();

/* ===== v52: picker collapses so it never covers a world ===== */
(function () {
  var bar = document.querySelector(".sky-picker");
  if (!bar || bar.dataset.collapsible) return;
  bar.dataset.collapsible = "1";
  var t = document.createElement("button");
  t.type = "button"; t.className = "sky-toggle"; t.title = "Worlds";
  t.setAttribute("aria-label", "Choose world");
  t.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4M12 3.8c2.6 2.3 2.6 14.1 0 16.4M12 3.8c-2.6 2.3-2.6 14.1 0 16.4"/></svg>';
  bar.insertBefore(t, bar.firstChild);
  bar.classList.add("closed");
  t.addEventListener("click", function (e) { e.stopPropagation(); bar.classList.toggle("closed"); });
  bar.querySelectorAll(".sky-chip").forEach(function (c) {
    c.addEventListener("click", function () { bar.classList.add("closed"); });
  });
})();

/* ===== v53: self-healing globes — survive Spin rebuilds ===== */
(function () {
  var nodes = document.getElementById("const-nodes");
  if (!nodes || nodes.dataset.heal) return;
  nodes.dataset.heal = "1";

  var LOCAL = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }

  function ensure() {
    nodes.querySelectorAll(".const-node").forEach(function (n) {
      if (n.querySelector(".cn-world")) return;
      var b = n.querySelector(".cn-lbl b");
      var title = b ? b.textContent : "world";
      var g = document.createElement("span");
      g.className = "cn-world"; g.setAttribute("aria-hidden", "true");
      g.style.backgroundImage = "url('../assets/gen/" + LOCAL[hash(title) % LOCAL.length] + "')";
      n.insertBefore(g, n.firstChild);
    });
  }
  var tm = 0;
  new MutationObserver(function () {
    clearTimeout(tm); tm = setTimeout(ensure, 150);
  }).observe(nodes, { childList: true, subtree: true });
  ensure();
})();

/* ===== v54: mockup grade — brain orb, glass bubbles, duo layout, glow send ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.fx) return;
  chat.dataset.fx = "1";

  /* blurred-city veil behind the conversation (mockup's depth) */
  if (!chat.querySelector(".city-veil")) {
    var v = document.createElement("span");
    v.className = "city-veil"; v.setAttribute("aria-hidden", "true");
    chat.insertBefore(v, chat.firstChild);
  }

  function enhance() {
    /* brain-core orb into every thinking block */
    chat.querySelectorAll(".fx-orb-legacy-off").forEach(function (t) {
      if (!/Thinking/.test(t.textContent) || t.dataset.fxd) return;
      if (t.querySelector(".fx-think") || (t.parentElement && t.parentElement.closest(".fx-think"))) return;
      t.dataset.fxd = "1"; t.classList.add("fx-think");
      if (!t.querySelector(".brain-orb")) {
        var o = document.createElement("span");
        o.className = "brain-orb";
        o.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">'
          + '<path d="M12 4.5c-1.8-1.2-4.6-.8-5.6 1.2-1.8.2-3 1.7-2.8 3.4-1 .9-1.2 2.5-.3 3.6-.6 1.7.4 3.5 2.2 3.9.3 1.9 2.2 3.1 4.1 2.6.7.9 2.3 1 3 .1"/>'
          + '<path d="M12 4.5c1.8-1.2 4.6-.8 5.6 1.2 1.8.2 3 1.7 2.8 3.4 1 .9 1.2 2.5.3 3.6.6 1.7-.4 3.5-2.2 3.9-.3 1.9-2.2 3.1-4.1 2.6-.7.9-2.3 1-3 .1"/>'
          + '<path d="M12 4.5V19"/><path d="M9 8.5c1 .3 1.8 1 2 2M8.5 12.5c1.2 0 2.3.6 2.8 1.6M15 8.5c-1 .3-1.8 1-2 2M15.5 12.5c-1.2 0-2.3.6-2.8 1.6"/></svg>';
        t.insertBefore(o, t.firstChild);
      }
      /* duo: answer + thinking side by side on wide screens */
      var row = t, i = 0;
      while (row && i++ < 4) {
        row = row.parentElement;
        if (!row) break;
        var hasBubble = row.querySelector('[class*="bubble" i],[class*="msg" i]');
        if (hasBubble && !hasBubble.contains(t) && hasBubble !== t) { row.classList.add("fx-duo"); break; }
      }
    });
    /* glass treatment on bubbles */
    chat.querySelectorAll('[class*="bubble" i]').forEach(function (b) {
      if (!b.dataset.fxd && b.textContent.trim()) { b.dataset.fxd = "1"; b.classList.add("fx-glass"); }
    });
    chat.querySelectorAll('.msg.fx-glass').forEach(function (b) { b.classList.remove("fx-glass"); });
    /* glowing send/stop */
    var s = chat.querySelector('[class*="send" i]:not([class*="sent" i]),[class*="stop" i],[id*="send" i]');
    if (s) s.classList.add("fx-send");
  }
  var tm = 0;
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(enhance, 120); })
    .observe(chat, { childList: true, subtree: true });
  enhance();
})();

/* ===== v56: orb surgery — exact proc row, one orb, right size ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.orbfx) return;
  chat.dataset.orbfx = "1";
  var SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M12 4.5c-1.8-1.2-4.6-.8-5.6 1.2-1.8.2-3 1.7-2.8 3.4-1 .9-1.2 2.5-.3 3.6-.6 1.7.4 3.5 2.2 3.9.3 1.9 2.2 3.1 4.1 2.6.7.9 2.3 1 3 .1"/><path d="M12 4.5c1.8-1.2 4.6-.8 5.6 1.2 1.8.2 3 1.7 2.8 3.4 1 .9 1.2 2.5.3 3.6.6 1.7-.4 3.5-2.2 3.9-.3 1.9-2.2 3.1-4.1 2.6-.7.9-2.3 1-3 .1"/><path d="M12 4.5V19"/><path d="M9 8.5c1 .3 1.8 1 2 2M8.5 12.5c1.2 0 2.3.6 2.8 1.6M15 8.5c-1 .3-1.8 1-2 2M15.5 12.5c-1.2 0-2.3.6-2.8 1.6"/></svg>';

  function fix() {
    /* strays out: any orb not living in a real proc row */
    chat.querySelectorAll(".brain-orb").forEach(function (o) {
      if (!o.parentElement.querySelector(".proc-txt")) o.remove();
    });
    chat.querySelectorAll(".fx-think").forEach(function (r) {
      if (!r.querySelector(".proc-txt")) r.classList.remove("fx-think", "fx-duo") || r.classList.remove("fx-think");
    });
    /* one orb, in the icon+text row */
    chat.querySelectorAll(".proc-title").forEach(function (pt) {
      var txt = pt.closest(".proc-txt") || pt;
      var row = txt.parentElement; if (!row) return;
      row.classList.add("fx-think");
      if (row.querySelector(".brain-orb")) return;
      var o = document.createElement("span");
      o.className = "brain-orb"; o.setAttribute("aria-hidden", "true");
      o.innerHTML = SVG;
      row.insertBefore(o, row.firstChild);
      /* duo on PC: find the answer bubble up to 4 levels */
      var up = row, i = 0;
      while (up && i++ < 4) {
        up = up.parentElement; if (!up) break;
        var bb = up.querySelector(".bubble");
        if (bb && !bb.contains(row)) { up.classList.add("fx-duo"); break; }
      }
    });
  }
  var tm = 0;
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(fix, 120); })
    .observe(chat, { childList: true, subtree: true });
  fix();
})();



/* ===== v58: processing state = red stop button is showing ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.procfx2) return;
  chat.dataset.procfx2 = "1";

  function isRed(el) {
    if (!el) return false;
    var cs = getComputedStyle(el);
    var m = (cs.backgroundColor + " " + cs.backgroundImage).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return false;
    var r = +m[1], g = +m[2], b = +m[3];
    return r > 150 && r > g + 60 && r > b + 60;   /* red stop vs blue send */
  }
  function busyNow() {
    var btns = chat.querySelectorAll(".fx-send,[class*='send' i],[class*='stop' i]");
    for (var i = 0; i < btns.length; i++) if (isRed(btns[i])) return true;
    return !!chat.querySelector('[class*="dots" i],[class*="cursor" i],[class*="skel" i],[class*="shimmer" i]');
  }
  setInterval(function () {
    var b = busyNow();
    if (b !== chat.classList.contains("fx-processing")) chat.classList.toggle("fx-processing", b);
  }, 350);
})();

/* ===== v59: input capsule finder + user-bubble tagging ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.inpfx) return;
  chat.dataset.inpfx = "1";
  var t = chat.querySelector("input[placeholder],textarea");
  if (t) { var bar = t.closest("div") || t.parentElement; if (bar) bar.classList.add("fx-inputbar"); }
  chat.querySelectorAll(".msg").forEach(function (m) {
    if (/\b(user|me|own)\b/i.test(m.className) && !/\bai\b/i.test(m.className)) m.classList.add("fx-user");
  });
})();

/* ===== v60: tag every input wrapper level + footer ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.fx60) return;
  chat.dataset.fx60 = "1";
  var t = chat.querySelector("input[placeholder],textarea"), el = t, i = 0;
  while (el && el !== chat && i++ < 3) { el = el.parentElement; if (el) el.classList.add("fx-inputbar-wrap"); }
  var f = chat.lastElementChild;
  if (f) f.classList.add("fx-inputbar-wrap");
})();

/* ===== v62: user row keeps its own color while processing ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.fx62) return; chat.dataset.fx62 = "1";
  chat.querySelectorAll(".msg-av").forEach(function (a) {
    var m = (getComputedStyle(a).backgroundColor + getComputedStyle(a).backgroundImage)
            .match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m && +m[1] > 200 && +m[3] < 120) { var r = a.closest(".msg"); if (r) r.classList.add("fx-user"); }
  });
})();

/* ===== v63: finished state — the UI warms to amber when the answer lands ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.fx63) return;
  chat.dataset.fx63 = "1";
  var wasBusy = false, holdT = 0;
  setInterval(function () {
    var busy = chat.classList.contains("fx-processing");
    if (wasBusy && !busy) {                       /* answer just completed */
      chat.classList.add("fx-finished");
      clearTimeout(holdT);
      holdT = setTimeout(function () { chat.classList.remove("fx-finished"); }, 6000);
    }
    if (busy) { chat.classList.remove("fx-finished"); clearTimeout(holdT); }
    wasBusy = busy;
  }, 300);
})();

/* ===== v64: user-row tagging that survives dynamic messages ===== */
(function () {
  var chat = document.getElementById("view-chat");
  if (!chat || chat.dataset.fx64) return;
  chat.dataset.fx64 = "1";
  setInterval(function () {
    chat.querySelectorAll(".msg:not(.fx-user):not(.fx-scanned)").forEach(function (m) {
      m.classList.add("fx-scanned");
      var a = m.querySelector(".msg-av"); if (!a) return;
      var cs = getComputedStyle(a);
      var mt = (cs.backgroundColor + " " + cs.backgroundImage).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (mt && +mt[1] > 200 && +mt[3] < 120) m.classList.add("fx-user");   /* orange avatar = user */
    });
  }, 600);
})();

/* ===== v66: Explore — community prompts & results + share-to-explore ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.explored) return;
  view.dataset.explored = "1";
  function imgUrl(p, seed){ return "/api/image?prompt=" + encodeURIComponent(p)
    + "&seed=" + (seed||7); }

  function load(){ try { return JSON.parse(localStorage.getItem("explore-posts") || "null"); } catch(e){ return null; } }
  function save(d){ try { localStorage.setItem("explore-posts", JSON.stringify(d)); } catch(e){} }
  function store(){ var d = load(); if (!d) {
    d = { liked:{}, posts:[
      {id:"s1",kind:"image",prompt:"neon cyberpunk street after rain, reflections everywhere",src:"neon cyberpunk street after rain, wet asphalt reflections, cinematic",seed:31,by:"Nova",likes:214},
      {id:"s2",kind:"image",prompt:"astronaut watching a violet nebula from a cliff",src:"astronaut on alien cliff watching violet nebula, cinematic",seed:12,by:"Kai",likes:187},
      {id:"s3",kind:"video",prompt:"holographic butterfly garden at dusk",src:"holographic butterflies glowing garden at dusk, teal and magenta",seed:53,by:"Vega",likes:156},
      {id:"s4",kind:"image",prompt:"ancient library with floating candle lights",src:"ancient grand library floating candles warm light, cinematic",seed:24,by:"Rin",likes:143},
      {id:"s5",kind:"video",prompt:"liquid chrome sports car morphing at sunset",src:"liquid chrome futuristic sports car at sunset, studio light",seed:66,by:"Mora",likes:129},
      {id:"s6",kind:"image",prompt:"floating islands above a golden sea of clouds",src:"floating islands golden sea of clouds, epic vista",seed:88,by:"Juno",likes:117},
      {id:"s7",kind:"image",prompt:"crystal dragon in a bioluminescent cave",src:"crystal dragon bioluminescent cave, teal glow",seed:45,by:"Ash",likes:98}
    ]}; save(d);
  } return d; }

  var wrap = document.createElement("div");
  wrap.className = "explore-wrap";
  wrap.innerHTML = '<div class="ex-head"><h2>Explore</h2><p>Prompts & results from the community — tap ♡, or Try it yourself.</p></div>'
    + '<div class="ex-filters"><button class="ex-f on" data-f="all">All</button>'
    + '<button class="ex-f" data-f="image">Images</button><button class="ex-f" data-f="video">Videos</button>'
    + '<button class="ex-f" data-f="mine">Yours</button></div><div class="ex-grid"></div>';
  view.appendChild(wrap);
  var grid = wrap.querySelector(".ex-grid"), filter = "all";

  function render(){
    var d = store();
    grid.innerHTML = "";
    d.posts.slice().sort(function(a,b){ return (b.ts||0) - (a.ts||0); }).forEach(function(p){
      if (filter !== "all" && filter !== "mine" && p.kind !== filter) return;
      if (filter === "mine" && !p.mine) return;
      var c = document.createElement("article");
      c.className = "ex-card" + (p.kind === "video" ? " ex-video" : "");
      c.style.backgroundImage = "url('" + imgUrl(p.src, p.seed) + "')";
      var liked = d.liked[p.id];
      c.innerHTML = '<span class="ex-by"></span><div class="ex-ov"><p class="ex-prompt"></p>'
        + '<div class="ex-row"><button class="ex-try" type="button">Try it</button>'
        + '<button class="ex-like' + (liked ? " on" : "") + '" type="button"></button>'
        + (p.kind === "video" ? '<span class="ex-badge">▶ Video</span>' : "")
        + '</div></div>';
      c.querySelector(".ex-by").textContent = "by " + p.by + (p.mine ? " (you)" : "");
      c.querySelector(".ex-prompt").textContent = p.prompt;
      c.querySelector(".ex-like").textContent = (liked ? "♥" : "♡") + " " + (p.likes + (liked?1:0));
      c.querySelector(".ex-try").addEventListener("click", function(){
        var t = document.querySelector("#view-chat .composer input, #view-chat .composer textarea");
        if (t){ t.value = p.prompt; t.focus(); }
        window.location.hash = "#chat";
      });
      c.querySelector(".ex-like").addEventListener("click", function(){
        var d2 = store(); d2.liked[p.id] = !d2.liked[p.id]; save(d2); render();
      });
      if (p.kind === "video") c.addEventListener("click", function(e){
        if (e.target.closest("button")) return;
        toast("Video playback arrives with the backend — prompt copied ✔");
        try { navigator.clipboard.writeText(p.prompt); } catch(e){}
      });
      grid.appendChild(c);
    });
    if (!grid.children.length) grid.innerHTML = '<p class="ex-empty">Nothing here yet — share something from chat.</p>';
  }
  wrap.querySelectorAll(".ex-f").forEach(function (b) {
    b.addEventListener("click", function(){
      wrap.querySelectorAll(".ex-f").forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on"); filter = b.dataset.f; render();
    });
  });

  function toast(msg){
    var t = document.createElement("div"); t.className = "ex-toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add("bye"); }, 2200);
    setTimeout(function(){ t.remove(); }, 2700);
  }

  /* chat share button -> publish your last prompt to Explore */
  var chat = document.getElementById("view-chat");
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest('[class*="share" i]');
    if (!btn || !chat.contains(btn)) return;
    ev.preventDefault(); ev.stopPropagation();
    var d = store();
    var promptEl = null;
    chat.querySelectorAll(".msg").forEach(function (m) {
      if (/user|me|own/i.test(m.className)) { var b = m.querySelector(".bubble"); if (b) promptEl = b; }
    });
    var prompt = promptEl ? promptEl.textContent.trim() : "a scene from my chat";
    var id = "p" + Date.now();
    d.posts.push({ id:id, kind:"image", prompt:prompt.slice(0,140),
      src:prompt, seed:(id.charCodeAt(1)+id.length)%9999,
      by:"Fred", likes:0, mine:true, ts:Date.now() });
    save(d); render(); toast("Shared to Explore ✔");
  }, true);

  render();
})();


/* ===== v67-fallback: ring layout override ===== */
(function () {
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  var view = document.getElementById("view-history");
  if (!stage || !nodes || !view || stage.dataset.rings) return;
  stage.dataset.rings = "1";
  function layout() {
    var r = stage.getBoundingClientRect(); if (!r.width) return;
    var ns = nodes.querySelectorAll(".const-node");
    var n = ns.length; if (!n) return;
    nodes.classList.toggle("crowd", n > 8);
    var wide = (r.width / r.height) >= 0.95;
    var rx = wide ? 34 : 27, ry = wide ? 30 : 34, per = wide ? 6 : 5;
    for (var i = 0; i < n; i++) {
      var el = ns[i], x, y;
      if (i === 0) { x = wide ? 40 : 48; y = wide ? 22 : 16; }
      else {
        var ring = Math.floor((i - 1) / per), idx = (i - 1) % per;
        var inRing = Math.min(per, n - 1 - ring * per);
        var a = (idx / inRing) * 6.2832 + (ring ? 0.55 : -0.35);
        var sc = 1 - ring * 0.34;
        x = 50 + Math.cos(a) * rx * sc; y = 46 + Math.sin(a) * ry * sc;
      }
      el.style.left = x + "%"; el.style.top = y + "%";
      if (x > 62) el.classList.add("left"); else el.classList.remove("left");
    }
  }
  var tm = 0;
  function soon(){ clearTimeout(tm); tm = setTimeout(layout, 160); }
  new MutationObserver(soon).observe(nodes, { childList:true, subtree:true });
  new MutationObserver(soon).observe(view, { attributes:true, attributeFilter:["class"] });
  window.addEventListener("resize", soon);
  layout(); setTimeout(layout, 700);
})();
/* ===== v68: pixel-space collision resolver — no pile-ups at any count ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || nodes.dataset.collide) return;
  nodes.dataset.collide = "1";

  function resolve() {
    var sr = stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return;
    var els = [].slice.call(nodes.querySelectorAll(".const-node"));
    var n = els.length; if (n < 2) return;
    var P = els.map(function (el) {
      var g = el.querySelector(".cn-world") || el;
      return {
        el: el,
        x: parseFloat(el.style.left) || 50,
        y: parseFloat(el.style.top) || 50,
        rx: (g.offsetWidth / 2 + 8) / sr.width,   /* globe half-width + gap, in % */
        ry: (g.offsetHeight / 2 + 8) / sr.height
      };
    });
    var yMax = 1e9; /* v88: flow layout owns vertical space */                                /* keep clear of spin bar + detail card */
    for (var pass = 0; pass < 60; pass++) {
      var moved = false;
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        var a = P[i], b = P[j];
        var dx = b.x - a.x, dy = b.y - a.y;
        var ox = a.rx + b.rx - Math.abs(dx);      /* overlap in % of width */
        var oy = a.ry + b.ry - Math.abs(dy);      /* overlap in % of height */
        if (ox > 0 && oy > 0) {
          moved = true;
          if (ox * sr.width <= oy * sr.height) {  /* push along the smaller real axis */
            var f = (ox + 0.4) / 2, d = dx >= 0 ? 1 : -1;
            a.x -= d * f; b.x += d * f;
          } else {
            var f2 = (oy + 0.4) / 2, d2 = dy >= 0 ? 1 : -1;
            a.y -= d2 * f2; b.y += d2 * f2;
          }
        }
      }
      P.forEach(function (p) {
        p.x = Math.max(p.rx, Math.min(100 - p.rx, p.x));
        p.y = Math.max(p.ry + 1, Math.min(yMax, p.y));
      });
      if (!moved) break;
    }
    P.forEach(function (p) { p.el.style.left = p.x + "%"; p.el.style.top = p.y + "%"; });
  }

  var t = 0;
  function soon() { clearTimeout(t); t = setTimeout(resolve, 260); }  /* after legacy's 160ms pass */
  new MutationObserver(soon).observe(nodes, { childList: true, subtree: true });
  new MutationObserver(soon).observe(view, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", soon);
  /* settle runs to catch the legacy layout's own delayed passes */
  [400, 900, 1800, 3000, 4500].forEach(function (ms) { setTimeout(resolve, ms); });
  setTimeout(resolve, 60);
})();

/* ===== v69: world actions — Delete (fail-closed) + Keep ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || nodes.dataset.wacts) return;
  nodes.dataset.wacts = "1";

  var bar = document.createElement("div");
  bar.className = "w-actions";
  bar.innerHTML = '<button type="button" class="w-del">🗑 Delete</button>'
    + '<button type="button" class="w-keep">✓ Keep</button>';
  stage.appendChild(bar);

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "w-toast"; t.textContent = msg;
    view.appendChild(t);
    setTimeout(function () { t.classList.add("bye"); }, 2800);
    setTimeout(function () { t.remove(); }, 3400);
  }

  function parseLabel(lbl) {
    if (!lbl) return null;
    var m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(lbl);
    if (!m) return null;
    var h = (+m[1]) % 12; if (/pm/i.test(m[3])) h += 12;
    return { h: h, min: +m[2], day: /yesterday/i.test(lbl) ? "yesterday" : (/today/i.test(lbl) ? "today" : null) };
  }
  function sameStamp(ts, p) {
    var d = new Date(typeof ts === "number" ? ts : Date.parse(ts));
    if (isNaN(d.getTime())) return true;             /* unparseable → don't disqualify */
    if (Math.abs((d.getHours() * 60 + d.getMinutes()) - (p.h * 60 + p.min)) > 1) return false;
    var now = new Date();
    if (p.day === "yesterday") return d.toDateString() === new Date(now.getTime() - 864e5).toDateString();
    if (p.day === "today") return d.toDateString() === now.toDateString();
    return true;
  }
  function looksChats(a) {
    return a.some(function (x) {
      var t = x && (x.title || x.name);
      return typeof t === "string" && !!(x.messages || x.msgs || x.ts || x.time || x.created || x.updated);
    });
  }
  function collect() {                                /* find chat arrays anywhere in storage */
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i), raw = localStorage.getItem(k);
      if (!raw || (raw[0] !== "[" && raw[0] !== "{")) continue;
      var v; try { v = JSON.parse(raw); } catch (e) { continue; }
      (function walk(o, root) {
        if (!o || typeof o !== "object") return;
        if (Array.isArray(o)) {
          if (o.length && o.every(function (x) { return x && typeof x === "object" && !Array.isArray(x); }) && looksChats(o))
            out.push({ key: k, root: root, arr: o });
          o.forEach(function (x) { walk(x, root); });
        } else Object.keys(o).forEach(function (kk) { walk(o[kk], root); });
      })(v, v);
    }
    return out;
  }
  function findTarget(node) {
    var b = node.querySelector(".cn-lbl b"), iEl = node.querySelector(".cn-lbl i");
    var title = (b ? b.textContent : node.textContent).trim().split("\n")[0];
    var p = parseLabel(iEl ? iEl.textContent : "");
    var hits = [];
    collect().forEach(function (c) {
      c.arr.forEach(function (it, idx) {
        var t = it && (it.title || it.name);
        if (typeof t !== "string" || t.trim() !== title) return;
        if (p) {
          var ts = it.ts || it.time || it.updated || it.created ||
                   (it.messages && it.messages.length &&
                    (it.messages[it.messages.length - 1].ts || it.messages[it.messages.length - 1].time));
          if (ts != null && !sameStamp(ts, p)) return;
        }
        hits.push({ key: c.key, root: c.root, arr: c.arr, idx: idx });
      });
    });
    return { hits: hits, title: title };
  }

  bar.querySelector(".w-keep").addEventListener("click", function () {
    nodes.querySelectorAll(".const-node.sel").forEach(function (n) { n.classList.remove("sel"); });
    bar.classList.remove("on");
  });
  bar.querySelector(".w-del").addEventListener("click", function () {
    var sel = nodes.querySelector(".const-node.sel");
    if (!sel) return;
    var r = findTarget(sel);
    if (r.hits.length !== 1) {
      toast(r.hits.length
        ? r.hits.length + ' chats match "' + r.title + '" at that time — not deleting blind.'
        : "Couldn't match this chat in storage safely — nothing deleted.");
      return;
    }
    var h = r.hits[0];
    try {
      var bk = JSON.parse(localStorage.getItem("alfred-del-backup") || "[]");
      bk.unshift({ key: h.key, item: h.arr[h.idx], at: Date.now() });
      localStorage.setItem("alfred-del-backup", JSON.stringify(bk.slice(0, 20)));
      h.arr.splice(h.idx, 1);
      localStorage.setItem(h.key, JSON.stringify(h.root));
    } catch (e) { toast("Storage write failed — nothing deleted."); return; }
    sel.remove(); bar.classList.remove("on");
    toast("World deleted — refresh to settle the universe.");
  });

  setInterval(function () {                           /* the pill follows its world */
    var sel = nodes.querySelector(".const-node.sel");
    if (!sel) { bar.classList.remove("on"); return; }
    var stg = stage.getBoundingClientRect();
    var l = parseFloat(sel.style.left) || 50;
    var tv = sel.style.top || "50%";
    var t = tv.indexOf("px") > -1 ? (parseFloat(tv) / (stg.height || 1)) * 100 : (parseFloat(tv) || 50);
    bar.style.left = Math.max(16, Math.min(84, l)) + "%";
    bar.style.top = Math.min(94, t + 6) + "%";
    bar.classList.add("on");
  }, 500);
})();

/* ===== v70: exact delete — real key, timeLabel match, tombstones ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || nodes.dataset.v70) return;
  nodes.dataset.v70 = "1";
  var KEY = "alfred_history";

  function timeLabel(ts) {                      /* 1:1 copy of the app's own formatter */
    var d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString())
      return "Today, " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    var days = Math.round((now - d) / 864e5);
    if (days <= 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    var w = Math.round(days / 7); return w + (w > 1 ? " weeks ago" : " week ago");
  }
  function tsOf(it) {
    if (!it || typeof it !== "object") return null;
    var v = it.ts; if (v == null) v = it.time; if (v == null) v = it.at;
    if (v == null) v = it.created; if (v == null) v = it.updated;
    if (v == null) { var ms = it.messages || it.msgs;
      if (Array.isArray(ms) && ms.length) { var m = ms[ms.length - 1] || {}; v = m.ts; if (v == null) v = m.time; } }
    return v == null ? null : v;
  }
  function titleOf(it) {
    if (!it || typeof it !== "object") return null;
    var c = it.title || it.name || it.t || it.q || it.head || it.text;
    if (typeof c !== "string" || !c.trim()) {
      var ms = it.messages || it.msgs;
      if (Array.isArray(ms) && ms.length) { var m = ms[0] || {}; c = m.t || m.text || m.content || m.q; }
    }
    return typeof c === "string" ? c.trim() : null;
  }
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "w-toast"; t.textContent = msg;
    view.appendChild(t);
    setTimeout(function () { t.classList.add("bye"); }, 2800);
    setTimeout(function () { t.remove(); }, 3400);
  }

  /* TOMBSTONES: any future write() that contains a deleted chat gets it stripped */
  var opSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === KEY) {
      try {
        var tombs = JSON.parse(localStorage.getItem("alfred_tombs") || "[]");
        if (tombs.length) {
          var a = JSON.parse(v);
          if (Array.isArray(a)) {
            var f = a.filter(function (it) {
              var t = titleOf(it); if (t) t = t.toLowerCase();
              var ts = tsOf(it);
              for (var i = 0; i < tombs.length; i++) {
                var tb = tombs[i];
                if (t && t === tb.t && ts != null && tb.ts != null && Number(tb.ts) === Number(ts)) return false;
                if (t && t === tb.t && ts != null && timeLabel(ts) === tb.label) return false;
              }
              return true;
            });
            if (f.length !== a.length) v = JSON.stringify(f);
          }
        }
      } catch (e) {}
    }
    return opSet.call(this, k, v);
  };

  /* reuse the v69 pill — clone-replace its buttons (clones drop the old listeners) */
  var bar = stage.querySelector(".w-actions");
  if (!bar) {
    bar = document.createElement("div"); bar.className = "w-actions";
    bar.innerHTML = '<button type="button" class="w-del">🗑 Delete</button><button type="button" class="w-keep">✓ Keep</button>';
    stage.appendChild(bar);
  }
  var del = bar.querySelector(".w-del"), keep = bar.querySelector(".w-keep");
  var d2 = del.cloneNode(true); del.parentNode.replaceChild(d2, del); del = d2;
  var k2 = keep.cloneNode(true); keep.parentNode.replaceChild(k2, keep); keep = k2;

  keep.onclick = function () {
    nodes.querySelectorAll(".const-node.sel").forEach(function (n) { n.classList.remove("sel"); });
    bar.classList.remove("on");
  };

  del.onclick = function () {
    var sel = nodes.querySelector(".const-node.sel");
    if (!sel) return;
    var b = sel.querySelector(".cn-lbl b"), iEl = sel.querySelector(".cn-lbl i");
    var title = ((b && b.textContent) || sel.textContent || "").trim().split("\n")[0].trim();
    var label = (iEl ? iEl.textContent : "").trim();
    var a = []; try { a = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) {}
    if (!Array.isArray(a)) a = [];
    var hits = [];
    a.forEach(function (it, idx) {
      var t = titleOf(it), ts = tsOf(it);
      var tOk = !!t && t.toLowerCase() === title.toLowerCase();
      var lOk = !!label && ts != null && timeLabel(ts) === label;
      if ((tOk && lOk) || (lOk && !t)) hits.push(idx);
    });
    if (hits.length !== 1) {
      toast(hits.length
        ? hits.length + ' chats match "' + title + '" at that exact time — not deleting blind.'
        : 'No exact match for "' + title + '" at ' + (label || "?") + " — nothing deleted.");
      return;
    }
    var item = a[hits[0]];
    try {
      var bk = JSON.parse(localStorage.getItem("alfred-del-backup") || "[]");
      bk.unshift({ key: KEY, item: item, at: Date.now() });
      localStorage.setItem("alfred-del-backup", JSON.stringify(bk.slice(0, 20)));
    } catch (e) {}
    try {
      var tombs = JSON.parse(localStorage.getItem("alfred_tombs") || "[]");
      tombs.push({ t: (titleOf(item) || title).toLowerCase(), ts: tsOf(item), label: label });
      localStorage.setItem("alfred_tombs", JSON.stringify(tombs.slice(-80)));
      a.splice(hits[0], 1);
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch (e) { toast("Storage write failed — nothing deleted."); return; }
    sel.remove(); bar.classList.remove("on");
    toast("World deleted — it stays deleted, even when the app re-saves.");
  };
})();

/* ===== v71: world diversity — every chat becomes its own planet ===== */
(function () {
  var nodes = document.getElementById("const-nodes");
  var view  = document.getElementById("view-history");
  if (!nodes || !view || nodes.dataset.divers) return;
  nodes.dataset.divers = "1";

  var PLATES = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
  var THEMES = [
    "crimson lava planet with glowing cracks", "emerald ocean world with swirling storms",
    "amber desert planet with twin suns", "ice world with glowing blue rings",
    "violet gas giant with luminous bands", "teal jungle moon with bioluminescent seas",
    "rose nebula world with golden rings", "obsidian volcanic planet with ember glow",
    "aqua terran world with white clouds", "golden city planet with night lights"
  ];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  function keyOf(n){
    var b=n.querySelector(".cn-lbl b"), i=n.querySelector(".cn-lbl i");
    return ((b?b.textContent:"")+"|"+(i?i.textContent:"")).trim() || "w0";
  }
  function loadCache(){ try { return JSON.parse(localStorage.getItem("alfred_world_skins")||"{}"); } catch(e){ return {}; } }
  function saveCache(c){ try { localStorage.setItem("alfred_world_skins", JSON.stringify(c)); } catch(e){} }

  function skin() {
    var ns = nodes.querySelectorAll(".const-node");
    ns.forEach(function (n, idx) {
      var g = n.querySelector(".cn-world"); if (!g) return;
      var k = keyOf(n) || ("w" + idx);
      if (g.dataset.skin === k) return;               /* already skinned */
      g.dataset.skin = k;
      var h = hash(k); g.dataset.wkey = k; g.dataset.h = String(h);
      var c = loadCache();
      if (c[k]) { g.style.backgroundImage = "url('" + c[k] + "')"; g.style.filter = "none"; }
      else {
        g.style.backgroundImage = "url('../assets/gen/" + PLATES[h % PLATES.length] + "')";
        g.style.filter = "hue-rotate(" + (h % 360) + "deg) saturate(1.15)";
      }
    });
  }
  var tm = 0;
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(skin, 180); })
    .observe(nodes, { childList: true, subtree: true });
  skin();

  /* unique generated planet per world — one at a time, cached forever */
  var busy = false;
  setInterval(function () {
    if (busy) return;
    var g = nodes.querySelector(".cn-world[data-wkey]:not([data-gen])");
    if (!g) return;
    busy = true; g.dataset.gen = "1";
    var k = g.dataset.wkey, h = +g.dataset.h || 0;
    var url = "/api/image?prompt=" + encodeURIComponent(
        THEMES[h % THEMES.length] + ", seen from space, realistic, cinematic light, no text")
      + "&seed=" + (h % 9999);
    var img = new Image();
    img.onload = function () {
      var c = loadCache(); c[k] = url; saveCache(c);
      if (g.isConnected) { g.style.backgroundImage = "url('" + url + "')"; g.style.filter = "none"; }
      busy = false;
    };
    img.onerror = function () { busy = false; };
    img.src = url;
  }, 2500);
})();

/* ===== v72: cosmic orbits + guaranteed-unique worlds ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || stage.dataset.cosmic) return;
  stage.dataset.cosmic = "1";
  var NS = "http://www.w3.org/2000/svg";

  /* orbit layer — lives behind the worlds */
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "orbit-svg");
  svg.setAttribute("aria-hidden", "true");
  stage.insertBefore(svg, stage.firstChild);

  function srcPos() {
    var c = stage.querySelector('[class*="core" i],[class*="src" i],[class*="sun" i],[class*="star" i]');
    if (c) {
      var r = c.getBoundingClientRect(), s = stage.getBoundingClientRect();
      if (r.width) return { x: (r.left + r.width / 2 - s.left) / s.width * 100,
                            y: (r.top + r.height / 2 - s.top) / s.height * 100 };
    }
    return { x: 50, y: 44 };
  }
  function draw() {
    var s = stage.getBoundingClientRect(); if (!s.width) return;
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    var src = srcPos(), out = "";
    nodes.querySelectorAll(".const-node").forEach(function (n) {
      var x = parseFloat(n.style.left) || 50, y = parseFloat(n.style.top) || 50;
      var dx = x - src.x, dy = y - src.y;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      var rx = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
      var cxy = src.x.toFixed(2) + " " + src.y.toFixed(2);
      out += '<ellipse cx="' + src.x.toFixed(2) + '" cy="' + src.y.toFixed(2) + '" rx="' + rx.toFixed(2)
        + '" ry="' + (rx * .4).toFixed(2) + '" transform="rotate(' + ang.toFixed(1) + ' ' + cxy
        + ')" fill="none" stroke="rgba(130,190,255,.13)" stroke-width="1.2" vector-effect="non-scaling-stroke"/>';
      out += '<ellipse class="orbit-dash" cx="' + src.x.toFixed(2) + '" cy="' + src.y.toFixed(2) + '" rx="' + rx.toFixed(2)
        + '" ry="' + (rx * .4).toFixed(2) + '" transform="rotate(' + ang.toFixed(1) + ' ' + cxy
        + ')" fill="none" stroke="rgba(200,235,255,.3)" stroke-width="1" stroke-dasharray="2 7" vector-effect="non-scaling-stroke"/>';
    });
    svg.innerHTML = out;
  }
  var t1 = 0;
  function soon() { clearTimeout(t1); t1 = setTimeout(draw, 220); }
  new MutationObserver(soon).observe(nodes, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
  window.addEventListener("resize", soon);
  setInterval(draw, 1400); draw();

  /* retire the old straight-line painter */
  view.querySelectorAll('[class*="const-line"],[class*="const-link"],[class*="cn-line"],[class*="edge"]').forEach(function (el) {
    if (!el.classList.contains("orbit-svg")) el.style.opacity = ".06";
  });

  /* worlds v2: unique theme per chat, golden-angle hue spread */
  var THEMES = [
    "crimson lava planet with glowing cracks", "emerald ocean world with swirling storms",
    "amber desert planet with twin suns", "ice world with glowing blue rings",
    "violet gas giant with luminous bands", "teal jungle moon with bioluminescent seas",
    "rose nebula world with golden rings", "obsidian volcanic planet with ember glow",
    "aqua terran world with white clouds", "golden city planet with night lights"
  ];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  function keyOf(n){
    var b=n.querySelector(".cn-lbl b"), i=n.querySelector(".cn-lbl i");
    return ((b?b.textContent:"")+"|"+(i?i.textContent:"")).trim() || "w0";
  }
  function loadCache(){ try { return JSON.parse(localStorage.getItem("alfred_world_skins_v2")||"{}"); } catch(e){ return {}; } }
  function saveCache(c){ try { localStorage.setItem("alfred_world_skins_v2", JSON.stringify(c)); } catch(e){} }

  function skin() {
    nodes.querySelectorAll(".const-node").forEach(function (n, idx) {
      var g = n.querySelector(".cn-world"); if (!g) return;
      var k = keyOf(n) || ("w" + idx);
      if (g.dataset.skin === k) return;
      g.dataset.skin = k; g.dataset.wkey = k; g.dataset.h = String(hash(k)); g.dataset.gen = "1"; /* retires v71's queue */
      var h = +g.dataset.h, c = loadCache();
      if (c[k]) { g.style.backgroundImage = "url('" + c[k].split("#")[0] + "')"; g.style.filter = "none"; }
      else {
        g.style.backgroundImage = "url('../assets/gen/" + ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"][h % 6] + "')";
        g.style.filter = "hue-rotate(" + ((h * 47) % 360) + "deg) saturate(1.12)";  /* golden-angle = no near-dupes */
      }
    });
  }
  var t2 = 0;
  new MutationObserver(function () { clearTimeout(t2); t2 = setTimeout(skin, 180); })
    .observe(nodes, { childList: true, subtree: true });
  skin();

  var busy = false;
  setInterval(function () {
    if (busy) return;
    var g = nodes.querySelector(".cn-world[data-wkey]:not([data-gen72])");
    if (!g) return;
    busy = true; g.dataset.gen72 = "1";
    var k = g.dataset.wkey, h = +g.dataset.h || 0;
    var c = loadCache(), used = {};
    Object.keys(c).forEach(function (kk) { var m = /theme=(\d+)/.exec(c[kk]); if (m) used[+m[1]] = 1; });
    var ti = -1;
    for (var i = 0; i < THEMES.length; i++) { var cand = (h + i * 3) % THEMES.length; if (!used[cand]) { ti = cand; break; } }
    if (ti < 0) ti = h % THEMES.length;
    var url = "/api/image?prompt=" + encodeURIComponent(THEMES[ti] + ", seen from space, realistic, cinematic light, no text")
      + "&seed=" + ((h + ti * 17) % 9999);
    var img = new Image();
    img.onload = function () {
      c = loadCache(); c[k] = url + "#theme=" + ti; saveCache(c);
      if (g.isConnected) { g.style.backgroundImage = "url('" + url + "')"; g.style.filter = "none"; }
      busy = false;
      window.dispatchEvent(new Event("resize"));  /* nudge the collision resolver after images size up */
    };
    img.onerror = function () { busy = false; };
    img.src = url;
  }, 2500);
})();

/* ===== v73: nested orbits + dive-into-world backdrop ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || stage.dataset.cos3) return;
  stage.dataset.cos3 = "1";
  var NS = "http://www.w3.org/2000/svg";

  /* clean orbit layer (v72's cage is hidden by CSS) */
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "orbit-svg2"); svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
  stage.insertBefore(svg, stage.firstChild);

  function srcPos() {
    var c = stage.querySelector('[class*="core" i],[class*="src" i],[class*="sun" i],[class*="star" i]');
    if (c) { var r = c.getBoundingClientRect(), s = stage.getBoundingClientRect();
      if (r.width) return { x:(r.left+r.width/2-s.left)/s.width*100, y:(r.top+r.height/2-s.top)/s.height*100 }; }
    return { x:50, y:44 };
  }
  function draw() {
    var s = stage.getBoundingClientRect(); if (!s.width) return;
    var src = srcPos(), out = "", seen = {};
    nodes.querySelectorAll(".const-node").forEach(function (n) {
      var x = parseFloat(n.style.left)||50, y = parseFloat(n.style.top)||50;
      var d = Math.hypot(x-src.x, (y-src.y)*1.35);       /* flattened = tilted-system look */
      d = Math.round(d/7)*7 || 8; if (seen[d]) return; seen[d] = 1;
      var cx = src.x.toFixed(2), cy = src.y.toFixed(2);
      out += '<circle cx="'+cx+'" cy="'+cy+'" r="'+d+'" fill="none" stroke="rgba(120,185,255,.10)" stroke-width="1" vector-effect="non-scaling-stroke"/>'
           + '<circle class="od" cx="'+cx+'" cy="'+cy+'" r="'+d+'" fill="none" stroke="rgba(205,235,255,.28)" stroke-width=".8" stroke-dasharray="1.5 8" vector-effect="non-scaling-stroke"/>';
    });
    svg.innerHTML = out;
  }
  var t = 0; function soon(){ clearTimeout(t); t = setTimeout(draw, 220); }
  new MutationObserver(soon).observe(nodes, { childList:true, subtree:true, attributes:true, attributeFilter:["style"] });
  window.addEventListener("resize", soon);
  setInterval(draw, 1600); draw();

  /* dive backdrop: selecting a world morphs the universe into it */
  var bg = document.createElement("div");
  bg.className = "world-bg"; bg.setAttribute("aria-hidden","true");
  stage.insertBefore(bg, svg);
  function cache(){ try { return JSON.parse(localStorage.getItem("alfred_world_skins_v2")||"{}"); } catch(e){ return {}; } }
  function urlOf(n) {
    var g = n.querySelector(".cn-world"); if (!g) return null;
    var c = cache(), k = g.dataset.wkey;
    if (k && c[k]) return c[k].split("#")[0];
    var m = /url\(['"]?([^'"]*)['"]?\)/.exec(g.style.backgroundImage||"");
    return m ? m[1] : null;
  }
  function syncSel() {
    var sel = nodes.querySelector(".const-node.sel");
    if (sel) {
      var u = urlOf(sel);
      if (u) {
        u = u.replace(/^\.\./, "");
        if (bg.dataset.url !== u) {
          bg.dataset.url = u;
          bg.style.backgroundImage = "url('" + u + "')";
          bg.classList.remove("on"); void bg.offsetWidth; bg.classList.add("on");
        } else bg.classList.add("on");
      }
    } else { bg.classList.remove("on"); bg.dataset.url = ""; }
  }
  nodes.addEventListener("click", function(){ setTimeout(syncSel, 40); });
  var t3 = 0;
  new MutationObserver(function(){ clearTimeout(t3); t3 = setTimeout(syncSel, 160); })
    .observe(nodes, { subtree:true, attributes:true, attributeFilter:["class"] });
  syncSel();

  /* generator: proxy first, direct Pollinations fallback (beats the 500s) */
  var THEMES = ["crimson lava planet with glowing cracks","emerald ocean world with swirling storms",
    "amber desert planet with twin suns","ice world with glowing blue rings",
    "violet gas giant with luminous bands","teal jungle moon with bioluminescent seas",
    "rose nebula world with golden rings","obsidian volcanic planet with ember glow",
    "aqua terran world with white clouds","golden city planet with night lights"];
  var busy = false;
  setInterval(function () {
    if (busy) return;
    var g = nodes.querySelector(".cn-world[data-wkey]:not([data-g73])");
    if (!g) return;
    busy = true; g.dataset.g73 = "1";
    var k = g.dataset.wkey, h = +(g.dataset.h||0), c = cache();
    var used = {}; Object.keys(c).forEach(function(kk){ var m=/theme=(\d+)/.exec(c[kk]); if(m) used[+m[1]]=1; });
    var ti=-1; for (var i=0;i<THEMES.length;i++){ var cd=(h+i*3)%THEMES.length; if(!used[cd]){ ti=cd; break; } }
    if (ti<0) ti=h%THEMES.length;
    var p = encodeURIComponent(THEMES[ti]+", seen from space, realistic, cinematic light, no text");
    var seed = (h+ti*17)%9999;
    var proxy = "/api/image?prompt="+p+"&seed="+seed;
    var direct = "https://image.pollinations.ai/prompt/"+p+"?width=768&height=768&nologo=true&seed="+seed;
    function adopt(u){ c=cache(); c[k]=u+"#theme="+ti;
      try{ localStorage.setItem("alfred_world_skins_v2", JSON.stringify(c)); }catch(e){}
      if (g.isConnected){ g.style.backgroundImage="url('"+u+"')"; g.style.filter="none"; }
      busy=false; window.dispatchEvent(new Event("resize")); }
    var img = new Image();
    img.onload  = function(){ adopt(proxy); };
    img.onerror = function(){ var im2 = new Image();
      im2.onload = function(){ adopt(direct); };
      im2.onerror = function(){ busy=false; };
      im2.src = direct; };
    img.src = proxy;
  }, 2500);
})();

/* ===== v74: one shared scene + per-chat galaxies + explore image fix ===== */
(function () {                                   /* 1) the ONE realistic scene */
  var stage = document.querySelector(".const-stage");
  if (!stage || stage.dataset.scene74) return;
  stage.dataset.scene74 = "1";
  function apply(u) {
    stage.dataset.sceneUrl = u;
    stage.style.backgroundImage =
      "linear-gradient(180deg, rgba(2,8,20,.55), rgba(2,8,20,.2) 42%, rgba(2,8,20,.72)), url('" + u + "')";
  }
  var saved = null; try { saved = localStorage.getItem("alfred_scene"); } catch (e) {}
  if (saved) apply(saved);
  try { localStorage.removeItem("alfred_world_skins_v2"); } catch (e) {}   /* stale planets out */
  var p = encodeURIComponent("ultra realistic deep space panorama, one vast glowing spiral galaxy core at center, colorful nebula clouds magenta teal and gold, hundreds of sharp stars, cinematic astrophotography, high detail, no text");
  function tryUrl(u, fb) { var i = new Image(); i.onload = function () {
      try { localStorage.setItem("alfred_scene", u); } catch (e) {} apply(u); };
    i.onerror = fb; i.src = u; }
  tryUrl("/api/image?prompt=" + p + "&seed=42", function () {
    tryUrl("https://image.pollinations.ai/prompt/" + p + "?width=1024&height=1536&nologo=true&seed=42", function () {});
  });
})();

(function () {                                   /* 2) every chat = its own CSS galaxy */
  var nodes = document.getElementById("const-nodes");
  if (!nodes || nodes.dataset.gal74) return;
  nodes.dataset.gal74 = "1";
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  function keyOf(n){ var b=n.querySelector(".cn-lbl b"), i=n.querySelector(".cn-lbl i");
    return ((b?b.textContent:"")+"|"+(i?i.textContent:"")).trim() || "w0"; }
  function galaxify() {
    nodes.querySelectorAll(".const-node").forEach(function (n, idx) {
      var g = n.querySelector(".cn-world"); if (!g) return;
      var k = keyOf(n) || ("w" + idx);
      var generated = /url\(/.test(g.style.backgroundImage || "");
      if (g.dataset.g74 === k && !generated) return;          /* re-claim if an old generator overwrote us */
      g.dataset.g74 = k; g.dataset.wkey = k;
      g.dataset.gen = "1"; g.dataset.gen72 = "1"; g.dataset.g73 = "1";   /* retire v71–73 queues */
      var h = hash(k), hu = h % 360, hu2 = (hu + 45) % 360;
      g.style.backgroundImage =
        "radial-gradient(circle at 50% 50%, rgba(255,255,255,.98) 0%, rgba(215,240,255,.85) 7%, rgba(130,195,255,.4) 18%, " +
        "hsla(" + hu + ",85%,62%,.5) 34%, hsla(" + hu2 + ",80%,45%,.26) 54%, transparent 72%)";
      g.style.filter = "none";
      g.style.boxShadow = "0 0 20px hsla(" + hu + ",90%,65%,.45), inset 0 0 14px hsla(" + hu2 + ",90%,60%,.3)";
      if (!g.querySelector(".cn-planet")) for (var i = 0; i < 3; i++) {
        var pl = document.createElement("span");
        pl.className = "cn-planet p" + (i + 1);
        pl.style.background = "radial-gradient(circle at 35% 30%, hsl(" + ((hu + i * 75) % 360) + ",92%,76%), hsl(" + ((hu + i * 75) % 360) + ",80%,38%))";
        g.appendChild(pl);
      }
    });
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(galaxify, 160); })
    .observe(nodes, { childList: true, subtree: true });
  galaxify();
  /* dive: selected world tints the one scene */
  var stage = document.querySelector(".const-stage");
  function hash2(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  setInterval(function () {
    var sel = null, bg = stage && stage.querySelector(".world-bg"); /* v88: dive owned by v73 sync */
    if (!bg) return;
    if (sel) {
      var hu = hash2(keyOf(sel)) % 360;
      var scene = stage.dataset.sceneUrl || "../assets/gen/history-sky.jpg";
      bg.style.backgroundImage =
        "radial-gradient(circle at 50% 42%, hsla(" + hu + ",85%,60%,.28), transparent 58%), url('" + scene + "')";
      bg.classList.add("on");
    } else bg.classList.remove("on");
  }, 400);
})();

/* v74 rescuer retired in v82 */

/* ===== v75: realistic galaxies — one generated world per chat ===== */
(function () {
  var nodes = document.getElementById("const-nodes");
  var stage = document.querySelector(".const-stage");
  if (!nodes || !stage || nodes.dataset.real75) return;
  nodes.dataset.real75 = "1";

  var PLATES = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
  var PALETTES = [
    ["crimson and gold","lava-red star with golden accretion glow"],
    ["emerald and teal","green-cyan bioluminescent glow"],
    ["violet and magenta","purple twin-star glow"],
    ["ice blue and silver","pale blue white-dwarf glow"],
    ["amber and copper","warm orange giant glow"],
    ["rose and pearl","pink ring glow"],
    ["aqua and sapphire","blue supergiant glow"],
    ["obsidian and ember","deep red ember glow"],
    ["jade and gold","jade nebula glow"],
    ["indigo and silver","indigo pulsar glow"]
  ];
  function hash(t){ var h=5381; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  function keyOf(n){ var b=n.querySelector(".cn-lbl b"), i=n.querySelector(".cn-lbl i");
    return ((b?b.textContent:"")+"|"+(i?i.textContent:"")).trim() || "w0"; }
  function cache(){ try { return JSON.parse(localStorage.getItem("alfred_galaxies")||"{}"); } catch(e){ return {}; } }
  function save(c){ try { localStorage.setItem("alfred_galaxies", JSON.stringify(c)); } catch(e){} }

  function dress() {
    nodes.querySelectorAll(".const-node").forEach(function (n, idx) {
      var g = n.querySelector(".cn-world"); if (!g) return;
      var k = keyOf(n) || ("w" + idx);
      if (g.dataset.r75 === k) return;
      g.dataset.r75 = k; g.dataset.wkey = k; g.dataset.h = String(hash(k));
      g.dataset.gen = "1"; g.dataset.gen72 = "1"; g.dataset.g73 = "1"; g.dataset.g74 = k;  /* retire all old painters */
      g.querySelectorAll(".cn-planet").forEach(function (p){ p.remove(); });               /* CSS dots out */
      var c = cache(), h = hash(k);
      if (c[k]) {
        g.style.backgroundImage = "url('" + c[k].split("#")[0] + "')";
        g.style.filter = "none";
      } else {
        g.style.backgroundImage = "url('../assets/gen/" + PLATES[h % PLATES.length] + "')";
        g.style.filter = "hue-rotate(" + ((h*47)%360) + "deg) saturate(1.18) brightness(1.05)";
      }
      g.style.boxShadow = "0 0 22px rgba(140,200,255,.4), inset 0 0 14px rgba(2,8,24,.55)";
    });
  }
  var t = 0;
  new MutationObserver(function(){ clearTimeout(t); t = setTimeout(dress, 150); })
    .observe(nodes, { childList:true, subtree:true });
  dress();

  var busy = false;
  setInterval(function () {
    if (busy) return;
    var g = nodes.querySelector(".cn-world[data-wkey]:not([data-g75])");
    if (!g) return;
    busy = true; g.dataset.g75 = "1";
    var k = g.dataset.wkey, h = +(g.dataset.h || 0), c = cache();
    var used = {}; Object.keys(c).forEach(function(kk){ var m = /#p(\d+)/.exec(c[kk]); if (m) used[+m[1]] = 1; });
    var pi = -1;
    for (var i = 0; i < PALETTES.length; i++){ var cd = (h + i * 3) % PALETTES.length; if (!used[cd]) { pi = cd; break; } }
    if (pi < 0) pi = h % PALETTES.length;
    var prompt = "realistic " + PALETTES[pi][0] + " spiral galaxy with a brilliant white core, "
      + PALETTES[pi][1] + ", orbiting planets visible as tiny glowing spheres, scattered sharp stars, "
      + "deep space photograph, astrophotography, ultra detailed, cinematic, no text";
    var seed = (h + pi * 131) % 9999, q = encodeURIComponent(prompt);
    function adopt(u){ c = cache(); c[k] = u + "#p" + pi; save(c);
      if (g.isConnected){ g.style.backgroundImage = "url('" + u + "')"; g.style.filter = "none";
        g.style.boxShadow = "0 0 22px rgba(140,200,255,.4), inset 0 0 14px rgba(2,8,24,.55)"; }
      busy = false; window.dispatchEvent(new Event("resize")); }
    function tryLoad(u, next){ var im = new Image(); im.onload = function(){ adopt(u); }; im.onerror = next; im.src = u; }
    tryLoad("/api/image?prompt=" + q + "&seed=" + seed, function () {
      tryLoad("https://image.pollinations.ai/prompt/" + q + "?width=768&height=768&nologo=true&seed=" + seed, function () {
        tryLoad("https://image.pollinations.ai/prompt/" + q + "?width=768&height=768&nologo=true&seed=" + ((seed+377)%9999),
          function(){ busy = false; });
      });
    });
  }, 2500);
})();

/* ===== v76: Explore cinema — hero, tilt, lightbox, fresh drops ===== */
(function () {                                    /* cinematic hero */
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.hero76) return;
  view.dataset.hero76 = "1";
  var wrap = view.querySelector(".explore-wrap") || view;
  var head = wrap.querySelector(".ex-head"); if (head) head.style.display = "none";
  var FEATS = [
    ["Aurora Cathedral", "aurora borealis over an ice cathedral, god rays, cinematic"],
    ["Sky Whale", "giant luminous whale swimming through clouds at dusk, photoreal fantasy"],
    ["Comet Train", "train of glowing comets over a mountain lake, long exposure"],
    ["Floating Temple", "ancient temple floating above waterfalls, golden hour, epic vista"]
  ];
  var hero = document.createElement("div");
  hero.className = "ex-hero";
  hero.innerHTML = '<div class="ex-hero-bg"></div><div class="ex-hero-in">'
    + '<span class="ex-hero-kick">COMMUNITY PICK</span>'
    + '<span class="ex-hero-cap"></span><h1>Explore</h1>'
    + '<p>Real prompts, real results — made by people who dream in pixels.</p>'
    + '<button type="button" class="ex-hero-btn">✨ Surprise me</button></div>';
  wrap.insertBefore(hero, wrap.firstChild);
  var bg = hero.querySelector(".ex-hero-bg"), cap = hero.querySelector(".ex-hero-cap"), fi = 0;
  function setBg(i) {
    cap.textContent = FEATS[i][0];
    var q = encodeURIComponent(FEATS[i][1] + ", ultra detailed, no text");
    var u = "/api/image?prompt=" + q + "&seed=" + (i * 97 + 11);
    var im = new Image(); im.onload = function () { bg.style.backgroundImage = "url('" + u + "')"; }; im.src = u;
  }
  setBg(0);
  /* hero rotation moved to v82 */
  function goChat(prompt) {
    var t = document.querySelector(".composer input, .composer textarea");
    if (t) { t.value = prompt; t.focus(); }
    var nav = document.querySelector('[data-view="chat"],[data-target="chat"],#nav-chat,.nav [class*="chat" i]');
    if (nav) nav.click(); else try { location.hash = "#chat"; } catch (e) {}
  }
  hero.querySelector(".ex-hero-btn").addEventListener("click", function () {
    goChat(FEATS[Math.floor(Math.random() * FEATS.length)][1]);
  });
})();

(function () {                                    /* fresh premium drops */
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.drop76) return;
  view.dataset.drop76 = "1";
  try {
    var d = JSON.parse(localStorage.getItem("explore-posts") || "null");
    if (d && Array.isArray(d.posts) && !d.posts.some(function (p) { return p.id === "x1"; })) {
      var now = Date.now();
      [["x1", "image", "bioluminescent whale gliding above a midnight city, volumetric fog", "Umi", 341, 31],
       ["x2", "image", "crystal cathedral inside a glowing glacier, god rays, ultra detailed", "Sol", 296, 47],
       ["x3", "video", "paper lanterns rising over terraced rice fields at dawn", "Hana", 263, 63],
       ["x4", "image", "astronaut surfing a ring of golden stardust, cinematic", "Vero", 238, 79]
      ].forEach(function (a, i) {
        d.posts.push({ id: a[0], kind: a[1], prompt: a[2], src: a[2], seed: a[5], by: a[3], likes: a[4], ts: now - i });
      });
      localStorage.setItem("explore-posts", JSON.stringify(d));
      var on = view.querySelector(".ex-f.on"); if (on) on.click();   /* re-render through the app's own path */
    }
  } catch (e) {}
})();

(function () {                                    /* tilt, like pulse, image rescue, lightbox */
  var view = document.getElementById("view-explore");
  var grid = view && view.querySelector(".ex-grid");
  if (!grid || grid.dataset.cine76) return;
  grid.dataset.cine76 = "1";

  grid.addEventListener("pointermove", function (e) {
    var c = e.target.closest(".ex-grid > *"); if (!c) return;
    var r = c.getBoundingClientRect();
    var rx = ((e.clientY - r.top) / r.height - .5) * -6;
    var ry = ((e.clientX - r.left) / r.width - .5) * 8;
    c.style.transform = "perspective(700px) rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg) translateY(-3px)";
  });
  function reset() { grid.querySelectorAll(".ex-grid > *").forEach(function (c) { c.style.transform = ""; }); }
  grid.addEventListener("pointerleave", reset);
  grid.addEventListener("pointerout", function (e) { if (!e.relatedTarget || !grid.contains(e.relatedTarget)) reset(); });

  grid.addEventListener("click", function (e) {    /* like pulse */
    var b = e.target.closest("button");
    if (b && /♡|like/i.test(b.textContent + " " + b.className)) { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); }
  });

  setInterval(function () {                        /* rescue stuck card images */
    grid.querySelectorAll("img").forEach(function (im) {
      return; if (im.complete || im.dataset.r76) return;
      im.dataset.r76 = "1";
      var s = im.getAttribute("src") || "";
      if (s.indexOf("/api/image") === 0) {
        var q = new URLSearchParams(s.split("?")[1] || "");
        s = "https://image.pollinations.ai/prompt/" + encodeURIComponent(q.get("prompt") || "galaxy")
          + "?width=768&height=1024&nologo=true&seed=" + (q.get("seed") || 7);
      }
      im.onerror = function () { im.onerror = null; im.src = s.replace(/seed=\d+/, "seed=" + Math.floor(Math.random() * 9999)); };
      im.src = s;
    });
  }, 2000);

  var lb = document.createElement("div");          /* fullscreen lightbox */
  lb.className = "ex-lb";
  lb.innerHTML = '<div class="ex-lb-card"><button type="button" class="ex-lb-x">✕</button>'
    + '<div class="ex-lb-img"></div><div class="ex-lb-txt"><p></p>'
    + '<button type="button" class="ex-lb-try">✨ Try this prompt</button></div></div>';
  view.appendChild(lb);
  function urlFromCard(card) {
    var im = card.querySelector("img"); if (im && im.src) return im.src;
    var any = card.querySelector('[style*="background-image"]');
    var m = any && /url\(["']?([^"')]+)["']?\)/.exec(any.getAttribute("style"));
    return m ? m[1] : "";
  }
  grid.addEventListener("click", function (e) {
    if (e.target.closest("button")) return;
    var card = e.target.closest(".ex-grid > *"); if (!card) return;
    var u = urlFromCard(card); if (!u) return;
    var txt = card.textContent.replace(/\s+/g, " ").trim();
    lb.querySelector(".ex-lb-img").style.backgroundImage = "url('" + u + "')";
    lb.querySelector("p").textContent = txt;
    lb.classList.add("on");
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("ex-lb-x")) lb.classList.remove("on");
    else if (e.target.classList.contains("ex-lb-try")) {
      goChatSafe(lb.querySelector("p").textContent); lb.classList.remove("on");
    }
  });
  function goChatSafe(p) {
    var t = document.querySelector(".composer input, .composer textarea");
    if (t) { t.value = p; t.focus(); }
    var nav = document.querySelector('[data-view="chat"],[data-target="chat"],#nav-chat,.nav [class*="chat" i]');
    if (nav) nav.click(); else try { location.hash = "#chat"; } catch (e) {}
  }
})();

/* ===== v77: explore finish — shimmer while loading, fade on arrival ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.fin77) return;
  view.dataset.fin77 = "1";
  function wire(im) {
    if (im.dataset.w77) return; im.dataset.w77 = "1";
    im.style.opacity = "0";
    im.addEventListener("load", function () { im.style.transition = "opacity .6s ease"; im.style.opacity = "1"; });
    if (im.complete && im.naturalWidth) im.style.opacity = "1";
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () {
    view.querySelectorAll(".ex-grid img").forEach(wire);
  }, 200); }).observe(view, { childList: true, subtree: true });
  view.querySelectorAll(".ex-grid img").forEach(wire);
})();

/* ===== v78: living community — server feed + share sync ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.live78) return;
  view.dataset.live78 = "1";
  function load(){ try { return JSON.parse(localStorage.getItem("explore-posts") || "null"); } catch(e){ return null; } }
  function save(d){ try { localStorage.setItem("explore-posts", JSON.stringify(d)); } catch(e){} }
  function uid(){ var u = localStorage.getItem("alfred_uid");
    if (!u) { u = "a" + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem("alfred_uid", u); } catch(e){} } return u; }
  function rerender(){ var f = view.querySelector(".ex-f.on"); if (f) f.click(); }

  function merge(list) {                              /* server = source of truth, merge by id */
    var d = load() || { liked: {}, posts: [] }; if (!d.posts) d.posts = [];
    var have = {}; d.posts.forEach(function (p){ have[p.id] = 1; });
    var added = 0;
    (list || []).forEach(function (p) {
      if (!p || !p.id || have[p.id] || !p.prompt) return;
      have[p.id] = 1; p._srv = 1; p.mine = p.authorId === uid();
      d.posts.push(p); added++;
    });
    if (added) { save(d); rerender(); }
  }
  function pull(){ fetch("/api/explore").then(function (r){ return r.json(); })
    .then(function (a){ if (Array.isArray(a)) merge(a); }).catch(function(){}); }

  function drain() {                                  /* pending user shares -> everyone */
    var q = []; try { q = JSON.parse(localStorage.getItem("explore-pending") || "[]"); } catch(e){}
    if (!q.length) return;
    var it = q[0];
    fetch("/api/explore", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: it.prompt, kind: it.kind, seed: it.seed, by: it.by, authorId: uid() })
    }).then(function (r){ if (!r.ok) throw 0; return r.json(); })
      .then(function (saved) {
        q.shift(); try { localStorage.setItem("explore-pending", JSON.stringify(q)); } catch(e){}
        var d = load();
        if (d && saved.id) { d.posts.forEach(function (p){ if (p.id === it.id) p.id = saved.id; }); save(d); }
        setTimeout(drain, 1200);
      }).catch(function(){});                          /* stays queued, retried on next poll/visit */
  }
  setInterval(function () {                           /* catch fresh shares + retry old ones */
    var d = load(); if (!d || !d.posts) return;
    var q = []; try { q = JSON.parse(localStorage.getItem("explore-pending") || "[]"); } catch(e){}
    var qids = {}; q.forEach(function (p){ qids[p.id] = 1; });
    var dirty = false;
    d.posts.forEach(function (p) {
      if (!p._srv && !p._drained && (p.mine || p.by === "You" || p.origin === "user") && !qids[p.id]) {
        p._drained = 1; dirty = true;
        q.push({ id: p.id, prompt: p.prompt, kind: p.kind || "image", seed: p.seed || 7, by: p.by || "Guest" });
      }
    });
    if (dirty) { save(d); try { localStorage.setItem("explore-pending", JSON.stringify(q)); } catch(e){} }
    if (q.length) drain();
  }, 5000);

  var st = document.createElement("style");           /* inspiration badge */
  st.textContent = ".ex-or{position:absolute;top:10px;right:10px;font:600 9.5px/1 system-ui,sans-serif;"
    + "letter-spacing:.08em;color:#9fd8ff;background:rgba(30,90,170,.4);border:1px solid rgba(120,200,255,.35);"
    + "border-radius:999px;padding:4px 8px;z-index:2;backdrop-filter:blur(6px);}";
  document.head.appendChild(st);
  setInterval(function () {
    var d = load(); if (!d || !d.posts) return;
    var eng = d.posts.filter(function (p){ return p.origin === "engine"; });
    if (!eng.length) return;
    view.querySelectorAll(".ex-grid > *").forEach(function (c) {
      if (c.querySelector(".ex-or")) return;
      var t = (c.textContent || "").toLowerCase();
      for (var i = 0; i < eng.length; i++) {
        if (eng[i].prompt && t.indexOf(eng[i].prompt.toLowerCase().slice(0, 28)) > -1) {
          var s = document.createElement("span");
          s.className = "ex-or"; s.textContent = "\u2726 inspiration";
          if (getComputedStyle(c).position === "static") c.style.position = "relative";
          c.appendChild(s); break;
        }
      }
    });
  }, 2500);

  pull();
  setInterval(pull, 30000);
})();

/* ===== v79: Settings — profile, models, accent, prefs, data, health ===== */
(function () {
  var view = document.getElementById("view-settings");
  if (!view || view.dataset.set79) return;
  view.dataset.set79 = "1";

  function cfg(){ try { return JSON.parse(localStorage.getItem("alfred_settings")||"{}"); } catch(e){ return {}; } }
  function setCfg(o){ try { localStorage.setItem("alfred_settings", JSON.stringify(o)); } catch(e){} }
  function toast(m){ var t=document.createElement("div"); t.className="ex-toast"; t.textContent=m;
    document.body.appendChild(t); setTimeout(function(){ t.classList.add("bye"); },2600);
    setTimeout(function(){ t.remove(); },3200); }

  var MODELS = [["gpt6","GPT-6 Astra","OpenAI · flagship"],["claude","Claude Sonnet 4.5","Anthropic · balanced"],
                ["deepseek","DeepSeek v4.1","deep reasoning"]];
  var ACCENTS = [["cyan","Cyan Pulse","#5ad1ff"],["violet","Violet Dream","#b18cff"],
                 ["amber","Amber Warmth","#ffb46b"],["emerald","Emerald Calm","#5fe8b0"]];

  var wrap = document.createElement("div");
  wrap.className = "set-wrap";
  wrap.innerHTML =
    '<div class="set-head"><h1>Settings</h1><p>Tune Alfred to feel like yours.</p></div>'

    + '<div class="set-card"><div class="set-ct">PROFILE</div><div class="set-row">'
    + '<span class="set-av">Λ</span><div class="set-grow"><label>Your name</label>'
    + '<input id="set-name" maxlength="24" placeholder="How should Alfred call you?"></div></div></div>'

    + '<div class="set-card"><div class="set-ct">DEFAULT MODEL</div><div class="set-pills" id="set-models">'
    + MODELS.map(function(m){ return '<button type="button" class="set-pill" data-m="'+m[0]+'"><b>'+m[1]+'</b><i>'+m[2]+'</i></button>'; }).join("")
    + '</div></div>'

    + '<div class="set-card"><div class="set-ct">ACCENT</div><div class="set-swatches">'
    + ACCENTS.map(function(a){ return '<button type="button" class="set-sw" data-a="'+a[0]+'" style="--sw:'+a[2]+'"><span>'+a[1]+'</span></button>'; }).join("")
    + '</div></div>'

    + '<div class="set-card"><div class="set-ct">CHAT</div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Streaming answers</b><i class="set-i">Text appears live as Alfred thinks</i></div>'
    + '<button type="button" class="set-tgl" data-k="stream"></button></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Show thinking by default</b><i class="set-i">Process panel open while answering</i></div>'
    + '<button type="button" class="set-tgl" data-k="think"></button></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Save chat history</b><i class="set-i">Worlds are born from your talks</i></div>'
    + '<button type="button" class="set-tgl" data-k="history"></button></div></div>'

    + '<div class="set-card set-danger"><div class="set-ct">DANGER ZONE</div>'
    + '<button type="button" class="set-btn warn" id="set-clr-hist">Clear chat history</button>'
    + '<button type="button" class="set-btn warn" id="set-clr-ex">Clear Explore cache</button>'
    + '<button type="button" class="set-btn red"  id="set-reset">Reset everything</button></div>'

    + '<div class="set-card"><div class="set-ct">SYSTEM</div>'
    + '<div class="set-health" id="set-health"><span class="hp-dot"></span> checking brain…</div>'
    + '<div class="set-ver">ALFRED AI</div></div>';
  view.appendChild(wrap);

  var c = cfg(), name = view.querySelector("#set-name");
  name.value = localStorage.getItem("alfred_name") || "";

  function paint() {
    wrap.querySelectorAll(".set-pill").forEach(function (p) {
      p.classList.toggle("on", p.dataset.m === (c.model || "gpt6"));
    });
    wrap.querySelectorAll(".set-sw").forEach(function (s) {
      s.classList.toggle("on", s.dataset.a === (c.accent || "cyan"));
    });
    wrap.querySelectorAll(".set-tgl").forEach(function (t) {
      var d = { stream: 1, think: 0, history: 1 }[t.dataset.k];
      t.classList.toggle("on", c[t.dataset.k] !== undefined ? !!c[t.dataset.k] : !!d);
    });
  }
  paint();

  wrap.querySelectorAll(".set-pill").forEach(function (p) {
    p.addEventListener("click", function () { c.model = p.dataset.m; setCfg(c); paint(); toast(p.textContent.trim() + " set as default"); });
  });
  wrap.querySelectorAll(".set-sw").forEach(function (s) {
    s.addEventListener("click", function () {
      c.accent = s.dataset.a; setCfg(c); paint();
      document.documentElement.setAttribute("data-accent", c.accent);
      toast(s.textContent.trim() + " accent on");
    });
  });
  wrap.querySelectorAll(".set-tgl").forEach(function (t) {
    t.addEventListener("click", function () { c[t.dataset.k] = !t.classList.contains("on"); setCfg(c); paint(); });
  });
  if (c.accent) document.documentElement.setAttribute("data-accent", c.accent);

  name.addEventListener("change", function () {
    var v = name.value.trim();
    try { v ? localStorage.setItem("alfred_name", v) : localStorage.removeItem("alfred_name"); } catch(e){}
    toast("Saved — refresh to hear Alfred greet you");
  });

  function confirmDo(msg, fn) {                     /* styled confirm modal */
    var m = document.createElement("div"); m.className = "set-modal";
    m.innerHTML = '<div class="set-mc"><p>' + msg + '</p>'
      + '<div><button type="button" class="set-btn red" id="sm-y">Yes, do it</button>'
      + '<button type="button" class="set-btn" id="sm-n">Cancel</button></div></div>';
    document.body.appendChild(m);
    requestAnimationFrame(function(){ m.classList.add("on"); });
    m.querySelector("#sm-n").onclick = function(){ m.remove(); };
    m.querySelector("#sm-y").onclick = function(){ m.remove(); fn(); };
    m.addEventListener("click", function(e){ if (e.target === m) m.remove(); });
  }
  view.querySelector("#set-clr-hist").onclick = function(){ confirmDo("Delete all chat worlds? This can't be undone.", function(){
    ["alfred_history","alfred_tombs"].forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
    toast("Chat history cleared — the universe is empty"); }); };
  view.querySelector("#set-clr-ex").onclick = function(){ confirmDo("Clear your Explore cache and shares?", function(){
    ["explore-posts","explore-pending","alfred-del-backup"].forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
    toast("Explore cleared"); }); };
  view.querySelector("#set-reset").onclick = function(){ confirmDo("Wipe EVERYTHING — name, history, worlds, likes?", function(){
    var keep = {}; try { keep.scene = localStorage.getItem("alfred_scene"); } catch(e){}
    localStorage.clear();
    try { if (keep.scene) localStorage.setItem("alfred_scene", keep.scene); } catch(e){}
    toast("Fresh start — reloading"); setTimeout(function(){ location.reload(); }, 900); }); };

  var hp = view.querySelector("#set-health");       /* live brain status */
  fetch("/api/health").then(function(r){ return r.json(); }).then(function(j){
    hp.innerHTML = '<span class="hp-dot ok"></span> Alfred is online — all engines humming ✓';
  }).catch(function(){ hp.innerHTML = '<span class="hp-dot bad"></span> Alfred is waking up — try again in a moment'; });
})();

/* ===== v80: explore freshness — dedupe by prompt, retire seeds when feed is alive ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.fresh80) return;
  view.dataset.fresh80 = "1";
  function load(){ try { return JSON.parse(localStorage.getItem("explore-posts") || "null"); } catch(e){ return null; } }
  function save(d){ try { localStorage.setItem("explore-posts", JSON.stringify(d)); } catch(e){} }
  function run() {
    var d = load(); if (!d || !d.posts) return;
    var seen = {}, out = [], dirty = false;
    d.posts.forEach(function (p) {                       /* same work twice? keep one */
      var k = (p.prompt || "").toLowerCase().slice(0, 60);
      if (!k || seen[k]) { dirty = true; return; }
      seen[k] = 1; out.push(p);
    });
    var live = d.posts.filter(function (p) { return p._srv || p.origin; }).length;
    if (live >= 8) out = out.filter(function (p) {       /* old sample posts retire */
      if (/^s\d+$|^x\d+$/.test(p.id)) { dirty = true; return false; }
      return true;
    });
    if (out.length !== d.posts.length) dirty = true;
    if (dirty) { d.posts = out; save(d); var f = view.querySelector(".ex-f.on"); if (f) f.click(); }
  }
  setInterval(run, 9000); run();
})();

/* ===== v80: settings rebuild — no model section, full sections ===== */
(function () {
  var view = document.getElementById("view-settings");
  if (!view || view.dataset.set80) return;
  view.dataset.set80 = "1";
  Array.prototype.slice.call(view.childNodes).forEach(function (n) { try { n.remove(); } catch (e) {} });

  var SUPPORT = { email: "hello@alfredai.app", community: "" };   /* ← put your real links here */

  function cfg(){ try { return JSON.parse(localStorage.getItem("alfred_settings")||"{}"); } catch(e){ return {}; } }
  function setCfg(o){ try { localStorage.setItem("alfred_settings", JSON.stringify(o)); } catch(e){} }
  function toast(m){ var t=document.createElement("div"); t.className="ex-toast"; t.textContent=m;
    document.body.appendChild(t); setTimeout(function(){ t.classList.add("bye"); },2600); setTimeout(function(){ t.remove(); },3200); }

  var ACCENTS = [["cyan","Cyan","#5ad1ff"],["violet","Violet","#b18cff"],["amber","Amber","#ffb46b"],["emerald","Emerald","#5fe8b0"]];
  var FAQ = [
    ["What is ALFRED?", "Alfred is your AI companion — he answers, creates images, and turns every conversation into a living world in your history universe."],
    ["Where are my chats stored?", "On this device only. Your history never leaves your phone unless you share a prompt to Explore yourself."],
    ["How do worlds form?", "Every chat you start becomes a unique galaxy in History — its own star, palette and planets."],
    ["How do I share to Explore?", "Tap the share icon in any chat — your creation joins the community wall for everyone."],
    ["Is Alfred free?", "The core experience is free. Creative power-ups arrive with the upcoming plans."],
    ["Why do images take a moment?", "Each one is generated fresh, then cached — the second time you see it, it's instant."]
  ];
  var TOGGLES = [["stream","Streaming answers","Text appears live as Alfred thinks",1],
                 ["think","Show thinking by default","Process panel open while answering",0],
                 ["history","Save chat history","Worlds are born from your talks",1],
                 ["sounds","Interface sounds","Soft ticks and confirms",1],
                 ["motion","Cinematic motion","Parallax, zooms and drifts",1],
                 ["autoplay","Autoplay Explore previews","Videos start on view",1]];

  var wrap = document.createElement("div");
  wrap.className = "set-wrap";
  wrap.innerHTML =
    '<div class="set-head"><h1>Settings</h1><p>Tune Alfred to feel like yours.</p></div>'

    + '<div class="set-card"><div class="set-ct">PROFILE</div>'
    + '<div class="set-row"><span class="set-av" id="s80-av">Λ</span>'
    + '<div class="set-grow"><label>Your name</label><input id="s80-name" maxlength="24" placeholder="How should Alfred call you?"></div></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Member since</b><i class="set-i" id="s80-since">—</i></div></div></div>'


    + '<div class="set-card"><div class="set-ct">FAQ</div><div class="faq-list">'
    + FAQ.map(function(f,i){ return '<div class="faq-i"><button type="button" class="faq-q">'+f[0]+'<span>+</span></button><div class="faq-a">'+f[1]+'</div></div>'; }).join("")
    + '</div></div>'

    + '<div class="set-card"><div class="set-ct">CONTACT & SUPPORT</div>'
    + '<button type="button" class="set-row set-link" id="s80-mail">✉️ <span class="set-grow"><b class="set-b">Email support</b><i class="set-i">'+SUPPORT.email+'</i></span></button>'
    + '<button type="button" class="set-row set-link" id="s80-bug">🐞 <span class="set-grow"><b class="set-b">Report a problem</b><i class="set-i">Send logs & description by email</i></span></button>'
    + '<button type="button" class="set-row set-link" id="s80-com">💬 <span class="set-grow"><b class="set-b">Community</b><i class="set-i">Chat with other creators</i></span></button>'
    + '<button type="button" class="set-row set-link" id="s80-priv">🛡️ <span class="set-grow"><b class="set-b">Privacy & terms</b><i class="set-i">The short, honest version</i></span></button></div>'

    + '<div class="set-card"><div class="set-ct">ABOUT</div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Version</b><i class="set-i">ALFRED AI · V1</i></div></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Your companion</b><i class="set-i">Chat, images, code, research, planning \u2014 every ability in one companion.</i></div></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">What\u2019s new</b><i class="set-i">Smarter modules \u00b7 cinematic chat \u00b7 living Explore feed</i></div></div>'
    + '<div class="set-row"><div class="set-grow"><b class="set-b">Storage used</b><i class="set-i" id="s80-stor">…</i>'
    + '<span class="stor-bar"><span id="s80-bar"></span></span></div></div>'
    + '<div class="set-health" id="s80-health"><span class="hp-dot"></span> checking brain…</div>'
    + '<button type="button" class="set-btn" id="s80-share" style="margin-top:10px">📲 Share ALFRED</button></div>'

    + '<div class="set-card set-danger"><div class="set-ct">DANGER ZONE</div>'
    + '<button type="button" class="set-btn warn" id="s80-clr-h">Clear chat history</button>'
    + '<button type="button" class="set-btn warn" id="s80-clr-e">Clear Explore cache</button>'
    + '<button type="button" class="set-btn red" id="s80-reset">Reset everything</button></div>';
  view.appendChild(wrap);

  var c = cfg();
  var name = wrap.querySelector("#s80-name");
  name.value = localStorage.getItem("alfred_name") || "";
  wrap.querySelector("#s80-av").textContent = (name.value || "F").charAt(0).toUpperCase();
  name.addEventListener("input", function(){ wrap.querySelector("#s80-av").textContent = (name.value || "F").charAt(0).toUpperCase(); });
  name.addEventListener("change", function(){
    var v = name.value.trim();
    try { v ? localStorage.setItem("alfred_name", v) : localStorage.removeItem("alfred_name"); } catch(e){}
    toast("Saved — refresh to hear Alfred greet you");
  });
  var since = localStorage.getItem("alfred_joined");
  if (!since) { since = new Date().toISOString(); try { localStorage.setItem("alfred_joined", since); } catch(e){} }
  wrap.querySelector("#s80-since").textContent = new Date(since).toLocaleDateString([], { year:"numeric", month:"long" });

  function paint() {
    wrap.querySelectorAll(".set-sw").forEach(function (s){ s.classList.toggle("on", s.dataset.a === (c.accent || "cyan")); });
    wrap.querySelectorAll(".set-tgl").forEach(function (t){
      var def = { stream:1, think:0, history:1, sounds:1, motion:1, autoplay:1 }[t.dataset.k];
      var on = c[t.dataset.k] !== undefined ? !!c[t.dataset.k] : !!def;
      t.classList.toggle("on", on);
      if (t.dataset.k === "motion") document.documentElement.classList.toggle("rm", !on);
    });
  }
  paint();
  document.documentElement.removeAttribute("data-accent");   /* accent retired - default theme */
  delete c.accent; setCfg(c);
  wrap.querySelectorAll(".set-sw").forEach(function (s){
    s.addEventListener("click", function(){ c.accent = s.dataset.a; setCfg(c); paint();
      document.documentElement.setAttribute("data-accent", c.accent); toast("Accent on"); });
  });
  wrap.querySelectorAll(".set-tgl").forEach(function (t){
    t.addEventListener("click", function(){ c[t.dataset.k] = !t.classList.contains("on"); setCfg(c); paint(); });
  });
  wrap.querySelectorAll(".faq-q").forEach(function (q){
    q.addEventListener("click", function(){
      var i = q.parentElement, open = i.classList.contains("open");
      wrap.querySelectorAll(".faq-i.open").forEach(function (o){ o.classList.remove("open"); });
      if (!open) i.classList.add("open");
    });
  });
  wrap.querySelector("#s80-mail").onclick = function(){ location.href = "mailto:" + SUPPORT.email + "?subject=ALFRED%20support"; };
  wrap.querySelector("#s80-bug").onclick  = function(){ location.href = "mailto:" + SUPPORT.email + "?subject=ALFRED%20bug%20report&body=What%20happened%3A%0A"; };
  wrap.querySelector("#s80-com").onclick  = function(){ toast(SUPPORT.community ? "Opening community…" : "Add your invite link in SUPPORT.community"); };
  wrap.querySelector("#s80-priv").onclick = function(){
    var m = document.createElement("div"); m.className = "set-modal";
    m.innerHTML = '<div class="set-mc"><p><b>Privacy, short & honest:</b><br>Chats, likes and worlds stay on this device. ' +
'Clearing data in Danger Zone removes them for real. Shared Explore posts are public by design. No tracking, no accounts yet.</p>' +
'<button type="button" class="set-btn" id="s80-pok">Got it</button></div>';
    document.body.appendChild(m); requestAnimationFrame(function(){ m.classList.add("on"); });
    m.querySelector("#s80-pok").onclick = function(){ m.remove(); };
    m.addEventListener("click", function(e){ if (e.target === m) m.remove(); });
  };
  try {                                   /* storage meter */
    var tot = 0;
    for (var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); tot += (localStorage.getItem(k) || "").length; }
    var pct = Math.min(100, Math.round(tot / 52428));   /* of ~5MB */
    wrap.querySelector("#s80-stor").textContent = (tot / 1024).toFixed(1) + " KB of ~5 MB";
    wrap.querySelector("#s80-bar").style.width = pct + "%";
  } catch (e) {}
  wrap.querySelector("#s80-share").onclick = function(){
    if (navigator.share) navigator.share({ title: "ALFRED AI", text: "Meet Alfred — an AI that turns chats into worlds", url: location.origin }).catch(function(){});
    else { try { navigator.clipboard.writeText(location.origin); toast("Link copied"); } catch(e){} }
  };
  function confirmDo(msg, fn){
    var m = document.createElement("div"); m.className = "set-modal";
    m.innerHTML = '<div class="set-mc"><p>'+msg+'</p><div>'
      + '<button type="button" class="set-btn red" id="sm-y">Yes, do it</button>'
      + '<button type="button" class="set-btn" id="sm-n">Cancel</button></div></div>';
    document.body.appendChild(m); requestAnimationFrame(function(){ m.classList.add("on"); });
    m.querySelector("#sm-n").onclick = function(){ m.remove(); };
    m.querySelector("#sm-y").onclick = function(){ m.remove(); fn(); };
    m.addEventListener("click", function(e){ if (e.target === m) m.remove(); });
  }
  wrap.querySelector("#s80-clr-h").onclick = function(){ confirmDo("Delete all chat worlds? This can't be undone.", function(){
    ["alfred_history","alfred_tombs"].forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
    toast("Universe emptied"); }); };
  wrap.querySelector("#s80-clr-e").onclick = function(){ confirmDo("Clear your Explore cache and shares?", function(){
    ["explore-posts","explore-pending","alfred-del-backup"].forEach(function(k){ try{localStorage.removeItem(k);}catch(e){} });
    toast("Explore cleared"); }); };
  wrap.querySelector("#s80-reset").onclick = function(){ confirmDo("Wipe EVERYTHING — name, history, worlds, likes?", function(){
    var sc = null; try { sc = localStorage.getItem("alfred_scene"); } catch(e){}
    localStorage.clear();
    try { if (sc) localStorage.setItem("alfred_scene", sc); } catch(e){}
    toast("Fresh start"); setTimeout(function(){ location.reload(); }, 900); }); };

  fetch("/api/health").then(function(r){ return r.json(); }).then(function(j){
    wrap.querySelector("#s80-health").innerHTML = '<span class="hp-dot ok"></span> Alfred is online — all engines humming ✓';
  }).catch(function(){
    wrap.querySelector("#s80-health").innerHTML = '<span class="hp-dot bad"></span> Alfred is waking up — try again in a moment';
  });
})();

/* ===== v81: explore expiry — works retire after 30 days ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.exp81) return;
  view.dataset.exp81 = "1";
  var MONTH = 30 * 24 * 3600 * 1000;
  function load(){ try { return JSON.parse(localStorage.getItem("explore-posts") || "null"); } catch(e){ return null; } }
  function save(d){ try { localStorage.setItem("explore-posts", JSON.stringify(d)); } catch(e){} }
  function run() {
    var d = load(); if (!d || !d.posts) return;
    var now = Date.now();
    var keep = d.posts.filter(function (p){ return !p.ts || (now - p.ts) < MONTH; });
    if (keep.length !== d.posts.length) {
      d.posts = keep; save(d);
      var f = view.querySelector(".ex-f.on"); if (f) f.click();
    }
  }
  run(); setInterval(run, 60000);
})();

/* ===== v82: explore reborn — honest hero, warmed feed, own sky ===== */
(function () {
  var view = document.getElementById("view-explore");
  if (!view || view.dataset.reb82) return;
  view.dataset.reb82 = "1";

  /* HERO: 6 distinct scenes; caption moves only when the image truly lands */
  var FEATS = [
    ["Aurora Cathedral", "aurora borealis over an ice cathedral, god rays, cinematic"],
    ["Sky Whale", "giant luminous whale swimming through clouds at dusk, photoreal fantasy"],
    ["Comet Train", "train of glowing comets over a mountain lake, long exposure"],
    ["Floating Temple", "ancient temple floating above waterfalls, golden hour, epic vista"],
    ["Storm Sailor", "lone sailboat on a glowing bioluminescent ocean under storm clouds"],
    ["Crystal Fox", "arctic fox made of stained glass walking through snowy forest, backlight"]
  ];
  var hero = view.querySelector(".ex-hero"), bg = hero && hero.querySelector(".ex-hero-bg"),
      cap = hero && hero.querySelector(".ex-hero-cap");
  function heroUrl(i, w, h) {
    return "/api/image?prompt=" + encodeURIComponent(FEATS[i][1] + ", ultra detailed, no text")
      + "&width=" + w + "&height=" + h + "&seed=" + (i * 97 + 11);
  }
  var hi = 0, hbusy = false;
  function showHero(i) {
    if (!bg || hbusy) return;
    hbusy = true;
    var im = new Image();
    im.onload = function () {
      bg.style.backgroundImage = "url('" + heroUrl(i, 1200, 700) + "')";
      bg.style.backgroundSize = "cover";
      cap.textContent = FEATS[i][0];
      hbusy = false;
    };
    im.onerror = function () { hbusy = false; };       /* caption stays honest */
    im.src = heroUrl(i, 1200, 700);
  }
  showHero(0);
  setInterval(function () { hi = (hi + 1) % FEATS.length; showHero(hi); }, 9000);

  /* WARM: ask the server to pre-generate every feed image + hero scenes */
  function marked(){ try { return JSON.parse(localStorage.getItem("alfred_warm")||"{}"); } catch(e){ return {}; } }
  function mark(k,o){ o[k]=1; try { localStorage.setItem("alfred_warm", JSON.stringify(o)); } catch(e){} }
  function warm(prompt, seed) {
    var k = prompt + "|" + seed, o = marked();
    if (o[k]) return; mark(k, o);
    fetch("/api/warm?prompt=" + encodeURIComponent(prompt) + "&seed=" + seed).catch(function(){});
  }
  var swept = 0;
  setInterval(function () {
    var d = null; try { d = JSON.parse(localStorage.getItem("explore-posts")||"null"); } catch(e){}
    if (d && d.posts) d.posts.slice(0, 14).forEach(function (p){ if (swept < 3) { warm(p.prompt, p.seed || 7); swept++; } });
  }, 4000);
  FEATS.forEach(function (f, i) { warm(f[1] + ", ultra detailed, no text", i * 97 + 11); });
})();

/* ===== v83: scroll guardian — covers can't swallow touch scroll ===== */
(function () {
  document.addEventListener("touchmove", function (e) {
    if (e.defaultPrevented) return;
    var n = e.target, hop = 0;
    while (n && n !== document && hop++ < 6) {
      var cs = n && n.nodeType === 1 ? getComputedStyle(n) : null;
      if (cs && cs.position === "fixed" && cs.pointerEvents !== "none" && cs.opacity === "0") {
        n.style.pointerEvents = "none"; return;          /* invisible cover: mute it on the spot */
      }
      n = n.parentElement;
    }
  }, { passive: true });
})();

/* ===== v84: scroll fixer — measured pane height, all screens ===== */
(function () {
  if (window.__scrollFix) return; window.__scrollFix = "1";
  var VIEWS = ["view-explore", "view-settings", "view-modules", "view-pay", "view-history"];
  var last = {};

  function visible(el) { return !!(el && el.offsetParent !== null || (el && getComputedStyle(el).position === "fixed")); }

  function fit(id) {
    var v = document.getElementById(id);
    if (!v || !visible(v)) return;
    var r = v.getBoundingClientRect();
    if (r.height < 40) return;
    var lim = window.innerHeight - 8;
    var p = v.parentElement;                       /* nearest clipping ancestor sets the real bottom */
    while (p && p !== document.body) {
      var cs = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(cs.overflowY)) {
        var pb = p.getBoundingClientRect().bottom;
        if (pb < lim) lim = pb;
        break;
      }
      p = p.parentElement;
    }
    var h = Math.round(Math.max(220, Math.min(lim - r.top, window.innerHeight - 40)));
    if (last[id] === h) return;                    /* nothing changed → never touch a scrolling view */
    last[id] = h;
    v.style.height = h + "px";
    v.style.overflowY = "auto";
    v.style.overscrollBehavior = "contain";
    v.style.touchAction = "pan-y";
    v.style.webkitOverflowScrolling = "touch";
  }
  function fitAll() { VIEWS.forEach(fit); }

  window.addEventListener("resize", function () { last = {}; fitAll(); });
  window.addEventListener("orientationchange", function () { last = {}; setTimeout(fitAll, 350); });
  new ResizeObserver(function () { fitAll(); }).observe(document.body);
  var mo = new MutationObserver(function () { fitAll(); });
  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  [200, 800, 2000, 4000].forEach(function (ms) { setTimeout(fitAll, ms); });
  setInterval(fitAll, 1500);                       /* cheap: exits unless height actually changed */
  fitAll();
})();

/* ===== v87: Plans — pricing view, waitlist, preview unlock ===== */
(function () {
  var setView = document.getElementById("view-settings");
  if (!setView || setView.dataset.pay87) return;
  setView.dataset.pay87 = "1";

  var PLANS = [
    { id:"free",  name:"Free",  mo:0,  yr:0,   tag:"Meet Alfred",
      feats:["Chat with Alfred — 60 messages a day","3 image creations a day","3 standard minds behind him","Core modules to start with"], cta:"Current plan" },
    { id:"pro",   name:"Pro",   mo:12, yr:120, tag:"Alfred at full speed", pop:1,
      feats:["Unlimited chats with Alfred","150 image creations a day","6 latest-generation minds behind him","Every module unlocked · priority lanes","Zero ads — pure Alfred"], cta:"Go Pro" },
    { id:"ultra", name:"Ultra", mo:30, yr:300, tag:"Alfred, unbound",
      feats:["Everything in Pro, multiplied","500 image creations a day","4 apex minds + the Deep-think Council","One question — every mind answers together","First to every new ability · Founder badge"], cta:"Go Ultra" }
  ];
  function toast(m){ var t=document.createElement("div"); t.className="ex-toast"; t.textContent=m;
    document.body.appendChild(t); setTimeout(function(){ t.classList.add("bye"); },2600); setTimeout(function(){ t.remove(); },3200); }
  function getPlan(){ try { return JSON.parse(localStorage.getItem("alfred_plan")||'{"id":"free"}'); } catch(e){ return {id:"free"}; } }
  function setPlan(p){ try { localStorage.setItem("alfred_plan", JSON.stringify(p)); } catch(e){} }

  var pay = document.createElement("section");
  pay.id = "view-pay";
  pay.innerHTML =
    '<div class="pay-wrap">'
    + '<div class="pay-hero"><span class="pay-kick">CHOOSE YOUR ALFRED</span>'
    + '<h1>One Alfred.<br>Every mind behind him.</h1>'
    + '<p>You talk to Alfred. Behind him, the strongest AI minds work as one team \u2014 you choose how many join him.</p>'
    + '<div class="pay-toggle"><button type="button" class="on" data-b="mo">Monthly</button>'
    + '<button type="button" data-b="yr">Yearly <i>2 months free</i></button></div></div>'
    + '<div class="pay-cards">' + PLANS.map(function(p){
        return '<div class="pay-card' + (p.pop ? ' pop' : '') + '" data-p="' + p.id + '">'
          + (p.pop ? '<span class="pay-rib">MOST POPULAR</span>' : '')
          + '<h3>' + p.name + '</h3><i class="pay-tag">' + p.tag + '</i>'
          + '<div class="pay-price"><b class="pv" data-mo="' + p.mo + '" data-yr="' + p.yr + '">$' + (p.mo || 0) + '</b>'
          + '<span class="pu">/month</span></div>'
          + '<ul class="pay-feats">' + p.feats.map(function(f){ return '<li>\u2713 ' + f + '</li>'; }).join("") + '</ul>'
          + '<button type="button" class="pay-cta" data-p="' + p.id + '">' + p.cta + '</button></div>';
      }).join("") + '</div>'
    + '<div class="pay-trust">\u2713 Cancel anytime \u00b7 \u2713 Secure checkout at launch \u00b7 \u2713 Prices in USD</div>'
    + '</div>';
  setView.parentElement.insertBefore(pay, setView);
  pay.style.display = "none";

  /* billing toggle */
  var yr = false;
  pay.querySelectorAll(".pay-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      yr = b.dataset.b === "yr";
      pay.querySelectorAll(".pay-toggle button").forEach(function (x){ x.classList.toggle("on", x === b); });
      pay.querySelectorAll(".pv").forEach(function (v){ v.textContent = "$" + (yr ? +v.dataset.yr : +v.dataset.mo); });
      pay.querySelectorAll(".pu").forEach(function (u){ u.textContent = yr ? "/year" : "/month"; });
    });
  });

  /* sidebar: Plans row (cloned from Settings row) + Free Plan badge opens it */
  var setRow = null;
  document.querySelectorAll("*").forEach(function (el) {
    if (!setRow && el.children.length === 0 && el.textContent.trim() === "Settings") {
      var r = el.closest("button,[role=button],a,div");
      if (r && r.parentElement) setRow = r;
    }
  });
  var plansRow = null;
  if (setRow) {
    plansRow = setRow.cloneNode(true);
    plansRow.querySelectorAll("*").forEach(function (n) {
      if (n.children.length === 0 && n.textContent.trim() === "Settings") n.textContent = "Plans";
    });
    var sv = plansRow.querySelector("svg");
    if (sv) { var ic = document.createElement("span"); ic.className = "pay-nav-ic"; ic.textContent = "\u25c8";
      ic.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:17px;color:#9fd2ff;";
      sv.replaceWith(ic); }
    setRow.parentElement.insertBefore(plansRow, setRow);
  }
  var payHidden = [];                            /* v92: every view we cover */
  function openPlans() {
    payMode = true;
    payHidden = [];
    [].slice.call(setView.parentElement.children).forEach(function (el) {
      if (el === pay || el === setView || el.nodeType !== 1) return;
      var cs = getComputedStyle(el);
      if (cs.display !== "none" && cs.visibility !== "hidden") {
        payHidden.push({ el: el, d: el.style.display });
        el.style.display = "none";
      }
    });
    setView.style.display = "none";
    pay.style.display = "";
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  window.__openPlans = openPlans;
  if (plansRow) plansRow.addEventListener("click", function (e) { e.stopPropagation(); openPlans(); });
  var freeBadge = null;
  document.querySelectorAll("*").forEach(function (el) {
    if (!freeBadge && el.children.length === 0 && el.textContent.trim() === "Free Plan") freeBadge = el.closest("div,button,a") || el;
  });
  if (freeBadge) { freeBadge.style.cursor = "pointer";
    freeBadge.addEventListener("click", function (e) { e.stopPropagation(); openPlans(); }); }

  /* view swap: settings shows, we trade places; any other nav exits plans mode */
  var payMode = false;
  if (setRow && setRow.parentElement) {
    setRow.parentElement.addEventListener("click", function (e) {
      if (plansRow && (e.target === plansRow || plansRow.contains(e.target))) return;
      if (payMode) {
        payMode = false; pay.style.display = "none";
        payHidden.forEach(function (h) { try { h.el.style.display = h.d; } catch (e) {} });
        setView.style.display = "";
      }
    }, true);
  }
  setInterval(function () {
    if (!payMode) return;
    if (getComputedStyle(setView).display !== "none") { setView.style.display = "none"; pay.style.display = ""; }
    payHidden.forEach(function (h) { try { if (getComputedStyle(h.el).display !== "none") h.el.style.display = "none"; } catch (e) {} });
  }, 250);

  /* modal: waitlist + preview */
  function modal(pid, name) {
    var m = document.createElement("div"); m.className = "pay-modal";
    m.innerHTML = '<div class="pay-mc"><button type="button" class="pay-mx">\u2715</button>'
      + '<h3>' + name + ' is almost here</h3>'
      + '<p>Checkout goes live at launch. Leave your email and Alfred will reserve your spot \u2014 or preview it today.</p>'
      + '<input id="pay-em" type="email" placeholder="you@star.mail">'
      + '<div class="pay-mrow"><button type="button" class="pay-btn pri" id="pay-notify">\u2728 Notify me</button>'
      + '<button type="button" class="pay-btn" id="pay-prev">Preview ' + name + ' today</button></div></div>';
    document.body.appendChild(m);
    requestAnimationFrame(function(){ m.classList.add("on"); });
    var x = m.querySelector(".pay-mx");
    function close(){ m.remove(); }
    x.onclick = close;
    m.addEventListener("click", function (e) { if (e.target === m) close(); });
    m.querySelector("#pay-notify").onclick = function () {
      var em = (m.querySelector("#pay-em").value || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast("Drop a real email so Alfred can find you"); return; }
      try { var w = JSON.parse(localStorage.getItem("alfred_waitlist") || "[]");
        if (!w.some(function (x2){ return x2.em === em; })) w.push({ em: em, plan: pid, at: Date.now() });
        localStorage.setItem("alfred_waitlist", JSON.stringify(w)); } catch (e) {}
      close(); toast("You\u2019re on the list \u2728 Alfred will ping you at launch");
    };
    m.querySelector("#pay-prev").onclick = function () {
      setPlan({ id: pid, preview: 1, at: Date.now() });
      paint(); close();
      toast(name + " preview on \u2014 visual only until launch");
    };
  }
  function paint() {
    var cur = getPlan();
    var badgeEl = freeBadge && freeBadge.querySelector("*") === null ? freeBadge : null;
    document.querySelectorAll("*").forEach(function (el) {
      if (el.children.length === 0 && /^(Free Plan|Pro \u00b7 Preview|Ultra \u00b7 Preview)$/.test(el.textContent.trim())
          && freeBadge && (freeBadge === el || freeBadge.contains(el))) {
        el.textContent = cur.id === "free" ? "Free Plan" : (cur.id === "pro" ? "Pro \u00b7 Preview" : "Ultra \u00b7 Preview");
      }
    });
    pay.querySelectorAll(".pay-card").forEach(function (c) {
      var mine = c.dataset.p === cur.id;
      c.classList.toggle("mine", mine);
      var b = c.querySelector(".pay-cta");
      if (mine) b.textContent = cur.id === "free" ? "Current plan" : "Your plan \u00b7 preview";
      else b.textContent = c.dataset.p === "free" ? "Back to Free" : PLANS.filter(function(p){return p.id===c.dataset.p;})[0].cta;
    });
  }
  pay.querySelectorAll(".pay-cta").forEach(function (b) {
    b.addEventListener("click", function () {
      var pid = b.dataset.p;
      if (pid === "free") { setPlan({ id: "free" }); paint(); toast("Back on Free \u2014 your worlds stay"); return; }
      var name = PLANS.filter(function(p){ return p.id === pid; })[0].name;
      modal(pid, name);
    });
  });
  paint();
})();

/* ===== v88: world flow — scroll down through your galaxies ===== */
(function () {
  var view = document.getElementById("view-history");
  var stage = document.querySelector(".const-stage");
  var nodes = document.getElementById("const-nodes");
  if (!view || !stage || !nodes || stage.dataset.flow88) return;
  stage.dataset.flow88 = "1";
  view.classList.add("flow88");

  /* the one scene becomes a fixed cosmos behind the whole journey */
  var cos = document.createElement("div");
  cos.className = "cosmos-fixed"; cos.setAttribute("aria-hidden", "true");
  view.insertBefore(cos, view.firstChild);
  setInterval(function () {
    var u = stage.dataset.sceneUrl;
    if (u && cos.dataset.u !== u) { cos.dataset.u = u; cos.style.backgroundImage = "url('" + u + "')"; }
  }, 800);

  /* kill the old galaxy thumbnail rail */
  function killStrip() {
    var vr = view.getBoundingClientRect();
    [].slice.call(view.querySelectorAll("*")).forEach(function (el) {
      if (el.dataset.k88 || el.closest(".const-node")) return;
      var kids = [].slice.call(el.children);
      if (kids.length < 3 || kids.length > 12) return;
      var r = el.getBoundingClientRect(); if (!r.height || r.height > 90) return;
      var circ = kids.filter(function (k) {
        var kr = k.getBoundingClientRect();
        if (!kr.width || kr.width > 80 || kr.width < 26) return false;
        var br = getComputedStyle(k).borderRadius;
        return br.indexOf("50%") > -1 || br === "999px" || br === "9999px";
      });
      if (circ.length >= 3 && r.top < vr.top + vr.height * 0.3) {
        el.style.setProperty("display", "none", "important"); el.dataset.k88 = "1";
      }
    });
  }

  /* meandering galaxy trail: one world per stop, scroll to choose */
  var XS = [50, 31, 69, 38, 62, 27, 73, 34, 58, 43, 66, 29];
  function flow() {
    killStrip();
    var ns = [].slice.call(nodes.querySelectorAll(".const-node"));
    var n = ns.length; if (!n) return;
    var wide = window.innerWidth >= 900;
    var gap = wide ? 210 : 170, top0 = wide ? 150 : 130;
    var H = top0 + n * gap + 240;
    if (stage.style.height !== H + "px") { stage.style.height = H + "px"; nodes.style.height = H + "px"; }
    ns.forEach(function (el, i) {
      var t = el.textContent || "", h = 0;
      for (var c = 0; c < t.length; c++) h = ((h << 5) + h + t.charCodeAt(c)) | 0;
      h = Math.abs(h);
      var xs = Math.max(18, Math.min(82, XS[i % XS.length] + (h % 9) - 4)) + "%";
      var ys = (top0 + i * gap) + "px";
      if (el.style.left !== xs) el.style.left = xs;
      if (el.style.top !== ys) el.style.top = ys;
    });
  }
  var tm = 0;
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(flow, 250); })
    .observe(nodes, { childList: true, subtree: true });
  window.addEventListener("resize", function () { setTimeout(flow, 200); });
  setInterval(flow, 1200);
  setTimeout(flow, 400);
})();

/* ===== v89: clean Plans nav + scrollable chat boxes ===== */
(function () {                                    /* rebuild the Plans row the right way */
  var setRow = null;
  [].slice.call(document.querySelectorAll("body *")).forEach(function (el) {
    if (!setRow && el.children.length === 0 && el.textContent.trim() === "Settings") {
      var r = el.closest("button,[role=button],a,div"); if (r && r.parentElement) setRow = r;
    }
  });
  if (!setRow) return;
  [].slice.call(document.querySelectorAll("body *")).forEach(function (el) {   /* remove the broken clone */
    if (el.children.length === 0 && el.textContent.trim() === "Plans") {
      var r = el.closest("button,[role=button],a,div");
      if (r && r !== setRow && !setRow.contains(r)) r.remove();
    }
  });
  var row = setRow.cloneNode(true);
  row.querySelectorAll("*").forEach(function (n) {
    if (n.children.length === 0 && n.textContent.trim() === "Settings") n.textContent = "Plans";
  });
  setRow.parentElement.insertBefore(row, setRow);
  row.addEventListener("click", function (e) {
    e.stopPropagation(); if (window.__openPlans) window.__openPlans();
  });
})();

(function () {                                    /* history = scrollable chat boxes */
  var view = document.getElementById("view-history");
  var nodes = document.getElementById("const-nodes");
  if (!view || !nodes || view.dataset.list89) return;
  view.dataset.list89 = "1";
  view.classList.add("list89");
  var list = document.createElement("div");
  list.className = "gal-list";
  view.appendChild(list);

  function bgOf(n) {
    var g = n.querySelector(".cn-world"); if (!g) return "";
    var m = /url\(['"]?([^'"]+)['"]?\)/.exec(g.style.backgroundImage || "");
    return m ? m[1] : "";
  }
  function build() {
    var ns = [].slice.call(nodes.querySelectorAll(".const-node"));
    var sig = ns.map(function (n) {
      var b = n.querySelector(".cn-lbl b"), i = n.querySelector(".cn-lbl i");
      return ((b && b.textContent) || "") + "|" + ((i && i.textContent) || "") + "|" + bgOf(n)
        + "|" + (n.classList.contains("sel") ? 1 : 0);
    }).join("\u00a7");
    if (list.dataset.sig === sig) return;
    list.dataset.sig = sig;
    list.innerHTML = "";
    ns.forEach(function (n) {
      var b = n.querySelector(".cn-lbl b"), i = n.querySelector(".cn-lbl i");
      var row = document.createElement("div");
      row.className = "gal-row" + (n.classList.contains("sel") ? " on" : "");
      row.innerHTML = "<span class='gal-orb' style=\"background-image:url('" + bgOf(n) + "')\"></span>"
        + "<span class='gal-meta'><b>" + ((b && b.textContent) || "Chat") + "</b><i>" + ((i && i.textContent) || "") + "</i></span>"
        + "<span class='gal-acts'><button type='button' class='g-del' title='Delete'>\ud83d\uddd1</button><span class='g-open'>Open \u203a</span></span>";
      row.addEventListener("click", function () { try { n.click(); } catch (e) {} });
      row.querySelector(".g-del").addEventListener("click", function (e) {
        e.stopPropagation();
        try { n.classList.add("sel"); var d = document.querySelector(".w-del"); if (d) d.click(); } catch (err) {}
      });
      list.appendChild(row);
    });
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 300); })
    /* v89 observer retired by v90 */
  /* v89 builder retired by v90 */
})();

/* ===== v90: list v2 — cache-healed orbs, real chat opens ===== */
(function () {
  var view = document.getElementById("view-history");
  var nodes = document.getElementById("const-nodes");
  if (!view || !nodes || view.dataset.list90) return;
  view.dataset.list90 = "1";
  var list = view.querySelector(".gal-list");
  if (!list) { list = document.createElement("div"); list.className = "gal-list"; view.appendChild(list); }

  function hue(t){ var h=0; t=t||""; for (var i=0;i<t.length;i++) h=((h<<5)+h+t.charCodeAt(i))|0; return Math.abs(h); }
  function galCache(){ try { return JSON.parse(localStorage.getItem("alfred_galaxies")||"{}"); } catch(e){ return {}; } }
  function orbOf(n) {
    var g = n.querySelector(".cn-world"); if (!g) return "";
    var k = g.dataset.wkey || "", c = galCache();
    if (k && c[k]) return c[k].split("#")[0];                    /* the real generated galaxy */
    var m = /url\(['"]?([^'"]+)['"]?\)/.exec(g.style.backgroundImage || "");
    if (m) return m[1];
    var H = hue(k || n.textContent);                             /* heal: no black orbs, ever */
    var PL = ["history-sky.jpg","nebula-plate.png","chat-sky.jpg","explore-sky.jpg","modules-sky.jpg","settings-sky.jpg"];
    var u = "../assets/gen/" + PL[H % PL.length];
    g.style.backgroundImage = "url('" + u + "')";
    g.style.filter = "hue-rotate(" + (H % 360) + "deg) saturate(1.15)";
    return u;
  }
  function openChat() {                                          /* the app's own View Chat path */
    var b = view.querySelectorAll("button,[role=button],a");
    for (var i = 0; i < b.length; i++)
      if (/view\s*chat|open\s*chat/i.test(b[i].textContent || "")) { try { b[i].click(); } catch(e){} return; }
  }
  function build() {
    var ns = [].slice.call(nodes.querySelectorAll(".const-node"));
    var sig = ns.map(function (n) {
      var b = n.querySelector(".cn-lbl b"), i = n.querySelector(".cn-lbl i");
      return ((b&&b.textContent)||"")+"|"+((i&&i.textContent)||"")+"|"+orbOf(n)+"|"+(n.classList.contains("sel")?1:0);
    }).join("\u00a7");
    if (list.dataset.sig90 === sig) return;
    list.dataset.sig90 = sig; list.innerHTML = "";
    ns.forEach(function (n) {
      var b = n.querySelector(".cn-lbl b"), i = n.querySelector(".cn-lbl i");
      var u = orbOf(n), H = hue(((b&&b.textContent)||"")+((i&&i.textContent)||""));
      var row = document.createElement("div");
      row.className = "gal-row" + (n.classList.contains("sel") ? " on" : "");
      var orb = u ? "background-image:url('" + u + "')"
                  : "background:radial-gradient(circle at 38% 32%, hsl(" + (H%360) + ",85%,72%), hsl(" + ((H+70)%360) + ",75%,34%))";
      row.innerHTML = "<span class='gal-orb' style=\"" + orb + "\"></span>"
        + "<span class='gal-meta'><b>" + ((b&&b.textContent)||"Chat") + "</b><i>" + ((i&&i.textContent)||"") + "</i></span>"
        + "<span class='gal-acts'><button type='button' class='g-del' title='Delete'>\ud83d\uddd1</button><span class='g-open'>Open \u203a</span></span>";
      row.addEventListener("click", function () {
        try { n.click(); } catch (e) {}
        setTimeout(openChat, 320);
      });
      row.querySelector(".g-del").addEventListener("click", function (e) {
        e.stopPropagation();
        try { n.classList.add("sel"); var d = document.querySelector(".w-del"); if (d) d.click(); } catch (err) {}
      });
      list.appendChild(row);
    });
  }
  var t2 = 0;
  new MutationObserver(function(){ clearTimeout(t2); t2 = setTimeout(build, 250); })
    .observe(nodes, { childList:true, subtree:true, attributes:true, attributeFilter:["class"] });
  setInterval(build, 1500); build();
})();

/* ===== v93: drawer auto-close for Plans ===== */
(function () {
  if (window.__v93drawer) return; window.__v93drawer = "1";
  var syn = false;
  document.body.addEventListener("click", function (e) {  /* our synthetic clicks stay invisible to the exit-guard */
    if (!syn) return;
    syn = false;
    var c = (e.target && (e.target.className || "")) + "";
    if (/scrim|overlay|backdrop|veil/i.test(c)) e.stopPropagation();
  }, false);

  function drawer() {
    var c = document.querySelectorAll("aside, [class*='sidebar'], [class*='side-bar'], [class*='drawer'], [id*='sidebar']");
    for (var i = 0; i < c.length; i++) {
      var r = c[i].getBoundingClientRect();
      if (r.width > 80 && r.height > 200 && r.left > -24) return c[i];
    }
    return null;
  }
  function tryClose() {
    if (window.innerWidth >= 900) return;                 /* desktop: sidebar belongs there */
    var d = drawer(); if (!d) return;
    var sc = document.querySelectorAll("[class*='scrim'],[class*='overlay'],[class*='backdrop'],[class*='veil']");
    for (var i = 0; i < sc.length; i++) {
      var x = sc[i];
      if (x === d || d.contains(x) || x.contains(d)) continue;
      var cs = getComputedStyle(x);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) continue;
      var r = x.getBoundingClientRect();
      if (r.width < 100 || r.height < 100) continue;
      syn = true; x.click(); syn = false;                 /* the app's own close handler does the work */
      return;
    }
    var b = document.querySelector("[class*='burger'],[class*='hamburger'],[class*='menu-btn'],[aria-label*='menu' i]");
    if (b) { return; } /* v190: never reopen the drawer to close it */
    ["open","show","active","on","visible","in"].forEach(function (k) { d.classList.remove(k); });
  }
  var old = window.__openPlans;
  if (typeof old === "function") {
    window.__openPlans = function () {
      var r = old.apply(this, arguments);
      setTimeout(tryClose, 250); setTimeout(tryClose, 750);
      return r;
    };
  }
})();

/* ===== v94: Plans gem icon ===== */
(function () {
  var cand = [].slice.call(document.querySelectorAll("body *")).filter(function (el) {
    return el.children.length === 0 && el.textContent.trim() === "Plans";
  });
  for (var i = 0; i < cand.length; i++) {
    var row = cand[i].closest("button,[role=button],a,div");
    if (!row || row.dataset.gem94) continue;
    if (row.closest("#view-pay,.pay-wrap,.set-wrap,.set-modal")) continue;
    if (!row.closest("aside,[class*='side'],[id*='side'],nav")) continue;
    row.dataset.gem94 = "1"; row.classList.add("row-gem");
    var gem = '<path d="M12 3 18 9 12 21 6 9Z" fill="none" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 9h12M12 3 9 9l3 12 3-12Z" fill="none" stroke-width="1.2"/>';
    var sv = row.querySelectorAll("svg");
    if (sv.length) [].slice.call(sv).forEach(function (x) { x.innerHTML = gem; });
    else { var ic = row.querySelector("i,span"); if (ic && ic !== cand[i]) { ic.textContent = "\u25C6"; ic.classList.add("ic-gem"); } }
    break;
  }
})();

/* ===== v94: history date sections + orb variety ===== */
(function () {
  var view = document.getElementById("view-history");
  var list = view && view.querySelector(".gal-list");
  if (!list || list.dataset.sec94) return;
  list.dataset.sec94 = "1";
  var tm = 0, lastSig = "";

  function bucket(t) {
    if (/today/i.test(t)) return "Today";
    if (/yesterday/i.test(t)) return "Yesterday";
    if (/week/i.test(t)) return "This week";
    if (/month/i.test(t)) return "This month";
    return "Earlier";
  }
  function decor() {
    var rows = [].slice.call(list.children).filter(function (el) {
      return el.classList && el.classList.contains("gal-row");
    });
    if (!rows.length) return;
    var sig = rows.map(function (r) { return (r.querySelector("b") || { textContent: "" }).textContent; }).join("|") + "#" + rows.length;
    if (sig === lastSig) return;
    lastSig = sig;

    var head = list.querySelector(".gal-head");
    if (!head) { head = document.createElement("div"); head.className = "gal-head"; list.insertBefore(head, list.firstChild); }
    var sub = rows.length + (rows.length === 1 ? " universe" : " universes") + " born from your chats";
    if (head.dataset.on !== "1") { head.innerHTML = 'Your Worlds<small></small>'; head.dataset.on = "1"; }
    var sm = head.querySelector("small"); if (sm && sm.textContent !== sub) sm.textContent = sub;

    [].slice.call(list.querySelectorAll(".gal-sec")).forEach(function (sec) {
      var n = sec.nextElementSibling;
      if (!n || !n.classList.contains("gal-row")) sec.remove();
    });

    var cur = null;
    rows.forEach(function (r, i) {
      if (r.style.getPropertyValue("--gi") !== String(i % 12)) r.style.setProperty("--gi", i % 12);
      var t = r.querySelector("i");
      var b = bucket(t ? t.textContent : "");
      if (b !== cur) {
        var prev = r.previousElementSibling;
        if (!(prev && prev.classList.contains("gal-sec") && prev.dataset.b === b)) {
          var sec = document.createElement("div");
          sec.className = "gal-sec"; sec.dataset.b = b;
          sec.innerHTML = "<b>" + b + "</b>";
          list.insertBefore(sec, r);
        }
        cur = b;
      }
    });

    var groups = {};
    rows.forEach(function (r) {
      var o = r.querySelector(".gal-orb"); if (!o) return;
      var m = /url\(['"]?([^'")]+)/.exec(o.style.backgroundImage || "");
      var key = m ? m[1] : "none:" + (r.querySelector("b") || { textContent: "" }).textContent;
      (groups[key] = groups[key] || []).push({ r: r, o: o });
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].forEach(function (g, i) {
        if (!g.r.dataset.bf94) g.r.dataset.bf94 = g.o.style.filter || "";
        var base = g.r.dataset.bf94.replace(/hue-rotate\([^)]*\)/g, "").trim();
        var nf = (base ? base + " " : "") + (i ? "hue-rotate(" + ((i * 47) % 360) + "deg) saturate(1.12)" : "saturate(1.08)");
        if (g.o.style.filter !== nf) g.o.style.filter = nf;
      });
    });
  }
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(decor, 140); }).observe(list, { childList: true });
  decor(); setTimeout(decor, 600);
})();

/* ===== v95: storage meter out of Settings ===== */
(function () {
  if (window.__v95store) return; window.__v95store = "1";
  function kill() {
    var sv = document.getElementById("view-settings");
    if (!sv) return;
    [].slice.call(sv.querySelectorAll("*")).forEach(function (el) {
      if (el.children.length || el.textContent.trim() !== "Storage used") return;
      var row = el.closest(".set-row") || el.parentElement;
      if (!row || row.dataset.k95) return;
      row.dataset.k95 = "1"; row.remove();
      var nx = row.nextElementSibling;                 /* the meter bar, if it sits alone */
      if (nx && !nx.textContent.trim() && nx.querySelector("div")) nx.remove();
    });
  }
  new MutationObserver(kill).observe(document.body, { childList: true, subtree: true });
  kill(); setInterval(kill, 1200);
})();

/* ===== v95: package rosters in Modules ===== */
(function () {
  var view = document.getElementById("view-modules");
  if (!view || view.dataset.roster95) return;
  view.dataset.roster95 = "1";
  var ROSTER = {
    Free:  ["GPT-5 mini", "Claude Sonnet 4", "Dolphin"],
    Pro:   ["GPT-6 Astra", "Claude Opus 5", "DeepSeek 4.1", "Dolphin", "Code Interpreter", "Web Search"],
    Ultra: ["GPT-6 Astra Ultra", "Claude Opus 5 Max", "DeepSeek 4.1 Apex", "Dolphin Ultra", "Deep-think Council"]
  };
  var card = null, cur = "";
  function pick() {                                    /* find the package <select> by its options */
    var sels = view.querySelectorAll("select");
    for (var i = 0; i < sels.length; i++) {
      var o = [].slice.call(sels[i].options).map(function (x) { return x.textContent.trim(); });
      for (var k in ROSTER) if (o.indexOf(k) > -1) return sels[i];
    }
    return null;
  }
  function name() {
    var sel = pick(); if (!sel) return "";
    var v = sel.options[sel.selectedIndex]; return v ? v.textContent.trim() : "";
  }
  function render() {
    var n = name(); if (!n || n === cur) return; cur = n;
    if (!card) {
      card = document.createElement("div"); card.className = "ros95";
      var sel = pick();
      (sel.parentElement.parentElement || view).insertBefore(card, sel.parentElement.nextSibling);
    }
    var list = ROSTER[n] || ROSTER.Free;
    card.innerHTML = '<div class="ros95-t">Inside <b>' + n + '</b> \u2014 minds working together</div>'
      + '<div class="ros95-p">' + list.map(function (m) { return "<span>" + m + "</span>"; }).join("") + "</div>";
  }
  view.addEventListener("change", render);
  new MutationObserver(render).observe(view, { childList: true, subtree: true });
  render(); setTimeout(render, 700);
})();

/* ===== v95: ghost delete buttons ===== */
(function () {
  function mark() {
    var l = document.querySelector("#view-history .gal-list"); if (!l) return;
    [].slice.call(l.querySelectorAll("button")).forEach(function (b) {
      if ((b.textContent || "").indexOf("\uD83D\uDDD1") > -1) b.classList.add("g-del");
    });
  }
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  mark(); setInterval(mark, 1200);
})();

/* ===== v95: ghost delete buttons ===== */
(function () {
  function mark() {
    var l = document.querySelector("#view-history .gal-list"); if (!l) return;
    [].slice.call(l.querySelectorAll("button")).forEach(function (b) {
      if ((b.textContent || "").indexOf("\uD83D\uDDD1") > -1) b.classList.add("g-del");
    });
  }
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  mark(); setInterval(mark, 1200);
})();

/* ===== v96: level dropdown — all 3 packages, minds visible ===== */
(function () {
  var view = document.getElementById("view-modules");
  if (!view || view.dataset.pkg96) return;
  view.dataset.pkg96 = "1";

  var MODELS = {
      Free:  { n: "3 minds \u00b7 standard class", list: ["GPT-5 mini", "Claude Sonnet 4", "Dolphin"] },
      Pro:   { n: "6 minds \u00b7 latest class", list: ["GPT-6 Astra", "Claude Opus 5", "DeepSeek 4.1", "Dolphin", "Code Interpreter", "Web Search"] },
      Ultra: { n: "4 apex minds + Council", list: ["GPT-6 Astra Ultra", "Claude Opus 5 Max", "DeepSeek 4.1 Apex", "Dolphin Ultra", "Deep-think Council"] }
    };
  var panel = null;

  function findSel() {
    var sels = view.querySelectorAll("select");
    for (var i = 0; i < sels.length; i++) {
      var o = [].slice.call(sels[i].options).map(function (x) { return x.textContent.trim(); });
      if (o.indexOf("Free") > -1 && o.indexOf("Pro") > -1) return sels[i];
    }
    return null;
  }
  function cur() {
    var o = sel.options[sel.selectedIndex];
    var t = o ? o.textContent.trim() : "Free";
    return MODELS[t] ? t : "Free";
  }
  function render() {
    var c = cur();
    panel.innerHTML = '<div class="pkg96-t">Alfred\u2019s power levels</div>'
      + ["Free", "Pro", "Ultra"].map(function (k) {
          return '<button type="button" class="pkg96-row' + (k === c ? " on" : "") + '" data-k="' + k + '">'
            + "<b>" + k + "</b><i>" + MODELS[k].n + " cooperating with Alfred</i>"
            + '<div class="pkg96-chips">' + MODELS[k].list.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>"
            + "</button>";
        }).join("");
  }
  function out(e) {
    if (!panel.contains(e.target) && !pill.contains(e.target)) close();
  }
  function open() { render(); panel.hidden = false; document.addEventListener("click", out, true); }
  function close() { panel.hidden = true; document.removeEventListener("click", out, true); }

  var sel = null, pill = null;
  function boot() {
    sel = findSel();
    if (!sel || sel.dataset.v96) return;
    sel.dataset.v96 = "1";
    pill = sel.parentElement;
    var r = sel.getBoundingClientRect();
    var box = document.createElement("span");
    box.style.cssText = "position:relative;display:inline-block;width:" + Math.max(r.width, 90) + "px;height:" + r.height + "px;vertical-align:middle;";
    sel.parentNode.insertBefore(box, sel);
    box.appendChild(sel);
    sel.style.cssText += ";width:100%;height:100%;";
    var hit = document.createElement("button");        /* owns the tap — native picker never opens */
    hit.type = "button"; hit.setAttribute("aria-label", "Choose package");
    hit.style.cssText = "position:absolute;inset:0;z-index:5;background:transparent;border:0;cursor:pointer;";
    box.appendChild(hit);
    pill.addEventListener("click", function (e) { e.preventDefault(); panel.hidden ? open() : close(); });
    panel = document.createElement("div");
    panel.className = "pkg96"; panel.hidden = true;
    panel.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".pkg96-row") : null;
      if (!b) return;
      e.stopPropagation();
      var k = b.dataset.k;
      for (var i = 0; i < sel.options.length; i++)
        if (sel.options[i].textContent.trim() === k) { sel.selectedIndex = i; break; }
      sel.dispatchEvent(new Event("change", { bubbles: true }));   /* roster card follows */
      close();
    });
    pill.parentElement.insertBefore(panel, pill.nextSibling);
  }
  setInterval(boot, 1500); boot();
})();


/* ===== v97: package levels panel + plans nav glow ===== */
(function () {
  var view = document.getElementById("view-modules");
  /* v97 panel retired by v100 */
  /* --- sidebar glow follows Plans --- */
  var TOKS = ["on", "active", "sel", "selected", "current", "cur", "now", "is-active", "is-selected", "nav-on", "nav-active", "w97-on"];
  function rowByText(t) {
    var all = document.querySelectorAll("body *");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length) continue;
      if ((el.textContent || "").trim() !== t) continue;
      var r = el.closest("button,[role=button],a,li,div");
      if (r) return r;
    }
    return null;
  }
  function activeTok(r) {
    var c = (r.className || "").split(/\s+/);
    for (var i = 0; i < c.length; i++) if (TOKS.indexOf(c[i].toLowerCase()) > -1) return c[i];
    return r.getAttribute("aria-current") ? "aria" : null;
  }
  function glowPlans() {
    var plans = rowByText("Plans");
    if (!plans) return;
    plans.classList.remove("w97-on");
    var rest = ["Chat", "Explore", "Modules", "History", "Settings"], moved = false;
    for (var i = 0; i < rest.length; i++) {
      var r = rowByText(rest[i]);
      if (!r) continue;
      var tok = activeTok(r);
      if (tok === "aria") { r.removeAttribute("aria-current"); plans.setAttribute("aria-current", "page"); moved = true; break; }
      if (tok) { r.classList.remove(tok); plans.classList.add(tok); moved = true; break; }
    }
    if (!moved) plans.classList.add("w97-on");
  }
  document.addEventListener("click", function (e) {     /* leaving Plans: glow returns to the app */
    var r = e.target && e.target.closest ? e.target.closest("button,[role=button],a,li") : null;
    if (!r) return;
    var t = (r.textContent || "").trim();
    if (!/^(Chat|Explore|Modules|History|Settings)\b/.test(t)) return;
    setTimeout(function () {
      var p = rowByText("Plans");
      if (p) TOKS.forEach(function (k) { p.classList.remove(k); });
    }, 140);
  }, true);
  var tries = 0;
  (function waitWrap() {
    if (typeof window.__openPlans === "function" && !window.__v97glow) {
      window.__v97glow = "1";
      var prev = window.__openPlans;
      window.__openPlans = function () {
        var r = prev.apply(this, arguments);
        setTimeout(glowPlans, 90); setTimeout(glowPlans, 550);
        return r;
      };
    } else if (++tries < 40) setTimeout(waitWrap, 200);
  })();
})();

/* ===== v98: history delete that never misses ===== */
(function () {
  var list = document.querySelector("#view-history .gal-list");
  if (!list || window.__v98del) return;
  window.__v98del = "1";
  var SKIP = /backup|galax|explore-posts|module_package/i;

  function titleOf(e){ return e && typeof e === "object" ? String(e.title || e.name || e.label || "") : ""; }
  function tsOf(e){ return (e && (e.ts || e.time || e.created || e.updated || e.at)) || 0; }
  function rowTs(lab) {
    var d = new Date();
    if (/yesterday/i.test(lab)) d = new Date(Date.now() - 864e5);
    var g = /(\d+)\s*days?\s*ago/i.exec(lab);
    if (g) d = new Date(Date.now() - (+g[1]) * 864e5);
    var m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(lab);
    if (m) { var h = (+m[1]) % 12; if (m[3] && /pm/i.test(m[3])) h += 12; d.setHours(h, +m[2], 0, 0); }
    else d.setHours(12, 0, 0, 0);
    return d.getTime();
  }
  function same(e, t, ts, tol) {
    var et = titleOf(e); if (!et || et.toLowerCase() !== t.toLowerCase()) return false;
    var ets = tsOf(e); return !ets || Math.abs(+ets - ts) < tol;
  }
  function eachStore(fn) {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i); if (SKIP.test(k)) continue;
      var a; try { a = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
      var wrap = a && typeof a === "object" && !Array.isArray(a) && Array.isArray(a.arr);
      var arr = wrap ? a.arr : a;
      if (!Array.isArray(arr) || !arr.length || typeof arr[0] !== "object") continue;
      if (fn(k, arr, wrap, a)) i = -1;
    }
  }
  function has(t, ts) {
    var f = false;
    eachStore(function (k, arr) {
      for (var j = 0; j < arr.length; j++) if (same(arr[j], t, ts, 9e7)) { f = true; return true; }
      return false;
    });
    return f;
  }
  function purge(t, ts, tol) {
    var n = 0;
    eachStore(function (k, arr, wrap, obj) {
      var keep = arr.filter(function (e) { return !same(e, t, ts, tol); });
      if (keep.length === arr.length) return false;
      n += arr.length - keep.length;
      try { localStorage.setItem(k, JSON.stringify(wrap ? (obj.arr = keep, obj) : keep)); } catch (e) {}
      return true;
    });
    return n;
  }
  function modalOpen() {
    return [].slice.call(document.querySelectorAll("[class*='modal'],[class*='confirm'],[class*='dialog']"))
      .some(function (el) { var cs = getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.05; });
  }
  function killNodes(t) {
    var nd = document.getElementById("const-nodes"); if (!nd) return;
    [].slice.call(nd.querySelectorAll(".const-node")).forEach(function (n) {
      var b = n.querySelector(".cn-lbl b") || n.querySelector("b");
      if (b && b.textContent.trim().toLowerCase() === t.toLowerCase()) n.remove();
    });
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".g-del") : null; if (!b) return;
    var row = b.closest(".gal-row"); if (!row) return;
    var t = ((row.querySelector("b") || {}).textContent || "").trim();
    var lab = ((row.querySelector("i") || {}).textContent || "").trim();
    if (!t) return;
    var ts = rowTs(lab), tol = /:\d{2}/.test(lab) ? 18e4 : 9e7;
    var tries = 0;
    var iv = setInterval(function () {
      if (++tries > 26) clearInterval(iv);
      if (modalOpen()) return;                        /* a confirm dialog is up - let the user decide first */
      clearInterval(iv);
      if (has(t, ts)) purge(t, ts, tol);              /* the app's engine missed it - finish the deletion */
      setTimeout(function () {
        killNodes(t);
        [].slice.call(list.querySelectorAll(".gal-row")).forEach(function (r) {
          var rt = ((r.querySelector("b") || {}).textContent || "").trim();
          var rl = ((r.querySelector("i") || {}).textContent || "").trim();
          if (rt.toLowerCase() === t.toLowerCase() && Math.abs(rowTs(rl) - ts) < tol && !has(rt, rowTs(rl))) r.remove();
        });
      }, 500);
    }, 400);
  }, true);
})();

/* ===== v99: module cards — locks, logos, detail sheets ===== */
(function () {
  var view = document.getElementById("view-modules");
  if (!view || window.__v99mod) return;
  window.__v99mod = "1";

  var LVL = { Free: 0, Pro: 1, Ultra: 2 };
  function level() {
    var k = ""; try { k = localStorage.getItem("alfred_module_package") || ""; } catch (e) {}
    if (LVL[k] != null) return k;
    var m = /ultra|pro|free/i.exec(view.textContent || ""); var g = m ? m[0] : "Free";
    g = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
    return LVL[g] != null ? g : "Free";
  }
  var LOGO = {
    chatgpt: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#10a37f"/><path d="M24 12l9 5v10l-9 5-9-5V17z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="22" r="3.2" fill="#fff"/></svg>',
    claude: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#e8623c"/><g stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M24 10v8M24 30v8M10 24h8M30 24h8M14 14l5.5 5.5M28.5 28.5L34 34M34 14l-5.5 5.5M19.5 28.5L14 34"/></g></svg>',
    deepseek: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#4b6bfb"/><path d="M10 28c6-9 16-12 24-9-3 1-5 2-6 4 4-1 7 0 9 3-6-2-11-1-15 2-4 2-9 3-12 0z" fill="#fff"/></svg>',
    dolphin: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#8b93f8"/><g stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M12 20c4-3 8-3 12 0s8 3 12 0"/><path d="M12 28c4-3 8-3 12 0s8 3 12 0"/></g></svg>',
    code: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#c94fd8"/><g stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M18 18l-7 6 7 6M30 18l7 6-7 6M26 15l-4 18"/></g></svg>',
    search: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#38b6ff"/><circle cx="22" cy="22" r="8" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M28 28l7 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>'
  };
  var MODS = {
    chatgpt: { name: "ChatGPT", sub: "Everyday genius", min: 0,
      desc: "Your all-round mind \u2014 conversations, ideas, plans and answers that feel like they come from someone who knows you.",
      by: { Free: "GPT-5 mini", Pro: "GPT-6 Astra", Ultra: "GPT-6 Astra Ultra" } },
    claude: { name: "Claude", sub: "Words that feel human", min: 0,
      desc: "Essays, emails, analysis and long thoughts \u2014 written with taste, nuance and perfect structure.",
      by: { Free: "Claude Sonnet 4", Pro: "Claude Opus 5", Ultra: "Claude Opus 5 Max" } },
    deepseek: { name: "DeepSeek", sub: "Deep reasoning", min: 1,
      desc: "Math, logic and hard problems \u2014 thinks step by step until it cracks them.",
      by: { Pro: "DeepSeek 4.1", Ultra: "DeepSeek 4.1 Apex" } },
    dolphin: { name: "Dolphin", sub: "Fun & roleplay", min: 0,
      desc: "The wildcard mind \u2014 creative, playful, unfiltered ideas and character roleplay.",
      by: { Free: "Dolphin", Pro: "Dolphin", Ultra: "Dolphin Ultra" } },
    code: { name: "Code Interpreter", sub: "Runs real code", min: 1,
      desc: "Writes, runs and fixes real code \u2014 scripts, data, bugs, automation.",
      by: { Pro: "Sandbox + GPT-6 Astra", Ultra: "Sandbox + Council" } },
    search: { name: "Web Search", sub: "Live answers", min: 1,
      desc: "Reads the live web before answering \u2014 news, prices, facts, anything happening right now.",
      by: { Pro: "GPT-6 Astra + live index", Ultra: "Council + live index" } }
  };
  var SUBMAP = { "conversation": "Everyday genius", "writing & analysis": "Words that feel human",
    "advanced reasoning": "Deep reasoning", "generic": "Fun & roleplay",
    "code & logic": "Runs real code", "real-time info": "Live answers" };

  function keyFor(t) {
    t = (t || "").trim().toLowerCase();
    for (var k in MODS) if (MODS[k].name.toLowerCase() === t) return k;
    return null;
  }
  function cards() {
    var map = {}, all = view.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length) continue;
      if (el.closest(".pkg97,.pkg96,.pkg100,.ros95,.m99-sheet")) continue;
      var k = keyFor(el.textContent); if (!k || map[k]) continue;
      var c = el.parentElement;
      while (c && c !== view && !(c.querySelector && c.querySelector("svg"))) c = c.parentElement;
      if (!c || c === view || map[k]) continue;
      if (c.closest(".pkg97,.pkg96,.pkg100,.ros95,.m99-sheet")) continue;
      var tc = (c.textContent || "");
      if (tc.length > 320) continue;
      if (/power levels/i.test(tc) || /cooperating with alfred/i.test(tc) || /package\s*:/i.test(tc)) continue;
      map[k] = c;
    }
    return map;
  }

  var sheet = document.createElement("div");
  sheet.className = "m99-sheet"; sheet.hidden = true;
  document.body.appendChild(sheet);
  function closeSheet() { sheet.hidden = true; }
  function openSheet(k) {
    var m = MODS[k], li = LVL[level()];
    var rows = ["Free", "Pro", "Ultra"].filter(function (L) { return m.by[L]; }).map(function (L) {
      var lk = LVL[L] > li;
      return '<div class="m99-mrow' + (lk ? " lk" : "") + '"><span class="m99-lgo">' + LOGO[k] + "</span>"
        + "<div><b>" + m.by[L] + "</b><i>" + (lk ? "Unlocks at " + L : L + " level") + "</i></div>"
        + "<em>" + (lk ? "\uD83D\uDD12" : "\u2713") + "</em></div>";
    });
    var locked = li < m.min;
    sheet.innerHTML = '<div class="m99-back"></div><div class="m99-card">'
      + '<span class="m99-big">' + LOGO[k] + "</span><h3>" + m.name + "</h3><i>" + m.sub + "</i>"
      + "<p>" + m.desc + '</p><div class="m99-sec">Powered by</div>' + rows.join("")
      + (locked ? '<button type="button" class="m99-cta">Unlock with ' + (m.min === 1 ? "Pro" : "Ultra") + "</button>" : "")
      + '<button type="button" class="m99-x">Close</button></div>';
    sheet.hidden = false;
    sheet.querySelector(".m99-back").onclick = closeSheet;
    sheet.querySelector(".m99-x").onclick = closeSheet;
    var cta = sheet.querySelector(".m99-cta");
    if (cta) cta.onclick = function () { closeSheet(); if (window.__openPlans) window.__openPlans(); };
  }

  function apply() {
    var li = LVL[level()], cs = cards();
    Object.keys(MODS).forEach(function (k) {
      var c = cs[k]; if (!c) return;
      var m = MODS[k];
      c.style.position = c.style.position || "relative";
      [].slice.call(c.children).forEach(function (ch) {
        if (ch.children.length === 0) {
          var s = SUBMAP[ch.textContent.trim().toLowerCase()];
          if (s) ch.textContent = s;
        }
      });
      var locked = li < m.min;
      c.classList.toggle("m99-off", locked);
      var lock = c.querySelector(".m99-lock");
      if (locked && !lock) {
        lock = document.createElement("div"); lock.className = "m99-lock";
        lock.innerHTML = "<span>\uD83D\uDD12 " + (m.min === 1 ? "Pro" : "Ultra") + "</span>";
        c.appendChild(lock);
      } else if (!locked && lock) lock.remove();
      if (!c.dataset.m99) {
        c.dataset.m99 = "1";
        c.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".pkg97,.pkg96,.pkg100,.ros95,.m99-sheet")) return; e.preventDefault(); e.stopPropagation(); openSheet(k); }, true);
      }
    });
  }
  setInterval(apply, 1500); apply(); setTimeout(apply, 900);
})();

/* ===== v100: power levels panel v2 + badge janitor ===== */
(function () {
  var view = document.getElementById("view-modules");
  if (!view || window.__v100) return;
  window.__v100 = "1";
  var LEVELS = {
    Free:  { mg: "F", tag: "3 standard minds \u00b7 to meet Alfred",
      list: ["GPT-5 mini", "Claude Sonnet 4", "Dolphin"] },
    Pro:   { mg: "P", tag: "6 latest-generation minds \u00b7 full speed",
      list: ["GPT-6 Astra", "Claude Opus 5", "DeepSeek 4.1", "Dolphin", "Code Interpreter", "Web Search"] },
    Ultra: { mg: "U", tag: "4 apex minds + the Deep-think Council",
      list: ["GPT-6 Astra Ultra", "Claude Opus 5 Max", "DeepSeek 4.1 Apex", "Dolphin Ultra", "Deep-think Council"] }
  };
  var DOT = { GPT: "#10a37f", Claude: "#e8623c", DeepSeek: "#4b6bfb", Dolphin: "#8b93f8", Code: "#c94fd8", Web: "#38b6ff", "Deep-think": "#f0c04a" };
  function dot(n) {
    for (var k in DOT) if (n.indexOf(k) === 0) return '<span class="pkg100-dot" style="background:' + DOT[k] + '"></span>';
    return '<span class="pkg100-dot" style="background:#9fb4d8"></span>';
  }
  function saved() { try { return localStorage.getItem("alfred_module_package") || ""; } catch (e) { return ""; } }
  function cur() { return LEVELS[saved()] ? saved() : "Free"; }
  var panel = null, pill = null;

  function render() {
    if (!panel) return;
    panel.innerHTML = '<div class="pkg100-t">Alfred\u2019s power levels</div>' +
      ["Free", "Pro", "Ultra"].map(function (k) {
        var L = LEVELS[k], on = k === cur();
        return '<button type="button" class="pkg100-row' + (on ? " on" : "") + '" data-k="' + k + '">'
          + '<span class="pkg100-mg">' + L.mg + '</span>'
          + '<span class="pkg100-bd"><span class="pkg100-nm"><b>' + k + '</b>'
          + (on ? '<em class="pkg100-cur">CURRENT</em>' : '') + '</span><i>' + L.tag + '</i>'
          + '<span class="pkg100-chips">' + L.list.map(function (m) { return '<span>' + dot(m) + m + '</span>'; }).join('') + '</span></span></button>';
      }).join("");
  }
  function setPill(k) {
    if (!pill) return;
    var els = [].slice.call(pill.querySelectorAll("*")); els.push(pill);
    els.forEach(function (el) {
      var kn = el.childNodes;
      if (kn.length === 1 && kn[0].nodeType === 3 && /^(free|pro|ultra)$/i.test((kn[0].nodeValue || "").trim()))
        kn[0].nodeValue = kn[0].nodeValue.replace(/free|pro|ultra/i, k);
    });
  }
  function choose(k) {
    try { localStorage.setItem("alfred_module_package", k); } catch (e) {}
    setPill(k);
    var sel = view.querySelector("select");
    if (sel) {
      var opts = [].slice.call(sel.options).map(function (o) { return o.textContent.trim(); });
      if (opts.indexOf("Free") > -1 && opts.indexOf("Pro") > -1 && opts.indexOf(k) > -1) {
        sel.selectedIndex = opts.indexOf(k);
        try { sel.dispatchEvent(new Event("change", { bubbles: true })); } catch (e2) {}
      }
    }
    render();
  }
  function boot() {
    var all = view.querySelectorAll("*"), found = null;
    for (var i = 0; i < all.length && !found; i++) {
      var el = all[i], kn = el.childNodes;
      for (var c = 0; c < kn.length; c++)
        if (kn[c].nodeType === 3 && /package/i.test(kn[c].nodeValue || "")) {
          found = el.closest("button,[role=button],[class*='pill'],[class*='chip']") || el.parentElement; break;
        }
    }
    if (!found) return;
    pill = found;
    if (!pill.dataset.w100) {
      pill.dataset.w100 = "1"; pill.dataset.w97 = "1";   /* claims both wirings - no double panels */
      panel = view.querySelector(".pkg100");
      if (!panel) {
        panel = document.createElement("div");
        panel.className = "pkg100";
        (pill.parentElement || view).insertBefore(panel, pill.nextSibling);
      }
    } else panel = view.querySelector(".pkg100");
    if (panel && !document.contains(panel)) (pill.parentElement || view).insertBefore(panel, pill.nextSibling);
    if (panel && !panel.innerHTML) render();
  }
  setInterval(boot, 1500); boot();
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var p = e.target.closest("[data-w100]");
    if (p) { e.preventDefault(); e.stopPropagation(); if (panel) { panel.hidden = !panel.hidden; if (!panel.hidden) render(); } return; }
    var r = e.target.closest(".pkg100-row");
    if (r && panel && panel.contains(r)) { e.preventDefault(); e.stopPropagation(); choose(r.dataset.k); panel.hidden = true; }
  }, true);
  (function janit() {                                    /* stray locks + stale v97 panels */
    [].slice.call(document.querySelectorAll("#view-modules .m99-lock")).forEach(function (l) {
      var c = l.parentElement;
      if (c && (c.textContent.length > 400 || c.querySelector(".pkg97,.pkg100"))) l.remove();
    });
    [].slice.call(document.querySelectorAll("#view-modules .pkg97")).forEach(function (x) { x.remove(); });
    setTimeout(janit, 2500);
  })();
})();

/* v101 grid-sync retired by v115; panel owns Modules */

/* v102 retired by v103 */

/* v103 retired by v104 */

/* v104 retired by v105 */

/* ===== v104: Alfred mark discs + per-level energy ===== */
(function () {
  var view = document.getElementById("view-modules");
  if (!view || window.__v104) return;
  window.__v104 = "1";

  function mark() {
    return '<svg viewBox="0 0 48 48" class="alfmark104" aria-hidden="true">'
      + '<defs><linearGradient id="alfg104" x1="0" y1="1" x2="1" y2="0">'
      + '<stop offset="0" stop-color="#4f9dff"/><stop offset="1" stop-color="#a5e2ff"/></linearGradient></defs>'
      + '<path d="M24 8 11.5 39" stroke="url(#alfg104)" stroke-width="4.6" stroke-linecap="round" fill="none"/>'
      + '<path d="M24 8 36.5 39" stroke="url(#alfg104)" stroke-width="4.6" stroke-linecap="round" fill="none"/>'
      + '<path d="M18 29.5h12" stroke="url(#alfg104)" stroke-width="3.2" stroke-linecap="round"/></svg>';
  }
  function solo() {
    var panel = view.querySelector(".pkg100");
    if (!panel) return;
    if (panel.parentElement !== view) view.insertBefore(panel, view.firstChild);
    if (panel.hidden) panel.hidden = false;
    [].slice.call(view.children).forEach(function (el) {
      if (el === panel || el.tagName === "STYLE" || el.tagName === "SCRIPT") return;
      if (getComputedStyle(el).display !== "none") el.style.setProperty("display", "none", "important");
    });
    [].slice.call(panel.querySelectorAll(".pkg100-mg")).forEach(function (mg) {
      if ((mg.innerHTML || "").indexOf("alfmark104") === -1) mg.innerHTML = mark();  /* heals wrong icons + survives redraws */
    });
  }
  setInterval(solo, 900); solo();
  var tm = 0;
  new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(solo, 150); })
    .observe(view, { childList: true, subtree: true });
})();

/* v105 retired by v106 */

/* v106 retired by v107 */

/* v107 retired by v108 */

/* v108 retired by v109 */

/* ===== v109: ONE level brain — topbar, chat, modules move together ===== */
(function () {
  if (window.__v109b) return; window.__v109b = "1";
  var view = document.getElementById("view-modules");

  var CL = {
    Free:  { a:"#93a6c4", b:"#e8f0fc", core:"#e6edf8", glow:"rgba(165,190,225,.5)",  beat:"4.8s" },
    Pro:   { a:"#2f7cff", b:"#9fe8ff", core:"#eaf8ff", glow:"rgba(90,190,255,.85)",  beat:"2.6s" },
    Ultra: { a:"#ff9d3c", b:"#ffeab2", core:"#fff3d6", glow:"rgba(255,195,110,.95)", beat:"1.7s" }
  };
  function lvl(){ try{ var k=localStorage.getItem("alfred_module_package"); if(CL[k])return k; }catch(e){} return "Free"; }

  function mark(L){
    var c=CL[L], id="vg109"+L, ring="";
    if(L==="Free"){
      ring='<circle cx="24" cy="24" r="17" fill="none" stroke="'+c.a+'" stroke-opacity=".3" stroke-width="1.1"/>';
    }else if(L==="Pro"){
      ring='<g class="alv-orb" style="animation-duration:9s">'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round"/>'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round" transform="rotate(180 24 24)"/></g>';
    }else{
      ring='<g class="alv-orb" style="animation-duration:7s">'
        +'<circle cx="24" cy="24" r="18" fill="none" stroke="#ffd98a" stroke-opacity=".6" stroke-width="1.3" stroke-dasharray="86 27" stroke-linecap="round"/></g>'
        +'<path d="M24 2.4l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#ffeab2"/>'
        +'<circle cx="9" cy="12" r="1" fill="#ffeab2" opacity=".7"/><circle cx="39.5" cy="34" r=".9" fill="#ffeab2" opacity=".5"/>';
    }
    function leg(d){
      return '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="7.6" stroke-linecap="round" opacity=".2" fill="none"/>'
           + '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
           + '<path d="'+d+'" stroke="'+c.core+'" stroke-width="1.1" stroke-linecap="round" opacity=".45" fill="none"/>';
    }
    return '<svg viewBox="0 0 48 48" class="alfmark104" aria-hidden="true">'
      +'<defs>'
      +'<linearGradient id="'+id+'" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="'+c.a+'"/><stop offset="1" stop-color="'+c.b+'"/></linearGradient>'
      +'<radialGradient id="'+id+'h"><stop offset="0" stop-color="'+c.glow+'" stop-opacity=".4"/><stop offset="1" stop-color="'+c.glow+'" stop-opacity="0"/></radialGradient>'
      +'<filter id="'+id+'f" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      +'</defs>'
      +'<circle cx="24" cy="24" r="21" fill="url(#'+id+'h)"/>'+ring
      +'<g filter="url(#'+id+'f)">'+leg("M24 9.5 13 38.5")+leg("M24 9.5 35 38.5")
      +'<path d="M17.6 28.6h12.8" stroke="url(#'+id+')" stroke-width="3" stroke-linecap="round"/></g>'
      +'<circle cx="24" cy="9.5" r="2.1" fill="'+c.core+'"><animate attributeName="opacity" values="1;.45;1" dur="'+c.beat+'" repeatCount="indefinite"/></circle>'
      +'</svg>';
  }

  /* every round identity disc: ring + tint by level; gets our mark only if empty */
  function setDisc(el, L){
    el.classList.add("lvldisc");
    ["Free","Pro","Ultra"].forEach(function(k){ el.classList.toggle("lvldisc-"+k, k===L); });
    el.dataset.lvl = L;
    var art = el.querySelectorAll("svg,img");
    if (!art.length) { el.innerHTML = mark(L); el.dataset.mk109 = "1"; }
    else [].slice.call(art).forEach(function(x){
      x.classList.remove("tint-Free","tint-Pro","tint-Ultra");
      x.classList.add("tint-"+L);
    });
  }

  function titles(){
    var st = document.querySelectorAll("[data-t105]");
    if (st.length) return [].slice.call(st);
    var out = [], all = document.querySelectorAll("body *");
    for (var i=0;i<all.length;i++){
      var e = all[i];
      if (!e.children.length && (e.textContent||"").trim()==="General AI") out.push(e);
    }
    return out;
  }
  function findAvatar(t){
    var tr = t.getBoundingClientRect();
    var root = t.closest("header,[class*='topbar'],[class*='top-bar'],[class*='chat-top']") || t.parentElement.parentElement || document.body;
    var best=null, bg=1e9;
    [].slice.call(root.querySelectorAll("*")).forEach(function(el){
      if (el===t || t.contains(el) || el.contains(t)) return;
      var r = el.getBoundingClientRect();
      if (r.width<26 || r.width>76 || r.height<26 || r.height>76) return;
      if (Math.abs(r.width-r.height)>14) return;
      var br = parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;
      if (br < r.width*.35 && br < 16) return;
      var gap = tr.left - r.right;
      if (gap<-8 || gap>90) return;
      if (Math.abs((r.top+r.height/2)-(tr.top+tr.height/2))>32) return;
      if (gap<bg){ bg=gap; best=el; }
    });
    return best;
  }
  function topbar(){
    var L = lvl();
    titles().forEach(function(t){
      if ((t.textContent||"").trim() !== L) t.textContent = L;
      t.dataset.t105 = "1";
      t.classList.add("lvl105-t");
      ["Free","Pro","Ultra"].forEach(function(k){ t.classList.toggle("lvl105-t-"+k, k===L); });
    });
    var t0 = null;
    titles().forEach(function(t){ if (!t0 && t.offsetParent !== null) t0 = t; });
    if (!t0) return;
    var av = findAvatar(t0);
    if (av) setDisc(av, L);
  }
  function chatDress(){
    var L = lvl();
    [].slice.call(document.querySelectorAll(".msg-av")).forEach(function(a){
      var m = a.closest(".msg");
      if (m && /(^|\s)(me|user|mine|human)(\s|$)/i.test(m.className)) return;
      setDisc(a, L);
    });
    var chat = document.getElementById("view-chat"); if (!chat) return;
    var big=null, bw=0;
    [].slice.call(chat.querySelectorAll("img,svg")).forEach(function(x){
      if (x.closest(".composer,[class*='send'],.msg-av")) return;
      var r = x.getBoundingClientRect();
      if (r.width>bw && r.width>=110 && r.width<560){ big=x; bw=r.width; }
    });
    if (false && big){ /* hero restored - v111: big A is never touched */ }
  }
  function solo(){
    var panel = view && view.querySelector(".pkg100"); if (!panel) return;
    if (panel.parentElement !== view) view.insertBefore(panel, view.firstChild);
    if (panel.hidden) panel.hidden = false;
    [].slice.call(view.children).forEach(function(el){
      if (el===panel || el.tagName==="STYLE" || el.tagName==="SCRIPT") return;
      if (getComputedStyle(el).display !== "none") el.style.setProperty("display","none","important");
    });
    [].slice.call(panel.querySelectorAll(".pkg100-row")).forEach(function(r){
      var mg = r.querySelector(".pkg100-mg"); if (!mg) return;
      var k = r.dataset.k || lvl();
      if (mg.dataset.m109 !== k){ mg.dataset.m109 = k; mg.innerHTML = mark(k); }
    });
  }
  function all(){ topbar(); chatDress(); solo(); }

  /* instant reaction: any write of the level key re-lights everything in 30ms */
  try {
    var _set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v){
      _set.apply(this, arguments);
      if (k === "alfred_module_package") setTimeout(all, 30);
    };
  } catch(e) {}
  try { window.addEventListener("storage", function(e){ if (e && e.key === "alfred_module_package") all(); }); } catch(e2) {}

  all();
  setInterval(all, 900);
  document.addEventListener("click", function(){ setTimeout(all, 260); }, true);
})();

/* v110 retired by v111 - hero stays original */

/* ===== v111: chat avatars wear the FULL level mark ===== */
(function () {
  if (window.__v111) return; window.__v111 = "1";
  var CL = {
    Free:  { a:"#93a6c4", b:"#e8f0fc", core:"#e6edf8", glow:"rgba(165,190,225,.5)",  beat:"4.8s" },
    Pro:   { a:"#2f7cff", b:"#9fe8ff", core:"#eaf8ff", glow:"rgba(90,190,255,.85)",  beat:"2.6s" },
    Ultra: { a:"#ff9d3c", b:"#ffeab2", core:"#fff3d6", glow:"rgba(255,195,110,.95)", beat:"1.7s" }
  };
  function lvl(){ try{ var k=localStorage.getItem("alfred_module_package"); return CL[k]?k:"Free"; }catch(e){ return "Free"; } }
  function mark(L){
    var c=CL[L], id="vg111"+L, ring="";
    if(L==="Free") ring='<circle cx="24" cy="24" r="17" fill="none" stroke="'+c.a+'" stroke-opacity=".3" stroke-width="1.1"/>';
    else if(L==="Pro")
      ring='<g class="alv-orb" style="animation-duration:9s">'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round"/>'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round" transform="rotate(180 24 24)"/></g>';
    else
      ring='<g class="alv-orb" style="animation-duration:7s">'
        +'<circle cx="24" cy="24" r="18" fill="none" stroke="#ffd98a" stroke-opacity=".6" stroke-width="1.3" stroke-dasharray="86 27" stroke-linecap="round"/></g>'
        +'<path d="M24 2.4l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#ffeab2"/>'
        +'<circle cx="9" cy="12" r="1" fill="#ffeab2" opacity=".7"/><circle cx="39.5" cy="34" r=".9" fill="#ffeab2" opacity=".5"/>';
    function leg(d){
      return '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="7.6" stroke-linecap="round" opacity=".2" fill="none"/>'
           + '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
           + '<path d="'+d+'" stroke="'+c.core+'" stroke-width="1.1" stroke-linecap="round" opacity=".45" fill="none"/>';
    }
    return '<svg viewBox="0 0 48 48" class="alfmark104" aria-hidden="true">'
      +'<defs>'
      +'<linearGradient id="'+id+'" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="'+c.a+'"/><stop offset="1" stop-color="'+c.b+'"/></linearGradient>'
      +'<radialGradient id="'+id+'h"><stop offset="0" stop-color="'+c.glow+'" stop-opacity=".4"/><stop offset="1" stop-color="'+c.glow+'" stop-opacity="0"/></radialGradient>'
      +'<filter id="'+id+'f" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      +'</defs>'
      +'<circle cx="24" cy="24" r="21" fill="url(#'+id+'h)"/>'+ring
      +'<g filter="url(#'+id+'f)">'+leg("M24 9.5 13 38.5")+leg("M24 9.5 35 38.5")
      +'<path d="M17.6 28.6h12.8" stroke="url(#'+id+')" stroke-width="3" stroke-linecap="round"/></g>'
      +'<circle cx="24" cy="9.5" r="2.1" fill="'+c.core+'"><animate attributeName="opacity" values="1;.45;1" dur="'+c.beat+'" repeatCount="indefinite"/></circle>'
      +'</svg>';
  }
  function dress(){
    var L = lvl();
    [].slice.call(document.querySelectorAll(".msg-av")).forEach(function (a) {
      var m = a.closest(".msg");
      if (m && /(^|\s)(me|user|mine|human)(\s|$)/i.test(m.className)) return;
      if (a.dataset.f111 !== L) { a.dataset.f111 = L; a.innerHTML = mark(L); }
    });
    [].slice.call(document.querySelectorAll(".hero110w")).forEach(function (w) {  /* safety: unwrap the big A */
      while (w.firstChild) w.parentNode.insertBefore(w.firstChild, w);
      w.remove();
    });
  }
  dress(); setInterval(dress, 800);
  document.addEventListener("click", function () { setTimeout(dress, 300); }, true);
  try {
    var _s = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      _s.apply(this, arguments);
      if (k === "alfred_module_package") setTimeout(dress, 40);
    };
  } catch (e) {}
})();

/* ===== v112: full level mark in topbar + New Chat disc ===== */
(function () {
  if (window.__v112) return; window.__v112 = "1";
  var CL = {
    Free:  { a:"#93a6c4", b:"#e8f0fc", core:"#e6edf8", glow:"rgba(165,190,225,.5)",  beat:"4.8s" },
    Pro:   { a:"#2f7cff", b:"#9fe8ff", core:"#eaf8ff", glow:"rgba(90,190,255,.85)",  beat:"2.6s" },
    Ultra: { a:"#ff9d3c", b:"#ffeab2", core:"#fff3d6", glow:"rgba(255,195,110,.95)", beat:"1.7s" }
  };
  function lvl(){ try{ var k=localStorage.getItem("alfred_module_package"); return CL[k]?k:"Free"; }catch(e){ return "Free"; } }
  function mark(L){
    var c=CL[L], id="vg112"+L, ring="";
    if(L==="Free") ring='<circle cx="24" cy="24" r="17" fill="none" stroke="'+c.a+'" stroke-opacity=".3" stroke-width="1.1"/>';
    else if(L==="Pro")
      ring='<g class="alv-orb" style="animation-duration:9s">'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round"/>'
        +'<circle cx="24" cy="24" r="17.5" fill="none" stroke="#7fd7ff" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="40 70" stroke-linecap="round" transform="rotate(180 24 24)"/></g>';
    else
      ring='<g class="alv-orb" style="animation-duration:7s">'
        +'<circle cx="24" cy="24" r="18" fill="none" stroke="#ffd98a" stroke-opacity=".6" stroke-width="1.3" stroke-dasharray="86 27" stroke-linecap="round"/></g>'
        +'<path d="M24 2.4l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#ffeab2"/>'
        +'<circle cx="9" cy="12" r="1" fill="#ffeab2" opacity=".7"/><circle cx="39.5" cy="34" r=".9" fill="#ffeab2" opacity=".5"/>';
    function leg(d){
      return '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="7.6" stroke-linecap="round" opacity=".2" fill="none"/>'
           + '<path d="'+d+'" stroke="url(#'+id+')" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
           + '<path d="'+d+'" stroke="'+c.core+'" stroke-width="1.1" stroke-linecap="round" opacity=".45" fill="none"/>';
    }
    return '<svg viewBox="0 0 48 48" class="alfmark104" aria-hidden="true">'
      +'<defs>'
      +'<linearGradient id="'+id+'" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="'+c.a+'"/><stop offset="1" stop-color="'+c.b+'"/></linearGradient>'
      +'<radialGradient id="'+id+'h"><stop offset="0" stop-color="'+c.glow+'" stop-opacity=".4"/><stop offset="1" stop-color="'+c.glow+'" stop-opacity="0"/></radialGradient>'
      +'<filter id="'+id+'f" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      +'</defs>'
      +'<circle cx="24" cy="24" r="21" fill="url(#'+id+'h)"/>'+ring
      +'<g filter="url(#'+id+'f)">'+leg("M24 9.5 13 38.5")+leg("M24 9.5 35 38.5")
      +'<path d="M17.6 28.6h12.8" stroke="url(#'+id+')" stroke-width="3" stroke-linecap="round"/></g>'
      +'<circle cx="24" cy="9.5" r="2.1" fill="'+c.core+'"><animate attributeName="opacity" values="1;.45;1" dur="'+c.beat+'" repeatCount="indefinite"/></circle>'
      +'</svg>';
  }
  function ringOn(el, L){
    el.classList.add("lvldisc");
    ["Free","Pro","Ultra"].forEach(function(k){ el.classList.toggle("lvldisc-"+k, k===L); });
  }
  function topbarDisc(){
    var t = document.querySelector("[data-t105]");
    if (!t){
      var all = document.querySelectorAll("body *");
      for (var i=0;i<all.length;i++){ var e=all[i];
        if (!e.children.length && (e.textContent||"").trim()==="General AI"){ t=e; break; } }
    }
    if (!t) return null;
    var tr=t.getBoundingClientRect();
    var root=t.closest("header,[class*='topbar'],[class*='top-bar'],[class*='chat-top']")||t.parentElement.parentElement||document.body;
    var best=null,bg=1e9;
    [].slice.call(root.querySelectorAll("*")).forEach(function(el){
      if(el===t||t.contains(el)||el.contains(t))return;
      var r=el.getBoundingClientRect();
      if(r.width<26||r.width>76||r.height<26||r.height>76)return;
      if(Math.abs(r.width-r.height)>14)return;
      var br=parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;
      if(br<r.width*.35&&br<16)return;
      var gap=tr.left-r.right; if(gap<-8||gap>90)return;
      if(Math.abs((r.top+r.height/2)-(tr.top+tr.height/2))>32)return;
      if(gap<bg){bg=gap;best=el;}
    });
    return best;
  }
  function newChatDisc(){
    var t=null, all=document.querySelectorAll("body *");
    for(var i=0;i<all.length;i++){ var e=all[i];
      if(!e.children.length&&(e.textContent||"").trim()==="New Chat"){ t=e; break; } }
    if(!t)return null;
    var row=t.closest("button,[role=button],a,[class*='row'],[class*='card'],div")||t.parentElement;
    if(!row)return null;
    var best=null,bs=1e9;
    [].slice.call(row.querySelectorAll("*")).forEach(function(el){
      if(el===t||el.contains(t))return;
      var r=el.getBoundingClientRect();
      if(r.width<26||r.width>70)return;
      if(Math.abs(r.width-r.height)>12)return;
      var br=parseFloat(getComputedStyle(el).borderTopLeftRadius)||0;
      if(br<r.width*.4&&br<14)return;
      var s=r.width*r.height; if(s<bs){bs=s;best=el;}
    });
    return best;
  }
  function dress(){
    var L=lvl(), a=topbarDisc(), n=newChatDisc();
    if(a){ if(a.dataset.f112!==L){ a.dataset.f112=L; a.innerHTML=mark(L); } ringOn(a,L); }
    if(n){ if(n.dataset.f112!==L){ n.dataset.f112=L; n.innerHTML=mark(L); } ringOn(n,L); }
  }
  dress(); setInterval(dress, 800);
  document.addEventListener("click", function(){ setTimeout(dress, 300); }, true);
  try {
    var _s = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k,v){
      _s.apply(this, arguments);
      if (k === "alfred_module_package") setTimeout(dress, 40);
    };
  } catch(e){}
})();

/* ===== v113: VIP welcome ceremony for Pro & Ultra ===== */
(function () {
  if (window.__v113) return; window.__v113 = "1";
  function lvl(){ try{ var k=localStorage.getItem("alfred_module_package"); return {Free:1,Pro:1,Ultra:1}[k]?k:"Free"; }catch(e){ return "Free"; } }
  function who(){ try{ var n=localStorage.getItem("alfred_name")||"friend"; return n.charAt(0).toUpperCase()+n.slice(1); }catch(e){ return "friend"; } }
  function part(){ var h=new Date().getHours(); return h<12?"morning":(h<18?"afternoon":"evening"); }
  function html(L, w){
    if (L==="Pro") return '<span class="vip-badge">\u26A1 PRO \u00b7 MINDS ON SHIFT</span>'
      + '<p><b>Good ' + part() + ', ' + w + '.</b> You\u2019re running <b class="vipw-Pro">Pro</b> \u2014 six latest-generation minds are on shift for you right now. No limits. No waiting. The fast lane is yours \u2014 what are we building?</p>';
    if (L==="Ultra") return '<span class="vip-badge">\uD83D\uDC51 ULTRA \u00b7 THE FULL MIND</span>'
      + '<p><b>Welcome to the future, ' + w + '.</b> Every apex mind I have \u2014 and the <b class="vipw-Ultra">Deep-think Council</b> \u2014 stand with you tonight. Ask one question and they answer as one. Here, tomorrow isn\u2019t coming. <b>It\u2019s already answering.</b></p>';
    return "";
  }
  function dress(){
    var L = lvl();
    var g = document.querySelector("#view-chat .msg.ai"); if (!g) return;
    var b = g.querySelector(".bubble"); if (!b) return;
    if (b.dataset.v113lvl === L) return;
    if (!b.dataset.v113scan) {                       /* remember the default words, once */
      b.dataset.v113scan = "1";
      var hid = [];
      [].slice.call(b.childNodes).forEach(function (n) {
        var t = n.nodeType === 3 ? (n.nodeValue || "") : (n.textContent || "");
        if (/hello|companion|help you today/i.test(t)) hid.push(n);
      });
      b.__v113hid = hid;
    }
    var old = b.querySelector(".vip"); if (old) old.remove();
    (b.__v113hid || []).forEach(function (n) {       /* default words hide on VIP, return on Free */
      if (n.nodeType === 3) {
        if (!n.__w113) { var s = document.createElement("span"); s.className="v113h";
          n.parentNode.insertBefore(s, n); s.appendChild(n); n.__w113 = s; }
        n.__w113.style.display = (L === "Free") ? "" : "none";
      } else n.style.display = (L === "Free") ? "" : "none";
    });
    if (L !== "Free") {
      var d = document.createElement("div");
      d.className = "vip vip-" + L; d.innerHTML = html(L, who());
      b.insertBefore(d, b.firstChild);
    }
    b.classList.remove("vip-Pro","vip-Ultra");
    if (L !== "Free") b.classList.add("vip-" + L);
    b.dataset.v113lvl = L;
  }
  dress(); setInterval(dress, 900);
  document.addEventListener("click", function(){ setTimeout(dress, 300); }, true);
  try {
    var _s = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k,v){
      _s.apply(this, arguments);
      if (k === "alfred_module_package") setTimeout(dress, 40);
    };
  } catch(e){}
})();

/* ===== v114: responsive history fit ===== */
(function () {
  if (window.__v114History) return;
  window.__v114History = true;
  var view = document.getElementById("view-history");
  if (!view) return;

  function excluded(el) {
    return el.closest(".cn-nodes,.const-nodes,.pkg100,.hpreview114,.hspin114");
  }
  function stamp() {
    /* find + pin the selected-chat preview by its content, not an assumed class */
    var preview = null, previewLen = Infinity;
    [].slice.call(view.querySelectorAll("div,article,section,aside")).forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/view chat/i.test(t) && /\bmessages?\b/i.test(t) && t.length < previewLen) {
        preview = el; previewLen = t.length;
      }
    });
    if (preview) {
      preview.classList.add("hpreview114");
      view.classList.add("hhaspreview114");
    } else view.classList.remove("hhaspreview114");

    /* find the parent whose direct children are repeated history cards */
    var best = null, bestScore = 0;
    [].slice.call(view.querySelectorAll("*")).forEach(function (p) {
      if (excluded(p)) return;
      var groups = {};
      [].slice.call(p.children).forEach(function (c) {
        if (excluded(c)) return;
        var t = (c.textContent || "").replace(/\s+/g, " ").trim();
        if (t.length < 12 || t.length > 1800) return;
        var cls = (typeof c.className === "string" ? c.className : "")
          .split(/\s+/).filter(function (x) {
            return x && !/^(active|selected|current|open|focused)$/.test(x);
          }).sort().join(".");
        var key = c.tagName + "." + cls;
        (groups[key] = groups[key] || []).push(c);
      });
      Object.keys(groups).forEach(function (key) {
        var cards = groups[key];
        if (cards.length < 3) return;
        var bonus = /card|item|history|chat|session|entry/i.test(key) ? 25 : 0;
        var score = cards.length * 100 + bonus;
        if (score > bestScore) { best = { parent: p, cards: cards }; bestScore = score; }
      });
    });

    view.querySelectorAll(".hgrid114").forEach(function (el) {
      if (!best || el !== best.parent) el.classList.remove("hgrid114");
    });
    view.querySelectorAll(".hcard114").forEach(function (el) {
      el.classList.remove("hcard114");
    });
    if (best) {
      best.parent.classList.add("hgrid114");
      best.cards.forEach(function (el) { el.classList.add("hcard114"); });
    }

    /* keep the memory-spin pill safely below the preview */
    var spin = null, spinLen = Infinity;
    [].slice.call(view.querySelectorAll("*")).forEach(function (el) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/spin to explore your memories/i.test(t) && t.length < spinLen) {
        spin = el; spinLen = t.length;
      }
    });
    if (spin) (spin.closest("button,a,[role='button']") || spin).classList.add("hspin114");
  }

  var timer;
  function schedule() { clearTimeout(timer); timer = setTimeout(stamp, 120); }
  stamp();
  new MutationObserver(schedule).observe(view, {
    childList: true, subtree: true, characterData: true
  });
})();

/* ===== v115: sidebar tier label ===== */
(function () {
  if (window.__v115Plan) return; window.__v115Plan = true;
  function tier() {
    try {
      var t = localStorage.getItem("alfred_module_package") || "Free";
      return /^(Free|Pro|Ultra)$/i.test(t) ? t[0].toUpperCase()+t.slice(1).toLowerCase() : "Free";
    } catch (e) { return "Free"; }
  }
  function update() {
    var root = document.querySelector(".side-foot") ||
      document.querySelector("aside,[class*='sidebar'],[class*='side-bar']");
    if (!root) return;
    [].slice.call(root.querySelectorAll("*")).forEach(function (el) {
      if (/^(free|pro|ultra)\s+plan$/i.test((el.textContent||"").trim()) &&
          ![].slice.call(el.children).some(function (c) {
            return /^(free|pro|ultra)\s+plan$/i.test((c.textContent||"").trim());
          })) el.textContent = "Selected: " + tier();
    });
  }
  update();
  window.addEventListener("storage", update);
  setInterval(update, 1000);
})();

/* ===== v115: Android Back = view history ===== */
(function () {
  if (window.__v115Routes) return; window.__v115Routes = true;
  var lastRoute = null, suppressRoute = null, suppressTimer = 0;
  function fromId(id) {
    id = (id || "").toLowerCase();
    if (/plans?|pricing/.test(id)) return "plans";
    if (/modules?/.test(id)) return "modules";
    if (/history/.test(id)) return "history";
    if (/explore/.test(id)) return "explore";
    if (/settings?/.test(id)) return "settings";
    if (/chat/.test(id)) return "chat";
    return null;
  }
  function currentRoute() {
    var found = null, score = -1;
    [].slice.call(document.querySelectorAll('[id^="view-"]')).forEach(function (el) {
      var cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (cs.display === "none" || cs.visibility === "hidden" || !r.width || !r.height) return;
      var route = fromId(el.id); if (!route) return;
      var n = (el.classList.contains("active") || el.classList.contains("show")) ? 2 : 1;
      if (n > score) { found = route; score = n; }
    });
    return found;
  }
  function routeFromHash() {
    var m = (location.hash || "").match(/^#\/?([a-z-]+)/i);
    if (!m) return null;
    var r = m[1].toLowerCase();
    if (r === "plan" || r === "pricing") r = "plans";
    return /^(chat|explore|modules|history|plans|settings)$/.test(r) ? r : null;
  }
  function sidebar() {
    var foot = document.querySelector(".side-foot");
    return (foot && foot.closest("aside,[class*='sidebar'],[class*='side-bar']")) ||
      document.querySelector("aside,[class*='sidebar'],[class*='side-bar']") || document;
  }
  function navClick(route) {
    var aliases = route === "plans" ? ["plans", "plan", "pricing"] : [route];
    var root = sidebar();
    var clickables = [].slice.call(root.querySelectorAll("a,button,[role='button'],[onclick]"));
    var hit = clickables.filter(function (el) {
      return aliases.indexOf((el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase()) >= 0;
    })[0];
    if (!hit) hit = [].slice.call(root.querySelectorAll("*")).filter(function (el) {
      return aliases.indexOf((el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase()) >= 0;
    })[0];
    if (hit) hit.click();
    return !!hit;
  }
  function go(route) {
    if (!route || currentRoute() === route) return;
    suppressRoute = route;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(function () { suppressRoute = null; }, 1400);
    navClick(route);
  }
  function sync() {
    var route = currentRoute(); if (!route) return;
    if (suppressRoute) {
      if (route === suppressRoute) { lastRoute = route; suppressRoute = null; }
      return;
    }
    if (route === lastRoute) return;
    lastRoute = route;
    if (location.hash !== "#/" + route)
      history.pushState({ alfredRoute: route }, "", "#/" + route);
  }
  function restoreRoute() {
    var route = routeFromHash();
    if (route && route !== currentRoute()) go(route);
  }
  var initial = routeFromHash(), visible = currentRoute();
  if (initial && initial !== visible) go(initial);
  else if (visible) {
    lastRoute = visible;
    if (!initial) history.replaceState({ alfredRoute: visible }, "", "#/" + visible);
  }
  window.addEventListener("popstate", restoreRoute);
  window.addEventListener("hashchange", restoreRoute);
  new MutationObserver(function () { setTimeout(sync, 80); })
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
  setInterval(sync, 650);
})();

/* ===== v115: composer lifts above the keyboard ===== */
(function () {
  if (window.__v115Keyboard) return; window.__v115Keyboard = true;
  var chat = document.getElementById("view-chat"), wasOpen = false;
  function update() {
    if (!chat) return;
    var composer = chat.querySelector(".composer"); if (!composer) return;
    var vv = window.visualViewport;
    var overlap = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    if (overlap < 120) overlap = 0;
    var pos = getComputedStyle(composer).position;
    var canLift = pos === "fixed" || pos === "absolute";
    composer.style.setProperty("--alfred-kbd-overlap", Math.round(overlap) + "px");
    composer.classList.toggle("alfred-kbd-lift", !!overlap && canLift);
    var open = !!overlap;
    if (open && !wasOpen && getComputedStyle(chat).display !== "none") {
      var scroller = chat.querySelector(".messages,.chat-messages,.chat-scroll,.conversation");
      if (scroller && scroller.scrollHeight > scroller.clientHeight + 24)
        scroller.scrollTop = scroller.scrollHeight;
    }
    wasOpen = open;
  }
  window.addEventListener("resize", update);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", update);
    visualViewport.addEventListener("scroll", update);
  }
  setInterval(update, 700);
  update();
})();

/* ===== v115: undo deleted chat ===== */
(function () {
  if (window.__v115Undo) return; window.__v115Undo = true;
  var KEY = "alfred_history", previous = [], restore = null, timer = 0, toast = null;
  function read() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  previous = read();
  function historyNav(label) {
    var foot = document.querySelector(".side-foot");
    var root = (foot && foot.closest("aside,[class*='sidebar'],[class*='side-bar']")) ||
      document.querySelector("aside,[class*='sidebar'],[class*='side-bar']") || document;
    return [].slice.call(root.querySelectorAll("a,button,[role='button'],[onclick],*")).filter(function (el) {
      return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase() === label;
    })[0];
  }
  function refreshHistory() {
    var h = historyNav("history"), c = historyNav("chat");
    if (!h) { location.reload(); return; }
    if (document.getElementById("view-history") &&
        getComputedStyle(document.getElementById("view-history")).display !== "none" && c) {
      c.click();
      setTimeout(function () { h.click(); }, 180);
    } else h.click();
  }
  function hide() { if (toast) toast.remove(); toast = null; clearTimeout(timer); }
  function show() {
    hide();
    toast = document.createElement("div");
    toast.className = "v115-undo";
    toast.setAttribute("role", "status");
    toast.innerHTML = '<span>Chat deleted</span><button type="button">Undo</button>';
    document.body.appendChild(toast);
    toast.querySelector("button").addEventListener("click", function () {
      if (!restore) return;
      try { localStorage.setItem(KEY, JSON.stringify(restore)); previous = restore.slice(); } catch (e) {}
      hide(); refreshHistory();
    });
    timer = setTimeout(hide, 6000);
  }
  setInterval(function () {
    var now = read();
    if (now.length < previous.length) { restore = previous.slice(); show(); }
    previous = now;
  }, 1200);
})();

/* v118 retired by v119 */

/* v119 retired by v123 */

/* ===== v122: Settings sign-out ===== */
(function () {
  if (window.__v122) return;
  window.__v122 = true;

  var busy = false, sheet = null, rootObserver = null;

  function inject(view) {
    if (!view || view.querySelector('[data-v122="1"]')) return;
    var existing = [].slice.call(view.querySelectorAll("*")).some(function (el) {
      return /^(sign out|logout)$/i.test((el.textContent || "").trim());
    });
    if (existing) return;

    var wrap = document.createElement("div");
    wrap.className = "v122-signout";
    wrap.dataset.v122 = "1";
    wrap.innerHTML =
      '<div class="v122-so-h">Account</div>' +
      '<button type="button" class="v122-so-btn">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M13 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6"/>' +
          '<path d="M10 16l4-4-4-4M14 12H3"/>' +
        '</svg><span>Sign Out</span>' +
      '</button>';
    view.appendChild(wrap);
  }

  function bindView() {
    var view = document.getElementById("view-settings");
    if (!view) {
      if (document.body && !rootObserver) {
        rootObserver = new MutationObserver(bindView);
        rootObserver.observe(document.body, { childList: true, subtree: true });
      }
      return;
    }
    if (rootObserver) { rootObserver.disconnect(); rootObserver = null; }
    if (view.dataset.v122Watch) { inject(view); return; }
    view.dataset.v122Watch = "1";
    inject(view);
    var timer;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () { inject(view); }, 50);
    }).observe(view, { childList: true, subtree: true });
  }

  function toast(message) {
    var old = document.querySelector(".v122-toast");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "v122-toast";
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2500);
  }

  function closeSheet() {
    if (sheet) sheet.remove();
    sheet = null;
  }

  function openSheet() {
    if (busy || sheet) return;
    sheet = document.createElement("div");
    sheet.className = "v122-sheet";
    sheet.setAttribute("role", "presentation");
    sheet.innerHTML =
      '<div class="v122-sheet-card" role="dialog" aria-modal="true" aria-labelledby="v122-title">' +
        '<h2 id="v122-title">Sign out of Alfred?</h2>' +
        '<p>Your chats stay safely on this device.</p>' +
        '<button type="button" class="v122-sheet-cancel">Cancel</button>' +
        '<button type="button" class="v122-sheet-go">Sign Out</button>' +
      '</div>';
    document.body.appendChild(sheet);

    sheet.addEventListener("click", function (e) {
      if (e.target === sheet || e.target.closest(".v122-sheet-cancel")) {
        if (!busy) closeSheet();
        return;
      }
      if (!e.target.closest(".v122-sheet-go") || busy) return;

      busy = true;
      var go = sheet.querySelector(".v122-sheet-go");
      go.disabled = true;
      go.textContent = "Signing out…";

      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) throw new Error("logout failed");
          return r.json();
        })
        .then(function (data) {
          if (!data || data.ok !== true) throw new Error("logout failed");
          try {
            localStorage.removeItem("alfred_authed");
            localStorage.removeItem("alfred_name");
          } catch (e) {}
          location.reload();
        })
        .catch(function () {
          busy = false;
          closeSheet();
          toast("Could not sign out. Check the backend is running.");
        });
    });
  }

  document.addEventListener("click", function (e) {
    var button = e.target.closest && e.target.closest(".v122-so-btn");
    if (!button) {
      var candidate = e.target.closest &&
        e.target.closest("#view-settings button, #view-settings [role='button']");
      if (candidate && /^(sign out|logout)$/i.test((candidate.textContent || "").trim()))
        button = candidate;
    }
    if (!button) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    openSheet();
  }, true);

  bindView();
  document.addEventListener("DOMContentLoaded", bindView);
})();

/* ===== v123: auth v6 — the server is the only door ===== */
(function () {
  if (window.__v123) return; window.__v123 = "1";
  var allowNative = false;   /* only OUR verified flow may touch the app's login */

  function api(p, body, method) {
    return fetch(p, { method: method || "POST", credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; })
        .then(function (j) { j._code = r.status; return j; }); });
  }
  function cardOf(el) {
    var best = null, bestN = Infinity, x = el;
    while (x && x !== document.body) {
      if (x.querySelector && x.querySelector('input[type="password"]')) {
        var n = x.querySelectorAll("*").length;
        if (n < bestN) { best = x; bestN = n; }
      }
      x = x.parentElement;
    }
    return best;
  }
  function scope(card) { return card.querySelector("form") || card; }
  function field(sc, re, type) {
    var ins = sc.querySelectorAll("input");
    for (var i = 0; i < ins.length; i++) {
      var el = ins[i];
      if (type && el.type === type) return el;
      var label = ((el.closest("label") || {}).textContent || "") + " " +
        ((el.previousElementSibling || {}).textContent || "") + " " + (el.placeholder || "");
      if (!type && re.test(label)) return el;
    }
    return null;
  }
  function clean(v) { return (v || "").replace(/[\u200b-\u200f\ufeff]/g, "").trim(); }
  function errIn(card, btn, msg) {
    var e = card.querySelector(".v123-err");
    if (!e) { e = document.createElement("div"); e.className = "v123-err";
      (btn.parentElement || card).insertBefore(e, btn.nextSibling); }
    e.textContent = msg; e.style.display = "block";
  }
  function toast(msg) {
    var d = document.createElement("div"); d.className = "v123-toast";
    d.textContent = msg; document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 4000);
  }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 10 && r.height > 10; }
  function appVisible() {
    var a = document.querySelector("aside, .composer, [class*='sidebar'], [class*='side-bar'], [class*='topbar']");
    if (a && vis(a)) return true;
    var vs = document.querySelectorAll("[id^='view-']");
    for (var i = 0; i < vs.length; i++) if (vis(vs[i])) return true;
    return false;
  }
  function stillLoading() {
    var els = document.querySelectorAll("div,section,p,span");
    for (var i = 0; i < els.length; i++) {
      if (!vis(els[i])) continue;
      var t = (els[i].textContent || "").toLowerCase();
      if (/initializing|neural sanctuary|loading\.\.\./.test(t) && t.length < 200) return true;
    }
    return false;
  }
  function findGate() {
    var best = null, bestN = Infinity;
    [].slice.call(document.querySelectorAll("div,section,form,article")).forEach(function (el) {
      if (!vis(el) || !el.querySelector || !el.querySelector('input[type="password"]')) return;
      var t = (el.textContent || "").toLowerCase();
      if (!/(sign in|welcome back|create (your )?account)/.test(t)) return;
      var n = el.querySelectorAll("*").length;
      if (n < bestN) { best = el; bestN = n; }
    });
    return best;
  }
  var setName = false;
  function rememberName(user) {
    if (setName) return; setName = true;
    try { localStorage.setItem("alfred_name", (user && user.name) || "Fred");
          localStorage.setItem("alfred_authed", "1"); } catch (e) {}
  }
  var tries = 0;
  function watch() {
    if (appVisible()) { hideGate(); clearInterval(wt); return; }
    if (stillLoading()) return;
    tries++;
    if (tries % 2 === 1 && tries <= 10) {
      var gate = findGate();
      if (gate) {
        var btn = [].slice.call(gate.querySelectorAll("button")).filter(function (x) {
          return /sign in/i.test(x.textContent || "");
        })[0];
        if (btn) {
          allowNative = true;                 /* our verified click, and only this one */
          /* v184: auto-click removed - Alfred never presses Sign In for you */
          allowNative = false;
        }
      }
    }
    if (tries === 24) {
      clearInterval(wt);
      /* v183: phantom toast removed - it faked sign-in */
    }
  }
  function hideGate() {
    var gate = findGate(); if (!gate) return;
    gate.dataset.v123done = "1";
    gate.style.setProperty("display", "none", "important");
  }
  var wt = null;
  function startWatch() { if (!wt) { wt = setInterval(watch, 350); watch(); } }

  var busy = false;
  function go(btn) {
    if (busy) return;
    var t = (btn.textContent || "").toLowerCase();
    var up = /create|register|sign up/.test(t);
    var card = cardOf(btn); if (!card) return;
    var sc = scope(card);
    var pass = sc.querySelector('input[type="password"]') || card.querySelector('input[type="password"]');
    var email = field(sc, /email|example\.com/) || field(card, /email|example\.com/);
    if (!email || !pass) return;
    var ev = clean(email.value), pv = pass.value || "";
    var name = up ? (field(sc, /full name|your name/) || field(card, /full name|your name/)) : null;
    function fail(m) { errIn(card, btn, m); }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ev)) return fail("Enter a valid email address.");
    if (pv.length < 8) return fail("Password must be at least 8 characters.");
    if (up && name && clean(name.value).length < 2) return fail("Enter your name.");
    var e = card.querySelector(".v123-err"); if (e) e.style.display = "none";
    busy = true;
    api(up ? "/api/auth/register" : "/api/auth/login",
        up ? { name: clean(name && name.value) || "Friend", email: ev, password: pv }
           : { email: ev, password: pv,
               remember: !!(function () { var r = field(sc, /remember/);
                 return r && r.type === "checkbox" && r.checked; })() })
      .then(function (j) {
        if (j && j.ok) { rememberName(j.user); startWatch(); }
        else fail((j && j.error) || "Something went wrong. Try again.");
      })
      .catch(function () { fail("Cannot reach Alfred's servers. Is the backend running?"); })
      .then(function () { busy = false; });
  }
  function isAuthBtn(b) {
    if (!b || b.tagName === "A") return false;
    var t = (b.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!/sign in|create account|create your account/.test(t)) return false;
    if (/google|github|discord/.test(t)) return false;
    return !!cardOf(b);
  }
  /* capture phase: runs before the app's own demo handler can */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("button,[role='button'],a");
    if (!b) return;
    var t = (b.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (/forgot password|terms of service|privacy policy/.test(t)) {
      ev.preventDefault();
      toast("Coming soon \u2728");
      return;
    }
    if (isAuthBtn(b)) {
      if (allowNative) return;              /* our watcher's click — let it flow */
      ev.preventDefault(); ev.stopPropagation();
      if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      go(b);
    }
  }, true);
  document.addEventListener("submit", function (ev) {
    var f = ev.target;
    if (f && f.querySelector && f.querySelector('input[type="password"]') && !allowNative)
      ev.preventDefault();
  }, true);
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" || !ev.target || ev.target.tagName !== "INPUT") return;
    var card = cardOf(ev.target); if (!card) return;
    var btn = [].slice.call(card.querySelectorAll("button")).filter(function (x) {
      return /sign in|create account/i.test(x.textContent || "");
    })[0];
    if (btn) { ev.preventDefault(); ev.stopPropagation(); go(btn); }
  }, true);

  api("/api/auth/me", null, "GET").then(function (j) {
    if (j && j.ok) { rememberName(j.user); startWatch(); }
    else { try { localStorage.removeItem("alfred_authed"); } catch (e) {} }
  }).catch(function () {});
})();

/* ===== v124: ToS/Privacy sheets + real Google/GitHub/Discord OAuth ===== */
(function () {
  if (window.__v124) return; window.__v124 = "1";

  var TOS =
    "<h3>1. Acceptance</h3><p>By creating an account or using Alfred AI you agree to these Terms. If you do not agree, please do not use the service.</p>" +
    "<h3>2. The Service</h3><p>Alfred is an intelligent assistant that unifies multiple AI engines behind one character. Capabilities and features may evolve as Alfred improves.</p>" +
    "<h3>3. Your Account</h3><p>You are responsible for keeping your credentials safe and for activity under your account. You can end any session anytime via Sign Out.</p>" +
    "<h3>4. Acceptable Use</h3><p>No unlawful, harmful, deceptive or abusive use. No attempts to disrupt the service, bypass limits, or access other people's data.</p>" +
    "<h3>5. Subscriptions</h3><p>Paid plans are billed through the payment provider shown at checkout and renew until cancelled. Refunds follow the policy presented at purchase.</p>" +
    "<h3>6. Availability</h3><p>The service is provided as is. We work hard to keep Alfred fast and available, but features and response quality may change over time.</p>" +
    "<h3>7. Suspension &amp; Termination</h3><p>You may stop using Alfred at any time. Accounts that violate these Terms may be limited or suspended.</p>" +
    "<h3>8. Changes</h3><p>These Terms may be updated as Alfred grows. Continued use after an update means you accept the revised Terms.</p>" +
    "<div class=v124-f>Alfred AI — Your Mind, Amplified. Questions? Settings → Support.</div>";

  var PRIV =
    "<h3>1. What we collect</h3><p>Your name, email, the chats and prompts you send, your preferences, and basic sign-in details if you use a provider like Google.</p>" +
    "<h3>2. Where it lives</h3><p>Your data is stored on this device and on Alfred's servers. Chats stay in your History until you delete them.</p>" +
    "<h3>3. Cookies</h3><p>One secure, HttpOnly session cookie keeps you signed in. No ad trackers. Ever.</p>" +
    "<h3>4. Third-party sign-in</h3><p>If you sign in with Google, GitHub or Discord, they share only what you approve there: your name and verified email.</p>" +
    "<h3>5. What we never do</h3><p>We never sell your personal data, never show ads, and never expose which engines work behind Alfred.</p>" +
    "<h3>6. Your choices</h3><p>Sign out anytime from Settings, delete any chat from History, or request full account deletion via Settings → Support.</p>" +
    "<h3>7. Security</h3><p>Passwords are hashed, sessions are tokenized, and the server is the only door into your account. Found an issue? Tell us via Support.</p>" +
    "<div class=v124-f>Alfred AI — Your Mind, Amplified.</div>";

  function cardOf(el) {
    var best = null, bestN = Infinity, x = el;
    while (x && x !== document.body) {
      if (x.querySelector && x.querySelector('input[type="password"]')) {
        var n = x.querySelectorAll("*").length;
        if (n < bestN) { best = x; bestN = n; }
      }
      x = x.parentElement;
    }
    return best;
  }

  var sheet = null;
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; } }
  function openSheet(title, body) {
    closeSheet();
    sheet = document.createElement("div");
    sheet.className = "v124-sheet";
    sheet.innerHTML =
      '<div class="v124-card" role="dialog" aria-modal="true">' +
        '<button class="v124-x" type="button" aria-label="Close">&#10005;</button>' +
        '<div class="v124-brand"><span class="v124-mark">A</span>' + title + "</div>" +
        '<div class="v124-body">' + body + "</div></div>";
    document.body.appendChild(sheet);
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet || (e.target.closest && e.target.closest(".v124-x"))) closeSheet();
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  function detect(s) {
    if (/5865F2|20\.317/i.test(s)) return "discord";
    if (/M12 0c|M12 \.297/i.test(s)) return "github";
    if (/EA4335|4285F4|34A853|FBBC05/i.test(s)) return "google";
    return null;
  }
  function slotsAfter(card, mark) {
    return [].slice.call(card.querySelectorAll("button,a,[role=button]")).filter(function (b) {
      var s = b.querySelector("svg");
      if (!s || b.querySelectorAll("svg").length !== 1) return false;
      if (/[A-Za-z]{3}/.test((b.textContent || "").trim())) return false;
      return !!(mark.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
  }
  function orderDetect(el, card) {
    var mark = null, all = card.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      if (!all[i].children.length && /continue with|sign up with/i.test(all[i].textContent || "")) { mark = all[i]; break; }
    }
    if (!mark) return null;
    var slots = slotsAfter(card, mark);
    var host = el.closest("button,a,[role=button]") || el;
    var ix = slots.indexOf(host);
    return (ix > -1 && slots.length <= 4) ? (["google", "github", "discord"][ix] || null) : null;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var card = cardOf(t);
    var txt = (t.textContent || "").trim();
    if (card && /^(terms of service|privacy policy)$/i.test(txt)) {
      e.preventDefault(); e.stopImmediatePropagation();
      openSheet(/privacy/i.test(txt) ? "Privacy Policy" : "Terms of Service",
                /privacy/i.test(txt) ? PRIV : TOS);
      return;
    }
    if (!card) return;
    var host = t.closest("button,a,[role=button]") || t;
    var svg = host.querySelector ? host.querySelector("svg") : null;
    if (!svg || /[A-Za-z]{3}/.test((host.textContent || "").trim())) return;
    var p = detect(svg.innerHTML || "") || orderDetect(host, card);
    if (!p) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var h = (p === "google") ? "localhost" : location.hostname;
    window.location.href = location.protocol + "//" + h + ":8081/oauth/" + p;
  }, true);
})();

/* ===== v125: identity sync — the server session is the truth ===== */
(function () {
  if (window.__v125) return; window.__v125 = "1";
  function apply(name) {
    try {
      document.querySelectorAll("aside *, [class*='side'] *").forEach(function (el) {
        if (el.children.length === 0 && el.textContent && el.textContent.trim() &&
            ["Fred", "F"].indexOf(el.textContent.trim()) > -1) {
          el.textContent = (el.textContent.trim() === "F") ? name.charAt(0).toUpperCase() : name;
        }
      });
    } catch (e) {}
  }
  function boot() {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok || !j.user) return;                 /* guest: leave as is */
        var server = j.user.name || (j.user.email || "").split("@")[0] || "You";
        var local = localStorage.getItem("alfred_name") || "";
        if (local === server) { sessionStorage.removeItem("v125sync"); apply(server); return; }
        localStorage.setItem("alfred_name", server);
        if (sessionStorage.getItem("v125sync")) { apply(server); return; }  /* no reload loops */
        sessionStorage.setItem("v125sync", "1");
        /* v203: no reload — conductor routes */
      })
      .catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 300);
})();

/* ===== v126: login hardening UI — honeypot, strength meter, double-submit ===== */
(function () {
  if (window.__v126) return; window.__v126 = "1";

  var of = window.fetch;                       /* ride the honeypot into the register body */
  window.fetch = function (url, opts) {
    try {
      if (typeof url === "string" && url.indexOf("/api/auth/register") > -1 && opts && opts.body) {
        var hp = document.querySelector('input[name="website"]');
        var b = JSON.parse(opts.body);
        b.website = (hp && hp.value) || "";
        opts.body = JSON.stringify(b);
      }
    } catch (e) {}
    return of.apply(this, arguments);
  };

  function regCard() {
    var best = null, bestN = Infinity;
    [].slice.call(document.querySelectorAll("div,section,form,article")).forEach(function (el) {
      if (!el.querySelector || !el.querySelector('input[type="password"]')) return;
      if (!/create (your )?account|join the future/i.test(el.textContent || "")) return;
      var n = el.querySelectorAll("*").length;
      if (n < bestN) { best = el; bestN = n; }
    });
    return best;
  }
  function strength(p) {
    p = p || "";
    var d = /\d/.test(p), s = /[^A-Za-z0-9]/.test(p), u = /[A-Z]/.test(p);
    if (p.length < 8 || !d) return 0;
    if (p.length >= 12 && (s || u)) return 2;
    return 1;
  }
  function scan() {
    var card = regCard();
    if (!card) return;
    var pw = card.querySelector('input[type="password"]');
    if (pw && !card.querySelector('input[name="website"]')) {
      var hp = document.createElement("input");
      hp.type = "text"; hp.name = "website"; hp.autocomplete = "off";
      hp.tabIndex = -1; hp.setAttribute("aria-hidden", "true"); hp.className = "v126-hp";
      (pw.form || card).appendChild(hp);
    }
    if (pw && !card.querySelector(".v126-meter")) {
      var m = document.createElement("div");
      m.className = "v126-meter";
      m.innerHTML = "<span></span><span></span><span></span><i class='v126-mlbl'></i>";
      (pw.parentElement || card).insertBefore(m, pw.nextSibling);
      var lbl = m.querySelector(".v126-mlbl"), words = ["Too weak", "Good", "Strong"];
      pw.addEventListener("input", function () {
        var s = strength(pw.value);
        m.className = "v126-meter s" + s;
        lbl.textContent = pw.value ? words[s] : "";
      });
    }
  }
  document.addEventListener("click", function (e) {   /* kill double-submits */
    var b = e.target.closest && e.target.closest("button");
    if (!b) return;
    var card = b.closest("form,div");
    if (!card || !card.querySelector || !card.querySelector('input[type="password"]')) return;
    if (!/^(sign in|create account)/i.test((b.textContent || "").trim())) return;
    if (b.dataset.v126busy === "1") { e.preventDefault(); e.stopImmediatePropagation(); return; }
    b.dataset.v126busy = "1";
    setTimeout(function () { b.dataset.v126busy = ""; }, 1200);
  }, true);
  setInterval(scan, 800); scan();
})();

/* ===== v127: canonical host — everything lives on localhost ===== */
(function () {
  if (window.__v127) return; window.__v127 = "1";
  try {
    if (location.hostname === "127.0.0.1") {
      location.replace("http://localhost:8080" + location.pathname + location.search + location.hash);
    }
  } catch (e) {}
})();

/* ===== v128: recovery + security center UI ===== */
(function () {
  if (window.__v128fw) return; window.__v128fw = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    try {
      if (typeof u === "string" && u.indexOf("/api/auth/login") > -1 && o && o.body) {
        var b = JSON.parse(o.body);
        var card = (function(){ var bs=document.querySelectorAll("div,section,form");
          for (var i=0;i<bs.length;i++){ var x=bs[i];
            if (x.querySelector && x.querySelector('input[type="password"]') && /welcome back|sign in to continue/i.test(x.textContent||"")) return x; }
          return null; })();
        var cb = card && card.querySelector('input[type="checkbox"]');
        b.remember = !!(cb && cb.checked);
        o.body = JSON.stringify(b);
      }
    } catch (e) {}
    return of.apply(this, arguments);
  };
})();
(function () {
  if (window.__v128) return; window.__v128 = "1";
  function api(p, body, m) {
    return fetch(p, { method: m || "POST", credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  function sheet(html) {
    var s = document.createElement("div");
    s.className = "v124-sheet"; s.setAttribute("data-v128", "1");
    s.innerHTML = '<div class="v124-card v128-card">' +
      '<button class="v124-x" type="button">&#10005;</button>' + html + '</div>';
    document.body.appendChild(s);
    s.addEventListener("click", function (e) {
      if (e.target === s || (e.target.closest && e.target.closest(".v124-x"))) s.remove();
    });
    return s;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var x = document.querySelector('[data-v128="1"]'); if (x) x.remove(); }
  });
  function toast(msg, bad) {
    var t = document.createElement("div");
    t.className = "v128-toast" + (bad ? " bad" : "");
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  /* forgot password link */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!/forgot password\?/i.test((t.textContent || "").trim())) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var s = sheet('<div class="v128-h">Reset your password</div>' +
      '<p class="v128-p">Enter your account email - Alfred sends a reset link that expires in 30 minutes.</p>' +
      '<input class="v128-in" id="v128-fe" type="email" placeholder="you@example.com">' +
      '<button class="v128-btn" id="v128-fb" type="button">Send reset link</button>' +
      '<div class="v128-msg" id="v128-fm"></div>');
    s.querySelector("#v128-fb").addEventListener("click", function () {
      var em = s.querySelector("#v128-fe").value.trim();
      var msg = s.querySelector("#v128-fm");
      msg.textContent = "Sending..."; msg.className = "v128-msg";
      api("/api/auth/forgot", { email: em }).then(function (j) {
        if (j.ok) {
          msg.className = "v128-msg ok";
          msg.textContent = j.message + (j.dev ? "  (Dev mode: the link is printed in backend/engine.log)" : "");
        } else { msg.className = "v128-msg bad"; msg.textContent = j.error || "Something went wrong."; }
      });
    });
  }, true);
  /* reset screen */
  function maybeReset() {
    var h = location.hash || "";
    var m = h.match(/^#\/reset\?token=(.+)$/);
    if (!m || document.querySelector('[data-v128-reset="1"]')) return;
    var s = sheet('<div class="v128-h">Choose a new password</div>' +
      '<input class="v128-in" id="v128-rp" type="password" placeholder="New password (8+ letters & numbers)">' +
      '<input class="v128-in" id="v128-rp2" type="password" placeholder="Repeat new password">' +
      '<button class="v128-btn" id="v128-rb" type="button">Update password</button>' +
      '<div class="v128-msg" id="v128-rm"></div>');
    s.setAttribute("data-v128-reset", "1");
    s.querySelector("#v128-rb").addEventListener("click", function () {
      var p1 = s.querySelector("#v128-rp").value, p2 = s.querySelector("#v128-rp2").value;
      var msg = s.querySelector("#v128-rm");
      if (p1 !== p2) { msg.className = "v128-msg bad"; msg.textContent = "Passwords do not match."; return; }
      api("/api/auth/reset", { token: m[1], password: p1 }).then(function (j) {
        msg.className = "v128-msg " + (j.ok ? "ok" : "bad");
        msg.textContent = j.ok ? (j.message || "Password updated.") : (j.error || "Failed.");
        if (j.ok) setTimeout(function () { location.hash = "#/"; s.remove(); }, 1800);
      });
    });
  }
  setInterval(maybeReset, 600); maybeReset();
  /* settings: account security card */
  function injectSec() {
    var v = document.getElementById("view-settings");
    if (!v || v.querySelector(".v128-sec")) return;
    var card = document.createElement("div");
    card.className = "v128-sec";
    card.innerHTML = '<div class="v128-h2">Account security</div>' +
      '<button class="v128-row" data-a="chpw">Change password</button>' +
      '<button class="v128-row" data-a="revoke">Sign out other devices</button>' +
      '<button class="v128-row danger" data-a="del">Delete account</button>';
    var so = v.querySelector(".v122-signout");
    if (so && so.parentElement) so.parentElement.insertBefore(card, so); else v.appendChild(card);
    card.addEventListener("click", function (e) {
      var b = e.target.closest(".v128-row"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "chpw") {
        var s = sheet('<div class="v128-h">Change password</div>' +
          '<input class="v128-in" id="c1" type="password" placeholder="Current password">' +
          '<input class="v128-in" id="c2" type="password" placeholder="New password">' +
          '<input class="v128-in" id="c3" type="password" placeholder="Repeat new password">' +
          '<button class="v128-btn" id="cb" type="button">Save new password</button>' +
          '<div class="v128-msg" id="cm"></div>');
        s.querySelector("#cb").addEventListener("click", function () {
          var msg = s.querySelector("#cm");
          if (s.querySelector("#c2").value !== s.querySelector("#c3").value) {
            msg.className = "v128-msg bad"; msg.textContent = "New passwords do not match."; return; }
          api("/api/auth/change-password", { current: s.querySelector("#c1").value, next: s.querySelector("#c2").value })
            .then(function (j) {
              msg.className = "v128-msg " + (j.ok ? "ok" : "bad"); msg.textContent = j.message || j.error || "";
              if (j.ok) setTimeout(function () { s.remove(); }, 1600);
            });
        });
      }
      if (a === "revoke") {
        api("/api/auth/revoke-others", {}).then(function (j) {
          if (j && j.ok) toast(j.revoked + " other session(s) signed out");
          else toast((j && j.error) || "Please sign in first", true);
        });
      }
      if (a === "del") {
        var s2 = sheet('<div class="v128-h danger">Delete your account?</div>' +
          '<p class="v128-p">This removes your account and its data permanently. This cannot be undone.</p>' +
          '<input class="v128-in" id="d1" type="password" placeholder="Your password (provider accounts: leave empty)">' +
          '<input class="v128-in" id="d2" placeholder="Type DELETE to confirm">' +
          '<button class="v128-btn red" id="db" type="button" disabled>Delete forever</button>' +
          '<div class="v128-msg" id="dm"></div>');
        var din = s2.querySelector("#d2"), dbtn = s2.querySelector("#db");
        din.addEventListener("input", function () { dbtn.disabled = din.value !== "DELETE"; });
        dbtn.addEventListener("click", function () {
          api("/api/auth/delete-account", { password: s2.querySelector("#d1").value, confirm: din.value })
            .then(function (j) {
              if (j.ok) {
                try {
                  Object.keys(localStorage).forEach(function (k) { if (/^alfred/i.test(k)) localStorage.removeItem(k); });
                } catch (er) {}
                location.reload();
              } else { var m = s2.querySelector("#dm"); m.className = "v128-msg bad"; m.textContent = j.error || ""; }
            });
        });
      }
    });
  }
  setInterval(injectSec, 900); injectSec();
})();

/* ===== v128: recovery + security center UI ===== */
(function () {
  if (window.__v128fw) return; window.__v128fw = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    try {
      if (typeof u === "string" && u.indexOf("/api/auth/login") > -1 && o && o.body) {
        var b = JSON.parse(o.body);
        var card = (function(){ var bs=document.querySelectorAll("div,section,form");
          for (var i=0;i<bs.length;i++){ var x=bs[i];
            if (x.querySelector && x.querySelector('input[type="password"]') && /welcome back|sign in to continue/i.test(x.textContent||"")) return x; }
          return null; })();
        var cb = card && card.querySelector('input[type="checkbox"]');
        b.remember = !!(cb && cb.checked);
        o.body = JSON.stringify(b);
      }
    } catch (e) {}
    return of.apply(this, arguments);
  };
})();
(function () {
  if (window.__v128) return; window.__v128 = "1";
  function api(p, body, m) {
    return fetch(p, { method: m || "POST", credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  function sheet(html) {
    var s = document.createElement("div");
    s.className = "v124-sheet"; s.setAttribute("data-v128", "1");
    s.innerHTML = '<div class="v124-card v128-card">' +
      '<button class="v124-x" type="button">&#10005;</button>' + html + '</div>';
    document.body.appendChild(s);
    s.addEventListener("click", function (e) {
      if (e.target === s || (e.target.closest && e.target.closest(".v124-x"))) s.remove();
    });
    return s;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var x = document.querySelector('[data-v128="1"]'); if (x) x.remove(); }
  });
  function toast(msg, bad) {
    var t = document.createElement("div");
    t.className = "v128-toast" + (bad ? " bad" : "");
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!/forgot password\?/i.test((t.textContent || "").trim())) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var s = sheet('<div class="v128-h">Reset your password</div>' +
      '<p class="v128-p">Enter your account email - Alfred sends a reset link that expires in 30 minutes.</p>' +
      '<input class="v128-in" id="v128-fe" type="email" placeholder="you@example.com">' +
      '<button class="v128-btn" id="v128-fb" type="button">Send reset link</button>' +
      '<div class="v128-msg" id="v128-fm"></div>');
    s.querySelector("#v128-fb").addEventListener("click", function () {
      var em = s.querySelector("#v128-fe").value.trim();
      var msg = s.querySelector("#v128-fm");
      msg.textContent = "Sending..."; msg.className = "v128-msg";
      api("/api/auth/forgot", { email: em }).then(function (j) {
        if (j.ok) {
          msg.className = "v128-msg ok";
          msg.textContent = j.message + (j.dev ? "  (Dev mode: the link is printed in backend/engine.log)" : "");
        } else { msg.className = "v128-msg bad"; msg.textContent = j.error || "Something went wrong."; }
      });
    });
  }, true);
  function maybeReset() {
    var h = location.hash || "";
    var m = h.match(/^#\/reset\?token=(.+)$/);
    if (!m || document.querySelector('[data-v128-reset="1"]')) return;
    var s = sheet('<div class="v128-h">Choose a new password</div>' +
      '<input class="v128-in" id="v128-rp" type="password" placeholder="New password (8+ letters & numbers)">' +
      '<input class="v128-in" id="v128-rp2" type="password" placeholder="Repeat new password">' +
      '<button class="v128-btn" id="v128-rb" type="button">Update password</button>' +
      '<div class="v128-msg" id="v128-rm"></div>');
    s.setAttribute("data-v128-reset", "1");
    s.querySelector("#v128-rb").addEventListener("click", function () {
      var p1 = s.querySelector("#v128-rp").value, p2 = s.querySelector("#v128-rp2").value;
      var msg = s.querySelector("#v128-rm");
      if (p1 !== p2) { msg.className = "v128-msg bad"; msg.textContent = "Passwords do not match."; return; }
      api("/api/auth/reset", { token: m[1], password: p1 }).then(function (j) {
        msg.className = "v128-msg " + (j.ok ? "ok" : "bad");
        msg.textContent = j.ok ? (j.message || "Password updated.") : (j.error || "Failed.");
        if (j.ok) setTimeout(function () { location.hash = "#/"; s.remove(); }, 1800);
      });
    });
  }
  setInterval(maybeReset, 600); maybeReset();
  function injectSec() {
    var v = document.getElementById("view-settings");
    if (!v || v.querySelector(".v128-sec")) return;
    var card = document.createElement("div");
    card.className = "v128-sec";
    card.innerHTML = '<div class="v128-h2">Account security</div>' +
      '<button class="v128-row" data-a="chpw">Change password</button>' +
      '<button class="v128-row" data-a="revoke">Sign out other devices</button>' +
      '<button class="v128-row danger" data-a="del">Delete account</button>';
    var so = v.querySelector(".v122-signout");
    if (so && so.parentElement) so.parentElement.insertBefore(card, so); else v.appendChild(card);
    card.addEventListener("click", function (e) {
      var b = e.target.closest(".v128-row"); if (!b) return;
      var a = b.getAttribute("data-a");
      if (a === "chpw") {
        var s = sheet('<div class="v128-h">Change password</div>' +
          '<input class="v128-in" id="c1" type="password" placeholder="Current password">' +
          '<input class="v128-in" id="c2" type="password" placeholder="New password">' +
          '<input class="v128-in" id="c3" type="password" placeholder="Repeat new password">' +
          '<button class="v128-btn" id="cb" type="button">Save new password</button>' +
          '<div class="v128-msg" id="cm"></div>');
        s.querySelector("#cb").addEventListener("click", function () {
          var msg = s.querySelector("#cm");
          if (s.querySelector("#c2").value !== s.querySelector("#c3").value) {
            msg.className = "v128-msg bad"; msg.textContent = "New passwords do not match."; return; }
          api("/api/auth/change-password", { current: s.querySelector("#c1").value, next: s.querySelector("#c2").value })
            .then(function (j) {
              msg.className = "v128-msg " + (j.ok ? "ok" : "bad"); msg.textContent = j.message || j.error || "";
              if (j.ok) setTimeout(function () { s.remove(); }, 1600);
            });
        });
      }
      if (a === "revoke") {
        api("/api/auth/revoke-others", {}).then(function (j) {
          if (j && j.ok) toast(j.revoked + " other session(s) signed out");
          else toast((j && j.error) || "Please sign in first", true);
        });
      }
      if (a === "del") {
        var s2 = sheet('<div class="v128-h danger">Delete your account?</div>' +
          '<p class="v128-p">This removes your account and its data permanently. This cannot be undone.</p>' +
          '<input class="v128-in" id="d1" type="password" placeholder="Your password (provider accounts: leave empty)">' +
          '<input class="v128-in" id="d2" placeholder="Type DELETE to confirm">' +
          '<button class="v128-btn red" id="db" type="button" disabled>Delete forever</button>' +
          '<div class="v128-msg" id="dm"></div>');
        var din = s2.querySelector("#d2"), dbtn = s2.querySelector("#db");
        din.addEventListener("input", function () { dbtn.disabled = din.value !== "DELETE"; });
        dbtn.addEventListener("click", function () {
          api("/api/auth/delete-account", { password: s2.querySelector("#d1").value, confirm: din.value })
            .then(function (j) {
              if (j.ok) {
                try {
                  Object.keys(localStorage).forEach(function (k) { if (/^alfred/i.test(k)) localStorage.removeItem(k); });
                } catch (er) {}
                location.reload();
              } else { var m = s2.querySelector("#dm"); m.className = "v128-msg bad"; m.textContent = j.error || ""; }
            });
        });
      }
    });
  }
  setInterval(injectSec, 900); injectSec();
})();

/* ===== v129: M1 chat brain takeover ===== */
(function () {
  if (window.__v129) return; window.__v129 = "1";
  var pending = false;
  window.__v129chat = window.__v129chat || null;

  function composer() { return document.querySelector(".composer"); }
  function inputOf(c) { return c && c.querySelector("textarea,input"); }
  function scrollDown(el) {
    try { el.scrollTop = el.scrollHeight; } catch (e) {}
    try { window.scrollTo(0, document.body.scrollHeight); } catch (e) {}
  }
  function container(c) {
    var first = document.querySelector(".msg");
    if (first && first.parentElement) return first.parentElement;
    var p = c && c.previousElementSibling;
    while (p && !p.querySelector(".msg")) p = p.previousElementSibling;
    return p || (c && c.parentElement) || document.body;
  }
  function makeMsg(text, ai) {
    var el = document.createElement("div");
    el.className = ai ? "msg ai" : "msg user";
    if (ai) {
      var av = document.createElement("div"); av.className = "msg-av"; el.appendChild(av);
    }
    var b = document.createElement("div"); b.className = "bubble";
    b.textContent = text; el.appendChild(b);
    return el;
  }
  function cloneFor(ai, text) {
    var sel = ai ? ".msg.ai" : ".msg:not(.ai)";
    var list = document.querySelectorAll(sel);
    var el = list.length ? list[list.length - 1].cloneNode(true) : makeMsg("", ai);
    var b = el.querySelector(".bubble");
    if (!b) { b = document.createElement("div"); b.className = "bubble"; el.appendChild(b); }
    b.textContent = text;
    return {el: el, bubble: b};
  }
  function showToast(text) {
    var t = document.createElement("div"); t.className = "v129-toast"; t.textContent = text;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }
  function send() {
    if (pending) return;
    var c = composer(), input = inputOf(c);
    if (!input) return;
    var text = (input.value || "").trim();
    if (!text) return;
    pending = true; input.value = "";
    var button = c.querySelector(".send"); if (button) button.disabled = true;
    var box = container(c);
    var user = cloneFor(false, text);
    box.appendChild(user.el); scrollDown(box);
    var ai = cloneFor(true, "");
    ai.bubble.innerHTML = '<span class="v129-dots"><i></i><i></i><i></i></span>';
    box.appendChild(ai.el); scrollDown(box);

try { /* v163proc: native thinking card */
  var v163pd = ai.bubble && ai.bubble.style ? ai.bubble.style.display : "";
  if (ai.bubble) ai.bubble.style.display = "none";
  var v163p = document.createElement("div"); v163p.className = "proc";
  v163p.innerHTML = "<div class='proc-orb'><span class='proc-glass'></span><span class='proc-pulse'></span><span class='proc-core'></span></div>" +
    "<div class='proc-txt'><span class='proc-title'>Thinking...</span><span class='proc-cap'>Connecting ideas across my neural layers</span></div>" +
    "<button class='proc-hide' type='button'><span class='ph-tx'>Hide process</span></button>";
  ai.el.appendChild(v163p);
  try { ai.el.classList.add("fx-think"); } catch (e) {}
  var v163caps = ["Connecting ideas across my neural layers", "Weighing the best path to your answer", "Polishing the final words"], v163i = 0;
  var v163cap = setInterval(function () { v163i = (v163i + 1) % v163caps.length; var cc = v163p.querySelector(".proc-cap"); if (cc) cc.textContent = v163caps[v163i]; }, 2600);
  v163p.querySelector(".proc-hide").addEventListener("click", function () {
    var tx = v163p.querySelector(".proc-txt"), hid = tx.style.display === "none";
    tx.style.display = hid ? "" : "none";
    this.querySelector(".ph-tx").textContent = hid ? "Hide process" : "Show process";
  });
  var v163done = false;
  function v163clean() { if (v163done) return; v163done = true;
    clearInterval(v163ck); clearInterval(v163cap);
    var pc = ai.el.querySelector(".proc"); if (pc) pc.remove();
    try { if (ai.el) ai.el.classList.remove("fx-think"); } catch (e) {}
    if (ai.bubble) ai.bubble.style.display = v163pd; }
  var v163ck = setInterval(function () {
    if (v163done) return;
    if (!ai.el.isConnected || !ai.el.querySelector(".v129-dots")) v163clean();
  }, 300);
  setTimeout(v163clean, 120000);
} catch (e) {}

    var started = Date.now();

    fetch("http://" + location.hostname + ":8082/api/chat", {
      method: "POST", credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({chat_id: window.__v129chat || null, message: text})
    }).then(function (r) {
      return r.json().catch(function () { return {}; });
    }).then(function (j) {
      var wait = Math.max(0, 900 - (Date.now() - started));
      setTimeout(function () {
        if (j.ok) {
          window.__v129chat = j.chat_id;
          ai.bubble.textContent = j.reply || "";
          ai.bubble.style.whiteSpace = "pre-wrap";
          if (j.remaining <= 5) showToast(j.remaining + " messages left today");
        } else {
          ai.bubble.textContent = j.error || "Alfred could not answer just now.";
        }
        scrollDown(box);
      }, wait);
    }).catch(function () {
      ai.bubble.textContent = "I could not reach my mind - is the brain sidecar running?";
      scrollDown(box);
    }).finally(function () {
      pending = false;
      if (button) button.disabled = false;
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".send");
    if (!b || !b.closest(".composer")) return;
    e.preventDefault(); e.stopImmediatePropagation(); send();
  }, true);

  document.addEventListener("keydown", function (e) {
    var c = composer();
    if (!c || !e.target.matches("textarea,input") || !c.contains(e.target)) return;
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault(); e.stopImmediatePropagation(); send();
    }
  }, true);
})();

/* ===== v130: M2 living brain (true streaming + stop + server history) ===== */
(function () {
  if (window.__v130) return; window.__v130 = "1";
  var API = "http://" + location.hostname + ":8082";
  var streaming = false, ctrl = null;

  function $(s, c) { return (c || document).querySelector(s); }
  function toast(m) { try { if (typeof showToast === "function") showToast(m); } catch (e) {} }
  function inputEl() {
    return $(".composer textarea") || $(".composer input[type=text]") ||
           $(".composer input:not([type=file])") || null;
  }
  function msgBox() { var m = document.querySelector(".msg"); if (m && m.parentElement) return m.parentElement; var c = document.querySelector(".composer"); return (c && c.parentElement) ? c.parentElement : null; }
  function scrollBottom() { var b = msgBox(); if (!b) return; try { b.scrollTo({ top: 9e9, behavior: "smooth" }); } catch (e) {} try { b.scrollTop = b.scrollHeight; } catch (e) {} }

  function addMsg(cls) {
    var box = msgBox(); if (!box) return null;
    if (cls === "user") cls = $(".msg.me") ? "me" : "user";
    var msg = document.createElement("div"); msg.className = "msg " + cls;
    var proto = $(".msg." + cls + " .msg-av") || $(".msg-av");
    if (proto) msg.appendChild(proto.cloneNode(true));
    var b = document.createElement("div"); b.className = "bubble";
    msg.appendChild(b); box.appendChild(msg); scrollBottom();
    return b;
  }

  function send(text, inp) {
    if (streaming) return;
    text = (text || "").trim(); if (!text) return;
    var ub = addMsg("user");
    if (!ub) { if (inp) inp.value = text; return; }
    ub.textContent = text; ub.style.whiteSpace = "pre-wrap";
    if (inp) inp.value = "";
    var ab = addMsg("ai");
    if (!ab) { if (inp) inp.value = text; return; }
    ab.innerHTML = '<span class="v129-dots"><i></i><i></i><i></i></span>';
    streaming = true; ctrl = new AbortController();
    var btn = $(".send"); if (btn) btn.classList.add("v130-stop");
    var t0 = Date.now();

    function finish(stopped) {
      streaming = false; ctrl = null;
      if (btn) btn.classList.remove("v130-stop");
      var d = ab.querySelector(".v129-dots");
      if (d) d.parentNode.removeChild(d);
      if (stopped) ab.textContent = (ab.textContent || "") + (ab.textContent ? "  (stopped)" : "Stopped.");
      scrollBottom();
    }
    function nonStream() {
      fetch(API + "/api/chat", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, chat_id: window.__v129chat || null })
      }).then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) {
          setTimeout(function () {
            streaming = false; if (btn) btn.classList.remove("v130-stop");
            if (j.ok) {
              window.__v129chat = j.chat_id;
              ab.textContent = j.reply || ""; ab.style.whiteSpace = "pre-wrap";
              if (j.remaining <= 5) toast(j.remaining + " messages left today");
            } else {
              ab.textContent = j.error || "I could not reach my engines just now. Try again in a moment.";
            }
            scrollBottom();
          }, Math.max(0, 900 - (Date.now() - t0)));
        }).catch(function () {
          streaming = false; if (btn) btn.classList.remove("v130-stop");
          ab.textContent = "Connection hiccup - please try again.";
        });
    }

    fetch(API + "/api/chat/stream", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, chat_id: window.__v129chat || null }),
      signal: ctrl.signal
    }).then(function (r) {
      if (!r.ok || !r.body) throw { fallback: true };
      var rd = r.body.getReader(), dec = new TextDecoder(), buf = "";
      function handle(ev) {
        if (ev.chat_id && !ev.done) { window.__v129chat = ev.chat_id; return; }
        if (typeof ev.t === "string") {
          var d = ab.querySelector(".v129-dots");
          if (d) d.parentNode.removeChild(d);
          ab.textContent = (ab.textContent || "") + ev.t;
          ab.style.whiteSpace = "pre-wrap"; scrollBottom();
        } else if (ev.error) {
          ab.textContent = ev.error;
        } else if (ev.done) {
          window.__v129chat = ev.chat_id || window.__v129chat;
          if (ev.remaining <= 5) toast(ev.remaining + " messages left today");
        }
      }
      function pump() {
        return rd.read().then(function (res) {
          if (res.done) { finish(false); return; }
          buf += dec.decode(res.value, { stream: true });
          var parts = buf.split("\n\n"); buf = parts.pop();
          parts.forEach(function (blk) {
            blk.split("\n").forEach(function (ln) {
              if (ln.slice(0, 5) === "data:") {
                try { handle(JSON.parse(ln.slice(5).trim())); } catch (e) {}
              }
            });
          });
          return pump();
        });
      }
      return pump();
    }).catch(function (err) {
      if (err && err.name === "AbortError") { finish(true); return; }
      var had = ab.textContent && !ab.querySelector(".v129-dots");
      if (had) { finish(true); return; }
      nonStream();
    });
  }

  window.addEventListener("click", function (e) {
    var t = e.target; var btn = t && t.closest ? t.closest(".send") : null;
    if (!btn) return;
    if (streaming) { e.preventDefault(); e.stopPropagation(); if (ctrl) ctrl.abort(); return; }
    var inp = inputEl(); var text = inp ? inp.value : "";
    if (!text || !text.trim()) return;
    e.preventDefault(); e.stopPropagation();
    send(text, inp);
  }, true);

  window.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    var inp = inputEl();
    if (!inp || e.target !== inp) return;
    if (streaming) { e.preventDefault(); e.stopPropagation(); return; }
    var text = inp.value; if (!text || !text.trim()) return;
    e.preventDefault(); e.stopPropagation();
    send(text, inp);
  }, true);

  /* History hydrates from the real server (localStorage stays the fallback) */
  function hydrate() {
    var ac = new AbortController();
    var tm = setTimeout(function () { ac.abort(); }, 3000);
    fetch(API + "/api/chats", { credentials: "include", signal: ac.signal })
      .then(function (r) { clearTimeout(tm); return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.chats || !j.chats.length) return;
        var list = j.chats.slice(0, 12), done = 0, out = [];
        function rec(ch, msgs) {
          var t = String(ch.title || "Chat"), lo = t.toLowerCase();
          var cat = /image|photo|draw/.test(lo) ? "Image" : /code|bug|script/.test(lo) ? "Code"
                  : /research|summari|compare/.test(lo) ? "Research" : "General";
          return { t: t, ts: Math.round((ch.updated || Date.now() / 1000) * 1000),
                   cat: cat, prev: t, n: ch.msgcount || msgs.length, _sid: ch.id,
                   msgs: msgs.map(function (x) {
                     return { role: x.role, who: x.role === "assistant" ? "ai" : "me",
                              text: x.content, content: x.content };
                   }) };
        }
        function wrap() { if (++done === list.length) write(); }
        function write() {
          var cur = []; try { cur = JSON.parse(localStorage.getItem("alfred_history") || "[]"); } catch (e) {}
          var local = cur.filter(function (r) { return r && !r._sid; });
          try { localStorage.setItem("alfred_history", JSON.stringify(out.concat(local).slice(0, 12))); } catch (e) {}
        }
        list.forEach(function (ch) {
          fetch(API + "/api/chat/" + ch.id, { credentials: "include" })
            .then(function (r) { return r.json(); })
            .then(function (m) { out.push(rec(ch, (m && m.ok && m.messages) ? m.messages : [])); wrap(); })
            .catch(function () { out.push(rec(ch, [])); wrap(); });
        });
      }).catch(function () {});
  }
  setTimeout(hydrate, 1200);
})();

/* ===== v132b: session guard + login verifier ===== */
(function () {
  if (window.__v132b) return; window.__v132b = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf(":8082/api/chat") > -1 && o && o.method === "POST") {
        p.then(function (r) {
          if (r && r.status === 401) {
            try { if (typeof showToast === "function") showToast("Session expired — one more sign-in and you're set"); } catch (e) {}
            setTimeout(function () { location.hash = "#/login"; }, 700);
          }
        });
      }
      if (s.indexOf("/api/auth/login") > -1) {
        p.then(function (r) { return r.clone().json().catch(function () { return {}; }); })
         .then(function (j) {
           if (j && j.ok) setTimeout(function () {
             fetch("/api/auth/me", { credentials: "same-origin" })
               .then(function (r) { return r.json(); })
               .then(function (m) {
                 if (!m || !m.ok) {
                   try { if (typeof showToast === "function") showToast("Cookie didn't stick — sign in once more on this exact page"); } catch (e) {}
                 }
               }).catch(function () {});
           }, 700);
         });
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v133: single-submit lock for auth forms ===== */
(function () {
  if (window.__v133) return; window.__v133 = "1";
  var inflight = {};
  window.addEventListener("submit", function (e) {
    var f = e.target;
    if (!f || !f.querySelector || !f.querySelector('input[type="password"]')) return;
    if (inflight[f.__v133key || (f.__v133key = Math.random())]) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  window.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var card = b.closest('div,section,form');
    if (!card || !card.querySelector('input[type="password"]')) return;
    var key = card.__v133key || (card.__v133key = Math.random());
    if (inflight[key]) { e.preventDefault(); e.stopPropagation(); return; }
    inflight[key] = true;
    setTimeout(function () { delete inflight[key]; }, 2500);
  }, true);
  window.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var i = e.target;
    if (!i || !i.form || !i.form.querySelector('input[type="password"]')) return;
    if (i.form.__v133key && inflight[i.form.__v133key]) { e.preventDefault(); e.stopPropagation(); }
    else if (i.form.__v133key === undefined) {
      i.form.__v133key = Math.random(); inflight[i.form.__v133key] = true;
      setTimeout(function () { delete inflight[i.form.__v133key]; }, 2500);
    }
  }, true);
  /* v133b: prove which login attempt won — trace both fires */
  var of = window.fetch;
  window.fetch = function (u, o) {
    try {
      if (typeof u === "string" && u.indexOf("/api/auth/login") > -1) {
        var b = {}; try { b = JSON.parse(o.body); } catch (e2) {}
        console.log("[v133] login POST → pw-len:", (b.password || "").length, "remember:", !!b.remember);
      }
    } catch (e2) {}
    return of.apply(this, arguments);
  };
})();

/* ===== v134: on-screen auth lifecycle tracer ===== */
(function () {
  if (window.__v134) return; window.__v134 = "1";
  function say(m) { try { if (typeof showToast === "function") showToast(m); } catch (e) {} }
  var of = window.fetch, n = 0;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/login") > -1) {
        var i = ++n;
        say("v134 login attempt #" + i + " sent…");
        p.then(function (r) { say("v134 attempt #" + i + " → " + r.status); }).catch(function () {});
        setTimeout(function () {
          fetch("http://" + location.hostname + ":8082/api/whoami", { credentials: "include" })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              say("v134 cookie check: stored=" + j.n_cookies +
                  " live=" + (j.user ? j.user.name : "none"));
            }).catch(function () { say("v134 cookie check: brain unreachable"); });
        }, 1200);
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v137b: auth radar (on-screen debug) ===== */
(function () {
  if (window.__v137b) return; window.__v137b = "1";
  var b = document.createElement("div");
  b.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:99999;background:rgba(8,12,24,.94);" +
    "color:#9fd4ff;font:11px/1.5 monospace;padding:8px 10px;border:1px solid rgba(90,160,255,.45);" +
    "border-radius:10px;max-width:72vw;pointer-events:none;white-space:pre-wrap";
  function mount(){ if (!b.parentNode && document.body) document.body.appendChild(b); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  function say(m) {
    mount(); b.textContent += (b.textContent ? "\n" : "") + m;
    try { if (typeof showToast === "function") showToast(m); } catch (e) {}
  }
  var tl = 0; try { tl = (localStorage.getItem("alfred_token") || "").length; } catch (e) {}
  say("radar: stored token " + (tl ? tl + " chars" : "NONE"));
  var of = window.fetch;
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isLogin = /\/api\/auth\/(login|register)/.test(s);
    var isChat  = s.indexOf(":8082/") > -1 && s.indexOf("/api/chat") > -1;
    var p = of.apply(this, arguments);
    if (isLogin) {
      p.then(function (r) {
        r.clone().json().then(function (j) {
          if (j && j.ok) say("radar: login " + r.status + " — token " + (j.token ? "RECEIVED ✓" : "MISSING in body"));
          else say("radar: login " + r.status + " — " + ((j && j.error) || "rejected"));
        }).catch(function () { say("radar: login " + r.status); });
      }).catch(function () { say("radar: login network error"); });
    }
    if (isChat) {
      var sent = "";
      try { sent = new Headers(o.headers || {}).get("X-Alfred-Token") || ""; } catch (e) {}
      p.then(function (r) {
        if (r.status === 401) say("radar: chat 401 — token sent: " + (sent ? sent.length + " chars" : "NONE"));
      }).catch(function () {});
    }
    return p;
  };
})();

/* ===== v137c: tap-watcher + direct-login auto-heal (debug) ===== */
(function () {
  if (window.__v137c) return; window.__v137c = "1";
  function say(m) {
    try {
      var b = document.querySelector("div[style*='rgba(8,12,24']");
      if (b) { b.textContent += "\n" + m; return; }
    } catch (e) {}
    try { if (typeof showToast === "function") showToast(m); } catch (e) {}
    try { console.log(m); } catch (e) {}
  }
  var loginFired = false;
  var of = window.fetch;
  window.fetch = function (u, o) {
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/login") > -1) loginFired = true;
    } catch (e) {}
    return of.apply(this, arguments);
  };
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    var t = (b.textContent || "").trim().toLowerCase();
    if (t.indexOf("sign in") === -1 || /google|github|discord/.test(t)) return;
    if (!ev.isTrusted) return;                       /* ignore the app's own synthetic clicks */
    say("radar: Sign In tapped — waiting for login…");
    var card = b.closest("div,section,form") || document;
    var em = card.querySelector("input[type='email']") || card.querySelector("input[autocomplete='username']");
    var pw = card.querySelector("input[type='password']");
    var cb = card.querySelector("input[type='checkbox']");
    loginFired = false;
    setTimeout(function () {
      if (loginFired) return;                        /* app's own login ran — radar reports it */
      say("radar: app login did NOT fire → DIRECT LOGIN…");
      if (!em || !pw || !pw.value) { say("radar: fields empty — type them first"); return; }
      fetch("/api/auth/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em.value.trim(), password: pw.value,
                               remember: !!(cb && cb.checked) })
      }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (x) {
          if (x.j && x.j.ok && x.j.token) {
            try { localStorage.setItem("alfred_token", x.j.token); } catch (e) {}
            try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
            try { if (x.j.user && x.j.user.name) localStorage.setItem("alfred_name", x.j.user.name); } catch (e) {}
            say("radar: DIRECT LOGIN OK ✓ reloading…");
            setTimeout(function () { location.reload(); }, 1000);
          } else say("radar: direct login " + x.s + " — " + ((x.j && x.j.error) || "?"));
        })
        .catch(function () { say("radar: direct login network error"); });
    }, 2000);
  }, true);
})();

/* ===== v140: chat error net — no more dead bubbles or stuck themes ===== */
(function () {
  if (window.__v140) return; window.__v140 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf(":8082/") > -1 && s.indexOf("/api/chat") > -1) {
        p.then(function (r) {
          if (r.status === 401) {
            try { if (typeof showToast === "function") showToast("Session expired — refreshing…", true); } catch (e) {}
            setTimeout(function () { location.reload(); }, 1200);
          }
        }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v141: full-visibility chat radar (debug) ===== */
(function () {
  if (window.__v141) return; window.__v141 = "1";
  function say(m) {
    try {
      var b = document.querySelector("div[style*='rgba(8,12,24']");
      if (b) { b.textContent += "\n" + m; return; }
    } catch (e) {}
    try { console.log(m); } catch (e) {}
  }
  /* send-button tap tracer (passive) */
  document.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest(".send, .composer button") : null;
    if (t) say("radar: send tapped");
  }, true);
  /* brain health on load */
  try {
    fetch("http://" + location.hostname + ":8082/health")
      .then(function (r) { return r.json(); })
      .then(function (j) { say("radar: brain UP (" + (j.model || "?") + ")"); })
      .catch(function (e) { say("radar: brain UNREACHABLE — " + e); });
  } catch (e) {}
  /* chat fetch tracer: before / after / DEATH */
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = s.indexOf(":8082/") > -1 && s.indexOf("/api/chat") > -1;
    if (isChat) {
      var n = 0; try { n = (localStorage.getItem("alfred_token") || "").length; } catch (e) {}
      say("radar: chat → sending (token " + (n ? n + " chars" : "NONE") + ")");
      try {
        var p = of.apply(this, arguments);
        p.then(function (r) { say("radar: chat ← HTTP " + r.status); }).catch(function (e) {
          say("radar: chat ✗ DIED — " + e);
        });
        return p;
      } catch (e) {
        say("radar: chat ✗ THREW — " + e);
        throw e;
      }
    }
    return of.apply(this, arguments);
  };
})();

/* ===== v142: freshness proof + chat completion tracer ===== */
(function () {
  if (window.__v142) return; window.__v142 = "1";
  function say(m) {
    try {
      var b = document.querySelector("div[style*='rgba(8,12,24']");
      if (b) { b.textContent += "\n" + m; return; }
    } catch (e) {}
    try { console.log(m); } catch (e) {}
  }
  say("radar: v142 LIVE — all debug layers loaded ✓");
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = s.indexOf(":8082/") > -1 && s.indexOf("/api/chat") > -1;
    if (isChat) {
      var p;
      try { p = of.apply(this, arguments); }
      catch (e) { say("radar: chat ✗ THREW — " + e); throw e; }
      p.then(function (r) {
        if (r.ok) say("radar: chat ← 200 OK — answer should render now");
        else say("radar: chat ← HTTP " + r.status);
      }).catch(function (e) { say("radar: chat ✗ DIED — " + e); });
      return p;
    }
    return of.apply(this, arguments);
  };
})();

/* ===== v144: post-login admission — set flag + one auto-reload ===== */
(function () {
  if (window.__v144) return; window.__v144 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (/\/api\/auth\/(login|register)/.test(s)) {
        p.then(function (r) {
          r.clone().json().then(function (j) {
            if (j && j.ok && j.token) {
              try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
              setTimeout(function () {
                /* v198: auto-reload retired */
              }, 1500);
            }
          }).catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v144: post-login admission — set flag + one auto-reload ===== */
(function () {
  if (window.__v144) return; window.__v144 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (/\/api\/auth\/(login|register)/.test(s)) {
        p.then(function (r) {
          r.clone().json().then(function (j) {
            if (j && j.ok && j.token) {
              try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
              setTimeout(function () {
                /* v198: auto-reload retired */
              }, 1500);
            }
          }).catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v152: live streaming answers (SSE shim — no double-send fallback) ===== */
(function () {
  if (window.__v152) return; window.__v152 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
                 s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1;
    if (!isChat) return of.apply(this, arguments);
    var url = s.replace("/api/chat", "/api/chat/stream");
    return of.call(this, url, o).then(function (res) {
      if (!res.ok || !res.body || !res.body.getReader) return res;
      var bubble = null, full = "", chatId = null, model = null, remaining = null;
      try { var d = document.querySelector(".v129-dots"); if (d) bubble = d.closest(".bubble"); } catch (e) {}
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = "";
      function paint() { if (bubble) bubble.textContent = full + "▌"; }
      function feed(chunk) {
        var evs = chunk.split(/\r?\n\r?\n/), tail = evs.pop();
        for (var i = 0; i < evs.length; i++) {
          var data = null;
          evs[i].split(/\r?\n/).forEach(function (ln) { if (ln.slice(0, 6) === "data: ") data = ln.slice(6); });
          if (!data) continue;
          try {
            var j = JSON.parse(data);
            if (typeof j.t === "string") { full += j.t; paint(); }
            if (j.chat_id != null) chatId = j.chat_id;
            if (j.model) model = j.model;
            if (j.remaining != null) remaining = j.remaining;
          } catch (e) {}
        }
        return tail;
      }
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { feed(buf); return; }
          buf = feed(buf + dec.decode(r.value, { stream: true }));
          return pump();
        });
      }
      return pump().then(function () {
        if (bubble) bubble.textContent = full;
        return new Response(JSON.stringify({
          ok: true, chat_id: chatId, reply: full, model: model, remaining: remaining
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }).catch(function () {
        try { reader.cancel(); } catch (er) {}
        if (bubble) bubble.textContent = full;
        return new Response(JSON.stringify({
          ok: !!full, chat_id: chatId, reply: full,
          error: full ? undefined : "The stream was interrupted — try again."
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      });
    });
  };
})();

/* ===== v153a: admission fix — token saved → flag set → card auto-dismisses ===== */
(function () {
  if (window.__v153a) return; window.__v153a = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (/\/api\/auth\/(login|register)/.test(s)) {
        p.then(function (r) {
          r.clone().json().then(function (j) {
            if (j && j.ok && j.token) {
              try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
              setTimeout(function () {
                /* v198: auto-reload retired */
              }, 1500);
            }
          }).catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v153b: readability — light text on dark bubbles ===== */
(function () {
  if (window.__v153b) return; window.__v153b = "1";
  var css = document.createElement("style");
  css.textContent =
    ".msg.ai .bubble{color:#eaf4ff !important;text-shadow:0 1px 2px rgba(0,8,25,.5);}" +
    ".msg.user .bubble{color:#f6faff !important;}" +
    ".msg.ai .bubble a{color:#8fd0ff !important;}";
  (document.head || document.documentElement).appendChild(css);
})();

/* ===== v154: streaming v2 — done-required, no double-send, full SSE parse ===== */
(function () {
  if (window.__v154) return; window.__v154 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
                 s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1;
    if (!isChat) return of.apply(this, arguments);
    var url = s.replace("/api/chat", "/api/chat/stream");
    return of.call(this, url, o).then(function (res) {
      if (!res.ok || !res.body || !res.body.getReader) return res;
      var bubble = null, full = "", chatId = null, model = null,
          remaining = null, done = false;
      try { var d = document.querySelector(".v129-dots"); if (d) bubble = d.closest(".bubble"); } catch (e) {}
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = "";
      function paint() { if (bubble) bubble.textContent = full + "▌"; }
      function take(data) {
        try {
          var j = JSON.parse(data);
          if (typeof j.t === "string") { full += j.t; paint(); }
          if (j.chat_id != null) chatId = j.chat_id;
          if (j.model) model = j.model;
          if (j.remaining != null) remaining = j.remaining;
          if (j.done) done = true;
        } catch (e) {}
      }
      function scan(block) {
        var data = null;
        block.split(/\r?\n/).forEach(function (ln) {
          if (ln.slice(0, 6) === "data: ") data = ln.slice(6);
        });
        if (data) take(data);
      }
      function feed(chunk) {
        buf += chunk;
        var parts = buf.split(/\r?\n\r?\n/);
        buf = parts.pop();
        parts.forEach(scan);
      }
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { feed(dec.decode()); if (buf) scan(buf); return; }
          feed(dec.decode(r.value, { stream: true }));
          return pump();
        });
      }
      return pump().then(function () {
        if (bubble) bubble.textContent = full;
        if (!done) return new Response(JSON.stringify({
          ok: false, chat_id: chatId,
          error: full ? "The answer was cut off — try again." : "The stream was interrupted — try again."
        }), { status: 200, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({
          ok: true, chat_id: chatId, reply: full, model: model, remaining: remaining
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }).catch(function () {
        try { reader.cancel(); } catch (er) {}
        if (bubble && full) bubble.textContent = full;
        return new Response(JSON.stringify({
          ok: false, chat_id: chatId, error: "The stream was interrupted — try again."
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      });
    });
  };
})();

/* ===== v154b: markdown final pass — safe render once the text settles ===== */
(function () {
  if (window.__v154b) return; window.__v154b = "1";
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function md(src) {
    var out = esc(src);
    out = out.replace(/```([\s\S]*?)```/g, function (_, c) {
      return '<pre style="background:rgba(2,12,32,.6);border:1px solid rgba(120,180,255,.25);' +
             'border-radius:10px;padding:10px 12px;overflow-x:auto"><code>' +
             c.replace(/^\n/, "") + "</code></pre>";
    });
    out = out.replace(/`([^`\n]+)`/g,
      '<code style="background:rgba(80,140,255,.16);border-radius:5px;padding:1px 5px">$1</code>');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
    out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<i>$2</i>");
    out = out.replace(/^#{1,3} (.*)$/gm, "<b>$1</b>");
    out = out.replace(/^[-•] (.*)$/gm, "&nbsp;&nbsp;• $1");
    out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" style="color:#8fd0ff">$1</a>');
    return out;
  }
  var tm = 0;
  function render() {
    var list = document.querySelectorAll(".msg.ai .bubble");
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.dataset.v154md || b.children.length) continue;
      var t = b.textContent || "";
      if (!t.trim() || t.charAt(t.length - 1) === "▌") continue;
      b.dataset.v154md = "1";
      if (/\*\*|```|`[^`]|^#{1,3} |\n[-•] |https?:\/\/\S+/.test(t)) b.innerHTML = md(t);
    }
  }
  new MutationObserver(function () {
    clearTimeout(tm); tm = setTimeout(render, 850);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();

/* ===== v155a: new-chat guard — in-flight answers can never resurrect an old chat ===== */
(function () {
  if (window.__v155a) return; window.__v155a = "1";
  if (!window.__v155gen) window.__v155gen = 0;
  var of = window.fetch;
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
                 s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1;
    if (!isChat) return of.apply(this, arguments);
    var gen = window.__v155gen;
    return of.apply(this, arguments).then(function (res) {
      if (gen === window.__v155gen) return res;
      try {                                        /* New Chat happened mid-flight */
        return res.clone().json().then(function (j) {
          if (j && j.chat_id != null) j.chat_id = null;
          return new Response(JSON.stringify(j),
            { status: 200, headers: { "Content-Type": "application/json" } });
        });
      } catch (e) { return res; }
    });
  };
  window.__v155newChat = function () {
    window.__v155gen++;                            /* orphan anything in flight */
    window.__v129chat = null;                      /* next message = brand-new DB chat */
    try { document.querySelectorAll(".msg").forEach(function (m) { m.remove(); }); } catch (e) {}
  };
})();

/* ===== v155b: Your chats — real DB history, layered above the worlds scene ===== */
(function () {
  if (window.__v155b) return; window.__v155b = "1";
  var API = "http://" + location.hostname + ":8082";
  var sec = null, busy = false;
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function get(u) {
    return fetch(API + u, { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
  function when(sec2) {
    var t = (sec2 || 0) * 1000, dt = new Date(t), now = new Date();
    if (dt.toDateString() === now.toDateString())
      return "Today, " + dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    var days = Math.round((now - t) / 864e5);
    if (days <= 1) return "Yesterday";
    if (days < 7) return days + " days ago";
    var w = Math.round(days / 7); return w + (w > 1 ? " weeks ago" : " week ago");
  }
  var css = document.createElement("style");
  css.textContent =
    "#v155chats{margin:6px 14px 2px;padding:10px 12px;border-radius:16px;" +
    "background:linear-gradient(160deg,rgba(10,22,46,.72),rgba(6,14,32,.55));" +
    "border:1px solid rgba(120,180,255,.22);backdrop-filter:blur(8px);}" +
    "#v155chats h4{margin:0 0 8px;font-size:12.5px;letter-spacing:.14em;" +
    "text-transform:uppercase;color:#9cc8ff;}" +
    "#v155chats .v155row{display:flex;align-items:center;gap:10px;padding:9px 10px;" +
    "border-radius:12px;cursor:pointer;transition:background .18s;}" +
    "#v155chats .v155row:hover{background:rgba(90,160,255,.10);}" +
    "#v155chats .v155t{flex:1;min-width:0;}" +
    "#v155chats .v155t b{display:block;font-size:14px;color:#eaf4ff;white-space:nowrap;" +
    "overflow:hidden;text-overflow:ellipsis;font-weight:600;}" +
    "#v155chats .v155t i{font-style:normal;font-size:11.5px;color:#8fa8cc;}" +
    "#v155chats .v155del{background:none;border:1px solid rgba(255,120,120,.35);color:#ff9d9d;" +
    "border-radius:9px;padding:5px 9px;font-size:12px;cursor:pointer;flex-shrink:0;}" +
    "#v155chats .v155del:hover{background:rgba(255,90,90,.12);}";
  (document.head || document.documentElement).appendChild(css);

  function host() {                                /* outermost visible history container */
    var cands = document.querySelectorAll('[id*="hist" i],[class*="hist" i]');
    var best = null;
    for (var i = 0; i < cands.length; i++) {
      var el = cands[i];
      if (el.id === "v155chats") continue;
      if (sec && sec.contains(el)) continue;
      if (el.offsetWidth > 200 && el.offsetHeight > 200 &&
          (!best || el.offsetHeight > best.offsetHeight)) best = el;
    }
    return best;
  }
  function ensure(h) {
    if (!sec) {
      sec = document.createElement("div"); sec.id = "v155chats";
      sec.innerHTML = "<h4>Your chats</h4><div class='v155list'></div>";
    }
    if (sec.parentElement !== h) h.insertBefore(sec, h.firstChild);
    return sec;
  }
  function openChat(id) {
    get("/api/chat/" + id).then(function (j) {
      if (!j || !j.ok) return;
      window.__v155gen++;
      window.__v129chat = id;
      document.querySelectorAll(".msg").forEach(function (m) { m.remove(); });
      var first = document.querySelector(".msg");
      var box = first ? first.parentElement : document.body;
      (j.messages || []).forEach(function (m) {
        var el = document.createElement("div");
        el.className = "msg " + (m.role === "assistant" ? "ai" : "user");
        var b = document.createElement("div"); b.className = "bubble";
        b.textContent = m.content; el.appendChild(b); box.appendChild(el);
      });
      try { location.hash = "#/"; } catch (e) {}
    });
  }
  function render() {
    if (busy) return; busy = true;
    get("/api/chats").then(function (j) {
      busy = false;
      if (!j || !j.ok) return;
      var h = host(); if (!h) return;
      var list = ensure(h).querySelector(".v155list");
      list.innerHTML = "";
      (j.chats || []).slice(0, 30).forEach(function (c) {
        var row = document.createElement("div"); row.className = "v155row";
        row.innerHTML = "<div class='v155t'><b>" + esc(c.title) + "</b><i>" +
          when(c.updated) + " · " + (c.msgcount || 0) + " messages</i></div>" +
          "<button class='v155del' type='button'>Delete</button>";
        row.querySelector(".v155t").onclick = function () { openChat(c.id); };
        row.querySelector(".v155del").onclick = function (ev) {
          ev.stopPropagation();
          fetch(API + "/api/chat/" + c.id, { method: "DELETE", credentials: "include",
            headers: { "X-Alfred-Token": tok() } })
            .then(function (r) { return r.json(); })
            .then(function (d) { if (d && d.ok) { row.remove(); render(); } })
            .catch(function () {});
        };
        list.appendChild(row);
      });
    });
  }
  function route() {
    var onHist = (location.hash || "").toLowerCase().indexOf("hist") > -1 || !!host();
    if (onHist) setTimeout(render, 300);
  }
  window.addEventListener("hashchange", route);
  setInterval(route, 2500);
  route();
})();

/* ===== v155c: header "+" — binds ONLY when exactly one candidate exists ===== */
(function () {
  if (window.__v155c) return; window.__v155c = "1";
  function candidates() {
    var out = [], els = document.querySelectorAll("button,[role='button'],a,div,span,svg");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.top > 170 || r.width > 80) continue;
      var t = (el.textContent || "").trim();
      var hint = ((el.id || "") + " " + (el.className || "") + " " +
                  (el.getAttribute("aria-label") || "")).toLowerCase();
      if (t === "+" || /(^|[^a-z])(newchat|new-chat|plus|add)([^a-z]|$)/.test(hint)) out.push(el);
    }
    return out;
  }
  document.addEventListener("click", function (ev) {
    var c = candidates();
    if (c.length !== 1) return;                    /* ambiguous → stay hands-off */
    var hit = null;
    for (var i = 0; i < c.length; i++)
      if (c[i].contains(ev.target)) { hit = c[i]; break; }
    if (hit) { try { window.__v155newChat(); } catch (e) {} }
  }, true);
  setTimeout(function () {
    if (candidates().length !== 1)
      console.log("v155c: header + not uniquely identified — paste the recon greps");
  }, 1500);
})();

/* ===== v156: restore engine + chip hygiene (native history already reads the DB) ===== */
(function () {
  if (window.__v156) return; window.__v156 = "1";
  var API = "http://" + location.hostname + ":8082";
  var cache = [];
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function get(u) {
    return fetch(API + u, { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function refresh() {
    return get("/api/chats").then(function (j) {
      if (j && j.ok) cache = j.chats || [];
      return cache;
    });
  }
  function titleOf(id) {
    for (var i = 0; i < cache.length; i++) if (cache[i].id == id) return cache[i].title || "";
    return "";
  }
  /* fixed opener — captures container + templates BEFORE clearing; never touches body */
  window.__v156open = function (id) {
    return get("/api/chat/" + id).then(function (j) {
      if (!j || !j.ok) return false;
      var any = document.querySelector(".msg");
      var box = any ? any.parentElement : null;
      if (!box) {                                   /* empty chat: find the greeting scroller */
        var g = null, els = document.querySelectorAll("div,section");
        for (var i = 0; i < els.length; i++) {
          var t = els[i].textContent || "";
          if (t.indexOf("Create an image") > -1 && els[i].children.length < 14) { g = els[i]; break; }
        }
        var sc = g;
        while (sc && sc !== document.body) {
          var cs = getComputedStyle(sc);
          if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 40) break;
          sc = sc.parentElement;
        }
        box = (sc && sc !== document.body) ? sc : null;
      }
      if (!box) return false;
      var tplAI = document.querySelector(".msg.ai"), tplUser = document.querySelector(".msg.user");
      window.__v155gen++;                           /* orphan anything in flight */
      window.__v129chat = id;
      box.querySelectorAll(".msg").forEach(function (m) { m.remove(); });
      (j.messages || []).forEach(function (m) {
        var tpl = m.role === "assistant" ? tplAI : tplUser, el, b;
        if (tpl) {                                  /* clone the app's own bubble style */
          el = tpl.cloneNode(true);
          b = el.querySelector(".bubble");
          if (b) { b.textContent = m.content; try { delete b.dataset.v154md; } catch (e) {} }
        } else {
          el = document.createElement("div");
          el.className = "msg " + (m.role === "assistant" ? "ai" : "user");
          b = document.createElement("div"); b.className = "bubble";
          b.textContent = m.content; el.appendChild(b);
        }
        box.appendChild(el);
      });
      try { box.scrollTop = box.scrollHeight; } catch (e) {}
      return true;
    });
  };
  /* chip hygiene: clear the stale title pill only when positively identified */
  function chipSwap(oldT, newT) {
    if (!oldT) return;
    var els = document.querySelectorAll("div,span,p,h1,h2,h3,h4"), hits = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.top > 340 || r.height > 90) continue;
      var t = (el.textContent || "").trim();
      if ((t === oldT || t === "◈ " + oldT) && el.children.length <= 3) hits.push(el);
    }
    if (hits.length !== 1) return;                  /* ambiguous → hands off */
    var chip = hits[0], w = document.createTreeWalker(chip, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf(oldT) > -1) { n.nodeValue = newT ? n.nodeValue.replace(oldT, newT) : ""; return; }
    }
    if (!newT) chip.style.display = "none";
  }
  var _nc = window.__v155newChat;
  window.__v155newChat = function () {
    var oldT = titleOf(window.__v129chat);
    if (_nc) _nc(); else { window.__v155gen++; window.__v129chat = null; }
    chipSwap(oldT, "");
  };
  refresh();
  window.addEventListener("hashchange", function () {
    if ((location.hash || "").toLowerCase().indexOf("hist") > -1) refresh();
  });
})();

/* ===== v157a: token bridge v2 — Remember me, admission, credits pill, plan sync ===== */
(function () {
  if (window.__v157a) return; window.__v157a = "1";
  window.__v144 = "1";                                   /* retire v144 double-reload */
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  var pill = null;
  function ensurePill() {
    if (pill && document.contains(pill)) return pill;
    pill = document.createElement("div"); pill.id = "v157cr";
    pill.style.cssText = "display:none;align-items:center;white-space:nowrap;" +
      "font-size:12px;font-weight:700;color:#aee0ff;background:rgba(18,40,78,.6);" +
      "border:1px solid rgba(120,180,255,.4);border-radius:999px;padding:6px 11px;" +
      "backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,10,30,.35);";
    var plus = null, els = document.querySelectorAll("button,[role='button'],div,span,a");
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width && r.width < 80 && r.top > 40 && r.top < 170 &&
          (els[i].textContent || "").trim() === "+") { plus = els[i]; break; }
    }
    if (plus && plus.parentNode) {
      pill.style.display = "flex"; pill.style.marginRight = "10px";
      plus.parentNode.insertBefore(pill, plus);
    } else {
      pill.style.cssText += "display:flex;position:fixed;top:74px;right:14px;z-index:9999;";
    }
    return pill;
  }
  function setCr(n) { var p = ensurePill(); if (p) p.textContent = "⚡ " + n; }
  function setPlan(plan) {
    if (!plan) return;
    var n, els = document.querySelectorAll("b,div,span,h1,h2,h3,p");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.top > 190 || r.height > 70) continue;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro" || v === "Ultra") &&
            v.toLowerCase() !== String(plan).toLowerCase())
          n.nodeValue = n.nodeValue.replace(v, plan);
      }
    }
    var w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    while ((n = w2.nextNode()))
      if (/^Selected: (Free|Pro|Ultra)$/i.test(n.nodeValue.trim()))
        n.nodeValue = "Selected: " + plan;
  }
  window.__v157usage = function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) {
        if (r.status === 401) { try { localStorage.removeItem("alfred_token");
          localStorage.removeItem("alfred_authed"); } catch (e) {} return null; }
        return r.ok ? r.json() : null;
      })
      .then(function (j) { if (j && j.ok) { setCr(j.remaining); setPlan(j.plan); } })
      .catch(function () {});
  };
  var of = window.fetch;
  window.fetch = function (u, o) {
    o = o || {};
    var s = typeof u === "string" ? u : (u && u.url) || "";
    if (tok() && !(o.headers && o.headers["X-Alfred-Token"]) &&
        (s.indexOf("/api/auth/") > -1 || s.indexOf(":8082/") > -1)) {
      o.headers = Object.assign({}, o.headers || {}, { "X-Alfred-Token": tok() });
    }
    arguments[1] = o;
    var p = of.apply(this, arguments);
    if (/\/api\/auth\/(login|register)/.test(s) || s.indexOf(":8082/") > -1) {
      p.then(function (r) {
        r.clone().json().then(function (j) {
          if (j && j.ok && j.token) {
            try { localStorage.setItem("alfred_token", j.token);
                  localStorage.setItem("alfred_authed", "1"); } catch (e) {}
          }
          if (j && j.ok && j.remaining != null) setCr(j.remaining);
          if (j && j.ok && j.plan) setPlan(j.plan);
        }).catch(function () {});
      }).catch(function () {});
    }
    return p;
  };
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    if (!tok()) { window.__v157usage(); return; }
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) {
        if (r.status === 401) { try { localStorage.removeItem("alfred_token");
          localStorage.removeItem("alfred_authed"); } catch (e) {} return null; }
        if (!r.ok) return null;
        try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
        return r.json();
      })
      .then(function (j) {
        if (j && j.ok) {
          setCr(j.remaining); setPlan(j.plan);
          setTimeout(function () {
            if (document.querySelector("input[type='password']") &&
                !sessionStorage.getItem("v157rl")) {
              try { sessionStorage.setItem("v157rl", "1"); } catch (e) {}
              /* v203: no reload */
            }
          }, 1800);
        }
      })
      .catch(function () {});                        /* network fail: keep token */
  }
  var sweeps = 0;
  var tm = setInterval(function () {                 /* kill the stale debug toast */
    sweeps++;
    var els = document.querySelectorAll("div,span");
    for (var i = 0; i < els.length; i++) {
      if ((els[i].textContent || "").trim().indexOf("tap Sign In once to continue") > -1) {
        var c = els[i];
        while (c && c !== document.body && c.parentElement &&
               getComputedStyle(c).position !== "fixed") c = c.parentElement;
        if (c && c !== document.body) c.remove();
      }
    }
    if (sweeps > 12) clearInterval(tm);
  }, 500);
  boot(); setTimeout(window.__v157usage, 2500);
  setInterval(window.__v157usage, 60000);
})();

/* ===== v158b: thinking chip + error paint + history fit ===== */
(function () {
  if (window.__v157b) return; window.__v157b = "1";
  var css = document.createElement("style");
  css.textContent =
    "#v157think{position:fixed;left:50%;transform:translateX(-50%);bottom:110px;" +
    "z-index:9998;display:none;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;" +
    "background:rgba(12,26,54,.82);border:1px solid rgba(120,180,255,.35);color:#bfe0ff;" +
    "font-size:13px;backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(0,8,30,.45);}" +
    "#v157think i{width:7px;height:7px;border-radius:50%;background:#7cc4ff;display:inline-block;" +
    "animation:v157b 1s infinite alternate;}" +
    "#v157think i:nth-child(2){animation-delay:.2s}#v157think i:nth-child(3){animation-delay:.4s}" +
    "@keyframes v157b{from{opacity:.25}to{opacity:1;transform:translateY(-3px)}}" +
    "body.v157hist{overflow-x:hidden;}" +
    "body.v157hist [id*='hist'],body.v157hist [class*='hist']{max-width:100vw;overflow-x:hidden;}" +
    "body.v157hist [id*='hist'] img,body.v157hist [class*='hist'] img{max-width:46vw;height:auto;}" +
    "#v155chats{max-width:calc(100vw - 24px);}";
  (document.head || document.documentElement).appendChild(css);
  var chip = document.createElement("div"); chip.id = "v157think";
  chip.innerHTML = "<span><i></i><i></i><i></i></span>Thinking…";
  (document.body || document.documentElement).appendChild(chip);
  var obs = null, fail = null;
  function hide() {
    chip.style.display = "none";
    if (obs) { try { obs.disconnect(); } catch (e) {} obs = null; }
    if (fail) { clearTimeout(fail); fail = null; }
  }
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var isChat = o && o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
                 s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1;
    if (!isChat) return of.apply(this, arguments);
    hide(); chip.style.display = "flex";
    var bub = null;
    try { var d = document.querySelector(".v129-dots"); if (d) bub = d.closest(".bubble"); } catch (e) {}
    if (bub && !bub.dataset.v157w) {
      bub.dataset.v157w = "1";
      obs = new MutationObserver(function () {
        if ((bub.textContent || "").replace(/▌/g, "").trim().length > 1) hide();
      });
      obs.observe(bub, { childList: true, characterData: true, subtree: true });
    }
    fail = setTimeout(hide, 45000);
    return of.apply(this, arguments).then(function (res) {
      res.clone().json().then(function (j) {
        if (j && j.ok === false && j.error) {
          var b = null, list = document.querySelectorAll(".msg.ai .bubble");
          for (var i = list.length - 1; i >= 0; i--)
            if (!(list[i].textContent || "").trim()) { b = list[i]; break; }
          if (b) { b.textContent = "⚠ " + j.error; b.style.color = "#ffd9a8";
                   try { delete b.dataset.v154md; } catch (e) {} }
        }
        if (window.__v158cr) window.__v158cr();
      }).catch(function () {});
      setTimeout(hide, 400);
      return res;
    }).catch(function (e) { setTimeout(hide, 200); throw e; });
  };
  function fit() {
    document.body.classList.toggle("v157hist",
      (location.hash || "").toLowerCase().indexOf("hist") > -1);
  }
  window.addEventListener("hashchange", fit);
  fit(); setTimeout(fit, 800);
})();

/* ===== v158c: gold credits pill (always visible) + Ultra theme sync ===== */
(function () {
  if (window.__v158c2) return; window.__v158c2 = "1";
  function tok(){ try { return localStorage.getItem("alfred_token") || ""; } catch(e){ return ""; } }
  var old = document.getElementById("v157cr"); if (old) old.style.display = "none";
  var pill = document.getElementById("v158cr");
  if (!pill) {
    pill = document.createElement("div"); pill.id = "v158cr";
    pill.style.cssText = "position:fixed;top:76px;right:12px;z-index:99999;display:none;" +
      "font:700 12px/1 system-ui,-apple-system,sans-serif;color:#ffe9c2;" +
      "background:linear-gradient(135deg,rgba(64,40,10,.88),rgba(28,18,6,.88));" +
      "border:1px solid rgba(255,190,90,.55);border-radius:999px;padding:7px 12px;" +
      "box-shadow:0 2px 14px rgba(0,8,25,.55);backdrop-filter:blur(6px);";
    (document.body || document.documentElement).appendChild(pill);
  }
  function set(n, plan) {
    pill.style.display = "block";
    pill.textContent = "⚡ " + n + (plan ? "  ·  " + plan : "");
    if (!plan) return;
    try { localStorage.setItem("alfred_plan", plan); localStorage.setItem("plan", plan); } catch(e){}
    try { window.dispatchEvent(new StorageEvent("storage",
      { key: "alfred_plan", newValue: plan })); } catch(e){}
    var els = document.querySelectorAll("b,div,span,p,h1,h2,h3");
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (!r.width || r.top > 200 || r.height > 70) continue;
      var w = document.createTreeWalker(els[i], NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro") && v.toLowerCase() !== plan.toLowerCase())
          n.nodeValue = n.nodeValue.replace(v, plan);
      }
    }
  }
  window.__v158cr = function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) set(j.remaining, j.plan); })
      .catch(function () {});
  };
  window.__v158cr();
  setInterval(window.__v158cr, 45000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) window.__v158cr(); });
})();

/* ===== v159a: admission state machine — valid token walks in, logout walks out ===== */
(function () {
  if (window.__v159) return; window.__v159 = "1";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function admit() {
    var pw = document.querySelector("input[type='password']");
    if (!pw || !tok()) return;
    var g = null;
    try { g = sessionStorage.getItem("v159adm"); } catch (e) {}
    if (g && g === tok().slice(0, 8)) return;          /* once per token — no loops */
    try { sessionStorage.setItem("v159adm", tok().slice(0, 8)); } catch (e) {}
    location.replace("/#/chat");                        /* full navigation = the proven path */
  }
  fetch("http://" + location.hostname + ":8082/api/usage",
    { credentials: "include", headers: { "X-Alfred-Token": tok() } })
    .then(function (r) {
      if (r.status === 401) {                           /* dead token: wipe, never admit */
        try { localStorage.removeItem("alfred_token");
              localStorage.removeItem("alfred_authed"); } catch (e) {}
        return null;
      }
      return r.ok ? r.json() : null;
    })
    .then(function (j) {
      if (j && j.ok) { setTimeout(admit, 600); setTimeout(admit, 2200); }
    }).catch(function () {});
  var of = window.fetch;                                /* logout: reload to the gate */
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/logout") > -1)
        p.then(function () { setTimeout(function () { location.replace("/"); }, 400); })
         .catch(function () {});
    } catch (e) {}
    return p;
  };
  var tk = 0;                                           /* stale toast: killed forever */
  function killToast() {
    var els = document.querySelectorAll("div,span");
    for (var i = 0; i < els.length; i++) {
      if ((els[i].textContent || "").trim().indexOf("tap Sign In once to continue") > -1) {
        var c = els[i];
        while (c && c !== document.body && c.parentElement &&
               getComputedStyle(c).position !== "fixed") c = c.parentElement;
        if (c && c !== document.body) c.remove();
      }
    }
  }
  new MutationObserver(function () {
    clearTimeout(tk); tk = setTimeout(killToast, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });
  killToast();
})();

/* ===== v159b: plan label on the header only (never tier cards), pill hides on logout ===== */
(function () {
  if (window.__v159b) return; window.__v159b = "1";
  var busy = false, last = null;
  function swap(plan) {
    if (!plan) return;
    var h = (location.hash || "").toLowerCase();
    if (h.indexOf("module") > -1 || h.indexOf("plan") > -1 || h.indexOf("setting") > -1) return;
    var hits = 0;
    var els = document.querySelectorAll("b,div,span,p,h1,h2,h3");
    for (var i = 0; i < els.length && hits < 3; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.height > 60 || r.top > innerHeight * 0.45) continue;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro") && v.toLowerCase() !== plan.toLowerCase()) {
          n.nodeValue = n.nodeValue.replace(v, plan); hits++;
        }
      }
    }
  }
  setInterval(function () {
    if (busy) return; busy = true;
    var t = ""; try { t = localStorage.getItem("alfred_token") || ""; } catch (e) {}
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": t } })
      .then(function (r) {
        busy = false;
        var p = document.getElementById("v158cr");
        if (r.status === 401 && p) p.style.display = "none";
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (j && j.ok && j.plan !== last) { last = j.plan; swap(j.plan); }
      })
      .catch(function () { busy = false; });
  }, 4000);
})();

/* ===== v160a: credits pill lives IN the side nav — only while the drawer is open ===== */
(function () {
  if (window.__v160a) return; window.__v160a = "1";
  var css = document.createElement("style");
  css.textContent = "#v158cr{display:none !important}" +
    "#v160cr{display:none;align-items:center;gap:8px;font:700 12.5px/1 system-ui,sans-serif;" +
    "color:#ffe9c2;background:linear-gradient(135deg,rgba(64,40,10,.92),rgba(30,20,7,.92));" +
    "border:1px solid rgba(255,190,90,.55);border-radius:14px;padding:10px 12px;" +
    "margin:10px 14px 2px;box-shadow:0 2px 12px rgba(0,8,25,.4);}" +
    "#v160cr.low{color:#ffd2c9;border-color:rgba(255,120,110,.6);" +
    "background:linear-gradient(135deg,rgba(70,20,12,.92),rgba(34,10,7,.92));}" +
    "#v160cr .v160b{flex:1;height:5px;border-radius:4px;background:rgba(255,255,255,.14);overflow:hidden}" +
    "#v160cr .v160b i{display:block;height:100%;width:100%;border-radius:4px;" +
    "background:linear-gradient(90deg,#ffc46b,#ff9d5c);transition:width .5s}" +
    "#v160cr.low .v160b i{background:linear-gradient(90deg,#ff8f7d,#ff6b5c)}";
  (document.head || document.documentElement).appendChild(css);
  var pill = document.createElement("div"); pill.id = "v160cr";
  pill.innerHTML = "<span class='v160t'>⚡ …</span><span class='v160b'><i></i></span>";
  var lastTxt = "";
  function sidebar() {
    var cands = document.querySelectorAll('[class*="side" i],[id*="side" i]'), best = null;
    for (var i = 0; i < cands.length; i++) {
      var el = cands[i], r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width > 170 && r.width < innerWidth * 0.92 && r.height > 220 &&
          r.left > -10 && r.left < 60 &&                 /* truly on-screen, left edge */
          cs.display !== "none" && cs.visibility !== "hidden") {
        if (!best || r.height > best.getBoundingClientRect().height) best = el;
      }
    }
    return best;
  }
  function place() {
    var s = sidebar();
    if (!s) { if (pill.parentNode) pill.style.display = "none"; return; }
    var foot = s.querySelector('[class*="foot" i]');
    if (foot && foot.parentNode) {
      if (pill.parentNode !== foot.parentNode) foot.parentNode.insertBefore(pill, foot);
    } else if (pill.parentNode !== s) s.appendChild(pill);
    pill.style.display = "flex";
  }
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function update() {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) {
        if (r.status === 401) { pill.style.display = "none"; return null; }
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (!(j && j.ok)) return;
        var t = "⚡ " + j.remaining + " · " + j.plan;
        if (t !== lastTxt) {
          lastTxt = t;
          pill.querySelector(".v160t").textContent = t;
          pill.classList.toggle("low", j.remaining <= 5);
          pill.querySelector(".v160b i").style.width =
            Math.max(3, Math.round(j.remaining / Math.max(1, j.cap) * 100)) + "%";
        }
        place();
      }).catch(function () {});
  }
  window.__v158cr = update;                  /* chat replies refresh it instantly */
  update(); setInterval(update, 30000);
  setInterval(place, 600);                   /* follows the drawer open/close */
  window.addEventListener("resize", place);
})();

/* ===== v160b: out of credits? Alfred still speaks — in character ===== */
(function () {
  if (window.__v160b) return; window.__v160b = "1";
  function speak(errText, name) {
    var list = document.querySelectorAll(".msg.ai .bubble"), b = null;
    for (var i = list.length - 1; i >= 0; i--)
      if (!(list[i].textContent || "").trim()) { b = list[i]; break; }
    if (!b) {                                       /* no empty bubble? make one */
      var any = document.querySelector(".msg");
      var box = any ? any.parentElement : null;
      if (!box) return;
      var el = document.createElement("div"); el.className = "msg ai";
      b = document.createElement("div"); b.className = "bubble";
      el.appendChild(b); box.appendChild(el);
    }
    var msg;
    if (/used all .* messages|messages for today/i.test(errText))
      msg = "I have poured every last thought into our day together, " + name +
            " — even a butler's mind must rest. Your credits return at midnight, " +
            "or you may unlock more of me anytime in Plans. 🌙";
    else if (/faster than I can think/i.test(errText))
      msg = "One moment — I can only pour so quickly. Give me a breath and ask again. ☕";
    else
      msg = "Forgive me — something interrupted me mid-thought. Try once more, " + name + ".";
    b.textContent = msg;
    b.style.color = "#ffe3c9";
    try { delete b.dataset.v154md; } catch (e) {}
  }
  var of = window.fetch;
  window.fetch = function (u, o) {
    var p = of.apply(this, arguments);
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (o && o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
          s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1) {
        p.then(function (r) {
          r.clone().json().then(function (j) {
            if (j && j.ok === false && j.error) {
              var n = "Fred";
              try { n = localStorage.getItem("alfred_name") || "Fred"; } catch (e) {}
              speak(j.error, n.charAt(0).toUpperCase() + n.slice(1));
            }
          }).catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };
})();

/* ===== v161e: stable plan label + Ultra theme + thinking card ===== */
(function () {
  if (window.__v161e) return; window.__v161e = "1";
  var css = document.createElement("style");
  css.textContent =
    "body.v161ultra .msg-av,body.v161ultra .av{box-shadow:0 0 14px rgba(255,180,80,.55)," +
    "0 0 4px rgba(255,200,120,.8) !important;border-color:rgba(255,190,100,.7) !important;}" +
    "body.v161ultra .composer{border-color:rgba(255,190,100,.4) !important;}" +
    "body.v161ultra #v160cr{border-color:rgba(255,210,130,.85) !important;}" +
    "#v161think{position:fixed;left:50%;transform:translateX(-50%);bottom:112px;z-index:9998;" +
    "display:none;align-items:center;gap:9px;padding:9px 16px;border-radius:999px;" +
    "background:rgba(10,22,46,.85);border:1px solid rgba(130,190,255,.4);color:#cfe6ff;" +
    "font-size:13px;backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(0,8,30,.5);}" +
    "#v161think i{width:7px;height:7px;border-radius:50%;background:#7cc4ff;display:inline-block;" +
    "animation:v161t 1s infinite alternate;}" +
    "#v161think i:nth-child(2){animation-delay:.2s}#v161think i:nth-child(3){animation-delay:.4s}" +
    "@keyframes v161t{from{opacity:.25}to{opacity:1;transform:translateY(-3px)}}";
  (document.head || document.documentElement).appendChild(css);
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  var plan = "";
  /* stable label: fast sweep + scoped observer — no visible flip */
  function fix() {
    if (!plan || plan === "Free") return;
    var els = document.querySelectorAll("b,div,span,p,h1,h2,h3"), hits = 0;
    for (var i = 0; i < els.length && hits < 3; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.height > 60 || r.top > innerHeight * 0.45) continue;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro") && v !== plan) { n.nodeValue = n.nodeValue.replace(v, plan); hits++; }
      }
    }
  }
  setInterval(fix, 700);
  setInterval(function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!(j && j.ok)) return;
        plan = j.plan;
        document.body.classList.toggle("v161ultra", plan === "Ultra");
        fix();
      }).catch(function () {});
  }, 6000);
  /* thinking card: drives the app's own .proc element if present, else glass chip */
  var chip = document.createElement("div"); chip.id = "v161think";
  chip.innerHTML = "<span><i></i><i></i><i></i></span><span class='v161tt'>Thinking…</span>";
  (document.body || document.documentElement).appendChild(chip);
  var words = ["Thinking…", "Consulting the engines…", "Composing…"];
  var rot = null, obs = null, fail = null;
  function native() {
    var els = document.querySelectorAll('[class*="proc"]');
    for (var i = 0; i < els.length; i++)
      if ((els[i].textContent || "").indexOf("Thinking") > -1 && els[i].offsetParent) return els[i];
    return null;
  }
  function hide() {
    chip.style.display = "none"; clearInterval(rot);
    if (obs) { try { obs.disconnect(); } catch (e) {} obs = null; }
    if (fail) { clearTimeout(fail); fail = null; }
    var n = native(); if (n) n.style.display = "";
  }
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    if (!(o && o.method === "POST" && s.indexOf(":8082/api/chat") > -1 &&
          s.indexOf("/stream") === -1 && s.indexOf("/api/chats") === -1))
      return of.apply(this, arguments);
    hide();
    var n = native();
    if (n) { n.style.display = "flex"; }
    else chip.style.display = "flex";
    var wi = 0;
    rot = setInterval(function () {
      wi = (wi + 1) % words.length;
      chip.querySelector(".v161tt").textContent = words[wi];
      var pt = document.querySelector(".proc-title");
      if (pt && native()) pt.textContent = words[wi];
    }, 1400);
    var bub = null;
    try { var d = document.querySelector(".v129-dots"); if (d) bub = d.closest(".bubble"); } catch (e) {}
    if (bub && !bub.dataset.v161w) {
      bub.dataset.v161w = "1";
      obs = new MutationObserver(function () {
        if ((bub.textContent || "").replace(/▌/g, "").trim().length > 1) hide();
      });
      obs.observe(bub, { childList: true, characterData: true, subtree: true });
    }
    fail = setTimeout(hide, 45000);
    return of.apply(this, arguments).then(function (res) {
      setTimeout(hide, 400); return res;
    }).catch(function (e) { hide(); throw e; });
  };
})();

/* ===== v163b: label harmonizer (light) — store now agrees, war is over ===== */
(function () {
  if (window.__v163b) return; window.__v163b = "1";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  var plan = "";
  setInterval(function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) plan = j.plan; }).catch(function () {});
  }, 8000);
  setInterval(function () {
    if (!plan || plan === "Free") return;
    var els = document.querySelectorAll("b,div,span,p,h1,h2,h3"), hits = 0;
    for (var i = 0; i < els.length && hits < 3; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.height > 60 || r.top > innerHeight * 0.45) continue;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro") && v.toLowerCase() !== plan.toLowerCase()) {
          n.nodeValue = n.nodeValue.replace(v, plan); hits++;
        }
      }
    }
  }, 1000);
})();

/* ===== v163b: label harmonizer (light) — store now agrees, war is over ===== */
(function () {
  if (window.__v163b) return; window.__v163b = "1";
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  var plan = "";
  setInterval(function () {
    fetch("http://" + location.hostname + ":8082/api/usage",
      { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) plan = j.plan; }).catch(function () {});
  }, 8000);
  setInterval(function () {
    if (!plan || plan === "Free") return;
    var els = document.querySelectorAll("b,div,span,p,h1,h2,h3"), hits = 0;
    for (var i = 0; i < els.length && hits < 3; i++) {
      var el = els[i], r = el.getBoundingClientRect();
      if (!r.width || r.height > 60 || r.top > innerHeight * 0.45) continue;
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.trim();
        if ((v === "Free" || v === "Pro") && v.toLowerCase() !== plan.toLowerCase()) {
          n.nodeValue = n.nodeValue.replace(v, plan); hits++;
        }
      }
    }
  }, 1000);
})();

/* ===== v164b: /api/auth/me carries the token (phone Chrome drops cookies) ===== */
(function () {
  if (window.__v164b) return; window.__v164b = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    try {
      var s = typeof u === "string" ? u : (u && u.url) || "";
      if (s.indexOf("/api/auth/me") > -1) {
        var t = "";
        try { t = localStorage.getItem("alfred_token") || ""; } catch (e) {}
        if (t) {
          o = o || {};
          var h = Object.assign({}, o.headers || {});
          if (!h["X-Alfred-Token"]) h["X-Alfred-Token"] = t;
          o.headers = h;
        }
      }
    } catch (e) {}
    return of.call(this, u, o);
  };
})();
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

/* v170b: keep the header plan label in sync; cosmetic only */
(function () {
  if (window.__v170b) return;
  window.__v170b = true;

  function planName(id) {
    id = String(id || "").toLowerCase();
    return id === "ultra" ? "Ultra" : id === "pro" ? "Pro" :
           id === "free" ? "Free" : "";
  }
  function enrich(value) {
    try {
      var p = JSON.parse(value);
      if (!p || typeof p !== "object") return value;
      var name = planName(p.id);
      if (!name) return value;
      p.name = name; p.label = name;
      return JSON.stringify(p);
    } catch (e) { return value; }
  }
  try {
    var originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && String(key) === "alfred_plan")
        value = enrich(String(value));
      return originalSet.call(this, key, value);
    };
    var saved = localStorage.getItem("alfred_plan");
    if (saved) originalSet.call(localStorage, "alfred_plan", enrich(saved));
  } catch (e) {}

  function syncHeader() {
    var name = "";
    try {
      var p = JSON.parse(localStorage.getItem("alfred_plan") || "{}");
      name = planName(p.id);
    } catch (e) {}
    if (!name || !document.body) return;
    try {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        if (!/^(Free|Pro|Ultra)$/.test((node.nodeValue || "").trim())) continue;
        var range = document.createRange();
        range.selectNodeContents(node);
        var rect = range.getBoundingClientRect();
        if (rect.width && rect.top >= 0 && rect.top <= 170 &&
            node.nodeValue.trim() !== name) {
          node.nodeValue = name;
        }
      }
    } catch (e) {}
  }
  syncHeader();
  setInterval(syncHeader, 1500);
})();

/* v170c: normalize alfred_plan writes without discarding plan metadata */
(function () {
  if (window.__v170c) return;
  window.__v170c = true;

  function canon(raw) {
    var p = raw;
    try { p = JSON.parse(String(raw)); } catch (e) {}
    if (typeof p === "string") p = { id: p };
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    var m = String(p.id || p.plan || p.name || "")
      .toLowerCase().match(/\b(ultra|pro|free)\b/);
    if (!m) return null;
    p.id = m[1];
    p.name = p.label = m[1].charAt(0).toUpperCase() + m[1].slice(1);
    return JSON.stringify(p);
  }

  var prev = Storage.prototype.setItem;
  function fix() {
    try {
      var raw = localStorage.getItem("alfred_plan");
      if (raw === null) return;
      var clean = canon(raw);
      if (clean && clean !== raw) prev.call(localStorage, "alfred_plan", clean);
    } catch (e) {}
  }
  Storage.prototype.setItem = function (key, value) {
    try {
      if (this === localStorage && String(key) === "alfred_plan") {
        var clean = canon(value);
        if (clean) value = clean;
      }
    } catch (e) {}
    return prev.call(this, key, value);
  };

  fix();
  setTimeout(fix, 400);
  setInterval(fix, 2000);
  window.addEventListener("storage", function (e) {
    if (e.key === "alfred_plan") setTimeout(fix, 0);
  });
})();

/* v171: 10-second health badge — is the doctor on duty? */
(function(){
  if(window.__v171) return; window.__v171="1";
  function badge(){
    var b=document.getElementById("v171badge");
    if(!b){ b=document.createElement("div"); b.id="v171badge";
      b.style.cssText="position:fixed;bottom:6px;right:6px;z-index:2147483647;background:rgba(0,0,0,.75);color:#7fd48f;font:11px monospace;padding:4px 8px;border-radius:8px;pointer-events:none";
      (document.body||document.documentElement).appendChild(b); }
    var gate=document.getElementById("alfred-gate");
    var vis=gate&&getComputedStyle(gate).display!=="none";
    var plan="";try{plan=localStorage.getItem("alfred_plan")||"";}catch(e){}
    b.textContent="v170:"+(window.__v170?"LIVE":"DEAD")+" gate:"+(gate?(vis?"OPEN":"hidden"):"none")+" plan:"+plan.slice(0,40);
  }
  badge(); setInterval(badge,1000);
})();

/* v171b: instant header plan repaint (MutationObserver) — wins the paint war */
(function () {
  if (window.__v171b) return; window.__v171b = "1";
  function planLabel() {
    try {
      var p = JSON.parse(localStorage.getItem("alfred_plan") || "{}");
      var id = String(p.id || "").toLowerCase();
      return id === "ultra" ? "Ultra" : id === "pro" ? "Pro" : id === "free" ? "Free" : "";
    } catch (e) { return ""; }
  }
  function repaint() {
    var name = planLabel(); if (!name || !document.body) return;
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = (n.nodeValue || "").trim();
        if (!/^(Free|Pro|Ultra)$/.test(t)) continue;
        var r = document.createRange(); r.selectNodeContents(n);
        var b = r.getBoundingClientRect();
        if (b.width && b.top >= 0 && b.top <= 200 && t !== name) n.nodeValue = name;
      }
    } catch (e) {}
  }
  repaint(); setInterval(repaint, 700);
  try {
    var mo = new MutationObserver(function () { repaint(); });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (e) {}
})();

/* v172: prevent the second post-login reload; keep v170's normal app boot */
(function () {
  if (window.__v172) return;
  window.__v172 = true;

  var KEY = "v170boot2";
  function arm() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  }
  try {
    if (sessionStorage.getItem(KEY) === "1") {
      setTimeout(function () { try { sessionStorage.removeItem(KEY); } catch (e) {} }, 15000);
    }
  } catch (e) {}

  var previous = window.fetch;
  window.fetch = function (input) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var result = previous.apply(this, arguments);
    if (/\/api\/auth\/(login|register)(?:[?#]|$)/.test(url)) {
      result.then(function (response) {
        return response.clone().json().then(function (data) {
          if (data && data.ok && data.token) arm();
        }).catch(function () {});
      }).catch(function () {});
    }
    return result;
  };
})();

/* v173: server-verified plan wins; repair stale boot cache once */
(function () {
  if (window.__v173) return;
  window.__v173 = true;

  var FIX = "v173_plan_fix";
  var authPlan = "";

  function idOf(raw) {
    try {
      var p = JSON.parse(raw);
      if (typeof p === "string") return p.toLowerCase();
      return String(p && (p.id || p.plan || p.name) || "").toLowerCase();
    } catch (e) { return String(raw || "").toLowerCase(); }
  }
  function doc(plan, raw) {
    var p = {};
    try {
      var old = JSON.parse(raw || "{}");
      if (old && typeof old === "object" && !Array.isArray(old)) p = old;
      else if (typeof old === "string") p.id = old;
    } catch (e) {}
    p.id = plan.toLowerCase();
    p.name = p.label = plan;
    return JSON.stringify(p);
  }
  function sync(plan) {
    authPlan = plan;
    localStorage.setItem("alfred_plan", doc(plan, localStorage.getItem("alfred_plan")));
    localStorage.setItem("alfred_plan_cache", doc(plan, localStorage.getItem("alfred_plan_cache")));
  }
  function repair() {
    var token = "";
    try { token = localStorage.getItem("alfred_token") || ""; } catch (e) {}
    fetch("/api/auth/me", {
      credentials: "include",
      headers: { "X-Alfred-Token": token }
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var plan = j && j.ok && j.user && String(j.user.plan || "");
        if (!/^(free|pro|ultra)$/i.test(plan)) return;
        plan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();

        var mismatch =
          idOf(localStorage.getItem("alfred_plan")) !== plan.toLowerCase() ||
          idOf(localStorage.getItem("alfred_plan_cache")) !== plan.toLowerCase();

        sync(plan);
        if (!mismatch) {
          try { sessionStorage.removeItem(FIX); } catch (e) {}
          return;
        }
        var tried = false;
        try { tried = sessionStorage.getItem(FIX) === "1"; } catch (e) {}
        if (!tried) {
          try { sessionStorage.setItem(FIX, "1"); } catch (e) {}
          location.reload();                      /* ONE repair reload, then boot fresh */
        }
      }).catch(function () {});
  }

  /* after verification, no layer may write a stale plan back */
  var prevSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    try {
      if (this === localStorage && authPlan &&
          (key === "alfred_plan" || key === "alfred_plan_cache")) {
        value = doc(authPlan, String(value));
      }
    } catch (e) {}
    return prevSet.call(this, key, value);
  };

  /* sign-in from settings → land on chat (v170 owns the #/login case) */
  var prevFetch = window.fetch;
  window.fetch = function (input) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var result = prevFetch.apply(this, arguments);
    if (/\/api\/auth\/(login|register)(?:[?#]|$)/.test(url)) {
      result.then(function (r) {
        return r.clone().json().then(function (j) {
          if (!j || !j.ok || !j.token) return;
          if (j.user && /^(free|pro|ultra)$/i.test(String(j.user.plan || ""))) sync(j.user.plan);
          var h = location.hash || "";
          if (!/login/i.test(h) && !/chat/i.test(h)) location.hash = "#/chat";
        }).catch(function () {});
      }).catch(function () {});
    }
    return result;
  };

  repair();
})();

/* v175: modules taps become REAL — server plan, pill and header follow */
(function () {
  if (window.__v175) return; window.__v175 = "1";

  function tierFromCard(el) {
    for (var n = el, i = 0; n && i < 8; i++, n = n.parentElement) {
      if (!n.querySelector) continue;
      var hs = n.querySelectorAll("h1,h2,h3,b,strong,div,span");
      for (var k = 0; k < hs.length; k++) {
        var t = (hs[k].textContent || "").trim();
        if (/^(Free|Pro|Ultra)$/.test(t)) return t.toLowerCase();
      }
    }
    return "";
  }
  function writePlan(id) {
    try {
      var cap = id.charAt(0).toUpperCase() + id.slice(1);
      var doc = JSON.stringify({ id: id, name: cap, label: cap });
      localStorage.setItem("alfred_plan", doc);
      localStorage.setItem("alfred_plan_cache", doc);
    } catch (e) {}
  }
  function repaintPill(remaining, plan) {
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), x;
      while ((x = w.nextNode())) {
        var t = x.nodeValue || "";
        if (t.length > 40) continue;
        var m = t.match(/(\d+)\s*\u00b7\s*(Free|Pro|Ultra)/);
        if (m) x.nodeValue = t.replace(/(\d+)\s*\u00b7\s*(Free|Pro|Ultra)/,
          (remaining != null ? remaining : m[1]) + " \u00b7 " + (plan || m[2]));
      }
    } catch (e) {}
  }

  document.addEventListener("click", function (ev) {
    if (!ev.isTrusted) return;
    if ((location.hash || "").indexOf("mod") === -1) return;
    var tier = tierFromCard(ev.target);
    if (!tier) return;
    setTimeout(function () {
      try {
        var token = "";
        try { token = localStorage.getItem("alfred_token") || ""; } catch (e) {}
        fetch("/api/auth/plan", {
          method: "POST", credentials: "same-origin",
          headers: { "Content-Type": "application/json", "X-Alfred-Token": token },
          body: JSON.stringify({ plan: tier })
        }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (!j || !j.ok) return;
            writePlan(String(j.plan || tier).toLowerCase());
            repaintPill(j.remaining, j.plan || tier);
            try { window.dispatchEvent(new CustomEvent("alfred:plan-updated", { detail: j })); } catch (e) {}
          }).catch(function () {});
      } catch (e) {}
    }, 450);
  }, true);
})();

/* v176: kill the phantom login card — boot /me syncs alfred_authed (fail-closed) */
(function () {
  if (window.__v176) return; window.__v176 = "1";
  var GUARD = "v176sync";
  try { if (sessionStorage.getItem(GUARD) === "1")
    setTimeout(function () { try { sessionStorage.removeItem(GUARD); } catch (e) {} }, 12000);
  } catch (e) {}
  var token = "";
  try { token = localStorage.getItem("alfred_token") || ""; } catch (e) {}
  fetch("/api/auth/me", { credentials: "same-origin", headers: { "X-Alfred-Token": token } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!(j && j.ok && j.user)) return;              /* not signed in: do nothing */
      try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
      var pw = document.querySelector("input[type='password']");
      var already = false;
      try { already = sessionStorage.getItem(GUARD) === "1"; } catch (e) {}
      if (pw && !already) {                            /* demo card showing over a live session */
        try { sessionStorage.setItem(GUARD, "1"); } catch (e) {}
        /* v203: no reload */
      }
    }).catch(function () {});
})();

/* v178: plain login — no remembered prefill; you type, or you don't get in */
(function () {
  if (window.__v178) return; window.__v178 = "1";
  function cardVisible() {
    var ins = document.querySelectorAll("input[type='password']");
    for (var i = 0; i < ins.length; i++) {
      var r = ins[i].getBoundingClientRect();
      if (r.width && r.height) return true;
    }
    return false;
  }
  var cleared = false;
  function plainify() {
    if (cleared || !cardVisible()) return;
    try {
      var em = document.querySelector("input[type='email'], input[autocomplete='username']");
      var pw = document.querySelector("input[type='password']");
      if (em && em.value) em.value = "";
      if (pw && pw.value) pw.value = "";
      var cb = document.querySelector("input[type='checkbox']");
      if (cb) cb.checked = false;
      cleared = true;
    } catch (e) {}
  }
  plainify();
  setInterval(plainify, 1200);
})();

/* v179: truth-guard — the server's 401 outranks any UI trick */
(function () {
  if (window.__v179) return; window.__v179 = "1";
  var watch = 0;
  function wipe() {
    try { localStorage.removeItem("alfred_authed"); } catch (e) {}
    try { localStorage.removeItem("alfred_token"); } catch (e) {}
    var els = document.querySelectorAll("div,section,span,p");
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || "");
      if (t.indexOf("Signed in") > -1 && t.indexOf("tap Sign In") > -1 && t.length < 120)
        els[i].style.display = "none";
    }
  }
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var p = of.apply(this, arguments);
    if (/\/api\/auth\/(login|register)(\?|$)/.test(s)) {
      p.then(function (r) {
        if (r.status === 401 || r.status === 403) {
          wipe(); watch = Date.now() + 10000;         /* 10s re-wipe window */
        }
      }).catch(function () {});
    }
    return p;
  };
  setInterval(function () {
    if (Date.now() > watch) return;
    try { if (localStorage.getItem("alfred_authed")) wipe(); } catch (e) {}
  }, 1200);
})();

/* v180: Modules is view-only — admin selects, users see their paid tier */
(function () {
  if (window.__v180) return; window.__v180 = "1";
  var admin = false;
  function who() {
    var token = "";
    try { token = localStorage.getItem("alfred_token") || ""; } catch (e) {}
    fetch("/api/auth/me", { credentials: "same-origin", headers: { "X-Alfred-Token": token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        admin = !!(j && j.ok && j.user &&
          String(j.user.email || "").toLowerCase() === "fred@test.com");
      }).catch(function () { admin = false; });
  }
  who(); setInterval(who, 60000);
  function tierCard(el) {
    for (var n = el, i = 0; n && i < 8; i++, n = n.parentElement) {
      if (!n.querySelector) continue;
      var hs = n.querySelectorAll("h1,h2,h3,b,strong,div,span");
      for (var k = 0; k < hs.length; k++)
        if (/^(Free|Pro|Ultra)$/.test((hs[k].textContent || "").trim())) return true;
    }
    return false;
  }
  document.addEventListener("click", function (ev) {
    if (!ev.isTrusted || admin) return;
    if ((location.hash || "").indexOf("mod") === -1) return;
    if (!tierCard(ev.target)) return;
    ev.preventDefault(); ev.stopPropagation();
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode()))
        if (/View only/.test(n.nodeValue || "")) return;
    } catch (e) {}
    try { if (typeof showToast === "function") showToast("View only — your plan comes from your package", true); } catch (e) {}
  }, true);
})();

/* v181: boot router — live session goes straight to chat; login page only when signed out */
(function () {
  if (window.__v181) return; window.__v181 = "1";
  var loggingOut = false, checking = false;
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var p = of.apply(this, arguments);
    if (/\/api\/auth\/logout/.test(s)) {
      loggingOut = true;
      p.then(function () {
        try { localStorage.removeItem("alfred_authed"); } catch (e) {}
        setTimeout(function () { loggingOut = false; }, 3000);
      }).catch(function () { loggingOut = false; });
    }
    return p;
  };
  function boot() {
    if (checking || loggingOut) return;
    checking = true;
    var token = "";
    try { token = localStorage.getItem("alfred_token") || ""; } catch (e) {}
    fetch("/api/auth/me", { credentials: "same-origin", headers: { "X-Alfred-Token": token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        checking = false;
        var h = location.hash || "";
        if (j && j.ok && j.user) {
          try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
          if (h === "" || h === "#" || h === "#/" || h.indexOf("login") > -1) {
            try { location.hash = "#/chat"; } catch (e) {}
          }
        }
      }).catch(function () { checking = false; });
  }
  boot();
  window.addEventListener("hashchange", boot);
})();

/* v186: debug badges never block taps */
(function () {
  if (window.__v186) return; window.__v186 = "1";
  var css = document.createElement("style");
  css.textContent = "div[style*='rgba(8,12,24']{pointer-events:none !important;}";
  (document.head || document.documentElement).appendChild(css);
})();

/* v187: tap probe — names whatever sits under a top-left tap */
(function () {
  if (window.__v187) return; window.__v187 = "1";
  function say(m){ try{ console.log(m); }catch(e){} try{ if(typeof showToast==="function") showToast(m); }catch(e){} }
  document.addEventListener("click", function (ev) {
    var x = ev.clientX || 0, y = ev.clientY || 0;
    if (x > 140 || y > 280) return;               /* probe only the hamburger corner */
    setTimeout(function () {
      try {
        var el = document.elementFromPoint(x, y), d = "nothing";
        if (el) d = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
          (el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0,2).join(".") : "");
        say("v187 tap " + x + "," + y + " → " + d);
      } catch (e) {}
    }, 60);
  }, true);
})();

/* v188: hamburger rescue — opens the nav directly, reports into the debug badge */
(function () {
  if (window.__v188) return; window.__v188 = "1";
  function badge(m) {
    try { var b = document.querySelector("div[style*='rgba(8,12,24']"); if (b) b.textContent += "\n" + m; } catch (e) {}
  }
  function arm() {
    var sb = document.getElementById("sidebar"), sc = document.getElementById("scrim");
    if (!sb || !sc) { setTimeout(arm, 400); return; }
    badge("v188 armed");
    window.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("#burger") : null;
      if (!b) return;
      e.preventDefault();
      sb.classList.add("open"); sc.classList.add("on");
      badge("v188 OPEN");
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arm);
  else arm();
})();


/* v189: drawer layering — sidebar above scrim, always tappable */
(function () {
  if (window.__v189) return; window.__v189 = "1";
  var css = document.createElement("style");
  css.textContent = "@media (max-width:899px){"
    + "#sidebar.open{z-index:10020 !important;pointer-events:auto !important;}"
    + "#scrim.on{z-index:10010 !important;}}";
  (document.head || document.documentElement).appendChild(css);
})();

/* v190: drawer owner — open on burger, close on outside tap, close after nav tap */
(function () {
  if (window.__v190) return; window.__v190 = "1";
  var sb = null, sc = null;
  function ready() {
    if (!sb) { sb = document.getElementById("sidebar"); sc = document.getElementById("scrim"); }
    return !!(sb && sc);
  }
  window.addEventListener("click", function (e) {
    if (!ready()) return;
    var t = e.target;
    if (t && t.closest && t.closest("#burger")) {
      sb.classList.add("open"); sc.classList.add("on"); return;
    }
    if (!sb.classList.contains("open")) return;
    if (sb.contains(t)) {
      if (t.closest && t.closest(".nav-item")) { sb.classList.remove("open"); sc.classList.remove("on"); }
      return;                                   /* taps inside stay free */
    }
    sb.classList.remove("open"); sc.classList.remove("on");   /* outside tap closes */
  }, true);
})();

/* v191: nav taps drive the hash router — one navigation system */
(function () {
  if (window.__v191) return; window.__v191 = "1";
  var OK = { chat:1, explore:1, modules:1, history:1, plans:1, settings:1 };
  document.addEventListener("click", function (e) {
    var it = e.target && e.target.closest ? e.target.closest(".nav-item") : null;
    if (!it) return;
    var v = it.getAttribute("data-view");
    if (!v || !OK[v]) return;
    try { location.hash = "#/" + v; } catch (er) {}
  }, true);
})();

/* v192: drawer you control — stays open to read, closes only when you say */
(function () {
  if (window.__v192) return; window.__v192 = "1";
  function isOpen(){ var s=document.getElementById("sidebar"); return !!(s&&s.classList.contains("open")); }
  function close(){ var s=document.getElementById("sidebar"),c=document.getElementById("scrim");
    if(s) s.classList.remove("open"); if(c) c.classList.remove("on"); }
  window.addEventListener("click", function (e) {
    var s=document.getElementById("sidebar"), c=document.getElementById("scrim");
    if (!s || !c) return;
    var t = e.target;
    if (t && t.closest && t.closest("#burger")) {
      e.preventDefault(); e.stopPropagation();          /* native always-open can't fight */
      if (isOpen()) close(); else { s.classList.add("open"); c.classList.add("on"); }
      return;
    }
    if (isOpen() && s.contains(t) && t.closest && t.closest(".nav-item")) close();
  }, true);
})();

/* v193: login with eye open is still server-verified — .pw field counts */
(function () {
  if (window.__v193) return; window.__v193 = "1";
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("button,[role='button']") : null;
    if (!b) return;
    var t = (b.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!/^(sign in|enter alfred)$/.test(t)) return;
    var card = b.closest("div,section,form");
    if (!card) return;
    var pw = card.querySelector(".pw");
    if (!pw) return;
    if (card.querySelector("input[type='password']")) return;   /* v123 owns the eye-closed state */
    ev.preventDefault(); ev.stopPropagation();
    if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    var em = card.querySelector("input[type='email'], input[autocomplete='username']");
    if (!em || !em.value || !pw.value) {
      try { if (typeof showToast === "function") showToast("Type your email and password", true); } catch (e) {}
      return;
    }
    var cb = card.querySelector("input[type='checkbox']");
    fetch("/api/auth/login", { method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em.value.trim(), password: pw.value, remember: !!(cb && cb.checked) })
    }).then(function (r) { return r.json().then(function (j) { return { j: j }; }); })
      .then(function (x) {
        if (x.j && x.j.ok) {
          try { localStorage.setItem("alfred_token", x.j.token); localStorage.setItem("alfred_authed", "1"); } catch (e) {}
          location.hash = "#/chat";
        } else {
          try { if (typeof showToast === "function") showToast((x.j && x.j.error) || "Email or password is incorrect.", true); } catch (e) {}
        }
      }).catch(function () { try { if (typeof showToast === "function") showToast("Network error — try again", true); } catch (e) {} });
  }, true);
})();

/* v197: reveal without breaking type - CSS does the showing */
(function () {
  var css = document.createElement("style");
  css.textContent = "input.pw.showing{-webkit-text-security:none !important;}";
  (document.head || document.documentElement).appendChild(css);
  /* safety net: any password field flipped to text gets snapped back */
  setInterval(function () {
    document.querySelectorAll('input.pw').forEach(function (p) {
      if (p.type !== "password") p.type = "password";
    });
  }, 400);
})();

/* v198: token saved BEFORE the app navigates - the loop-breaker */
(function () {
  if (window.__v198) return; window.__v198 = "1";
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var p = of.apply(this, arguments);
    if (/\/api\/auth\/(login|register)(\?|$)/.test(s)) {
      return p.then(function (r) {
        try {
          return r.clone().json().then(function (j) {
            if (j && j.ok && j.token) {
              try { localStorage.setItem("alfred_token", j.token); } catch (e) {}
              try { localStorage.setItem("alfred_authed", "1"); } catch (e) {}
              if (j.user && j.user.name) {
                try { localStorage.setItem("alfred_name", j.user.name); } catch (e) {}
              }
            }
            return r;                       /* only now does the app see the response */
          });
        } catch (e) { return r; }
      });
    }
    return p;
  };
})();

/* v199: bounce tracer — tags every navigation with the auth state at that moment */
(function () {
  if (window.__v199) return; window.__v199 = "1";
  function state() {
    var t = 0, a = "-", c = "no";
    try { t = (localStorage.getItem("alfred_token") || "").length; } catch (e) {}
    try { a = localStorage.getItem("alfred_authed") || "-"; } catch (e) {}
    try { c = /alfred_session/.test(document.cookie || "") ? "yes" : "no"; } catch (e) {}
    return "tok=" + t + " authed=" + a + " cookie=" + c;
  }
  function mark(kind) {
    try {
      var b = document.getElementById("v199badge");
      if (!b) {
        b = document.createElement("div"); b.id = "v199badge";
        b.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#001b36;color:#8fd0ff;border:1px solid #2a6cff;border-radius:12px;padding:8px 12px;font:12px monospace;max-width:94vw;box-shadow:0 8px 30px rgba(0,0,0,.6)";
        (document.body || document.documentElement).appendChild(b);
      }
      b.textContent = kind + " | " + state() + " | " + new Date().toLocaleTimeString();
    } catch (e) {}
  }
  var oR = location.reload.bind(location);
  location.reload = function () { mark("RELOAD"); setTimeout(oR, 2500); };
  var oP = location.replace.bind(location);
  location.replace = function (u) { mark("REPLACE " + u); setTimeout(function () { oP(u); }, 2500); };
  window.addEventListener("hashchange", function () { mark("HASH→" + location.hash); });
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var p = of.apply(this, arguments);
    if (s.indexOf("/api/auth/me") > -1) {
      p.then(function (r) { if (r.status !== 200) mark("ME-FAIL " + r.status); }).catch(function () { mark("ME-NET"); });
    }
    return p;
  };
})();

/* v200: bounce historian — log survives reloads, shows the full sequence */
(function () {
  if (window.__v200) return; window.__v200 = "1";
  var KEY = "v200log";
  function log(ev) {
    var L = [];
    try { L = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) {}
    L.push(ev + " @" + new Date().toLocaleTimeString());
    L = L.slice(-6);
    try { sessionStorage.setItem(KEY, JSON.stringify(L)); } catch (e) {}
    try {
      var b = document.getElementById("v199badge");
      if (!b) {
        b = document.createElement("div"); b.id = "v199badge";
        b.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#001b36;color:#8fd0ff;border:1px solid #2a6cff;border-radius:12px;padding:8px 12px;font:11px monospace;max-width:94vw;white-space:pre";
        (document.body || document.documentElement).appendChild(b);
      }
      b.textContent = L.join("\n");
    } catch (e) {}
  }
  window.addEventListener("pagehide", function () { log("PAGEHIDE (real nav/reload)"); });
  window.addEventListener("pageshow", function () { log("PAGESHOW"); });
  window.addEventListener("hashchange", function () { log("HASH→" + location.hash); });
  var of = window.fetch;
  window.fetch = function (u, o) {
    var s = typeof u === "string" ? u : (u && u.url) || "";
    var p = of.apply(this, arguments);
    if (s.indexOf("/api/auth/me") > -1) {
      p.then(function (r) { if (r.status !== 200) log("ME-FAIL " + r.status); })
       .catch(function () { log("ME-NET-ERR"); });
    }
    return p;
  };
  log("PAGELOAD " + location.hash);
})();

/* v222: reload-hijacks retired - app may reload and self-heal again *//* v204b: light YOUR CHATS ghost sweep — checkpoints only, no loops */
(function () {
  if (window.__v204b) return; window.__v204b = "1";
  function killChats() {
    var all = document.querySelectorAll("b,span,h1,h2,h3,div,p");
    for (var i = 0; i < all.length; i++) {
      if ((all[i].textContent || "").trim().toUpperCase() !== "YOUR CHATS") continue;
      var n = all[i], hit = null;
      for (var k = 0; n && k < 8; k++, n = n.parentElement) {
        var cs; try { cs = getComputedStyle(n); } catch (e) { break; }
        if (cs.position === "fixed" || cs.position === "absolute" || cs.zIndex !== "auto") { hit = n; break; }
      }
      (hit || (all[i].parentElement && all[i].parentElement.parentElement) || all[i]).remove();
      return;
    }
  }
  function sweep() { killChats(); setTimeout(killChats, 300); }
  sweep();
  window.addEventListener("hashchange", sweep);
  setTimeout(sweep, 3000); setTimeout(sweep, 10000); setTimeout(sweep, 25000);
})();

/* v212: hide the ghost chat panel by heading + Delete + message count */
(function () {
  if (window.__v212) return;
  window.__v212 = "1";
  var heading = /your\s+chats/i;
  var queued = false;

  function inspect(seed) {
    for (var p = seed, depth = 0; p && p !== document.body && depth < 12;
         p = p.parentElement, depth++) {
      var text = p.textContent || "";
      if (text.length >= 400) break;
      if (!heading.test(text) || !/\bmessages?\b/i.test(text)) continue;
      var controls = p.querySelectorAll("button,a,[role='button']");
      var hasDelete = false;
      for (var i = 0; i < controls.length; i++) {
        var c = controls[i];
        if (/\bdelete\b/i.test((c.textContent || "") + " " +
            (c.getAttribute("aria-label") || "") + " " +
            (c.getAttribute("title") || ""))) { hasDelete = true; break; }
      }
      if (!hasDelete) continue;
      p.setAttribute("data-v212", "1");
      p.style.setProperty("display", "none", "important");
      return true;
    }
    return false;
  }

  function sweep() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = walker.nextNode())) {
      if (heading.test(n.nodeValue || "")) { inspect(n.parentElement); continue; }
      for (var q = n.parentElement, d = 0; q && q !== document.body && d < 6;
           q = q.parentElement, d++) {
        var qt = q.textContent || "";
        if (qt.length > 120) break;
        if (heading.test(qt)) { inspect(q); break; }
      }
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; sweep(); }, 200);
  }

  var observer = new MutationObserver(function (records) {
    var onlyOurs = records.length > 0 && records.every(function (r) {
      return r.type === "attributes" && r.target.hasAttribute("data-v212") &&
        (r.attributeName === "style" || r.attributeName === "data-v212");
    });
    if (!onlyOurs) schedule();
  });
  observer.observe(document.body, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ["style", "class", "data-v212"]
  });

  sweep();
  window.addEventListener("hashchange", sweep);
  var ticks = 0;
  var timer = setInterval(function () {
    sweep();
    if (++ticks >= 60) clearInterval(timer);
  }, 1500);
})();


/* v213: fallback - hide any already-rendered v155b Your chats panel */
(function () {
  if (window.__v213) return;
  window.__v213 = "1";
  function hidePanel() {
    if (!document.body) return;
    var hs = document.querySelectorAll("h4");
    for (var i = 0; i < hs.length; i++) {
      if ((hs[i].textContent || "").replace(/\s+/g, " ").trim().toLowerCase() !== "your chats") continue;
      for (var p = hs[i].parentElement; p && p !== document.body; p = p.parentElement) {
        if (!p.querySelector || !p.querySelector(".v155list")) continue;
        p.style.setProperty("display", "none", "important");
        p.setAttribute("data-v213", "1");
        break;
      }
    }
  }
  var queued = false;
  var observer = new MutationObserver(function () {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; hidePanel(); }, 150);
  });
  observer.observe(document.body, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ["style", "class"]
  });
  hidePanel();
  window.addEventListener("hashchange", hidePanel);
  var ticks = 0;
  var timer = setInterval(function () {
    hidePanel();
    if (++ticks >= 40) clearInterval(timer);
  }, 1500);
})();

/* v214: ONE plan authority — the server paints header, credits pill, sidebar footer */
(function () {
  if (window.__v214) return; window.__v214 = "1";
  var NAME = { free: "Free", pro: "Pro", ultra: "Ultra" };
  var busy = false;
  function tok() { try { return localStorage.getItem("alfred_token") || ""; } catch (e) { return ""; } }
  function paint(plan, remaining) {
    plan = NAME[(plan || "free").toLowerCase()] || "Free";
    try {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = (n.nodeValue || "").trim();
        var inBubble = n.parentElement && n.parentElement.closest &&
                       n.parentElement.closest(".bubble, .msg");
        if (inBubble) continue;
        /* credits pill: "8 · Free" → "111 · Pro" */
        if (/^\d+\s*·\s*(Free|Pro|Ultra)$/i.test(t))
          n.nodeValue = (remaining != null ? remaining : t.split("·")[0].trim()) + " · " + plan;
        /* header badge + stray plan labels near the top */
        else if (/^(Free|Pro|Ultra)( Plan| · Preview)?$/i.test(t)) {
          var r = n.parentElement.getBoundingClientRect();
          if (r.top >= 0 && r.top <= 170) n.nodeValue = plan;
        }
      }
    } catch (e) {}
    /* sidebar footer: "Fred / Ultra · Preview" → "Fred / Pro" */
    try {
      var un = document.getElementById("user-name");
      if (un) {
        var sib = un.parentElement.querySelector("i");
        if (sib) sib.textContent = plan;
      }
    } catch (e) {}
  }
  function sync() {
    if (busy) return; busy = true;
    var h = { credentials: "include", headers: { "X-Alfred-Token": tok() } };
    Promise.all([
      fetch("/api/auth/me", h).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch("http://" + location.hostname + ":8082/api/usage", h)
        .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (res) {
      var me = res[0], us = res[1];
      if (me && me.ok && me.user) {
        try { localStorage.setItem("alfred_plan", JSON.stringify({ id: (me.user.plan || "free").toLowerCase() })); } catch (e) {}
        paint(me.user.plan, us && typeof us.remaining === "number" ? us.remaining : null);
      }
      busy = false;
    });
  }
  sync();
  window.addEventListener("hashchange", sync);
  setInterval(sync, 10000);
})();


/* v215: badge sweeper — leftover debug badges go (v186 already made them untappable) */
(function () {
  if (window.__v215) return; window.__v215 = "1";
  function sweep() {
    try {
      var b = document.getElementById("v199badge");
      if (b) b.remove();
      var all = document.querySelectorAll("div[style*='rgba(8,12,24']");
      for (var i = 0; i < all.length; i++) all[i].remove();
    } catch (e) {}
  }
  sweep();
  setTimeout(sweep, 600); setTimeout(sweep, 1800);
  var n = 0, t = setInterval(function () { sweep(); if (++n > 4) clearInterval(t); }, 5000);
})();

/* v216: Admin dashboard — Users / Models & Brain / Billing / Logs (server-guarded) */
(function () {
  if (window.__v216) return; window.__v216 = "1";
  var ADMIN_EMAIL = "fred@test.com";
  function tok(){ try { return localStorage.getItem("alfred_token")||""; } catch(e){ return ""; } }
  function api(p, opt) {
    opt = opt || {}; opt.credentials = "include";
    opt.headers = Object.assign({ "X-Alfred-Token": tok() }, opt.headers||{});
    if (opt.body && !opt.headers["Content-Type"]) opt.headers["Content-Type"] = "application/json";
    return fetch(p, opt).then(function(r){ return r.json().catch(function(){ return {}; }); });
  }
  function say(m){ try { if (typeof showToast === "function") showToast(m); } catch(e){} }
  function esc(s){ var d=document.createElement("div"); d.textContent=(s==null?"":String(s)); return d.innerHTML; }
  var sec = null, cur = "users", OV = null;

  var CSS = ".adm-wrap{padding:18px;max-width:920px;margin:0 auto;color:#eaf4ff}" +
    ".adm-tabs{display:flex;gap:8px;margin:10px 0 14px}" +
    ".adm-tab{padding:8px 14px;border-radius:18px;border:1px solid rgba(120,180,255,.3);background:rgba(255,255,255,.05);color:#dce9ff;cursor:pointer;font-size:13px}" +
    ".adm-tab.on{background:linear-gradient(90deg,#3b82f6,#06b6d4);border:0;color:#fff;font-weight:700}" +
    ".adm-card{background:rgba(10,20,44,.72);border:1px solid rgba(110,170,255,.18);border-radius:16px;padding:14px;margin-bottom:12px}" +
    ".adm-t{width:100%;border-collapse:collapse;font-size:13px}" +
    ".adm-t th{text-align:left;color:#9db8e8;font-weight:600;padding:6px 4px}" +
    ".adm-t td{padding:6px 4px;border-top:1px solid rgba(120,180,255,.12)}" +
    ".adm-in{background:rgba(255,255,255,.06);border:1px solid rgba(120,180,255,.28);border-radius:8px;color:#eaf4ff;padding:6px 8px;font-size:13px}" +
    ".adm-btn{padding:7px 14px;border:0;border-radius:16px;background:linear-gradient(90deg,#3b82f6,#06b6d4);color:#fff;font-weight:700;cursor:pointer}" +
    ".adm-pill{display:inline-block;background:rgba(255,255,255,.06);border-radius:12px;padding:8px 12px;font-size:12px;color:#bfe3ff;margin:4px 6px 4px 0}";

  function engineLine(j){
    var e = j.engine || {};
    return e.ok ? ("Brain online — " + esc(e.model||"")) : ("Brain OFFLINE — " + esc(e.error||""));
  }

  function build() {
    var nav = document.getElementById("nav"); if (!nav) return false;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var a = document.createElement("a");
    a.className = "nav-item"; a.setAttribute("data-view", "admin");
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><span>Admin</span>';
    nav.appendChild(a);
    sec = document.createElement("section"); sec.className = "view"; sec.id = "view-admin";
    sec.innerHTML = '<div class="adm-wrap"><h2 style="margin:6px 0 2px"><span class="glowdot"></span>Admin Dashboard</h2>' +
      '<div class="adm-tabs"><button class="adm-tab on" data-t="users">Users</button>' +
      '<button class="adm-tab" data-t="brain">Models &amp; Brain</button>' +
      '<button class="adm-tab" data-t="billing">Billing</button>' +
      '<button class="adm-tab" data-t="logs">Logs</button></div><div id="adm-body"></div></div>';
    var views = document.querySelector(".views") || document.body;
    views.appendChild(sec);
    a.addEventListener("click", function () {
      document.querySelectorAll(".nav-item").forEach(function(n){ n.classList.remove("active"); });
      a.classList.add("active");
      document.querySelectorAll(".view").forEach(function(v){ v.classList.remove("show"); });
      sec.classList.add("show");
      try { var sb=document.getElementById("sidebar"), sc=document.getElementById("scrim");
            if (sb) sb.classList.remove("open"); if (sc) sc.classList.remove("on"); } catch(e){}
      load(cur);
    });
    sec.querySelectorAll(".adm-tab").forEach(function (b) {
      b.addEventListener("click", function () {
        sec.querySelectorAll(".adm-tab").forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on"); cur = b.getAttribute("data-t"); load(cur);
      });
    });
    return true;
  }

  function load(t) {
    var body = document.getElementById("adm-body"); if (!body) return;
    body.innerHTML = '<div class="adm-card">Loading…</div>';
    if (t === "brain") return brainTab(body);
    api("/api/admin/overview").then(function (j) {
      if (!j.ok) { body.innerHTML = '<div class="adm-card">Admin API: ' + esc(j.error) + '</div>'; return; }
      OV = j;
      if (t === "users") usersTab(body, j);
      else if (t === "billing") billTab(body, j);
      else logsTab(body, j);
    });
  }

  function usersTab(body, j) {
    var rows = (j.users||[]).map(function (u) {
      var opts = ["Free","Pro","Ultra"].map(function(p){ return '<option'+(u.plan===p?' selected':'')+'>'+p+'</option>'; }).join("");
      return '<tr><td>'+esc(u.email)+'</td><td>'+esc(u.name)+'</td>' +
        '<td><select class="adm-in">'+opts+'</select></td>' +
        '<td><button class="adm-btn" data-em="'+esc(u.email)+'">Save</button></td></tr>';
    }).join("");
    body.innerHTML = '<div class="adm-card"><b>'+engineLine(j)+'</b></div>' +
      '<div class="adm-card"><table class="adm-t"><tr><th>Email</th><th>Name</th><th>Plan</th><th></th></tr>'+rows+'</table></div>';
    body.querySelectorAll("button[data-em]").forEach(function (b) {
      b.addEventListener("click", function () {
        var em = b.getAttribute("data-em");
        var sel = b.closest("tr").querySelector("select");
        api("/api/admin/users/plan", { method:"POST", body: JSON.stringify({ email: em, plan: sel.value }) })
          .then(function (r) { say(r.ok ? (em + " → " + sel.value + " ✓") : (r.error || "failed")); load("users"); });
      });
    });
  }

  function billTab(body, j) {
    var caps = (j.brain && j.brain.daily_caps) || {}, by = j.byPlan || {};
    body.innerHTML = '<div class="adm-card"><b>Daily message caps</b><br>' +
      ["Free","Pro","Ultra"].map(function(p){
        return '<span class="adm-pill">'+p+': '+esc(caps[p]!=null?caps[p]:"—")+' msgs/day</span><span class="adm-pill">'+(by[p]||0)+' user(s)</span>';
      }).join("") +
      '<div style="margin-top:8px;color:#9db8e8">Total users: '+(j.users||[]).length+' — caps are editable in Models &amp; Brain.</div></div>';
  }

  function logsTab(body, j) {
    var rows = (j.logs||[]).map(function (l) {
      var d = new Date((l.ts||0)*1000);
      return '<tr><td>'+(isNaN(d)?"—":d.toLocaleString())+'</td><td>'+esc(l.email)+'</td>' +
        '<td style="color:'+(l.ok?'#7dffb0':'#ff9db1')+'">'+(l.ok?'OK':'BAD')+'</td><td>'+esc(l.reason)+'</td></tr>';
    }).join("");
    body.innerHTML = '<div class="adm-card"><b>Recent sign-ins</b><table class="adm-t"><tr><th>Time</th><th>Email</th><th></th><th>Reason</th></tr>'+rows+'</table></div>';
  }

  function brainTab(body) {
    api("/api/admin/brain").then(function (j) {
      if (!j.ok) { body.innerHTML = '<div class="adm-card">Admin API: '+esc(j.error)+'</div>'; return; }
      var c = j.config || {}, caps = c.daily_caps || {}, pn = c.public_names || {};
      body.innerHTML =
        '<div class="adm-card"><b>'+engineLine(j)+'</b><div class="adm-pill">API key: '+esc(c.gemini_key||"not set")+'</div></div>' +
        '<div class="adm-card"><b>Model chain</b> <i style="color:#9db8e8">(first = best, then fallbacks — one per line)</i><br>' +
          '<textarea id="adm-chain" class="adm-in" rows="3" style="width:100%">'+esc((c.chain||[]).join("\n"))+'</textarea></div>' +
        '<div class="adm-card"><table class="adm-t"><tr><th>Tier</th><th>Caps/day</th><th>Shown as</th></tr>' +
          ["Free","Pro","Ultra"].map(function(p){
            return '<tr><td>'+p+'</td><td><input class="adm-in" id="cap-'+p+'" style="width:80px" value="'+esc(caps[p]!=null?caps[p]:"")+'"></td>' +
                   '<td><input class="adm-in" id="pn-'+p+'" style="width:130px" value="'+esc(pn[p]||"")+'"></td></tr>';
          }).join("") +
          '<tr><td>Minute limit</td><td><input class="adm-in" id="adm-min" style="width:80px" value="'+esc(c.minute_limit!=null?c.minute_limit:"")+'"></td><td></td></tr>' +
          '<tr><td>Context msgs</td><td><input class="adm-in" id="adm-ctx" style="width:80px" value="'+esc(c.context_messages!=null?c.context_messages:"")+'"></td><td></td></tr>' +
        '</table></div>' +
        '<button class="adm-btn" id="adm-save">Save brain config</button>' +
        '<div class="adm-card" style="margin-top:10px;color:#9db8e8">After saving, restart the brain to apply:<br><code>pkill -f brain.py; sleep 1; nohup python3 backend/brain.py &gt;&gt; backend/engine.log 2&gt;&amp;1 &amp;</code></div>';
      document.getElementById("adm-save").addEventListener("click", function () {
        var g = function(id){ var e = document.getElementById(id); return e ? e.value : ""; };
        var caps = {}, pn = {};
        ["Free","Pro","Ultra"].forEach(function(p){
          if (g("cap-"+p) !== "") caps[p] = parseInt(g("cap-"+p),10) || 1;
          if (g("pn-"+p) !== "") pn[p] = g("pn-"+p);
        });
        api("/api/admin/brain", { method: "POST", body: JSON.stringify({
          chain: g("adm-chain").split("\n").map(function(s){ return s.trim(); }).filter(Boolean),
          daily_caps: caps, public_names: pn,
          minute_limit: parseInt(g("adm-min"),10) || 6,
          context_messages: parseInt(g("adm-ctx"),10) || 12
        })}).then(function (r) { say(r.ok ? "Brain config saved ✓ — restart the brain to apply" : (r.error || "save failed")); });
      });
    });
  }

  function boot() {
    api("/api/auth/me").then(function (j) {
      if (!(j && j.ok && j.user && (j.user.email||"").toLowerCase() === ADMIN_EMAIL)) return;
      if (!build()) setTimeout(boot, 400);
    }).catch(function(){});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 200);
})();

/* ===== v224: Settings — profile, security, sessions, health ===== */
(function () {
  var view = document.getElementById("view-settings");
  if (!view || view.dataset.set224) return;
  view.dataset.set224 = "1";
  function tok(){ try { return localStorage.getItem("alfred_token") || ""; } catch(e){ return ""; } }
  function toast(m){ var t=document.createElement("div"); t.textContent=m;
    t.style.cssText="position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#123;color:#cfe8ff;border:1px solid rgba(120,200,255,.4);padding:10px 18px;border-radius:12px;font:13px system-ui;z-index:99";
    document.body.appendChild(t); setTimeout(function(){ t.remove(); },2600); }
  function api(p,o){ return fetch(p, Object.assign({ credentials:"include",
    headers:{ "Content-Type":"application/json", "X-Alfred-Token":tok() } }, o||{}))
    .then(function(r){ return r.json(); }); }
  var card="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:16px;margin-bottom:14px";
  var lab="font-size:11px;letter-spacing:.12em;opacity:.6;margin-bottom:10px";
  var inp="width:100%;box-sizing:border-box;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.14);border-radius:10px;color:#e8f2ff;padding:10px 12px;font:14px system-ui;margin:6px 0";
  var btn="background:#2e7fd6;color:#fff;border:0;border-radius:10px;padding:10px 16px;font:600 13px system-ui;margin-top:8px;width:100%";
  view.innerHTML =
    '<div style="max-width:640px;margin:0 auto;padding:16px">'
    + '<h1 style="font-size:26px;margin:4px 0 2px">Settings</h1>'
    + '<p style="opacity:.7;margin:0 0 16px;font-size:13px">Tune Alfred to feel like yours.</p>'
    + '<div style="'+card+'"><div style="'+lab+'">PROFILE</div><div id="s224-prof" style="opacity:.6;font-size:13px">loading…</div></div>'
    + '<div style="'+card+'"><div style="'+lab+'">PASSWORD</div>'
    + '<input id="s224-cur" type="password" placeholder="Current password" style="'+inp+'">'
    + '<input id="s224-n1" type="password" placeholder="New password (8+ chars, letters & numbers)" style="'+inp+'">'
    + '<input id="s224-n2" type="password" placeholder="Repeat new password" style="'+inp+'">'
    + '<button id="s224-save" type="button" style="'+btn+'">Update password</button></div>'
    + '<div style="'+card+'"><div style="'+lab+'">SESSIONS</div><div id="s224-sess" style="opacity:.7;font-size:13px">loading…</div>'
    + '<button id="s224-revoke" type="button" style="'+btn+'">Sign out other devices</button></div>'
    + '<div style="'+card+'"><div style="'+lab+'">SYSTEM</div><div id="s224-health" style="opacity:.7;font-size:13px">checking…</div></div>'
    + '</div>';
  api("/api/auth/me").then(function(j){
    var u=j&&j.user;
    document.getElementById("s224-prof").innerHTML = u
      ? '<b>'+String(u.name||"—")+'</b> · '+String(u.email||"")+' · <span style="color:#9fd8ff">'+String(u.plan||"Free")+'</span>'
      : 'Not signed in';
  }).catch(function(){});
  function sessions(){
    api("/api/auth/sessions").then(function(j){
      var r=(j&&j.sessions)||[]; var cur=r.filter(function(s){return s.current;}).length;
      document.getElementById("s224-sess").textContent =
        r.length+" active session"+(r.length===1?"":"s")+(cur?" · this device ✓":"");
    }).catch(function(){});
  }
  sessions();
  document.getElementById("s224-revoke").onclick=function(){
    api("/api/auth/revoke-others",{method:"POST"}).then(function(j){
      toast(j.ok?"Other devices signed out ✓":(j.error||"Failed")); sessions();
    }).catch(function(){}); };
  document.getElementById("s224-save").onclick=function(){
    var c=document.getElementById("s224-cur").value, n=document.getElementById("s224-n1").value,
        n2=document.getElementById("s224-n2").value;
    if(!(n.length>=8 && /[a-zA-Z]/.test(n) && /[0-9]/.test(n))) return toast("New password needs 8+ chars, letters & numbers");
    if(n!==n2) return toast("New passwords don't match");
    api("/api/auth/change-password",{method:"POST",body:JSON.stringify({current:c,next:n})})
      .then(function(j){
        if(j&&j.ok){ toast("Password updated ✓"); ["s224-cur","s224-n1","s224-n2"].forEach(function(id){document.getElementById(id).value="";}); }
        else toast((j&&j.error)||"Failed");
      }).catch(function(){}); };
  fetch("/api/health").then(function(r){return r.json();}).then(function(j){
    document.getElementById("s224-health").textContent =
      (j&&j.ok) ? "Alfred online — brain "+(j.brain||"ready")+" ✓" : "Alfred waking up…";
  }).catch(function(){ document.getElementById("s224-health").textContent="Offline"; });
})();

/* ===== v227: Admin card (visible only to admins) ===== */
(function () {
  var view = document.getElementById("view-settings");
  if (!view || view.dataset.admin227) return;
  view.dataset.admin227 = "1";
  function tok(){ try { return localStorage.getItem("alfred_token") || ""; } catch(e){ return ""; } }
  function call(p, o){ return fetch(p, Object.assign({ credentials:"include",
    headers:{ "Content-Type":"application/json", "X-Alfred-Token":tok() } }, o||{})).then(function(r){ return r.json(); }); }
  call("/api/admin/overview").then(function (j) {
    if (!j || !j.ok) return;                            /* non-admins: card never appears */
    var wrap = view.querySelector("div"); if (!wrap) return;
    var card = document.createElement("div");
    card.style.cssText = "background:rgba(255,255,255,.05);border:1px solid rgba(255,80,80,.25);border-radius:16px;padding:16px;margin-bottom:14px";
    function row(u){
      var r = document.createElement("div");
      r.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07)";
      var sel = document.createElement("select");
      sel.style.cssText = "background:rgba(0,0,0,.3);color:#e8f2ff;border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:4px 6px;font:12px system-ui";
      ["Free","Pro","Ultra"].forEach(function(p){
        var o=document.createElement("option"); o.value=p; o.textContent=p; if(p===u.plan)o.selected=true; sel.appendChild(o); });
      sel.onchange = function(){ call("/api/admin/users/plan",{method:"POST",body:JSON.stringify({email:u.email,plan:sel.value})})
        .then(function(x){ sel.style.outline = x.ok ? "1px solid #5fe8b0" : "1px solid #ff6b6b"; setTimeout(function(){sel.style.outline="";},1200); }); };
      var del = document.createElement("button");
      del.type="button"; del.textContent="delete";
      del.style.cssText = "margin-left:auto;background:transparent;color:#ff6b6b;border:1px solid rgba(255,107,107,.4);border-radius:8px;padding:4px 10px;font:12px system-ui";
      var armed = 0;
      del.onclick = function(){
        if (!armed) { armed=1; del.textContent="sure?"; del.style.background="rgba(255,107,107,.15)";
          setTimeout(function(){ armed=0; del.textContent="delete"; del.style.background="transparent"; }, 3000); return; }
        call("/api/admin/users/delete",{method:"POST",body:JSON.stringify({email:u.email})})
          .then(function(x){ if(x.ok){ r.remove(); } else { del.textContent=x.error||"fail"; } }); };
      var em = document.createElement("span");
      em.style.cssText = "font:13px system-ui;color:#e8f2ff;overflow:hidden;text-overflow:ellipsis";
      em.textContent = u.email;
      r.appendChild(em); r.appendChild(sel); r.appendChild(del);
      return r;
    }
    var head = document.createElement("div");
    head.style.cssText = "font-size:11px;letter-spacing:.12em;opacity:.6;margin-bottom:10px";
    head.textContent = "ADMIN — " + (j.users||[]).length + " USERS";
    card.appendChild(head);
    (j.users||[]).forEach(function(u){ card.appendChild(row(u)); });
    wrap.appendChild(card);
  }).catch(function(){});
})();

/* v236: settings admin console retired - one admin surface: the dashboard */

/* ===== v229.2: reliability - real failures only (5xx/network), auth 401 silent ===== */
(function () {
  if (window.__v229) return; window.__v229 = "1";
  var of = window.fetch, last = null, el = null, tmr = null;
  function bubble(msg) {
    if (!el) {
      el = document.createElement("div");
      el.style.cssText = "position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:999;"
        + "background:#2a1420;border:1px solid rgba(255,107,107,.45);color:#ffd9d9;border-radius:14px;"
        + "padding:10px 14px;font:13px system-ui;display:flex;gap:10px;align-items:center;box-shadow:0 6px 24px rgba(0,0,0,.45)";
      var txt = document.createElement("span"), btn = document.createElement("button");
      txt.id = "v229msg"; btn.type = "button"; btn.textContent = "Retry";
      btn.style.cssText = "background:#ff6b6b;color:#fff;border:0;border-radius:9px;padding:6px 14px;font:600 13px system-ui";
      btn.onclick = function () {
        if (!last) return;
        btn.textContent = "..."; btn.disabled = true;
        of(last.u, last.o).then(function () { el.style.display = "none"; btn.textContent = "Retry"; btn.disabled = false; })
          .catch(function () { btn.textContent = "Retry"; btn.disabled = false; });
      };
      el.appendChild(txt); el.appendChild(btn); document.body.appendChild(el);
    }
    document.getElementById("v229msg").textContent = "Alfred couldn't answer - " + msg;
    el.style.display = "flex";
    clearTimeout(tmr); tmr = setTimeout(function () { if (el) el.style.display = "none"; }, 8000);
  }
  window.fetch = function (u, o) {
    var s = ""; try { s = String(u); } catch (e) {}
    var p = of.apply(this, arguments);
    if (s.indexOf("/api/chat") === -1 || s.indexOf("/api/auth") > -1 || !o || o.method !== "POST") return p;
    try { last = { u: u, o: { method: "POST", headers: o.headers, body: o.body, credentials: o.credentials || "include" } }; } catch (e) {}
    return p.then(function (r) {
      if (r.status >= 500) bubble("server trouble (" + r.status + ")");
      else if (r.status === 429) bubble("slow down - a moment, then Retry");
      return r;
    }).catch(function (e) { bubble("connection failed"); throw e; });
  };
})();


/* ===== v235: Providers tab — registry, rescan, chain editors ===== */
(function () {
  if (window.__v235) return; window.__v235 = "1";
  var J = null;
  function pf(p, o) {
    o = o || {}; o.credentials = "include";
    o.headers = Object.assign({ "Content-Type": "application/json",
      "X-Alfred-Token": localStorage.getItem("alfred_token") || "" }, o.headers || {});
    return fetch(p, o).then(function (r) { return r.json(); });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function toast(m) { var t = document.createElement("div"); t.className = "ex-toast"; t.textContent = m;
    document.body.appendChild(t); setTimeout(function () { t.classList.add("bye"); }, 2400);
    setTimeout(function () { t.remove(); }, 3000); }
  function catalog() {
    var out = [], tiers = (J && J.tiers) || {};
    Object.keys(tiers).forEach(function (pid) {
      (tiers[pid] || []).forEach(function (m) {
        var id = (typeof m === "string") ? m : m.id;
        if (id && out.indexOf(id) === -1) out.push(id); });
    });
    return out;
  }
  function render() {
    var body = document.getElementById("adm-body"); if (!body) return;
    body.innerHTML = '<div class="adm-card">Loading providers…</div>';
    pf("/api/admin/providers").then(function (j) {
      if (!j || !j.ok) { body.innerHTML = '<div class="adm-card">Providers API: ' + esc((j && j.error) || "failed") + '</div>'; return; }
      J = j; paint(body);
    });
  }
  function paint(body) {
    var provs = J.providers || [], tiers = J.tiers || {}, chains = J.chains || {};
    var h = '<div class="adm-card"><b>PROVIDERS</b><span style="opacity:.5;font-size:12px"> keys sealed — stored locally, never displayed</span>';
    provs.forEach(function (p) {
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);flex-wrap:wrap">'
        + '<b>' + esc(p.id) + '</b><span style="opacity:.55;font-size:12px">' + esc(p.type) + '</span>'
        + '<span style="font-size:12px;color:' + (p.configured ? "#5fe8b0" : "#ff6b6b") + '">' + (p.configured ? "key ✓" : "no key") + '</span>'
        + '<button type="button" class="adm-btn" data-scan="' + esc(p.id) + '" style="margin-left:auto;padding:4px 12px">rescan</button></div>';
    });
    h += '<details style="margin-top:10px"><summary style="cursor:pointer;opacity:.7;font-size:13px">+ add provider</summary>'
      + '<div style="display:grid;gap:6px;margin-top:8px;max-width:420px">'
      + '<input id="pv-id" class="adm-in" placeholder="id — e.g. openrouter">'
      + '<select id="pv-type" class="adm-in"><option value="google">google</option><option value="openai">openai</option><option value="openrouter">openrouter</option></select>'
      + '<input id="pv-url" class="adm-in" placeholder="base_url — e.g. https://api.openai.com/v1">'
      + '<input id="pv-key" class="adm-in" type="password" placeholder="api key (sealed on disk, never shown)">'
      + '<button type="button" class="adm-btn" id="pv-add">Add provider</button></div></details></div>';
    ["Free", "Pro", "Ultra"].forEach(function (plan) {
      var chain = chains[plan] || [];
      h += '<div class="adm-card"><b>' + plan.toUpperCase() + ' CHAIN</b><span style="opacity:.5;font-size:12px"> 1 = default, falls through on fail/429</span>';
      chain.forEach(function (m, i) {
        h += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:13px">'
          + '<span style="opacity:.45;width:18px">' + (i + 1) + '</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis">' + esc(m) + '</span>'
          + (i > 0 ? '<button type="button" class="adm-btn" data-up="' + plan + ':' + i + '" style="padding:2px 9px">↑</button>' : '')
          + (i < chain.length - 1 ? '<button type="button" class="adm-btn" data-dn="' + plan + ':' + i + '" style="padding:2px 9px">↓</button>' : '')
          + '<button type="button" class="adm-btn" data-rm="' + plan + ':' + i + '" style="padding:2px 9px;color:#ff6b6b">✕</button></div>';
      });
      var avail = catalog().filter(function (m) { return chain.indexOf(m) === -1; });
      h += '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
        + '<select class="adm-in" data-addsel="' + plan + '" style="flex:1;min-width:180px">'
        + avail.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join("") + '</select>'
        + '<button type="button" class="adm-btn" data-addm="' + plan + '" style="padding:4px 12px">+ add</button>'
        + '<button type="button" class="adm-btn" data-save="' + plan + '" style="padding:4px 14px">Save chain</button></div></div>';
    });
    h += '<div class="adm-card"><details><summary style="cursor:pointer;opacity:.75"><b>FULL CATALOG</b> — '
      + Object.keys(tiers).map(function (k) { return esc(k) + ": " + (tiers[k] || []).length; }).join(" · ") + '</summary>';
    Object.keys(tiers).forEach(function (pid) {
      h += '<div style="margin-top:8px"><b style="opacity:.65;font-size:12px">' + esc(pid) + '</b>';
      (tiers[pid] || []).forEach(function (m) {
        var id = (typeof m === "string") ? m : m.id, nm = (typeof m === "string") ? "" : (m.name || "");
        h += '<div style="display:flex;gap:8px;font-size:12px;padding:2px 0"><span style="flex:1">' + esc(id) + '</span><span style="opacity:.45">' + esc(nm === id ? "" : nm) + '</span></div>';
      });
      h += '</div>';
    });
    h += '</details></div>';
    body.innerHTML = h;
    function mv(plan, i, d) { var c = J.chains[plan], j = i + d;
      if (j < 0 || j >= c.length) return; var t = c[i]; c[i] = c[j]; c[j] = t; paint(body); }
    body.querySelectorAll("[data-scan]").forEach(function (b) {
      b.onclick = function () { b.textContent = "scanning…"; b.disabled = true;
        pf("/api/admin/providers/scan", { method: "POST", body: JSON.stringify({ id: b.getAttribute("data-scan") }) })
          .then(function (r) { toast(r.ok ? (r.count + " models scanned ✓") : ("scan failed — " + (r.error || "?"))); render(); }); };
    });
    var add = body.querySelector("#pv-add");
    if (add) add.onclick = function () {
      pf("/api/admin/providers/add", { method: "POST", body: JSON.stringify({
        id: body.querySelector("#pv-id").value.trim(), type: body.querySelector("#pv-type").value,
        base_url: body.querySelector("#pv-url").value.trim(), api_key: body.querySelector("#pv-key").value }) })
        .then(function (r) { toast(r.ok ? "provider added ✓" : (r.error || "add failed")); render(); }); };
    ["Free", "Pro", "Ultra"].forEach(function (plan) {
      body.querySelectorAll('[data-up^="' + plan + ':"]').forEach(function (b) {
        b.onclick = function () { mv(plan, +b.getAttribute("data-up").split(":")[1], -1); }; });
      body.querySelectorAll('[data-dn^="' + plan + ':"]').forEach(function (b) {
        b.onclick = function () { mv(plan, +b.getAttribute("data-dn").split(":")[1], 1); }; });
      body.querySelectorAll('[data-rm^="' + plan + ':"]').forEach(function (b) {
        b.onclick = function () { J.chains[plan].splice(+b.getAttribute("data-rm").split(":")[1], 1); paint(body); }; });
      var ab = body.querySelector('[data-addm="' + plan + '"]');
      if (ab) ab.onclick = function () {
        var sel = body.querySelector('[data-addsel="' + plan + '"]');
        if (sel && sel.value) { J.chains[plan].push(sel.value); paint(body); } };
      var sb = body.querySelector('[data-save="' + plan + '"]');
      if (sb) sb.onclick = function () {
        pf("/api/admin/providers/chains", { method: "POST", body: JSON.stringify({ plan: plan, models: J.chains[plan] }) })
          .then(function (r) { toast(r.ok ? (plan + " chain saved ✓ — live on next message") : (r.error || "save failed")); }); };
    });
  }
  function boot() {
    var btns = Array.prototype.slice.call(document.querySelectorAll("button")), anchor = null;
    for (var i = 0; i < btns.length; i++) if ((btns[i].textContent || "").trim() === "Models & Brain") { anchor = btns[i]; break; }
    if (!anchor || document.getElementById("pv-tab")) return !!anchor;
    var b = document.createElement("button");
    b.id = "pv-tab"; b.textContent = "Providers"; b.className = anchor.className;
    b.onclick = render;
    anchor.parentNode.insertBefore(b, anchor.nextSibling);
    return true;
  }
  var iv = setInterval(function () { if (boot()) clearInterval(iv); }, 1200);
})();

/* ===== v237: uploads — attach/image buttons live, preview strip, vision ===== */
(function () {
  if (window.__v237) return; window.__v237 = "1";
  var pending = [];
  function toast(m){ var t=document.createElement("div"); t.className="ex-toast"; t.textContent=m;
    document.body.appendChild(t); setTimeout(function(){t.classList.add("bye");},2200); setTimeout(function(){t.remove();},2800); }
  function shrink(url, cb) {
    var im = new Image();
    im.onload = function () {
      var s = Math.min(1, 1024 / Math.max(im.width, im.height));
      var c = document.createElement("canvas"); c.width = Math.round(im.width*s); c.height = Math.round(im.height*s);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      var d = c.toDataURL("image/jpeg", .85);
      cb({ mime: "image/jpeg", data: d.split(",")[1], url: d });
    }; im.src = url;
  }
  function strip() {
    var el = document.getElementById("v237strip"); if (!el) return;
    el.style.display = pending.length ? "flex" : "none"; el.innerHTML = "";
    pending.forEach(function (p, i) {
      var w = document.createElement("div"); w.style.cssText = "position:relative;flex:0 0 auto";
      if (p.url) { var im = document.createElement("img"); im.src = p.url;
        im.style.cssText = "height:52px;border-radius:10px;border:1px solid rgba(255,255,255,.25)"; w.appendChild(im); }
      else { var t = document.createElement("span"); t.textContent = "📄 " + (p.name || "file");
        t.style.cssText = "font:12px system-ui;color:#e8f2ff;background:rgba(0,0,0,.35);padding:14px 10px;border-radius:10px;display:inline-block"; w.appendChild(t); }
      var x = document.createElement("button"); x.type = "button"; x.textContent = "✕";
      x.style.cssText = "position:absolute;top:-6px;right:-6px;background:#ff6b6b;color:#fff;border:0;border-radius:50%;width:20px;height:20px;font:11px/20px system-ui";
      x.onclick = function () { pending.splice(i, 1); strip(); }; w.appendChild(x); el.appendChild(w);
    });
  }
  function wire() {
    var form = document.getElementById("composer");
    if (!form || form.dataset.v237) return; form.dataset.v237 = "1";
    var st = document.createElement("div"); st.id = "v237strip";
    st.style.cssText = "display:none;gap:8px;padding:6px 12px;overflow-x:auto"; form.insertBefore(st, form.firstChild);
    function mk(accept) { var i = document.createElement("input"); i.type = "file"; i.accept = accept;
      i.style.display = "none"; form.appendChild(i); return i; }
    var iAny = mk("image/*,application/pdf,text/plain"), iImg = mk("image/*");
    var bA = form.querySelector('.c-ic[aria-label="Attach"]'), bI = form.querySelector('.c-ic[aria-label="Image"]');
    if (bA) bA.onclick = function () { iAny.click(); };
    if (bI) bI.onclick = function () { iImg.click(); };
    function add(files) {
      Array.prototype.slice.call(files).slice(0, 2).forEach(function (f) {
        if (f.size > 8 * 1024 * 1024) return toast("Too big — max 8MB");
        if (!/^(image\/|application\/pdf|text\/plain)/.test(f.type)) return toast("Images, PDF and txt for now");
        var r = new FileReader();
        r.onload = function () {
          if (/^image\//.test(f.type)) shrink(r.result, function (p) { pending.push(p); strip(); });
          else { pending.push({ mime: f.type, data: String(r.result).split(",")[1], name: f.name }); strip(); }
        }; r.readAsDataURL(f);
      });
    }
    iAny.onchange = function () { add(iAny.files); iAny.value = ""; };
    iImg.onchange = function () { add(iImg.files); iImg.value = ""; };
    var of = window.fetch;
    window.fetch = function (u, o) {
      try {
        var s = String(u || "");
        if (pending.length && o && o.method === "POST" && s.indexOf("/api/chat") > -1 &&
            typeof o.body === "string" && o.body.indexOf('"images"') === -1) {
          var b = JSON.parse(o.body); b.images = pending.map(function (p) { return { mime: p.mime, data: p.data }; });
          o = Object.assign({}, o, { body: JSON.stringify(b) });
          pending = []; strip();
        }
      } catch (e) {}
      return of.apply(this, arguments);
    };
  }
  setInterval(function () { try { wire(); } catch (e) {} }, 900);
})();

/* ===== v239: admin row restored, dashboard user controls, profile fill ===== */
(function () {
  if (window.__v239) return; window.__v239 = "1";
  function pf(p, o) { o = o || {}; o.credentials = "include";
    o.headers = Object.assign({ "X-Alfred-Token": localStorage.getItem("alfred_token") || "" }, o.headers || {});
    return fetch(p, o).then(function (r) { return r.json(); }); }
  pf("/api/admin/overview").then(function (j) {
    if (!j || !j.ok) return;
    var rows = Array.prototype.slice.call(document.querySelectorAll("aside *, .sidebar *, #drawer *, nav *"))
      .filter(function (e) { return e.children.length <= 2 && /^(Settings|Admin)$/i.test((e.textContent || "").trim()); });
    var set = rows.filter(function (e) { return /^Settings$/i.test((e.textContent || "").trim()); })[0];
    var row = rows.filter(function (e) { return /^Admin$/i.test((e.textContent || "").trim()); })[0];
    if (!row && set) { row = set.cloneNode(true); set.parentNode.insertBefore(row, set.nextSibling); }
    if (!row) return;
    row.id = "v239-adminrow"; row.style.display = "";
    Array.prototype.forEach.call(row.querySelectorAll("*"), function (e) {
      if (!e.children.length && /Settings/i.test(e.textContent || "")) e.textContent = "Admin";
    });
    if (!row.children.length) row.textContent = "Admin";
    row.onclick = function () { location.hash = "#/admin"; };
  }).catch(function () {});
  var body = document.getElementById("adm-body");
  if (body && !body.dataset.v239) {
    body.dataset.v239 = "1"; var t = null;
    function aug() {
      body.querySelectorAll("tr").forEach(function (tr) {
        if (tr.dataset.v239r || !tr.querySelector("select")) return;
        var sv = tr.querySelector("button[data-em]"); if (!sv) return;
        tr.dataset.v239r = "1"; var email = sv.getAttribute("data-em");
        var td = document.createElement("td"); td.style.whiteSpace = "nowrap";
        [["logout", "#ffb46b", function (b) {
            pf("/api/admin/users/revoke", { method: "POST", body: JSON.stringify({ email: email }) })
              .then(function (x) { b.textContent = x.ok ? "out ✓" : "fail"; setTimeout(function () { b.textContent = "logout"; }, 1400); }); }],
         ["delete", "#ff6b6b", function (b) {
            if (b.textContent !== "sure?") { b.textContent = "sure?"; setTimeout(function () { b.textContent = "delete"; }, 2500); return; }
            pf("/api/admin/users/delete", { method: "POST", body: JSON.stringify({ email: email }) })
              .then(function (x) { b.textContent = x.ok ? "gone ✓" : "fail"; }); }]].forEach(function (c) {
          var b = document.createElement("button"); b.type = "button"; b.textContent = c[0];
          b.style.cssText = "background:transparent;color:" + c[1] + ";border:1px solid " + c[1] + "66;border-radius:8px;padding:3px 9px;font:12px system-ui;margin-left:6px";
          b.onclick = function () { c[2](b); }; td.appendChild(b);
        });
        tr.appendChild(td);
      });
    }
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(aug, 150); }).observe(body, { childList: true, subtree: true });
    aug();
  }
  pf("/api/auth/me").then(function (j) {
    if (!j || !j.ok || !j.user) return;
    var inp = document.querySelector('#view-settings input[placeholder*="call you"]');
    if (inp) inp.value = j.user.name || "";
    Array.prototype.forEach.call(document.querySelectorAll("#view-settings *"), function (e) {
      if (!e.children.length && /Not signed in/i.test(e.textContent || "")) e.textContent = "Signed in as " + (j.user.email || "");
    });
  }).catch(function () {});
})();

/* v240 dedupe retired in v241 */

/* v241 row block retired in v242 */

/* retired in v243 */

/* v243 row block retired in v244 */

/* retired in v245 */

/* ===== v244: modules — first render behaves like a real tier tap ===== */
/* retired v247.1 */

/* ===== v245: Admin row — always visible, outerHTML twin with shield ===== */
/* retired v247.1 */

/* ===== v245.1: Admin row — event-isolated, routes to dashboard ===== */
(function () {
  if (window.__v2451) return; window.__v2451 = "1";
  var SHIELD = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9fd8ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-2.9 8.2-7 10-4.1-1.8-7-5.6-7-10V6l7-3z"/></svg>';
  function scope() { return document.querySelector("aside,nav,[class*='sidebar'],[class*='drawer']") || document; }
  function srcRow() {
    var sc = scope(), els = sc.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (!e.children.length && (e.textContent || "").trim() === "Settings" && e.offsetParent !== null) {
        var r = e;
        while (r.parentElement && r.parentElement !== sc && (r.parentElement.textContent || "").trim() === "Settings") r = r.parentElement;
        return r;
      }
    }
    return null;
  }
  function go(ev) {
    if (ev) { ev.preventDefault(); ev.stopImmediatePropagation(); }
    try { location.hash = "#/admin"; } catch (e) {}
    setTimeout(function () {
      var v = document.getElementById("view-admin");
      if (!v || v.offsetParent === null) {
        var alt = document.querySelector("[data-view='admin'],[data-page='admin'],[href='#/admin']");
        if (alt) { alt.click(); return; }
        [].slice.call(document.querySelectorAll(".view")).forEach(function (x) { x.style.display = "none"; });
        if (v) v.style.display = "block";
      }
    }, 260);
  }
  setInterval(function () {
    try { var _sc = scope(); _sc.style.scrollbarWidth = "none"; } catch (e) {}
    if (document.getElementById("v2451-admin-row")) return;
    var src = srcRow(); if (!src) return;
    var row = src.cloneNode(true);
    row.id = "v2451-admin-row";
    [row].concat([].slice.call(row.querySelectorAll("*"))).forEach(function (x) {
      [].slice.call(x.attributes).forEach(function (at) {
        if (/^on/i.test(at.name) || /^(href|data-view|data-page|data-target|data-nav|data-route)$/i.test(at.name)) x.removeAttribute(at.name);
      });
      try { x.onclick = null; } catch (e) {}
    });
    var svg = row.querySelector("svg");
    if (svg) { var t = document.createElement("span"); t.innerHTML = SHIELD; svg.replaceWith(t.firstChild); }
    var leaf = null;
    [].slice.call(row.querySelectorAll("*")).forEach(function (x) {
      if (!x.children.length && /Settings/i.test(x.textContent || "")) leaf = x;
    });
    if (leaf) leaf.textContent = "Admin"; else row.textContent = "Admin";
    row.addEventListener("click", go, true);
    row.addEventListener("pointerdown", function (e) { e.stopImmediatePropagation(); }, true);
    row.style.cursor = "pointer";
    src.parentNode.insertBefore(row, src.nextSibling);
  }, 1200);
})();

/* ===== v245.6: no double circles around the brand mark ===== */
/* v245.6 retired - wrappers keep their rings */

/* ===== v245.7: brand asset selector — wrapper provides the ring ===== */
(function () {
  if (window.__v2457) return; window.__v2457 = "1";
  function isRound(el) {
    try {
      var r = parseFloat(getComputedStyle(el).borderRadius) || 0;
      var b = Math.min(el.offsetWidth, el.offsetHeight) || 1;
      return r >= b * 0.45;
    } catch (e) { return false; }
  }
  function sweep() {
    var imgs = document.querySelectorAll('img[src*="brand-192"]');
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i], p = im.parentElement;
      if (!p || p === document.body) continue;
      if (isRound(p)) {                                    /* wrapper = the one ring */
        if (im.src.indexOf("lambda-192") === -1) im.src = "/assets/lambda-192.png?v=1";
      } else if (im.src.indexOf("brand-192") === -1) {
        im.src = "/assets/brand-192.png?v=3";              /* standalone keeps its ring */
      }
    }
  }
  setInterval(sweep, 1200);
  document.addEventListener("DOMContentLoaded", sweep);
})();

/* ===== v247: single Admin row - final authority over all injector generations ===== */
/* v247 superseded by v248 */

/* ===== v248: admin authority (shield) + chat avatar de-branding ===== */
(function () {
  if (window.__v248) return; window.__v248 = "1";
  var SHIELD = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9fd8ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-2.9 8.2-7 10-4.1-1.8-7-5.6-7-10V6l7-3z"/></svg>';
  function scope() { return document.querySelector("aside,nav,[class*='sidebar'],[class*='drawer']") || document; }
  function go(ev) {
    if (ev) { ev.preventDefault(); ev.stopImmediatePropagation(); }
    try { location.hash = "#/admin"; } catch (e) {}
    setTimeout(function () {
      var any = [].slice.call(document.querySelectorAll(".view")).some(function (x) { return x.offsetParent !== null; });
      if (!any) { var v = document.getElementById("view-admin"); if (v) v.style.display = "block"; }
    }, 420);
  }
  setInterval(function () {
    if (document.hidden) return;
    var sc = scope(), keep = document.getElementById("v2451-admin-row"), leaves = [];
    [].slice.call(sc.querySelectorAll("*")).forEach(function (e) {
      if (!e.children.length && (e.textContent || "").trim() === "Admin") leaves.push(e);
    });
    if (!leaves.length) return;
    var rows = leaves.map(function (leaf) {
      var r = leaf;
      while (r.parentElement && r.parentElement !== sc && (r.parentElement.textContent || "").trim() === "Admin") r = r.parentElement;
      return r;
    });
    rows = rows.filter(function (r, i) { return rows.indexOf(r) === i; });
    if (!keep) {
      keep = rows[0]; keep.id = "v2451-admin-row";
      keep.addEventListener("click", go, true);
      keep.addEventListener("pointerdown", function (e) { e.stopImmediatePropagation(); }, true);
    }
    if (!keep.getAttribute("data-v248")) {
      keep.setAttribute("data-v248", "1");
      var svg = keep.querySelector("svg");
      if (svg) { var t = document.createElement("span"); t.innerHTML = SHIELD; svg.replaceWith(t.firstChild); }
      var leaf = null;
      [].slice.call(keep.querySelectorAll("*")).forEach(function (x) {
        if (!x.children.length && (x.textContent || "").trim() === "Admin") leaf = x;
      });
      if (leaf) leaf.textContent = "Admin";
    }
    rows.forEach(function (r) { if (r !== keep && r.parentNode) r.parentNode.removeChild(r); });
  }, 1200);
})();
(function () {
  if (window.__v248q) return; window.__v248q = "1";
  var SPARK = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="#9fd8ff"/></svg>');
  function sweep() {
    var imgs = document.querySelectorAll('.msg-av img[src*="brand-"], .msg-av img[src*="lambda-"]');
    for (var i = 0; i < imgs.length; i++) imgs[i].src = SPARK;
  }
  setInterval(function () { if (!document.hidden) sweep(); }, 1500);
  document.addEventListener("DOMContentLoaded", sweep);
})();

/* ===== v249: copy buttons — code blocks + message bubbles ===== */
(function () {
  if (window.__v249) return; window.__v249 = "1";
  function cp(txt, btn) {
    function done() { var o = btn.textContent; btn.textContent = "✓";
      setTimeout(function () { btn.textContent = "⧉"; }, 1200); }
    function fb() { var ta = document.createElement("textarea"); ta.value = txt;
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta);
      ta.select(); try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done(); }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(txt).then(done, fb); else fb();
  }
  function mk() {
    var b = document.createElement("button");
    b.type = "button"; b.className = "v249cp"; b.textContent = "⧉";
    return b;
  }
  function sweepCode() {
    var pres = document.querySelectorAll("#view-chat pre");
    for (var i = 0; i < pres.length; i++) {
      var p = pres[i];
      if (p.getAttribute("data-v249")) continue;
      p.setAttribute("data-v249", "1");
      var b = mk(); b.addEventListener("click", function (e) {
        e.stopPropagation(); cp(this.parentNode.innerText.replace(/⧉|✓/g, ""), this);
      });
      p.appendChild(b);
    }
  }
  function sweepMsgs() {
    var avs = document.querySelectorAll("#view-chat .msg-av");
    for (var i = 0; i < avs.length; i++) {
      var row = avs[i].parentElement; if (!row || row.classList.contains("v249row")) continue;
      var best = null, len = 60;
      [].slice.call(row.children).forEach(function (c) {
        if (c === avs[i] || c.querySelector && c.querySelector(".msg-av")) return;
        var L = (c.textContent || "").length;
        if (L > len) { len = L; best = c; }
      });
      if (!best) continue;
      row.classList.add("v249row");
      var b = mk(); b.addEventListener("click", function (e) {
        e.stopPropagation(); cp(this.parentNode.innerText.replace(/⧉|✓/g, ""), this);
      });
      row.appendChild(b);
    }
  }
  setInterval(function () { if (document.hidden) return; try { sweepCode(); sweepMsgs(); } catch (e) {} }, 1500);
  document.addEventListener("DOMContentLoaded", function () { sweepCode(); sweepMsgs(); });
})();

/* ===== v248b: admin metrics strip (schema-adaptive backend) ===== */
(function () {
  if (window.__v248b) return; window.__v248b = "1";
  var tick = 0;
  function fmt(n) { return (n === null || n === undefined) ? "—" : (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n)); }
  function card(label, val) {
    return '<div style="flex:1;min-width:130px;background:rgba(255,255,255,.05);border:1px solid rgba(159,216,255,.18);border-radius:14px;padding:12px 14px">' +
      '<div style="font:11px system-ui;color:#8fb8d8;text-transform:uppercase;letter-spacing:.08em">' + label + '</div>' +
      '<div style="font:600 20px system-ui;color:#e8f2ff;margin-top:4px">' + val + '</div></div>';
  }
  function load(strip) {
    fetch("/api/admin/metrics", { credentials: "include", headers: { "X-Alfred-Token": localStorage.getItem("alfred_token") || "" } }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) { strip.innerHTML = '<div style="font:12px system-ui;color:#ff8f8f">metrics: ' + ((j && j.error) || "unavailable") + '</div>'; return; }
      var m = j.metrics || {}, mix = (m.model_mix && m.model_mix[0]) ? m.model_mix[0].model + " · " + m.model_mix[0].n : "—";
      strip.innerHTML = card("Messages 24h", fmt(m.msgs_24h)) + card("Tokens 24h", fmt(m.tokens_24h)) +
        card("Chats total", fmt(m.chats_total)) + card("Live sessions", fmt(m.active_sessions)) + card("Top model", mix) + card("Failed logins 24h", fmt(m.failed_24h));
    }).catch(function () {});
  }
  setInterval(function () {
    if (document.hidden) return;
    var v = document.getElementById("view-admin");
    if (!v || v.offsetParent === null) return;
    var strip = document.getElementById("v248b-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.id = "v248b-strip";
      strip.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:10px 0";
      v.insertBefore(strip, v.firstChild);
      load(strip); tick = 0;
      return;
    }
    if (++tick >= 15) { tick = 0; load(strip); }
  }, 2000);
})();

/* ===== v251: router reconciler + splash watchdog + admin table scroll ===== */
(function () {
  if (window.__v251) return; window.__v251 = "1";
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      if ((location.hash || "").indexOf("admin") > -1) return;
      var views = [].slice.call(document.querySelectorAll(".view"));
      var vis = views.filter(function (x) { return x.offsetParent !== null; });
      if (!vis.length) return;                       /* router handled nothing -> fallback may act */
      views.forEach(function (x) { if (x.style.display) x.style.display = ""; });
      var h = (location.hash || "").replace("#/", "").split(/[?#]/)[0];
      var t = document.getElementById("view-" + h);
      if (t && t.offsetParent !== null) {
        t.classList.remove("v251in"); void t.offsetWidth; t.classList.add("v251in");
        setTimeout(function () { t.classList.remove("v251in"); }, 480);
      }
    }, 60);
  });
  setInterval(function () {
    if (document.hidden) return;
    [].slice.call(document.querySelectorAll("#view-admin table")).forEach(function (t) {
      if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains("v251scroll")) return;
      var w = document.createElement("div"); w.className = "v251scroll";
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }, 2500);
  setTimeout(function () {
    [].slice.call(document.querySelectorAll('[id*="splash"],[class*="splash"]')).forEach(function (e) {
      var cs = getComputedStyle(e);
      if (cs.position === "fixed" || cs.position === "absolute") e.style.display = "none";
    });
  }, 3500);
})();

/* ===== v251b: showcase — dashboard editor + modules render (display-only) ===== */
(function () {
  if (window.__v251b) return; window.__v251b = "1";
  function api(p, opt) { return fetch(p, Object.assign({ credentials: "include", headers: { "X-Alfred-Token": localStorage.getItem("alfred_token") || "" } }, opt || {})).then(function (r) { return r.json().catch(function () { return {}; }); }); }
  function editorCard(v) {
    var c = document.createElement("div");
    c.id = "v251b-editor";
    c.style.cssText = "background:rgba(255,255,255,.05);border:1px solid rgba(159,216,255,.18);border-radius:14px;padding:14px;margin:10px 0";
    c.innerHTML = '<div style="font:600 13px system-ui;color:#e8f2ff;margin-bottom:8px">Modules Showcase <span style="font-weight:400;color:#8fb8d8">(what visitors see — one item per line: Name | Description | Tier)</span></div>';
    var ta = document.createElement("textarea");
    ta.style.cssText = "width:100%;min-height:90px;background:rgba(0,0,0,.3);color:#e8f2ff;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;font:12px system-ui";
    ta.placeholder = "Nano Vision | Sees and reasons about your images | Pro\nDeep Thought | Multi-step reasoning for hard problems | Ultra";
    var row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px;margin-top:8px";
    var save = document.createElement("button"); save.type = "button"; save.textContent = "Publish";
    save.style.cssText = "background:#2e7fd6;color:#fff;border:0;border-radius:10px;padding:7px 16px;font:12px system-ui;cursor:pointer";
    var st = document.createElement("span"); st.style.cssText = "font:12px system-ui;color:#8fb8d8;align-self:center";
    save.onclick = function () {
      var items = ta.value.split("\n").map(function (l) {
        var p = l.split("|"); if (!p[0] || !p[0].trim()) return null;
        return { name: (p[0] || "").trim(), desc: (p[1] || "").trim(), tier: (p[2] || "Pro").trim() };
      }).filter(Boolean);
      api("/api/admin/showcase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items }) })
        .then(function (j) { st.textContent = j.ok ? "Published ✓ (" + j.count + " items)" : (j.error || "failed"); setTimeout(function(){ st.textContent = ""; }, 2500); });
    };
    var load = document.createElement("button"); load.type = "button"; load.textContent = "Load current";
    load.style.cssText = "background:transparent;color:#cfe9ff;border:1px solid rgba(159,216,255,.3);border-radius:10px;padding:7px 12px;font:12px system-ui;cursor:pointer";
    load.onclick = function () {
      api("/api/admin/showcase").then(function (j) {
        ta.value = (j.items || []).map(function (i) { return i.name + " | " + i.desc + " | " + i.tier; }).join("\n");
        st.textContent = (j.items || []).length + " loaded";
        setTimeout(function(){ st.textContent = ""; }, 2000);
      });
    };
    row.appendChild(save); row.appendChild(load); row.appendChild(st);
    c.appendChild(ta); c.appendChild(row);
    var strip = document.getElementById("v248b-strip");
    if (strip && strip.parentNode === v) v.insertBefore(c, strip.nextSibling); else v.insertBefore(c, v.firstChild);
    load.click();
  }
  setInterval(function () {
    if (document.hidden) return;
    var v = document.getElementById("view-admin");
    if (v && v.offsetParent !== null && !document.getElementById("v251b-editor")) editorCard(v);
    var m = document.getElementById("view-modules");
    if (m && m.offsetParent !== null && !m.getAttribute("data-v251sc")) {
      fetch("/showcase.json").then(function (r) { return r.ok ? r.json() : { items: [] }; }).catch(function(){ return {items:[]}; }).then(function (j) {
        var items = (j && j.items) || []; if (!items.length) return; m.setAttribute("data-v251sc", "1");
        var sec = document.createElement("div");
        sec.style.cssText = "margin:18px 0 8px";
        var h = document.createElement("div");
        h.style.cssText = "font:600 15px system-ui;color:#e8f2ff;margin-bottom:10px";
        h.textContent = "Alfred's Arsenal — always growing";
        sec.appendChild(h);
        items.forEach(function (it) {
          var card = document.createElement("div");
          card.style.cssText = "background:rgba(255,255,255,.05);border:1px solid rgba(159,216,255,.18);border-radius:14px;padding:12px 14px;margin-bottom:8px";
          var top = document.createElement("div"); top.style.cssText = "display:flex;align-items:center;gap:8px";
          var nm = document.createElement("span"); nm.style.cssText = "font:600 13px system-ui;color:#e8f2ff"; nm.textContent = it.name;
          var tier = document.createElement("span"); tier.style.cssText = "font:10px system-ui;color:#9fd8ff;border:1px solid rgba(159,216,255,.35);border-radius:99px;padding:1px 8px"; tier.textContent = it.tier;
          top.appendChild(nm); top.appendChild(tier);
          var ds = document.createElement("div"); ds.style.cssText = "font:12px system-ui;color:#8fb8d8;margin-top:4px"; ds.textContent = it.desc;
          card.appendChild(top); card.appendChild(ds); sec.appendChild(card);
        });
        m.appendChild(sec);
      });
    }
  }, 3000);
})();

/* ===== v252: admin route authority + cleanup sweeps ===== */
(function () {
  if (window.__v252) return; window.__v252 = "1";
  function scope() { return document.querySelector("aside,nav,[class*='sidebar'],[class*='drawer']") || document; }
  setInterval(function () {
    if (document.hidden) return;
    var admin = (location.hash || "").indexOf("admin") > -1;
    var views = [].slice.call(document.querySelectorAll(".view"));
    if (admin) {
      var va = document.getElementById("view-admin");
      if (va) {
        views.forEach(function (x) { x.style.display = (x === va) ? "block" : "none"; });
      }
    } else {
      views.forEach(function (x) { if (x.style.display) x.style.display = ""; });
    }
    /* kill the old settings admin console (ADMIN — N USERS) */
    [].slice.call(document.querySelectorAll("div,section")).forEach(function (e) {
      if (e.getAttribute("data-v252k")) return;
      var t = (e.textContent || "").slice(0, 40);
      if (/^ADMIN\s*[—-]\s*\d+\s*USERS/i.test(t) && e.textContent.length < 4000 && e.querySelector("select")) {
        e.setAttribute("data-v252k", "1"); e.style.display = "none";
      }
    });
    /* New Chat card: no logo, just the words */
    var sc = scope();
    [].slice.call(sc.querySelectorAll("*")).forEach(function (e) {
      if (e.children.length || (e.textContent || "").trim() !== "New Chat") return;
      var card = e;
      while (card.parentElement && card !== sc && (card.parentElement.textContent || "").indexOf("Start a new conversation") === -1) card = card.parentElement;
      if (card === sc || !card.parentElement) return;
      if (card.getAttribute("data-v252nc")) return;
      card.setAttribute("data-v252nc", "1");
      [].slice.call(card.querySelectorAll("img,svg")).forEach(function (im) { im.style.display = "none"; });
    });
  }, 900);
})();

/* ===== v253: new-chat de-logo (correct climb) + hero trim + bubble roles ===== */
(function () {
  if (window.__v253) return; window.__v253 = "1";
  function scope() { return document.querySelector("aside,nav,[class*='sidebar'],[class*='drawer']") || document; }
  function best(el) {
    var b = null, len = 60;
    [].slice.call(el.children).forEach(function (c) {
      if (c.querySelector && c.querySelector(".msg-av")) return;
      var L = (c.textContent || "").length;
      if (L > len && !c.querySelector("button")) { len = L; b = c; }
    });
    return b;
  }
  setInterval(function () {
    if (document.hidden) return;
    /* 1) New Chat card: climb UP until the card contains its subtitle */
    var sc = scope();
    [].slice.call(sc.querySelectorAll("*")).forEach(function (e) {
      if (e.children.length || (e.textContent || "").trim() !== "New Chat") return;
      var card = e;
      while (card && card !== sc && (card.textContent || "").indexOf("Start a new conversation") === -1) card = card.parentElement;
      if (!card || card === sc || card.getAttribute("data-v253nc")) return;
      card.setAttribute("data-v253nc", "1");
      [].slice.call(card.querySelectorAll("img,svg")).forEach(function (im) { im.style.display = "none"; });
    });
    /* hero img sweep retired in v256 - CSS rule owns it */
    /* 3) bubble roles: rows with .msg-av = Alfred, without = user */
    var av = document.querySelector("#view-chat .msg-av");
    if (!av) return;
    var cont = av.parentElement && av.parentElement.parentElement ? av.parentElement.parentElement : null;
    if (!cont) return;
    [].slice.call(cont.children).forEach(function (row) {
      if (row.getAttribute("data-v253r")) return;
      var bubble = best(row); if (!bubble) return;
      row.setAttribute("data-v253r", "1");
      bubble.classList.add(row.querySelector(".msg-av") ? "v253-ai-b" : "v253-user-b");
    });
  }, 1400);
})();

/* ===== v254: admin tab scroll, chat hero kill, tier titles, explore variety ===== */
(function () {
  if (window.__v254) return; window.__v254 = "1";
  /* A) admin tab bar -> horizontal scroll lane */
  setInterval(function () {
    if (document.hidden) return;
    var v = document.getElementById("view-admin"); if (!v || v.offsetParent === null) return;
    [].slice.call(v.querySelectorAll("*")).some(function (e) {
      var kids = [].slice.call(e.children);
      var t = kids.map(function (k) { return (k.textContent || "").trim(); }).join("|");
      if (kids.length >= 3 && t.indexOf("Users") > -1 && t.indexOf("Billing") > -1) {
        if (!e.classList.contains("v254tabs")) e.classList.add("v254tabs");
        return true;
      }
      return false;
    });
  }, 2000);
  /* B) chat: kill background-image hero + big/broken imgs (header untouched - it's outside #view-chat) */
  setInterval(function () {
    if (document.hidden) return;
    var c = document.getElementById("view-chat"); if (!c || c.offsetParent === null) return;
    [].slice.call(c.querySelectorAll("*")).forEach(function (e) {
      if (e.getAttribute("data-v254bg")) return;
      var bi = (getComputedStyle(e).backgroundImage || "");
      if ((bi.indexOf("brand-") > -1 || bi.indexOf("lambda-") > -1 || bi.indexOf("logo") > -1) && e.offsetHeight >= 140) {
        e.style.backgroundImage = "none"; e.setAttribute("data-v254bg", "1");
      }
    });
    [].slice.call(c.querySelectorAll("img")).forEach(function (im) {
      var src = im.getAttribute("src") || "";
      if ((src.indexOf("brand-") > -1 || src.indexOf("lambda-") > -1) && (im.offsetWidth >= 120 || im.offsetHeight >= 120)) { im.style.display = "none"; return; }
      if (im.complete && im.naturalWidth === 0 && src && src.indexOf("data:") !== 0) im.style.display = "none";
    });
  }, 1500);
  /* C) modules: tier titles from subtitle keywords (Free/Pro/Ultra where they belong) */
  var MAP = []; /* superseded by v255 deterministic fix */
  setInterval(function () {
    if (document.hidden) return;
    var m = document.getElementById("view-modules"); if (!m || m.offsetParent === null) return;
    MAP.forEach(function (pair) {
      [].slice.call(m.querySelectorAll("*")).forEach(function (e) {
        var t = e.textContent || "";
        if (t.indexOf(pair[0]) === -1 || t.length > 260) return;
        var root = e.parentElement; if (!root) return;
        if (root.getAttribute("data-v254t") === pair[1]) return;
        root.setAttribute("data-v254t", pair[1]);
        [].slice.call(root.querySelectorAll("*")).every(function (x) {
          if (x.children.length) return true;
          var xt = (x.textContent || "").trim();
          if (xt === "Free" || xt === "Pro" || xt === "Ultra") { x.textContent = pair[1]; return false; }
          return true;
        });
      });
    });
  }, 1600);
  /* v254 explore sweep retired in v262 - single painter policy */
})();

/* ===== v255: deterministic module tiers, sidebar scroll, sibling icons, shell sweep ===== */
(function () {
  if (window.__v255) return; window.__v255 = "1";
  /* A) module tier titles — climb from subtitle to the SMALLEST container holding a tier leaf */
  var MAP = [["standard minds", "Free"], ["latest-generation", "Pro"], ["apex minds", "Ultra"]];
  function tierLeaf(root) {
    var L = [].slice.call(root.querySelectorAll("*"));
    for (var i = 0; i < L.length; i++) {
      if (!L[i].children.length) {
        var t = (L[i].textContent || "").trim();
        if (t === "Free" || t === "Pro" || t === "Ultra") return L[i];
      }
    }
    return null;
  }
  setInterval(function () {
    if (document.hidden) return;
    var m = document.getElementById("view-modules"); if (!m || m.offsetParent === null) return;
    [].slice.call(m.querySelectorAll("[data-v254t]")).forEach(function (e) { e.removeAttribute("data-v254t"); });
    MAP.forEach(function (pair) {
      var subs = [].slice.call(m.querySelectorAll("*")).filter(function (e) {
        var t = e.textContent || "";
        return t.indexOf(pair[0]) > -1 && t.length < 300;
      });
      if (!subs.length) return;
      subs.sort(function (a, b) { return (a.textContent || "").length - (b.textContent || "").length; });
      var n = subs[0];
      while (n && n !== m) {
        var tl = tierLeaf(n);
        if (tl) { if (tl.textContent !== pair[1]) tl.textContent = pair[1]; break; }
        n = n.parentElement;
      }
    });
  }, 1700);
  /* B) sidebar: list scrolls internally, Admin always reachable; New Chat sibling icons die */
  setInterval(function () {
    if (document.hidden) return;
    var sc = document.querySelector("aside,nav,[class*='sidebar'],[class*='drawer']") || document;
    var set = false;
    [].slice.call(sc.querySelectorAll("*")).forEach(function (e) {
      if (set || e.children.length) return;
      if ((e.textContent || "").trim() !== "Settings") return;
      var n = e.parentElement;
      while (n && n !== sc) {
        var t = n.textContent || "";
        if (t.indexOf("Explore") > -1 && t.indexOf("History") > -1) {
          if (!n.getAttribute("data-v255sc")) {
            n.setAttribute("data-v255sc", "1");
            n.style.cssText += ";overflow-y:auto;min-height:0;flex:1 1 auto;padding-bottom:120px;scrollbar-width:none";
            n.style.setProperty("-webkit-overflow-scrolling", "touch");
          }
          set = true; return;
        }
        n = n.parentElement;
      }
    });
    [].slice.call(sc.querySelectorAll("*")).forEach(function (e) {
      if (e.children.length || (e.textContent || "").trim() !== "New Chat") return;
      var card = e;
      while (card && card !== sc && (card.textContent || "").indexOf("Start a new conversation") === -1) card = card.parentElement;
      if (!card || card === sc) return;
      var zones = [card];
      if (card.parentElement && card.parentElement !== sc && (card.parentElement.textContent || "").indexOf("ALFRED") === -1) zones.push(card.parentElement);
      zones.forEach(function (z) {
        [].slice.call(z.querySelectorAll("img,svg")).forEach(function (im) { im.style.display = "none"; });
      });
    });
  }, 1600);
  /* C) chat: empty avatar shells die (typing dots + composer protected) */
  setInterval(function () {
    if (document.hidden) return;
    var c = document.getElementById("view-chat"); if (!c || c.offsetParent === null) return;
    [].slice.call(c.querySelectorAll("*")).forEach(function (e) {
      if (e.getAttribute("data-v255sh") || e.closest("#composer")) return;
      if (e.querySelector && e.querySelector(".v129-dots, i, button, svg, img, video")) return;
      var r = parseFloat(getComputedStyle(e).borderRadius) || 0;
      if (r >= 14 && e.offsetHeight >= 24 && e.offsetHeight <= 90 && !(e.textContent || "").trim()) {
        e.setAttribute("data-v255sh", "1"); e.style.display = "none";
      }
    });
  }, 1500);
  /* D) admin: showcase editor belongs under the tab row */
  setInterval(function () {
    if (document.hidden) return;
    var ed = document.getElementById("v251b-editor"), tabs = document.querySelector("#view-admin .v254tabs");
    if (ed && tabs && ed.nextElementSibling !== tabs && !tabs.contains(ed)) tabs.parentNode.insertBefore(ed, tabs.nextSibling);
  }, 2600);
})();

/* ===== v258: nav truth (admin lit on #/admin) + plan truth (top bar + CURRENT) ===== */
(function () {
  if (window.__v258) return; window.__v258 = "1";
  var NAMES = ["Chat", "Explore", "Modules", "History", "Plans", "Settings", "Admin"];
  function rows() {
    var found = [];
    [].slice.call(document.querySelectorAll("aside *, nav *, [class*='sidebar'] *, [class*='drawer'] *")).forEach(function (e) {
      if (e.children.length > 3) return;
      var t = (e.textContent || "").trim();
      if (NAMES.indexOf(t) > -1) found.push(e);
    });
    var out = {};
    found.forEach(function (e) {          /* keep outermost match per name */
      var nested = found.some(function (o) { return o !== e && o.contains(e); });
      if (!nested && !out[(e.textContent || "").trim()]) out[(e.textContent || "").trim()] = e;
    });
    return out;
  }
  function marker(rs) {
    var chat = rs["Chat"]; if (!chat) return null;
    var common = {};
    NAMES.forEach(function (n) { var r = rs[n]; if (r && r !== chat) [].slice.call(r.classList).forEach(function (c) { common[c] = 1; }); });
    var mk = [].slice.call(chat.classList).filter(function (c) { return !common[c]; });
    return mk.length ? mk : null;
  }
  setInterval(function () {
    if (document.hidden) return;
    try {
      var rs = rows(); if (!rs["Admin"]) return;
      var mk = marker(rs); if (!mk) return;
      var onAdmin = (location.hash || "").indexOf("admin") > -1;
      if (onAdmin) {
        NAMES.forEach(function (n) {
          var r = rs[n]; if (!r) return;
          mk.forEach(function (c) { r.classList[n === "Admin" ? "add" : "remove"](c); });
        });
        rs["Admin"].setAttribute("data-v258lit", "1");
      } else if (rs["Admin"].getAttribute("data-v258lit")) {
        mk.forEach(function (c) { rs["Admin"].classList.remove(c); });
        rs["Admin"].removeAttribute("data-v258lit");
      }
      /* self-heal: router lost the marker after admin visit? relight current route */
      if (!onAdmin && !NAMES.some(function (n) { return rs[n] && mk.every(function (c) { return rs[n].classList.contains(c); }); })) {
        var seg = (location.hash || "").replace(/^#\/?/, "").split(/[?#]/)[0];
        var name = seg.charAt(0).toUpperCase() + seg.slice(1);
        if (rs[name]) mk.forEach(function (c) { rs[name].classList.add(c); });
      }
    } catch (e) {}
  }, 1200);

  function tok() {
    try {
      for (var k in localStorage) {
        var v = localStorage.getItem(k) || "";
        if (v.length >= 24 && /^[A-Za-z0-9_\-.]+$/.test(v)) return v;
      }
    } catch (e) {}
    return "";
  }
  function syncPlan() {
    fetch("/api/auth/me", { credentials: "include", headers: { "X-Alfred-Token": tok() } })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        var p = j && j.user && j.user.plan;
        if (["Free", "Pro", "Ultra"].indexOf(p) < 0) return;
        /* top bar tier word follows the REAL plan */
        [].slice.call(document.querySelectorAll("header, .model, [class*='topbar'], [class*='top-bar']")).forEach(function (h) {
          [].slice.call(h.querySelectorAll("*")).forEach(function (e) {
            if (e.children.length) return;
            var t = (e.textContent || "").trim();
            if ((t === "Free" || t === "Pro" || t === "Ultra") && t !== p) e.textContent = p;
          });
        });
        /* modules CURRENT badge follows the REAL plan */
        var m = document.getElementById("view-modules");
        if (!m || m.offsetParent === null) return;
        [].slice.call(m.querySelectorAll("[data-v258clone]")).forEach(function (c) { if (c.getAttribute("data-v258clone") !== p) c.parentNode.removeChild(c); });
        if (m.getAttribute("data-v258cur") === p) return;
        var badge = null, titles = [];
        [].slice.call(m.querySelectorAll("*")).forEach(function (e) {
          if (e.children.length) return;
          var t = (e.textContent || "").trim();
          if (!badge && t.toUpperCase() === "CURRENT") badge = e;
          else if (t === "Free" || t === "Pro" || t === "Ultra") titles.push(e);
        });
        titles = titles.filter(function (t) { return !titles.some(function (o) { return o !== t && o.contains(t); }); });
        var target = titles.filter(function (t) { return t.textContent.trim() === p; })[0];
        if (!badge || !target) return;
        var clone = badge.cloneNode(true);
        clone.setAttribute("data-v258clone", p);
        badge.style.display = "none";
        if (target.nextSibling) target.parentNode.insertBefore(clone, target.nextSibling);
        else target.parentNode.appendChild(clone);
        m.setAttribute("data-v258cur", p);
      }).catch(function () {});
  }
  syncPlan(); setInterval(function () { if (!document.hidden) syncPlan(); }, 20000);
})();

/* ===== v259: source-truth fixes (nav = .nav-item/.active/data-view, views = .show) ===== */
(function () {
  if (window.__v259) return; window.__v259 = "1";
  var adminRow = null;
  function findRow() {
    var rows = [].slice.call(document.querySelectorAll("#nav .nav-item, nav .nav-item, a.nav-item"));
    adminRow = rows.filter(function (r) { return (r.textContent || "").trim() === "Admin"; })[0] || adminRow;
    return adminRow;
  }
  function showView(name) {
    [].slice.call(document.querySelectorAll(".view")).forEach(function (v) {
      v.classList.toggle("show", v.id === "view-" + name);
      if (v.id !== "view-" + name && v.style.display) v.style.display = "";
    });
  }
  function light(name) {
    [].slice.call(document.querySelectorAll(".nav-item")).forEach(function (r) {
      r.classList.toggle("active", (r.textContent || "").trim().toLowerCase() === name);
    });
  }
  function wire() {
    var r = findRow(); if (!r || r.getAttribute("data-v259w")) return;
    r.setAttribute("data-view", "admin"); r.setAttribute("data-v259w", "1");
    r.addEventListener("click", function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      light("admin"); showView("admin");
      if ((location.hash || "") !== "#/admin") location.hash = "#/admin";
    }, true);
  }
  setInterval(function () {
    if (document.hidden) return;
    wire();
    if ((location.hash || "").indexOf("admin") > -1) { light("admin"); showView("admin"); }
  }, 900);
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      if ((location.hash || "").indexOf("admin") > -1) { light("admin"); showView("admin"); }
    }, 80);
  });
  /* v259 explore painter retired in v262 - v260 owns explore */
})();

/* ===== v260: explore truth v2 — longest-line captions, never-dark cards ===== */
(function () {
  if (window.__v260) return; window.__v260 = "1";
  var JUNK = /^(by |try it$|inspiration$|community pick$|♥|\d+$)/i;
  function caption(node) {
    var best = "";
    [].slice.call(node.querySelectorAll("*")).forEach(function (e) {
      if (e.children.length || e.tagName === "IMG") return;
      (e.textContent || "").split("\n").forEach(function (l) {
        l = l.trim();
        if (l.length > best.length && l.length > 20 && !JUNK.test(l)) best = l;
      });
    });
    return best;
  }
  function paint(im) {
    var cap = "", p = im.parentElement;
    for (var up = 0; up < 4 && p && !cap; up++) { cap = caption(p); if (!cap) p = p.parentElement; }
    if (!cap) return;
    im.setAttribute("data-v260m", "1");
    im.style.opacity = ".2";
    var base = "https://image.pollinations.ai/prompt/" + encodeURIComponent(cap.slice(0, 160)) +
               "?width=768&height=1024&nologo=true&";
    function load(seed) {
      im.onload = function () { im.style.opacity = "1"; im.setAttribute("data-v260done", "1"); };
      im.onerror = function () {
        if (im.getAttribute("data-v260r")) {
          im.style.opacity = "1"; im.style.display = "none";
          if (im.parentElement) im.parentElement.style.background = "linear-gradient(135deg,#1b2a44,#0e1830)";
        } else { im.setAttribute("data-v260r", "1"); load(String(Math.floor(Math.random() * 999999))); }
      };
      im.src = base + "seed=" + seed;
    }
    load(String(Math.floor(Math.random() * 999999)));
  }
  setInterval(function () {
    if (document.hidden) return;
    var x = document.getElementById("view-explore"); if (!x || x.offsetParent === null) return;
    [].slice.call(x.querySelectorAll("img")).forEach(function (im) {
      if ((im.getAttribute("src") || "").indexOf("data:") === 0) return;
      if (!im.getAttribute("data-v260m")) paint(im);
    });
  }, 2500);
  var st = document.createElement("style");
  st.textContent = "#view-explore img{transition:opacity .4s}" +
    "#view-explore img[data-v260m]:not([data-v260done]){background:linear-gradient(100deg,#12203a 30%,#1c3050 50%,#12203a 70%);background-size:200% 100%;animation:v260sh 1.2s infinite}" +
    "@keyframes v260sh{to{background-position:-200% 0}}";
  document.head.appendChild(st);
})();

/* ===== v261: explore single-painter — pre-mark so older sweeps stand down ===== */
(function () {
  if (window.__v261) return; window.__v261 = "1";
  setInterval(function () {
    if (document.hidden) return;
    var x = document.getElementById("view-explore"); if (!x || x.offsetParent === null) return;
    [].slice.call(x.querySelectorAll("img")).forEach(function (im) {
      if (!im.getAttribute("data-v254s")) im.setAttribute("data-v254s", "1");
      if (!im.getAttribute("data-v259m")) im.setAttribute("data-v259m", "1");
    });
  }, 900);
})();

/* ===== v264: living feed — real designers, fresh drops daily ===== */
(function () {
  if (window.__v264) return; window.__v264 = "1";
  var POOL = [
    ["Lena K.","cozy reading nook, warm lamp light, film photo","image"],
    ["marco.builds","minimal desk setup, walnut wood, matte black, morning light","image"],
    ["aya.studio","soft brutalist apartment interior, linen curtains, golden hour","image"],
    ["Tom R.","chef's table plating, dark slate, moody restaurant light","image"],
    ["nori_type","swiss type poster, big grotesk letters, off-white paper","image"],
    ["Vega","holographic butterfly garden at dusk, teal and magenta","video"],
    ["Dana P.","ceramic mug product shot, clay tones, soft shadow","image"],
    ["Kofi A.","accra street market at blue hour, neon signs, rain reflections","image"],
    ["Ines","flowing silk dress in the wind, dunes, editorial fashion","image"],
    ["yuji.lens","tokyo alley ramen shop, steam, night, 35mm","image"],
    ["Mora","liquid chrome sports car morphing at sunset, studio light","video"],
    ["Sana","indoor plant corner, terracotta pots, afternoon sun","image"],
    ["pablo.frames","concrete stairwell, single red door, fog","image"],
    ["Nia","curly hair portrait, freckles, soft window light","image"],
    ["Rin","ancient library with floating candle lights","image"],
    ["Otto","vintage motorcycle in a garage, oil stains, tungsten","image"],
    ["mira.makes","handmade pottery wheel, clay hands, close-up","video"],
    ["Jules","paris balcony breakfast, croissant, espresso, morning haze","image"],
    ["Zephyr","a fox with constellation fur during a meteor shower","image"],
    ["Elif","hammam tiles, turquoise patterns, steam and light beams","image"],
    ["Gus","surfboards on a van at dawn, beach fog","image"],
    ["kate_ui","glassmorphism dashboard UI, dark mode, cyan charts","image"],
    ["Ade","lagos skyline from the mainland bridge, dusk, haze","image"],
    ["Nova","neon cyberpunk street after rain, reflections everywhere","image"]
  ];
  function h(s){ var x=0; for (var i=0;i<s.length;i++) x=(x*31+s.charCodeAt(i))|0; return Math.abs(x); }
  function dayKey(){ return new Date().toISOString().slice(0,10); }
  function load(){ try { return JSON.parse(localStorage.getItem("explore-posts")||"null"); } catch(e){ return null; } }
  function save(d){ try { localStorage.setItem("explore-posts", JSON.stringify(d)); } catch(e){} }
  function refresh(force) {
    var d = load(); if (!d || !d.posts) return;             /* v66 seeds first visit */
    if (!force && d.day === dayKey()) return;
    d.day = dayKey();
    var off = h(dayKey()) % POOL.length, fresh = [];
    for (var i = 0; i < 12; i++) {
      var p = POOL[(off + i * 7) % POOL.length];
      var id = "d" + (h(p[0] + p[1] + dayKey()) % 100000);
      fresh.push({ id:id, kind:p[2], prompt:p[1], src:p[1], seed:h(id)%9999,
                   by:p[0], likes:40 + h(id)%900, ts:Date.now() - (2 + h(id)%70)*3600000 });
    }
    var kept = (d.posts||[]).filter(function(p){ return p.id && (p.id.charAt(0) === "u" || p.mine); });
    var ever = (d.posts||[]).filter(function(p){ return p.id && p.id.charAt(0) === "s" && h(p.id + dayKey()) % 3 === 0; });
    d.posts = fresh.concat(kept).concat(ever);
    save(d);
    var v = document.getElementById("view-explore");
    if (v && v.offsetParent !== null) { var f = document.querySelector(".ex-f.on"); if (f) f.click(); }
  }
  function mergeServer() {
    fetch("/api/explore").then(function(r){ return r.json().catch(function(){ return []; }); }).then(function(list){
      if (!Array.isArray(list) || !list.length) return;
      var d = load(); if (!d || !d.posts) return;
      var have = {}; d.posts.forEach(function(p){ have[p.id] = 1; });
      var add = list.filter(function(p){ return p && p.id && !have[p.id]; }).slice(0, 20);
      if (!add.length) return;
      d.posts = add.map(function(p){ p.by = p.by || "Guest"; return p; }).concat(d.posts);
      save(d);
    }).catch(function(){});
  }
  setInterval(function () {
    if (document.hidden) return;
    var v = document.getElementById("view-explore"); if (!v || v.offsetParent === null) return;
    refresh(false); mergeServer();
    var d = load(); if (!d || !d.posts) return;
    var tmap = {}; d.posts.forEach(function(p){ tmap[p.prompt] = p.ts || 0; });
    [].slice.call(v.querySelectorAll(".ex-card")).forEach(function (c) {
      var by = c.querySelector(".ex-by"), cap = c.querySelector(".ex-prompt");
      if (!by || !cap || by.getAttribute("data-v264")) return;
      var ts = tmap[cap.textContent] || 0; if (!ts) return;
      var m = Math.floor((Date.now() - ts) / 60000);
      var a = m < 60 ? m + "m" : m < 1440 ? Math.floor(m/60) + "h" : Math.floor(m/1440) + "d";
      by.textContent = by.textContent + " · " + a + " ago";
      by.setAttribute("data-v264", "1");
    });
  }, 4000);
  setTimeout(function(){ refresh(true); }, 1200);
})();

/* v265 landing retired in v268 */
/* ===== v265b: explore hygiene — dedupe, cap, honest Yours ===== */
(function () {
  if (window.__v265b) return; window.__v265b = "1";
  setInterval(function () {
    if (document.hidden) return;
    try {
      var d = JSON.parse(localStorage.getItem("explore-posts") || "null"); if (!d || !d.posts) return;
      var seen = {}, out = [];
      d.posts.forEach(function (p) { if (!p || !p.id || !p.prompt) return; if (seen[p.id]) return; seen[p.id] = 1; out.push(p); });
      if (out.length > 40) out = out.slice(0, 40);
      if (out.length !== d.posts.length) { d.posts = out; localStorage.setItem("explore-posts", JSON.stringify(d)); }
    } catch (e) {}
  }, 9000);
})();

/* ===== v265c: admin design pass — KPI numerals, pills, sticky columns ===== */
(function () {
  var st = document.createElement("style");
  st.textContent = [
    "#view-admin b, #v248b-strip > * { font-variant-numeric: tabular-nums; }",
    "#v248b-strip > * { border-radius: 16px; background: rgba(255,255,255,.045); border: 1px solid rgba(159,216,255,.14); padding: 12px 14px; }",
    "#v248b-strip { gap: 10px; padding-bottom: 6px; }",
    ".adm-t th { position: sticky; top: 0; background: #0b1424; z-index: 1; }",
    ".adm-t td:first-child { position: sticky; left: 0; background: #0b1424; }",
    "#view-admin .adm-card { border-radius: 16px; border: 1px solid rgba(159,216,255,.14); }"
  ].join("");
  document.head.appendChild(st);
})();

/* ===== v265d: refresh srcmap chunks (repo reading stays current) ===== */

/* v268 landing retired in v269 */

/* ===== v269: landing — cinematic editorial (city hero, Sora/DM Sans, one focal point) ===== */
(function () {
  if (window.__v269) return; window.__v269 = "1";
  var F = document.createElement("link"); F.rel = "stylesheet";
  F.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap";
  document.head.appendChild(F);
  var st = document.createElement("style");
  st.textContent = [
    "#land{position:fixed;inset:0;z-index:9988;overflow-y:auto;-webkit-overflow-scrolling:touch;display:none;background:#080D17;color:#F4F7FC;font-family:'DM Sans',system-ui,sans-serif}",
    "#land *{box-sizing:border-box}",
    "#land .in{max-width:1160px;margin:0 auto;padding:0 22px}",
    "#land nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0;position:relative;z-index:2}",
    "#land .brand{display:flex;align-items:center;gap:10px;font-family:Sora;font-weight:600;letter-spacing:2.5px;font-size:13px}",
    "#land .brand img{width:30px;height:30px;display:block}",
    "#land .hero{position:relative;min-height:88vh;display:flex;flex-direction:column;justify-content:center;padding:40px 0 70px}",
    "#land .hbg{position:absolute;inset:0 -22px;background:linear-gradient(90deg,rgba(5,9,17,.88) 0%,rgba(5,9,17,.58) 58%,rgba(5,9,17,.2) 100%),linear-gradient(0deg,#080D17 0%,rgba(8,13,23,.05) 48%,rgba(8,13,23,.35) 100%),url('/assets/cityy.jpg') center 56%/cover;animation:herozoom 24s linear forwards}",
    "@keyframes herozoom{from{transform:scale(1)}to{transform:scale(1.035)}}",
    "@media (prefers-reduced-motion:reduce){#land .hbg{animation:none}#land .rv{opacity:1!important;transform:none!important;transition:none!important}}",
    "#land .hero .in{position:relative;z-index:1}",
    "#land .kick{color:#66CCFF;font-size:11px;letter-spacing:3.5px;text-transform:uppercase;font-weight:600;margin-bottom:18px}",
    "#land h1{font-family:Sora;font-weight:600;font-size:clamp(2.75rem,11vw,5rem);line-height:1.02;letter-spacing:-.055em;margin:0 0 20px;max-width:640px}",
    "#land h1 em{font-style:normal;color:#66CCFF}",
    "#land .sub{font-size:clamp(1rem,4.2vw,1.125rem);color:#AAB7C9;max-width:460px;line-height:1.65;margin:0 0 34px}",
    "#land .cta{background:#66CCFF;color:#08131f;border:0;border-radius:14px;height:54px;padding:0 38px;font-family:'DM Sans';font-size:16px;font-weight:700;cursor:pointer;transition:transform .16s,filter .16s}",
    "#land .cta:hover{filter:brightness(1.08)}.cta:active{transform:scale(.98)}",
    "#land .how-link{display:inline-block;margin-left:22px;color:#AAB7C9;font-size:14px;background:none;border:0;cursor:pointer;text-decoration:underline;text-underline-offset:5px}",
    "#land section{padding:88px 0}",
    "#land h2{font-family:Sora;font-weight:600;font-size:clamp(1.8rem,7vw,3rem);line-height:1.1;letter-spacing:-.04em;margin:0 0 14px}",
    "#land .lede{color:#AAB7C9;font-size:clamp(.95rem,3.8vw,1.05rem);line-height:1.65;max-width:520px;margin:0 0 44px}",
    "#land .caps{display:grid;grid-template-columns:repeat(4,1fr);gap:34px}",
    "@media(max-width:760px){#land .caps{grid-template-columns:1fr 1fr;gap:26px}}",
    "#land .cap img{width:52px;height:52px;margin-bottom:14px}",
    "#land .cap b{display:block;font-family:Sora;font-weight:600;font-size:15.5px;margin-bottom:6px}",
    "#land .cap span{color:#AAB7C9;font-size:13px;line-height:1.6}",
    "#land .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-bottom:46px}",
    "@media(max-width:760px){#land .steps{grid-template-columns:1fr}}",
    "#land .step .n{font-family:Sora;font-weight:600;color:#66CCFF;font-size:13px;letter-spacing:2px;margin-bottom:10px}",
    "#land .step b{display:block;font-family:Sora;font-size:17px;margin-bottom:6px}",
    "#land .step span{color:#AAB7C9;font-size:13.5px;line-height:1.6}",
    "#land .neb{width:100%;border-radius:20px;display:block;opacity:.9}",
    "#land .tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}",
    "@media(max-width:760px){#land .tiers{grid-template-columns:1fr}}",
    "#land .tier{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:26px}",
    "#land .tier h3{font-family:Sora;font-size:19px;margin:0 0 6px}",
    "#land .tier .d{color:#AAB7C9;font-size:13px;line-height:1.6;margin-bottom:16px}",
    "#land .mind{display:inline-block;font-size:12px;color:#E6F1FB;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:5px 12px;margin:0 6px 8px 0}",
    "#land .faqw{max-width:640px}",
    "#land details{border-bottom:1px solid rgba(255,255,255,.09)}",
    "#land summary{padding:18px 4px;cursor:pointer;font-family:Sora;font-weight:500;font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center}",
    "#land summary::-webkit-details-marker{display:none}",
    "#land summary::after{content:'+';color:#66CCFF;font-size:18px;font-weight:400}",
    "#land details[open] summary::after{content:'\\2013'}",
    "#land details p{padding:0 4px 20px;color:#AAB7C9;font-size:14px;line-height:1.7;margin:0}",
    "#land .inv{text-align:center;border-top:1px solid rgba(255,255,255,.08)}",
    "#land .inv h2{margin-bottom:10px}",
    "#land .mail{display:inline-block;margin-top:26px;background:#66CCFF;color:#08131f;font-weight:700;border-radius:12px;padding:16px 32px;text-decoration:none;font-size:15px;transition:filter .16s}",
    "#land .mail:hover{filter:brightness(1.08)}",
    "#land footer{border-top:1px solid rgba(255,255,255,.08);padding:34px 0 46px}",
    "#land .frow{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px}",
    "#land .foot-l{display:flex;align-items:center;gap:9px;font-family:Sora;font-size:12px;letter-spacing:2px}",
    "#land .foot-l img{width:22px;height:22px}",
    "#land .foot-r{color:#AAB7C9;font-size:12.5px}",
    "#land .foot-r a{color:#66CCFF;text-decoration:none}",
    "#land .rv{opacity:0;transform:translateY(10px);transition:opacity .5s cubic-bezier(.2,.7,.2,1),transform .5s cubic-bezier(.2,.7,.2,1)}",
    "#land .rv.on{opacity:1;transform:none}"
  ].join("");
  document.head.appendChild(st);

  var M = {
    Free:  ["GPT-5 mini", "Claude Sonnet 4", "Dolphin"],
    Pro:   ["GPT-6 Astra", "Claude Opus 5", "DeepSeek 4.1", "Dolphin", "Code Interpreter", "Web Search"],
    Ultra: ["GPT-6 Astra Ultra", "Claude Opus 5 Max", "DeepSeek 4.1 Apex", "Dolphin Ultra", "Deep-think Council"]
  };
  function caps4() {
    return [["reason", "Think", "Hard questions, weighed from every angle before he answers."],
            ["image", "See", "Send a photo \u2014 he understands what is in it."],
            ["writing", "Create", "Words, images, worlds \u2014 drafted and refined with you."],
            ["code", "Build", "Real code, explained while it ships."]]
      .map(function (c) {
        return '<div class="cap rv"><img src="/assets/gen/tile-' + c[0] + '.png" alt=""><b>' + c[1] + '</b><span>' + c[2] + '</span></div>';
      }).join("");
  }
  function tiers() {
    return [["Free", "Meet Alfred \u2014 crisp, quick answers every day."],
            ["Pro", "The latest generation of minds at full speed."],
            ["Ultra", "Maximum depth \u2014 the Deep-think Council convenes on your question."]]
      .map(function (t) {
        return '<div class="tier rv"><h3>' + t[0] + '</h3><div class="d">' + t[1] + '</div>' +
               M[t[0]].map(function (x) { return '<span class="mind">' + x + '</span>'; }).join("") + '</div>';
      }).join("");
  }
  function build() {
    if (document.getElementById("land")) return;
    var L = document.createElement("div"); L.id = "land";
    L.innerHTML =
      '<div class="hbg"></div><nav class="in"><div class="brand"><img src="/assets/logo-dark.svg" alt="">ALFRED AI</div></nav>' +
      '<div class="hero"><div class="in"><div class="kick">Alfred AI \u00b7 Personal Intelligence</div>' +
      '<h1>One butler.<br>A <em>world of minds.</em></h1>' +
      '<p class="sub">Alfred brings powerful AI minds together to help you think, create, and move forward.</p>' +
      '<button class="cta" id="land-cta">Chat with Alfred</button>' +
      '<button class="how-link" id="land-how">See how it works</button></div></div>' +
      '<section><div class="in"><div class="kick rv">Capabilities</div><h2 class="rv">One conversation.<br>More ways forward.</h2>' +
      '<div class="caps">' + caps4() + '</div></div></section>' +
      '<section style="padding-top:0"><div class="in"><div class="kick rv">How it works</div>' +
      '<div class="steps" style="margin-top:26px">' +
      '<div class="step rv"><div class="n">01</div><b>Ask Alfred</b><span>Anything you would ask the sharpest person you know.</span></div>' +
      '<div class="step rv"><div class="n">02</div><b>He brings the right minds</b><span>Alfred convenes the specialists your question deserves.</span></div>' +
      '<div class="step rv"><div class="n">03</div><b>One useful answer</b><span>Not a feed of bots \u2014 one considered reply, with a next step.</span></div></div>' +
      '<img class="neb rv" src="/assets/gen/nebula-plate.png" alt=""></div></section>' +
      '<section><div class="in"><div class="kick rv">Power levels</div><h2 class="rv">Choose how hard he thinks.</h2>' +
      '<p class="lede rv">Same butler at every level \u2014 deeper councils at the higher ones.</p>' +
      '<div class="tiers">' + tiers() + '</div></div></section>' +
      '<section style="padding-top:0"><div class="in"><div class="kick rv">FAQ</div><div class="faqw">' +
      '<details class="rv"><summary>What exactly is Alfred?</summary><p>A personal AI butler that combines multiple state-of-the-art AI minds to give you one excellent answer \u2014 with vision, worlds, and memory.</p></details>' +
      '<details class="rv"><summary>Is it free?</summary><p>Yes. The Free level gets you chatting every day; Pro and Ultra convene deeper minds.</p></details>' +
      '<details class="rv"><summary>What can I use him for?</summary><p>Writing, coding, planning, learning, images, understanding photos \u2014 anything you would ask the world\u2019s best minds.</p></details>' +
      '<details class="rv"><summary>Are my conversations private?</summary><p>They belong to you. Sign in, talk, delete \u2014 your call.</p></details>' +
      '<details class="rv"><summary>Which devices work?</summary><p>Any modern browser \u2014 and on your phone he installs as a full-screen app.</p></details></div></div></section>' +
      '<section class="inv"><div class="in"><div class="kick rv">For investors & partners</div><h2 class="rv">Building a more useful kind of AI.</h2>' +
      '<p class="lede rv" style="margin:0 auto 0;max-width:420px">Alfred is the consumer face of multi-mind intelligence. Talk to us.</p>' +
      '<a class="mail rv" href="mailto:cyberartificial1@gmail.com?subject=Alfred%20AI%20%E2%80%94%20Investor%20inquiry">cyberartificial1@gmail.com</a></div></section>' +
      '<footer><div class="in frow"><div class="foot-l"><img src="/assets/logo-dark.svg" alt="">ALFRED AI</div>' +
      '<div class="foot-r">\u00a9 Alfred AI \u00b7 Your Mind, Amplified \u00b7 <a href="mailto:cyberartificial1@gmail.com">contact</a></div></div></footer>';
    document.body.appendChild(L);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    [].slice.call(L.querySelectorAll(".rv")).forEach(function (e) { io.observe(e); });
    function tok() { try { for (var k in localStorage) { var v = localStorage.getItem(k) || ""; if (v.length >= 24 && /^[A-Za-z0-9_\-.]+$/.test(v)) return v; } } catch (e) {} return ""; }
    function go() {
      fetch("/api/auth/me", { credentials: "include", headers: { "X-Alfred-Token": tok() } })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) {
          L.style.display = "none";
          if (j && j.user) {
            var c = [].slice.call(document.querySelectorAll(".nav-item")).filter(function (r) { return (r.textContent || "").trim() === "Chat"; })[0];
            if (c) c.click(); else location.hash = "#/chat";
          } else {
            [].slice.call(document.querySelectorAll(".view")).forEach(function (v) { v.classList.toggle("show", /login/i.test(v.id)); });
            [].slice.call(document.querySelectorAll(".nav-item")).forEach(function (r) { r.classList.remove("active"); });
          }
        }).catch(function () { L.style.display = "none"; });
    }
    document.getElementById("land-cta").addEventListener("click", go);
    document.getElementById("land-how").addEventListener("click", function () {
      L.querySelectorAll("section")[0].scrollIntoView({ behavior: "smooth" });
    });
  }
  function decide() {
    var h = (location.hash || "").toLowerCase();
    var L = document.getElementById("land");
    if (/chat|explore|modules|history|plans|settings|admin|login/.test(h)) { if (L) L.style.display = "none"; return; }
    if (!L) build();
    fetch("/api/auth/me", { credentials: "include" }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) { var x = document.getElementById("land"); if (x) x.style.display = (j && j.user) ? "none" : "block"; }).catch(function () {});
  }
  setTimeout(decide, 3600);
  window.addEventListener("hashchange", decide);
})();

/* ===== v270: landing future-polish — live council demo, FIG labels, changelog, manifesto ===== */
(function () {
  if (window.__v270) return; window.__v270 = "1";
  var st = document.createElement("style");
  st.textContent = [
    "#land .demo{margin:38px auto 0;max-width:520px;text-align:left;background:rgba(13,22,38,.78);border:1px solid rgba(102,204,255,.22);border-radius:18px;padding:16px 18px;backdrop-filter:blur(12px);box-shadow:0 20px 60px rgba(0,0,0,.45)}",
    "#land .dq{color:#EAF3FF;font-size:14px;line-height:1.5}",
    "#land .dq .cur{display:inline-block;width:8px;height:15px;background:#66CCFF;vertical-align:-2px;margin-left:2px;animation:blink 1s steps(2) infinite}",
    "@keyframes blink{50%{opacity:0}}",
    "#land .da{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#C7D6E8;line-height:1.6;display:none}",
    "#land .da .tag{display:inline-block;font-size:9.5px;letter-spacing:2px;color:#66CCFF;border:1px solid rgba(102,204,255,.35);border-radius:99px;padding:2px 8px;margin-bottom:8px;text-transform:uppercase}",
    "#land .strip{margin-top:26px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}",
    "#land .sl{font-size:10.5px;letter-spacing:1.5px;color:#7E97B8;text-transform:uppercase}",
    "#land .sl b{color:#66CCFF;font-weight:600}",
    "#land .kick .fig{color:#5F7FA3;margin-right:10px}",
    "#land .manifesto{padding:96px 0;text-align:center;background:radial-gradient(60% 80% at 50% 50%,rgba(102,204,255,.07),transparent)}",
    "#land .manifesto p{font-family:Sora;font-weight:600;font-size:clamp(1.4rem,5.5vw,2.2rem);line-height:1.3;letter-spacing:-.03em;max-width:680px;margin:0 auto}",
    "#land .manifesto p em{font-style:normal;color:#66CCFF}",
    "#land .cl{max-width:640px}",
    "#land .clrow{display:flex;gap:18px;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.08);align-items:baseline}",
    "#land .cld{font-family:Sora;font-size:12px;color:#66CCFF;min-width:86px;font-variant-numeric:tabular-nums}",
    "#land .clt{font-size:13.5px;color:#C7D6E8}",
    "#land .moment{margin-top:14px;font-size:12.5px;color:#7E97B8;font-style:normal}",
    "@media (prefers-reduced-motion:reduce){#land .dq .cur{animation:none}}"
  ].join("");
  document.head.appendChild(st);

  var Q = "Help me plan a product launch for Friday.";
  var A = "Convened three angles: audience, message, risk. Verdict: launch to your waitlist first, keep the press for week two \u2014 momentum beats reach. Want the day-by-day plan?";
  var CHG = [["SEP 24", "Council depth \u2014 Ultra answers now weigh multiple minds"], ["SEP 18", "Vision upgrade \u2014 Alfred reads photos natively"], ["SEP 11", "Living Explore \u2014 fresh designs and posts every day"]];
  function patch(L) {
    if (L.getAttribute("data-v270")) return;
    L.setAttribute("data-v270", "1");
    /* FIG labels: every kicker becomes a spec label */
    var figs = ["FIG 01", "FIG 02", "FIG 03", "FIG 04"], fi = 0;
    [].slice.call(L.querySelectorAll(".kick")).forEach(function (k) {
      if (fi < figs.length && k.textContent.indexOf("FIG") < 0) k.innerHTML = '<span class="fig">' + figs[fi++] + '</span>' + k.textContent;
    });
    /* stronger hero copy + use-moment */
    var sub = L.querySelector(".sub");
    if (sub) sub.textContent = "Ask once. Alfred convenes the sharpest AI minds alive and returns one answer worth acting on.";
    var cta = L.querySelector("#land-cta");
    if (cta && !L.querySelector(".moment")) {
      var mo = document.createElement("div"); mo.className = "moment";
      mo.textContent = "Tuesday, 6:47am \u2014 you ask. The council is already thinking.";
      cta.parentNode.insertBefore(mo, cta.nextSibling);
    }
    /* live council demo in the hero */
    if (!L.querySelector(".demo")) {
      var d = document.createElement("div"); d.className = "demo";
      d.innerHTML = '<div class="dq"><span class="txt"></span><span class="cur"></span></div>' +
                    '<div class="da"><span class="tag">Council convened</span><br>' + A + '</div>';
      var hero = L.querySelector(".hero .in"); if (hero) hero.appendChild(d);
      var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var tx = d.querySelector(".txt"), da = d.querySelector(".da");
      if (rm) { tx.textContent = Q; da.style.display = "block"; }
      else {
        var i = 0;
        var t = setInterval(function () {
          i++; tx.textContent = Q.slice(0, i);
          if (i >= Q.length) { clearInterval(t); d.querySelector(".cur").style.display = "none";
            setTimeout(function () { da.style.display = "block"; }, 500); }
        }, 42);
      }
    }
    /* status strip (qualitative, honest) */
    if (!L.querySelector(".strip")) {
      var s = document.createElement("div"); s.className = "strip";
      s.innerHTML = '<span class="sl"><b>Online</b> now</span><span class="sl">\u00b7</span><span class="sl">Minds <b>convened</b></span><span class="sl">\u00b7</span><span class="sl">Worlds <b>growing</b></span>';
      var h2 = L.querySelector(".hero .in"); if (h2) h2.appendChild(s);
    }
    /* manifesto band before FAQ */
    if (!L.querySelector(".manifesto")) {
      var m = document.createElement("section"); m.className = "manifesto";
      m.innerHTML = '<div class="in"><p>One model answers.<br><em>A council understands.</em></p></div>';
      var secs = L.querySelectorAll("section");
      var faq = null;
      [].slice.call(secs).forEach(function (x) { if (x.querySelector("details")) faq = x; });
      if (faq && faq.parentNode) faq.parentNode.insertBefore(m, faq);
    }
    /* changelog before the investor band */
    if (!L.querySelector(".cl")) {
      var c = document.createElement("section"); c.className = "cl-sec"; c.style.padding = "0";
      c.innerHTML = '<div class="in"><div class="kick"><span class="fig">FIG 05</span>Recently absorbed</div><h2 style="font-size:clamp(1.4rem,5vw,2rem)">He gets sharper while you sleep.</h2>' +
        '<div class="cl">' + CHG.map(function (r) { return '<div class="clrow"><span class="cld">' + r[0] + '</span><span class="clt">' + r[1] + '</span></div>'; }).join("") + '</div></div>';
      var inv = L.querySelector(".inv");
      if (inv && inv.parentNode) inv.parentNode.insertBefore(c, inv);
    }
  }
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (L && L.style.display !== "none") { patch(L); clearInterval(iv); }
  }, 900);
})();

/* ===== v270: landing future-polish — live council demo, FIG labels, changelog, manifesto ===== */
(function () {
  if (window.__v270) return; window.__v270 = "1";
  var st = document.createElement("style");
  st.textContent = [
    "#land .demo{margin:38px auto 0;max-width:520px;text-align:left;background:rgba(13,22,38,.78);border:1px solid rgba(102,204,255,.22);border-radius:18px;padding:16px 18px;backdrop-filter:blur(12px);box-shadow:0 20px 60px rgba(0,0,0,.45)}",
    "#land .dq{color:#EAF3FF;font-size:14px;line-height:1.5}",
    "#land .dq .cur{display:inline-block;width:8px;height:15px;background:#66CCFF;vertical-align:-2px;margin-left:2px;animation:blink 1s steps(2) infinite}",
    "@keyframes blink{50%{opacity:0}}",
    "#land .da{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#C7D6E8;line-height:1.6;display:none}",
    "#land .da .tag{display:inline-block;font-size:9.5px;letter-spacing:2px;color:#66CCFF;border:1px solid rgba(102,204,255,.35);border-radius:99px;padding:2px 8px;margin-bottom:8px;text-transform:uppercase}",
    "#land .strip{margin-top:26px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}",
    "#land .sl{font-size:10.5px;letter-spacing:1.5px;color:#7E97B8;text-transform:uppercase}",
    "#land .sl b{color:#66CCFF;font-weight:600}",
    "#land .kick .fig{color:#5F7FA3;margin-right:10px}",
    "#land .manifesto{padding:96px 0;text-align:center;background:radial-gradient(60% 80% at 50% 50%,rgba(102,204,255,.07),transparent)}",
    "#land .manifesto p{font-family:Sora;font-weight:600;font-size:clamp(1.4rem,5.5vw,2.2rem);line-height:1.3;letter-spacing:-.03em;max-width:680px;margin:0 auto}",
    "#land .manifesto p em{font-style:normal;color:#66CCFF}",
    "#land .cl{max-width:640px}",
    "#land .clrow{display:flex;gap:18px;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.08);align-items:baseline}",
    "#land .cld{font-family:Sora;font-size:12px;color:#66CCFF;min-width:86px;font-variant-numeric:tabular-nums}",
    "#land .clt{font-size:13.5px;color:#C7D6E8}",
    "#land .moment{margin-top:14px;font-size:12.5px;color:#7E97B8;font-style:normal}",
    "@media (prefers-reduced-motion:reduce){#land .dq .cur{animation:none}}"
  ].join("");
  document.head.appendChild(st);

  var Q = "Help me plan a product launch for Friday.";
  var A = "Convened three angles: audience, message, risk. Verdict: launch to your waitlist first, keep the press for week two \u2014 momentum beats reach. Want the day-by-day plan?";
  var CHG = [["SEP 24", "Council depth \u2014 Ultra answers now weigh multiple minds"], ["SEP 18", "Vision upgrade \u2014 Alfred reads photos natively"], ["SEP 11", "Living Explore \u2014 fresh designs and posts every day"]];
  function patch(L) {
    if (L.getAttribute("data-v270")) return;
    L.setAttribute("data-v270", "1");
    /* FIG labels: every kicker becomes a spec label */
    var figs = ["FIG 01", "FIG 02", "FIG 03", "FIG 04"], fi = 0;
    [].slice.call(L.querySelectorAll(".kick")).forEach(function (k) {
      if (fi < figs.length && k.textContent.indexOf("FIG") < 0) k.innerHTML = '<span class="fig">' + figs[fi++] + '</span>' + k.textContent;
    });
    /* stronger hero copy + use-moment */
    var sub = L.querySelector(".sub");
    if (sub) sub.textContent = "Ask once. Alfred convenes the sharpest AI minds alive and returns one answer worth acting on.";
    var cta = L.querySelector("#land-cta");
    if (cta && !L.querySelector(".moment")) {
      var mo = document.createElement("div"); mo.className = "moment";
      mo.textContent = "Tuesday, 6:47am \u2014 you ask. The council is already thinking.";
      cta.parentNode.insertBefore(mo, cta.nextSibling);
    }
    /* live council demo in the hero */
    if (!L.querySelector(".demo")) {
      var d = document.createElement("div"); d.className = "demo";
      d.innerHTML = '<div class="dq"><span class="txt"></span><span class="cur"></span></div>' +
                    '<div class="da"><span class="tag">Council convened</span><br>' + A + '</div>';
      var hero = L.querySelector(".hero .in"); if (hero) hero.appendChild(d);
      var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var tx = d.querySelector(".txt"), da = d.querySelector(".da");
      if (rm) { tx.textContent = Q; da.style.display = "block"; }
      else {
        var i = 0;
        var t = setInterval(function () {
          i++; tx.textContent = Q.slice(0, i);
          if (i >= Q.length) { clearInterval(t); d.querySelector(".cur").style.display = "none";
            setTimeout(function () { da.style.display = "block"; }, 500); }
        }, 42);
      }
    }
    /* status strip (qualitative, honest) */
    if (!L.querySelector(".strip")) {
      var s = document.createElement("div"); s.className = "strip";
      s.innerHTML = '<span class="sl"><b>Online</b> now</span><span class="sl">\u00b7</span><span class="sl">Minds <b>convened</b></span><span class="sl">\u00b7</span><span class="sl">Worlds <b>growing</b></span>';
      var h2 = L.querySelector(".hero .in"); if (h2) h2.appendChild(s);
    }
    /* manifesto band before FAQ */
    if (!L.querySelector(".manifesto")) {
      var m = document.createElement("section"); m.className = "manifesto";
      m.innerHTML = '<div class="in"><p>One model answers.<br><em>A council understands.</em></p></div>';
      var secs = L.querySelectorAll("section");
      var faq = null;
      [].slice.call(secs).forEach(function (x) { if (x.querySelector("details")) faq = x; });
      if (faq && faq.parentNode) faq.parentNode.insertBefore(m, faq);
    }
    /* changelog before the investor band */
    if (!L.querySelector(".cl")) {
      var c = document.createElement("section"); c.className = "cl-sec"; c.style.padding = "0";
      c.innerHTML = '<div class="in"><div class="kick"><span class="fig">FIG 05</span>Recently absorbed</div><h2 style="font-size:clamp(1.4rem,5vw,2rem)">He gets sharper while you sleep.</h2>' +
        '<div class="cl">' + CHG.map(function (r) { return '<div class="clrow"><span class="cld">' + r[0] + '</span><span class="clt">' + r[1] + '</span></div>'; }).join("") + '</div></div>';
      var inv = L.querySelector(".inv");
      if (inv && inv.parentNode) inv.parentNode.insertBefore(c, inv);
    }
  }
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (L && L.style.display !== "none") { patch(L); clearInterval(iv); }
  }, 900);
})();

/* ===== v270: landing future-polish — live council demo, FIG labels, changelog, manifesto ===== */
(function () {
  if (window.__v270) return; window.__v270 = "1";
  var st = document.createElement("style");
  st.textContent = [
    "#land .demo{margin:38px auto 0;max-width:520px;text-align:left;background:rgba(13,22,38,.78);border:1px solid rgba(102,204,255,.22);border-radius:18px;padding:16px 18px;backdrop-filter:blur(12px);box-shadow:0 20px 60px rgba(0,0,0,.45)}",
    "#land .dq{color:#EAF3FF;font-size:14px;line-height:1.5}",
    "#land .dq .cur{display:inline-block;width:8px;height:15px;background:#66CCFF;vertical-align:-2px;margin-left:2px;animation:blink 1s steps(2) infinite}",
    "@keyframes blink{50%{opacity:0}}",
    "#land .da{margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#C7D6E8;line-height:1.6;display:none}",
    "#land .da .tag{display:inline-block;font-size:9.5px;letter-spacing:2px;color:#66CCFF;border:1px solid rgba(102,204,255,.35);border-radius:99px;padding:2px 8px;margin-bottom:8px;text-transform:uppercase}",
    "#land .strip{margin-top:26px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}",
    "#land .sl{font-size:10.5px;letter-spacing:1.5px;color:#7E97B8;text-transform:uppercase}",
    "#land .sl b{color:#66CCFF;font-weight:600}",
    "#land .kick .fig{color:#5F7FA3;margin-right:10px}",
    "#land .manifesto{padding:96px 0;text-align:center;background:radial-gradient(60% 80% at 50% 50%,rgba(102,204,255,.07),transparent)}",
    "#land .manifesto p{font-family:Sora;font-weight:600;font-size:clamp(1.4rem,5.5vw,2.2rem);line-height:1.3;letter-spacing:-.03em;max-width:680px;margin:0 auto}",
    "#land .manifesto p em{font-style:normal;color:#66CCFF}",
    "#land .cl{max-width:640px}",
    "#land .clrow{display:flex;gap:18px;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.08);align-items:baseline}",
    "#land .cld{font-family:Sora;font-size:12px;color:#66CCFF;min-width:86px;font-variant-numeric:tabular-nums}",
    "#land .clt{font-size:13.5px;color:#C7D6E8}",
    "#land .moment{margin-top:14px;font-size:12.5px;color:#7E97B8;font-style:normal}",
    "@media (prefers-reduced-motion:reduce){#land .dq .cur{animation:none}}"
  ].join("");
  document.head.appendChild(st);

  var Q = "Help me plan a product launch for Friday.";
  var A = "Convened three angles: audience, message, risk. Verdict: launch to your waitlist first, keep the press for week two \u2014 momentum beats reach. Want the day-by-day plan?";
  var CHG = [["SEP 24", "Council depth \u2014 Ultra answers now weigh multiple minds"], ["SEP 18", "Vision upgrade \u2014 Alfred reads photos natively"], ["SEP 11", "Living Explore \u2014 fresh designs and posts every day"]];
  function patch(L) {
    if (L.getAttribute("data-v270")) return;
    L.setAttribute("data-v270", "1");
    /* FIG labels: every kicker becomes a spec label */
    var figs = ["FIG 01", "FIG 02", "FIG 03", "FIG 04"], fi = 0;
    [].slice.call(L.querySelectorAll(".kick")).forEach(function (k) {
      if (fi < figs.length && k.textContent.indexOf("FIG") < 0) k.innerHTML = '<span class="fig">' + figs[fi++] + '</span>' + k.textContent;
    });
    /* stronger hero copy + use-moment */
    var sub = L.querySelector(".sub");
    if (sub) sub.textContent = "Ask once. Alfred convenes the sharpest AI minds alive and returns one answer worth acting on.";
    var cta = L.querySelector("#land-cta");
    if (cta && !L.querySelector(".moment")) {
      var mo = document.createElement("div"); mo.className = "moment";
      mo.textContent = "Tuesday, 6:47am \u2014 you ask. The council is already thinking.";
      cta.parentNode.insertBefore(mo, cta.nextSibling);
    }
    /* live council demo in the hero */
    if (!L.querySelector(".demo")) {
      var d = document.createElement("div"); d.className = "demo";
      d.innerHTML = '<div class="dq"><span class="txt"></span><span class="cur"></span></div>' +
                    '<div class="da"><span class="tag">Council convened</span><br>' + A + '</div>';
      var hero = L.querySelector(".hero .in"); if (hero) hero.appendChild(d);
      var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var tx = d.querySelector(".txt"), da = d.querySelector(".da");
      if (rm) { tx.textContent = Q; da.style.display = "block"; }
      else {
        var i = 0;
        var t = setInterval(function () {
          i++; tx.textContent = Q.slice(0, i);
          if (i >= Q.length) { clearInterval(t); d.querySelector(".cur").style.display = "none";
            setTimeout(function () { da.style.display = "block"; }, 500); }
        }, 42);
      }
    }
    /* status strip (qualitative, honest) */
    if (!L.querySelector(".strip")) {
      var s = document.createElement("div"); s.className = "strip";
      s.innerHTML = '<span class="sl"><b>Online</b> now</span><span class="sl">\u00b7</span><span class="sl">Minds <b>convened</b></span><span class="sl">\u00b7</span><span class="sl">Worlds <b>growing</b></span>';
      var h2 = L.querySelector(".hero .in"); if (h2) h2.appendChild(s);
    }
    /* manifesto band before FAQ */
    if (!L.querySelector(".manifesto")) {
      var m = document.createElement("section"); m.className = "manifesto";
      m.innerHTML = '<div class="in"><p>One model answers.<br><em>A council understands.</em></p></div>';
      var secs = L.querySelectorAll("section");
      var faq = null;
      [].slice.call(secs).forEach(function (x) { if (x.querySelector("details")) faq = x; });
      if (faq && faq.parentNode) faq.parentNode.insertBefore(m, faq);
    }
    /* changelog before the investor band */
    if (!L.querySelector(".cl")) {
      var c = document.createElement("section"); c.className = "cl-sec"; c.style.padding = "0";
      c.innerHTML = '<div class="in"><div class="kick"><span class="fig">FIG 05</span>Recently absorbed</div><h2 style="font-size:clamp(1.4rem,5vw,2rem)">He gets sharper while you sleep.</h2>' +
        '<div class="cl">' + CHG.map(function (r) { return '<div class="clrow"><span class="cld">' + r[0] + '</span><span class="clt">' + r[1] + '</span></div>'; }).join("") + '</div></div>';
      var inv = L.querySelector(".inv");
      if (inv && inv.parentNode) inv.parentNode.insertBefore(c, inv);
    }
  }
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (L && L.style.display !== "none") { patch(L); clearInterval(iv); }
  }, 900);
})();

/* ===== v273b: landing nav sign-in ===== */
(function () {
  if (window.__v273b) return; window.__v273b = "1";
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (!L || L.getAttribute("data-v273b")) { if (L) clearInterval(iv); return; }
    var nav = L.querySelector("nav"); if (!nav) return;
    L.setAttribute("data-v273b", "1"); clearInterval(iv);
    var b = document.createElement("button"); b.className = "navin"; b.textContent = "Sign in";
    b.addEventListener("click", function () {
      L.style.display = "none";
      [].slice.call(document.querySelectorAll(".view")).forEach(function (v) { v.classList.toggle("show", /login/i.test(v.id)); });
      [].slice.call(document.querySelectorAll(".nav-item")).forEach(function (r) { r.classList.remove("active"); });
    });
    nav.appendChild(b);
  }, 800);
})();

/* ===== v274: retry + thumbs on Alfred replies (device-honest) ===== */
(function () {
  if (window.__v274) return; window.__v274 = "1";
  var st = document.createElement("style");
  st.textContent = [
    ".v274row{display:flex;gap:10px;margin-top:8px;align-items:center}",
    ".v274b{background:rgba(255,255,255,.05);border:1px solid rgba(159,216,255,.22);color:#bfe2ff;border-radius:99px;padding:5px 14px;font:12px system-ui;cursor:pointer;transition:background .15s}",
    ".v274b:active{transform:scale(.96)}",
    ".v274b.on{background:rgba(102,204,255,.18);border-color:rgba(102,204,255,.5);color:#dff1ff}",
    ".v274note{font:11px system-ui;color:#7e97b8}"
  ].join("");
  document.head.appendChild(st);
  function fb() { try { return JSON.parse(localStorage.getItem("alfred_fb") || "{}"); } catch (e) { return {}; } }
  function fbSave(o) { try { localStorage.setItem("alfred_fb", JSON.stringify(o)); } catch (e) {} }
  function lastUserText(row) {
    var n = row.previousElementSibling, hops = 0;
    while (n && hops++ < 8) {
      if (n.classList && (n.classList.contains("fx-user") || n.querySelector(".fx-user"))) {
        var t = (n.innerText || "").trim();
        if (t) return t;
      }
      n = n.previousElementSibling;
    }
    return "";
  }
  function sweep() {
    if (document.hidden) return;
    var v = document.getElementById("view-chat"); if (!v || v.offsetParent === null) return;
    if (window.streaming) return;
    [].slice.call(v.querySelectorAll(".msg")).forEach(function (row) {
      if (row.getAttribute("data-v274")) return;
      if (!row.querySelector(".msg-av")) return;                 /* Alfred rows only */
      if (row.classList.contains("fx-user")) return;
      if (row.querySelector(".v129-dots")) return;               /* still thinking */
      var txt = (row.innerText || "").trim();
      if (!txt || txt.length < 4) return;
      row.setAttribute("data-v274", "1");
      var bar = document.createElement("div"); bar.className = "v274row";
      var rt = document.createElement("button"); rt.type = "button"; rt.className = "v274b"; rt.textContent = "↻ Retry";
      rt.addEventListener("click", function () {
        if (window.streaming) return;
        var p = lastUserText(row);
        var inp = document.getElementById("msg-input");
        if (!p || !inp) return;
        inp.value = p; inp.focus();
        var f = document.getElementById("composer");
        if (f && f.requestSubmit) f.requestSubmit();
        else if (f) f.dispatchEvent(new Event("submit", { cancelable: true }));
      });
      var up = document.createElement("button"); up.type = "button"; up.className = "v274b"; up.textContent = "👍";
      var dn = document.createElement("button"); dn.type = "button"; dn.className = "v274b"; dn.textContent = "👎";
      var cid = window.__v129chat || "c";
      var mid = cid + ":" + [].slice.call(v.querySelectorAll(".msg")).indexOf(row);
      function paint() {
        var o = fb()[mid] || 0;
        up.classList.toggle("on", o === 1);
        dn.classList.toggle("on", o === -1);
      }
      function vote(x) {
        var o = fb(); o[mid] = (o[mid] === x) ? 0 : x; fbSave(o); paint();
        note.textContent = o[mid] ? "Saved on this device" : ""; 
        if (o[mid]) setTimeout(function () { note.textContent = ""; }, 2000);
      }
      up.addEventListener("click", function () { vote(1); });
      dn.addEventListener("click", function () { vote(-1); });
      var note = document.createElement("span"); note.className = "v274note";
      bar.appendChild(rt); bar.appendChild(up); bar.appendChild(dn); bar.appendChild(note);
      paint();
      row.appendChild(bar);
    });
  }
  setInterval(sweep, 1600);
})();

/* ===== v275: cascade repair - runtime overrides now WIN (injected after v269/v270) ===== */
(function () {
  if (window.__v275) return; window.__v275 = "1";
  var st = document.createElement("style");
  st.textContent = [
    /* hero depth: image rises behind nav, city finally bright */
    "#land .hbg{top:-80px !important;filter:brightness(1.16) saturate(1.07) !important;background:" +
      "linear-gradient(90deg,rgba(5,9,17,.78) 0%,rgba(5,9,17,.42) 55%,rgba(5,9,17,.08) 100%)," +
      "linear-gradient(180deg,rgba(5,9,17,.72) 0%,rgba(5,9,17,0) 26%)," +
      "linear-gradient(0deg,#080D17 0%,rgba(8,13,23,.02) 40%,rgba(8,13,23,.14) 100%)," +
      "url('/assets/cityy.jpg') center 56%/cover !important}",
    "#land .hero{padding-top:118px !important}",
    /* secondary CTA becomes a real ghost pill */
    "#land .how-link{background:rgba(255,255,255,.08) !important;border:1px solid rgba(255,255,255,.16) !important;border-radius:12px !important;padding:15px 24px !important;font-size:14px !important;color:#DFEAF6 !important;text-decoration:none !important;margin-left:12px !important}",
    "@media(max-width:380px){#land .how-link{margin:12px 0 0 !important}}",
    /* micro-polish: CTA row breathes, moment line tucks under button */
    "#land .cta{margin-right:0 !important}",
    "#land .moment{margin-top:16px !important}",
    /* nav glass: sits on the image now, needs its own scrim */
    "#land nav{background:linear-gradient(180deg,rgba(5,9,17,.55),rgba(5,9,17,0)) !important;margin-top:-0px;padding-top:24px !important}"
  ].join("");
  document.head.appendChild(st);
})();

/* ===== v276: splash cinema + landing product moment ===== */
(function () {
  if (window.__v276s) return; window.__v276s = "1";
  /* --- splash: exact selectors from index.html (#loading, #status, #fill, #pct) --- */
  var st = document.createElement("style");
  st.textContent = [
    "#loading .title{font-family:Sora,'DM Sans',system-ui !important;font-weight:600 !important;letter-spacing:.32em !important;text-shadow:0 2px 30px rgba(79,195,255,.35)}",
    "#loading .tagline{color:#9fc7e8 !important;font-family:'DM Sans',system-ui !important;letter-spacing:.08em}",
    "#loading .fill{background:linear-gradient(90deg,#4fc3ff 55%,#ffb347) !important}",
    "#loading .pct{font-variant-numeric:tabular-nums !important;font-family:Sora,system-ui !important;letter-spacing:.1em}",
    "#loading .status{font-size:12px !important;letter-spacing:.14em !important;text-transform:uppercase !important;color:#b9d2ea !important}",
    "#loading .logo-wrap{animation:breathe 3.2s ease-in-out infinite}",
    "@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}",
    "@media (prefers-reduced-motion:reduce){#loading .logo-wrap{animation:none}}"
  ].join("");
  document.head.appendChild(st);
  var LINES = ["Waking the council", "Lighting the city", "Tuning the minds", "Reading your worlds", "Opening the gates"];
  var li = 0;
  setInterval(function () {
    var s = document.getElementById("loading"), t = document.getElementById("status");
    if (s && t && s.offsetParent !== null) { li = (li + 1) % LINES.length; t.textContent = LINES[li]; }
  }, 780);
  /* --- landing: product moment + fig renumber + living changelog + honest footer --- */
  var st2 = document.createElement("style");
  st2.textContent = [
    "#land .pm{display:flex;justify-content:center}",
    "#land .phone{width:290px;border-radius:38px;border:1px solid rgba(255,255,255,.14);background:#0a1220;padding:18px 14px;box-shadow:0 30px 80px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.03)}",
    "#land .phone .notch{width:70px;height:5px;border-radius:99px;background:rgba(255,255,255,.16);margin:0 auto 16px}",
    "#land .pb{max-width:82%;border-radius:16px;padding:10px 13px;font-size:12.5px;line-height:1.5;margin-bottom:10px}",
    "#land .pb.u{margin-left:auto;background:rgba(255,179,71,.12);border:1px solid rgba(255,179,71,.25);color:#ffe6bd}",
    "#land .pb.a{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#dfeaf6}",
    "#land .pb .tag{display:inline-block;font-size:9px;letter-spacing:1.5px;color:#66CCFF;border:1px solid rgba(102,204,255,.3);border-radius:99px;padding:1px 7px;margin-bottom:6px}",
    "#land .pmcap{text-align:center;color:#7e97b8;font-size:12px;margin-top:14px}"
  ].join("");
  document.head.appendChild(st2);
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (!L || L.getAttribute("data-v276")) return;
    if (!L.querySelector(".tiers")) return;
    L.setAttribute("data-v276", "1"); clearInterval(iv);
    /* renumber FIGs 01..05 across visible kickers */
    var figs = ["FIG 01", "FIG 02", "FIG 03", "FIG 04", "FIG 05"], fi = 0;
    [].slice.call(L.querySelectorAll(".kick")).forEach(function (k) {
      var f = k.querySelector(".fig");
      if (fi === 0 && k.closest(".hero")) { if (f) f.remove(); return; }
      if (!f) { f = document.createElement("span"); f.className = "fig"; k.insertBefore(f, k.firstChild); }
      f.textContent = figs[fi++] || "";
    });
    /* living changelog labels (never stale) */
    var lbl = ["THIS WEEK", "LAST WEEK", "3 WKS AGO"];
    [].slice.call(L.querySelectorAll(".cld")).forEach(function (d, i) { if (lbl[i]) d.textContent = lbl[i]; });
    /* product moment: phone mock before the manifesto band */
    if (!L.querySelector(".phone")) {
      var sec = document.createElement("section");
      sec.innerHTML = '<div class="in"><div class="kick rv">The product</div><h2 class="rv" style="margin-bottom:36px">One voice. Every mind behind it.</h2>' +
        '<div class="pm rv"><div class="phone"><div class="notch"></div>' +
        '<div class="pb u">Why did signups dip this week?</div>' +
        '<div class="pb a"><span class="tag">COUNCIL CONVENED</span><br>Three causes stand out: onboarding friction at step two, weekend traffic dip, and one broken invite link. The link is the one costing you \u2014 fixed in a minute. Want the funnel breakdown?</div>' +
        '</div></div><div class="pmcap">The actual conversation view \u2014 every answer, one butler.</div></div>';
      var man = L.querySelector(".manifesto");
      if (man && man.parentNode) man.parentNode.insertBefore(sec, man);
      [].slice.call(sec.querySelectorAll(".rv")).forEach(function (e) { e.classList.add("on"); });
    }
    /* honest footer */
    var fr = L.querySelector(".foot-r");
    if (fr) fr.innerHTML = '\u00a9 Alfred AI \u00b7 Your Mind, Amplified \u00b7 <a href="mailto:cyberartificial1@gmail.com">contact</a> \u00b7 Privacy & Terms ship with public launch';
  }, 1000);
})();

/* ===== v277: consolidated — hero mark, cascade, splash, moment, retry+thumbs ===== */
(function () {
  if (window.__v277) return; window.__v277 = "1";
  var st = document.createElement("style");
  st.textContent = [
    /* cascade winners: bright city behind nav, pill secondary */
    "#land .hbg{top:-80px !important;filter:brightness(1.16) saturate(1.07) !important;background:linear-gradient(90deg,rgba(5,9,17,.78) 0%,rgba(5,9,17,.42) 55%,rgba(5,9,17,.08) 100%),linear-gradient(180deg,rgba(5,9,17,.72) 0%,rgba(5,9,17,0) 26%),linear-gradient(0deg,#080D17 0%,rgba(8,13,23,.02) 40%,rgba(8,13,23,.14) 100%),url('/assets/cityy.jpg') center 56%/cover !important}",
    "#land .hero{padding-top:118px !important}",
    "#land nav{background:linear-gradient(180deg,rgba(5,9,17,.55),rgba(5,9,17,0)) !important}",
    "#land .how-link{background:rgba(255,255,255,.08) !important;border:1px solid rgba(255,255,255,.16) !important;border-radius:12px !important;padding:15px 24px !important;text-decoration:none !important;color:#DFEAF6 !important;margin-left:12px !important}",
    "#land .navin{background:transparent;border:1px solid rgba(255,255,255,.22);color:#DFEAF6;border-radius:99px;padding:9px 20px;font:600 13px 'DM Sans',system-ui;cursor:pointer}",
    /* hero mark */
    "#land .hero-mark{width:92px;height:92px;margin:0 0 24px}",
    "#land .hero-mark img{width:100%;height:100%;filter:drop-shadow(0 0 34px rgba(79,195,255,.45))}",
    "#land .brand img,#land .foot-l img{content:url('/assets/land-mark-320.png')}",
    /* splash cinema (exact ids from index.html) */
    "#loading .title{font-family:Sora,'DM Sans',system-ui !important;letter-spacing:.32em !important;text-shadow:0 2px 30px rgba(79,195,255,.35)}",
    "#loading .fill{background:linear-gradient(90deg,#4fc3ff 55%,#ffb347) !important}",
    "#loading .pct{font-variant-numeric:tabular-nums !important}",
    "#loading .status{font-size:12px !important;letter-spacing:.14em !important;text-transform:uppercase !important;color:#b9d2ea !important}",
    "#loading .logo-wrap{animation:breathe 3.2s ease-in-out infinite}",
    "@keyframes breathe{50%{transform:scale(1.045)}}",
    /* product moment phone */
    "#land .pm{display:flex;justify-content:center}",
    "#land .phone{width:290px;border-radius:38px;border:1px solid rgba(255,255,255,.14);background:#0a1220;padding:18px 14px;box-shadow:0 30px 80px rgba(0,0,0,.5)}",
    "#land .phone .notch{width:70px;height:5px;border-radius:99px;background:rgba(255,255,255,.16);margin:0 auto 16px}",
    "#land .pb{max-width:82%;border-radius:16px;padding:10px 13px;font-size:12.5px;line-height:1.5;margin-bottom:10px}",
    "#land .pb.u{margin-left:auto;background:rgba(255,179,71,.12);border:1px solid rgba(255,179,71,.25);color:#ffe6bd}",
    "#land .pb.a{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#dfeaf6}",
    "#land .pb .tag{display:inline-block;font-size:9px;letter-spacing:1.5px;color:#66CCFF;border:1px solid rgba(102,204,255,.3);border-radius:99px;padding:1px 7px;margin-bottom:6px}",
    "#land .pmcap{text-align:center;color:#7e97b8;font-size:12px;margin-top:14px}",
    /* retry + thumbs */
    ".v274row{display:flex;gap:10px;margin-top:8px;align-items:center}",
    ".v274b{background:rgba(255,255,255,.05);border:1px solid rgba(159,216,255,.22);color:#bfe2ff;border-radius:99px;padding:5px 14px;font:12px system-ui;cursor:pointer}",
    ".v274b.on{background:rgba(102,204,255,.18);border-color:rgba(102,204,255,.5);color:#dff1ff}",
    ".v274note{font:11px system-ui;color:#7e97b8}"
  ].join("");
  document.head.appendChild(st);

  /* splash status rotator */
  if (!window.__v276s) {
    var LINES = ["Waking the council", "Lighting the city", "Tuning the minds", "Reading your worlds", "Opening the gates"], li = 0;
    setInterval(function () {
      var s = document.getElementById("loading"), t = document.getElementById("status");
      if (s && t && s.offsetParent !== null) { li = (li + 1) % LINES.length; t.textContent = LINES[li]; }
    }, 780);
  }

  /* landing patches */
  var L4 = ["THIS WEEK", "LAST WEEK", "3 WKS AGO"], FIGS = ["FIG 01", "FIG 02", "FIG 03", "FIG 04", "FIG 05"];
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (!L || !L.querySelector(".tiers")) return;
    clearInterval(iv);
    var nav = L.querySelector("nav");
    if (nav && !nav.querySelector(".navin")) {
      var b = document.createElement("button"); b.className = "navin"; b.textContent = "Sign in";
      b.addEventListener("click", function () {
        L.style.display = "none";
        [].slice.call(document.querySelectorAll(".view")).forEach(function (v) { v.classList.toggle("show", /login/i.test(v.id)); });
      });
      nav.appendChild(b);
    }
    var hin = L.querySelector(".hero .in");
    if (hin && !L.querySelector(".hero-mark")) {
      var hm = document.createElement("div"); hm.className = "hero-mark";
      hm.innerHTML = '<img src="/assets/land-mark.png" alt="">';
      var k = hin.querySelector(".kick");
      if (k) hin.insertBefore(hm, k); else hin.insertBefore(hm, hin.firstChild);
    }
    var fi = 0;
    [].slice.call(L.querySelectorAll(".kick")).forEach(function (kk) {
      if (kk.closest(".hero")) { var f0 = kk.querySelector(".fig"); if (f0) f0.remove(); return; }
      var f = kk.querySelector(".fig");
      if (!f) { f = document.createElement("span"); f.className = "fig"; kk.insertBefore(f, kk.firstChild); }
      f.textContent = FIGS[fi++] || "";
    });
    [].slice.call(L.querySelectorAll(".cld")).forEach(function (dd, i) { if (L4[i]) dd.textContent = L4[i]; });
    if (!L.querySelector(".phone")) {
      var sec = document.createElement("section");
      sec.innerHTML = '<div class="in"><div class="kick rv">The product</div><h2 class="rv" style="margin-bottom:36px">One voice. Every mind behind it.</h2>' +
        '<div class="pm rv"><div class="phone"><div class="notch"></div>' +
        '<div class="pb u">Why did signups dip this week?</div>' +
        '<div class="pb a"><span class="tag">COUNCIL CONVENED</span><br>Three causes stand out: onboarding friction at step two, weekend traffic dip, and one broken invite link. The link is the one costing you \u2014 fixed in a minute. Want the funnel breakdown?</div>' +
        '</div></div><div class="pmcap">The actual conversation view \u2014 every answer, one butler.</div></div>';
      var man = L.querySelector(".manifesto");
      if (man && man.parentNode) man.parentNode.insertBefore(sec, man);
      [].slice.call(sec.querySelectorAll(".rv")).forEach(function (e) { e.classList.add("on"); });
    }
    var fr = L.querySelector(".foot-r");
    if (fr) fr.innerHTML = '\u00a9 Alfred AI \u00b7 Your Mind, Amplified \u00b7 <a href="mailto:cyberartificial1@gmail.com">contact</a> \u00b7 Privacy & Terms ship with public launch';
  }, 1000);

  /* retry + thumbs on Alfred replies */
  function fb() { try { return JSON.parse(localStorage.getItem("alfred_fb") || "{}"); } catch (e) { return {}; } }
  function fbs(o) { try { localStorage.setItem("alfred_fb", JSON.stringify(o)); } catch (e) {} }
  setInterval(function () {
    if (document.hidden || window.streaming) return;
    var v = document.getElementById("view-chat"); if (!v || v.offsetParent === null) return;
    [].slice.call(v.querySelectorAll(".msg")).forEach(function (row) {
      if (row.getAttribute("data-v277r")) return;
      if (!row.querySelector(".msg-av") || row.classList.contains("fx-user")) return;
      if (row.querySelector(".v129-dots")) return;
      if ((row.innerText || "").trim().length < 4) return;
      row.setAttribute("data-v277r", "1");
      var bar = document.createElement("div"); bar.className = "v274row";
      var rt = document.createElement("button"); rt.type = "button"; rt.className = "v274b"; rt.textContent = "\u21bb Retry";
      rt.addEventListener("click", function () {
        var n = row.previousElementSibling, p = "", hops = 0;
        while (n && hops++ < 8) {
          if (n.classList && (n.classList.contains("fx-user") || n.querySelector(".fx-user"))) { p = (n.innerText || "").trim(); break; }
          n = n.previousElementSibling;
        }
        var inp = document.getElementById("msg-input");
        if (!p || !inp) return;
        inp.value = p; inp.focus();
        var f = document.getElementById("composer");
        if (f && f.requestSubmit) f.requestSubmit(); else if (f) f.dispatchEvent(new Event("submit", { cancelable: true }));
      });
      var up = document.createElement("button"); up.type = "button"; up.className = "v274b"; up.textContent = "\uD83D\uDC4D";
      var dn = document.createElement("button"); dn.type = "button"; dn.className = "v274b"; dn.textContent = "\uD83D\uDC4E";
      var mid = (window.__v129chat || "c") + ":" + [].slice.call(v.querySelectorAll(".msg")).indexOf(row);
      var note = document.createElement("span"); note.className = "v274note";
      function paint() { var o = fb()[mid] || 0; up.classList.toggle("on", o === 1); dn.classList.toggle("on", o === -1); }
      function vote(x) { var o = fb(); o[mid] = (o[mid] === x) ? 0 : x; fbs(o); paint();
        note.textContent = o[mid] ? "Saved on this device" : "";
        if (o[mid]) setTimeout(function () { note.textContent = ""; }, 2000); }
      up.addEventListener("click", function () { vote(1); });
      dn.addEventListener("click", function () { vote(-1); });
      bar.appendChild(rt); bar.appendChild(up); bar.appendChild(dn); bar.appendChild(note);
      paint(); row.appendChild(bar);
    });
  }, 1600);
})();

/* ===== v278: splash exit, mark backing, tier CTAs, interactive demo, trust ===== */
(function () {
  if (window.__v278) return; window.__v278 = "1";
  var st = document.createElement("style");
  st.textContent = [
    /* splash exit: hold at 100% then lift+crossfade */
    "#loading.exit{animation:v278out .56s cubic-bezier(.4,0,.2,1) forwards !important}",
    "#loading.exit .content{animation:v278lift .56s cubic-bezier(.4,0,.2,1) forwards}",
    "#loading.exit .loader{opacity:0;transition:opacity .3s}",
    "@keyframes v278out{to{opacity:0}}",
    "@keyframes v278lift{to{transform:translateY(-14px) scale(1.04);opacity:0}}",
    "@media (prefers-reduced-motion:reduce){#loading.exit,#loading.exit .content{animation-duration:.01s !important}}",
    /* mark backing: deep navy disc, consistent everywhere */
    "#land .hero-mark{border-radius:50%;background:radial-gradient(circle,rgba(8,16,30,.92) 0%,rgba(8,16,30,.72) 58%,rgba(8,16,30,0) 74%)}",
    "#land .brand img,#land .foot-l img{background:rgba(8,16,30,.55);border-radius:50%;padding:3px;box-sizing:content-box}",
    /* tier CTAs */
    "#land .tiercta{display:inline-block;margin-top:16px;background:#66CCFF;color:#08131f;font:700 13px 'DM Sans',system-ui;border:0;border-radius:12px;padding:12px 22px;cursor:pointer;transition:filter .16s}",
    "#land .tiercta:hover{filter:brightness(1.08)}",
    "#land .tiercta.ghost{background:transparent;color:#bfe2ff;border:1px solid rgba(255,255,255,.18)}",
    /* demo chips */
    "#land .dchips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}",
    "#land .dchip{font:12px 'DM Sans',system-ui;color:#bfe2ff;background:rgba(79,195,255,.08);border:1px solid rgba(102,204,255,.25);border-radius:99px;padding:6px 12px;cursor:pointer}",
    "#land .dchip.on{background:rgba(102,204,255,.2);color:#eaf6ff}"
  ].join("");
  document.head.appendChild(st);

  /* splash exit watcher */
  var exit = setInterval(function () {
    if (!window.__v207barFin) return;
    clearInterval(exit);
    setTimeout(function () {
      var s = document.getElementById("loading");
      if (s && s.offsetParent !== null) {
        s.classList.add("exit");
        setTimeout(function () {
          if (s && [].slice.call(document.querySelectorAll(".screen.show")).length) s.classList.remove("show");
        }, 600);
      }
    }, 180);
  }, 200);

  var QA = [
    ["Help me plan a product launch for Friday.", "Convened three angles: audience, message, risk. Verdict: launch to your waitlist first, keep the press for week two \u2014 momentum beats reach. Want the day-by-day plan?"],
    ["I have 4 hours and a messy pitch deck.", "Council's call: fix the story first \u2014 one sentence per slide, one ask at the end. I'll draft the narrative now; design polish is a 30-minute pass after. Deck or notes to start?"],
    ["Is my data safe here?", "Your conversations belong to you \u2014 they live in Alfred's own database, sessions sign out with one tap, and account deletion is yours on request. No ads, no resale."],
    ["What makes Ultra different?", "Depth. Ultra convenes the Deep-think Council \u2014 answers weigh multiple angles before landing. Free is crisp, Pro is full-speed, Ultra thinks hardest."]
  ];
  var iv = setInterval(function () {
    if (document.hidden) return;
    var L = document.getElementById("land");
    if (!L || !L.querySelector(".tiers")) return;
    clearInterval(iv);
    /* tier CTAs */
    [].slice.call(L.querySelectorAll(".tier")).forEach(function (t) {
      if (t.querySelector(".tiercta")) return;
      var name = (t.querySelector("h3") || {}).textContent || "";
      var b = document.createElement("button");
      b.className = "tiercta" + (name === "Pro" ? "" : " ghost");
      b.textContent = name === "Free" ? "Start free" : name === "Pro" ? "Go Pro" : "Go Ultra";
      b.addEventListener("click", function () {
        L.style.display = "none";
        var pv = [].slice.call(document.querySelectorAll(".view")).filter(function (v) { return /plan|pay/i.test(v.id); })[0];
        if (pv) {
          [].slice.call(document.querySelectorAll(".view")).forEach(function (v) { v.classList.remove("show"); });
          pv.classList.add("show");
          [].slice.call(document.querySelectorAll(".nav-item")).forEach(function (r) {
            r.classList.toggle("active", /plan/i.test(r.getAttribute("data-view") || ""));
          });
        } else {
          [].slice.call(document.querySelectorAll(".view")).forEach(function (v) { v.classList.toggle("show", /login/i.test(v.id)); });
        }
      });
      t.appendChild(b);
    });
    /* interactive demo chips */
    var demo = L.querySelector(".demo");
    if (demo && !demo.querySelector(".dchips")) {
      var tx = demo.querySelector(".txt"), da = demo.querySelector(".da"), tag = demo.querySelector(".da .tag");
      var chips = document.createElement("div"); chips.className = "dchips";
      QA.forEach(function (qa, i) {
        var c = document.createElement("button"); c.type = "button"; c.className = "dchip" + (i === 0 ? " on" : "");
        c.textContent = qa[0].length > 34 ? qa[0].slice(0, 32) + "\u2026" : qa[0];
        c.addEventListener("click", function () {
          [].slice.call(chips.children).forEach(function (x) { x.classList.remove("on"); });
          c.classList.add("on");
          if (tx) tx.textContent = qa[0];
          if (da) { da.style.display = "block"; var tg = da.querySelector(".tag"); if (tg) tg.after(document.createTextNode(qa[1])); da.dataset.q = qa[1]; }
        });
        chips.appendChild(c);
      });
      demo.appendChild(chips);
      /* wire answer text properly: rebuild answer node per chip */
      var an = document.createElement("span"); an.className = "ans";
      if (da) { an.textContent = " " + QA[0][1]; var tg2 = da.querySelector(".tag"); da.innerHTML = ""; if (tg2) da.appendChild(tg2); da.appendChild(document.createElement("br")); da.appendChild(an); }
      [].slice.call(chips.children).forEach(function (c, i) {
        c.addEventListener("click", function () {
          [].slice.call(chips.children).forEach(function (x) { x.classList.remove("on"); });
          c.classList.add("on");
          if (tx) tx.textContent = QA[i][0];
          if (an) an.textContent = " " + QA[i][1];
        });
      });
    }
    /* trust section before footer */
    if (!L.querySelector(".trustsec")) {
      var s = document.createElement("section"); s.className = "trustsec"; s.style.paddingTop = "0";
      s.innerHTML = '<div class="in"><div class="kick rv">Trust</div><h2 class="rv" style="font-size:clamp(1.4rem,5vw,2rem)">Straight answers, about Alfred too.</h2>' +
        '<div class="tiers" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:26px">' +
        '<div class="tier rv"><h3>Your words, your data</h3><div class="d">Conversations live in Alfred\u2019s own database \u2014 never sold, never fed to ads. Ask, and your data is deleted.</div></div>' +
        '<div class="tier rv"><h3>You control access</h3><div class="d">Sign out anywhere, from Settings. Admins can revoke any session instantly. No silent device lists.</div></div>' +
        '<div class="tier rv"><h3>Honest by design</h3><div class="d">Alfred says when he\u2019s unsure, never invents sources, and won\u2019t pretend to be human. Full privacy & terms ship at public launch.</div></div>' +
        '</div></div>';
      var f = L.querySelector("footer");
      if (f && f.parentNode) f.parentNode.insertBefore(s, f);
      [].slice.call(s.querySelectorAll(".rv")).forEach(function (e) { e.classList.add("on"); });
    }
  }, 1000);
})();

/* ===== v279: splash velocity + honest login ===== */
(function () {
  if (window.__v279) return; window.__v279 = "1";
  var st = document.createElement("style");
  st.textContent = [
    "#login .soc, #register .soc{display:none !important}",
    "#login .divider, #register .divider{display:none !important}",
    "#register .head p{color:#8fb8d8 !important;font-size:13px !important}",
    "#login .head p, #register .head p{font-family:'DM Sans',system-ui !important}",
    "#loading .bar-wrap{max-width:280px !important;margin:0 auto !important}",
    "#loading .status{margin-bottom:10px !important}"
  ].join("");
  document.head.appendChild(st);
  /* splash: 2.2s wall-clock glide (was 6500ms), sparkier particles */
  setTimeout(function () {
    try {
      if (window.__v279vel) return; window.__v279vel = 1;
      var scr = [].slice.call(document.scripts).filter(function (s) { return (s.textContent || "").indexOf("DURATION = 6500") > -1; })[0];
      if (!scr) return;
      var el = document.createElement("script");
      el.textContent = scr.textContent.replace(/DURATION = 6500/, "DURATION = 2200")
        .replace(/for \(var i = 0; i < 16; i\+\+\)/, "for (var i = 0; i < 22; i++)")
        .replace(/animationDelay = \(i \* 0\.9\)/, "animationDelay = (i * 0.35)")
        .replace(/animationDuration = \(9 \+ \(i % 5\) \* 2\)/, "animationDuration = (5 + (i % 4) * 1.5)");
      document.head.appendChild(el);
    } catch (e) {}
  }, 0);
  /* login: register terms-row real consent note */
  setInterval(function () {
    if (document.hidden) return;
    var r = document.getElementById("register"); if (!r || r.getAttribute("data-v279")) return;
    r.setAttribute("data-v279", "1");
    var t = r.querySelector(".terms .t");
    if (t) t.innerHTML = 'I agree to Alfred\u2019s <a href="mailto:cyberartificial1@gmail.com?subject=Terms%20%26%20Privacy" class="lnk">Terms & Privacy</a> \u2014 your chats stay yours.';
  }, 1200);
})();

/* ===== v280: void-disc mark everywhere, forced landing fixes, UX base ===== */
(function () {
  if (window.__v280) return; window.__v280 = "1";
  var st = document.createElement("style");
  st.textContent = [
    "#land .hero-mark{width:96px;height:96px;border-radius:50%;background:none !important;box-shadow:0 0 44px rgba(79,195,255,.28),0 14px 34px rgba(0,0,0,.5);margin-bottom:18px}",
    "#land .brand img,#land .foot-l img{background:transparent !important;padding:0 !important;box-shadow:none}",
    "#land .how-link{background:rgba(255,255,255,.08) !important;border:1px solid rgba(255,255,255,.16) !important;border-radius:12px !important;padding:14px 22px !important;color:#DFEAF6 !important;text-decoration:none !important;display:inline-block !important}",
    ":root{color-scheme:dark}",
    "*{-webkit-tap-highlight-color:transparent}",
    "html{scroll-behavior:smooth}",
    ":focus-visible{outline:2px solid #66CCFF;outline-offset:2px;border-radius:4px}",
    "::selection{background:rgba(102,204,255,.35)}",
    "img{max-width:100%}",
    "@media (pointer:coarse){button:not(.c-ic){min-height:42px}}",
    "@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important}}"
  ].join("");
  document.head.appendChild(st);
  var tries = 0;
  var iv = setInterval(function () {
    if (document.hidden) return;
    tries++;
    var L = document.getElementById("land");
    if (!L) { if (tries > 60) clearInterval(iv); return; }
    var hero = L.querySelector(".hero"), done = false;
    if (hero && !hero.querySelector(".hero-mark")) {
      var k = hero.querySelector(".kick") || hero.querySelector("h1");
      if (k) {
        var m = document.createElement("img");
        m.src = "/assets/land-mark-320.png?v=2"; m.alt = "Alfred"; m.className = "hero-mark";
        k.parentNode.insertBefore(m, k);
      }
    }
    done = !!(hero && hero.querySelector(".hero-mark"));
    [].slice.call(L.querySelectorAll(".brand img,.foot-l img")).forEach(function (im) {
      if (im.getAttribute("data-v280")) return;
      im.setAttribute("data-v280", "1"); im.src = "/assets/land-mark-320.png?v=2";
    });
    var halo = document.querySelector("#loading .halo img");
    if (halo && halo.getAttribute("data-v280") != "1") { halo.setAttribute("data-v280","1"); halo.src = "/assets/land-mark-320.png?v=2"; }
    [].slice.call(L.querySelectorAll("a,button,span,div")).forEach(function (e) {
      if (e.children.length || e.getAttribute("data-v280h")) return;
      if (/see how it works/i.test(e.textContent || "")) {
        e.setAttribute("data-v280h", "1");
        e.style.cssText += ";background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:14px 22px;color:#DFEAF6;text-decoration:none;display:inline-block";
      }
    });
    [].slice.call(L.querySelectorAll("a,button")).forEach(function (e) {
      if (e.getAttribute("data-v280i")) return;
      if (/cyberartificial1@gmail\.com/i.test(e.textContent || "")) {
        e.setAttribute("data-v280i", "1");
        e.style.cssText += ";max-width:340px;margin-left:auto;margin-right:auto;font-size:14px;padding:14px 22px;display:block;text-align:center";
      }
    });
    var labels = ["THIS WEEK", "LAST WEEK", "EARLIER", "EARLIER"];
    [].slice.call(L.querySelectorAll(".cld")).forEach(function (e, i) {
      if (labels[i] && e.textContent !== labels[i]) e.textContent = labels[i];
    });
    [].slice.call(L.querySelectorAll(".demo")).forEach(function (dm) {
      if (dm.getAttribute("data-v280d")) return; dm.setAttribute("data-v280d", "1");
      var lab = document.createElement("div");
      lab.style.cssText = "font:10px 'DM Sans',system-ui;letter-spacing:2px;color:#5F7FA3;text-transform:uppercase;margin-bottom:10px";
      lab.textContent = "Illustrative demo";
      dm.insertBefore(lab, dm.firstChild);
    });
    if (done || tries > 60) clearInterval(iv);
  }, 700);
})();
