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
    var h=location.hash||"";
    if(h.indexOf("login")>-1 && SS("v170boot")!=="1"){
      SSS("v170boot","1"); try{ location.hash="#/chat"; }catch(e){}
      setTimeout(function(){ try{ location.reload(); }catch(e){} },60);
    }
    /* safety net: authed but a login card still showing -> one capped reload */
    setTimeout(function(){
      try{
        var pv=document.querySelector('input[type="password"]');
        var vis=pv&&pv.offsetParent!==null;
        if(vis&&signed&&SS("v170boot2")!=="1"){ SSS("v170boot2","1"); location.reload(); }
      }catch(e){}
    },1600);
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

  function boot(){ build(); probe(); }
  if(document.body) boot();
  else document.addEventListener("DOMContentLoaded",boot);
  setInterval(probe,10000);
  window.addEventListener("hashchange",probe);
})();
