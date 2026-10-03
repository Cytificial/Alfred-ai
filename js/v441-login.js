/* v441-login: ignore superseded auth responses. Returns real Responses only. */
(function () {
  'use strict';
  if (window.__v441) return; window.__v441 = '1';

  var reqSeq = 0;

  /* v451: a stale request must still look like a Response to every caller */
  function staleResponse() {
    return new Response(JSON.stringify({ ok: false, stale: true, error: "" }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function errEl() {
    return document.getElementById('err') ||
           document.querySelector('.err, .v158err, [data-err]');
  }

  function clearErr() {
    var e = errEl();
    if (!e) return;
    e.textContent = '';
    e.style.display = 'none';
    e.classList.remove('show');
  }

  /* v453: server strings -> copy that tells the user what to do next */
  var FRIENDLY = [
    [/too many attempts for this account/i,
     "Too many tries on this account. Nothing is lost - wait 15 minutes, or reset your password if you have forgotten it."],
    [/too many attempts\. wait a few minutes/i,
     "Too many attempts from this network. Wait a few minutes, then try again."],
    [/email or password is incorrect/i,
     "That email and password do not match. Check for typos and try again."],
    [/already exists/i,
     "An account already uses that email. Sign in instead, or reset your password."],
    [/reserved/i,
     "That email address cannot be registered. Please use a different one."],
    [/enter your name/i,
     "Tell us your name so we can create your account."],
    [/at least 8 characters/i,
     "Your password needs at least 8 characters. Try a short phrase you will remember."],
    [/valid email/i,
     "That does not look like a complete email address."],
    [/too large/i,
     "That request was too large to process."],
    [/network hiccup|auth system error/i,
     "Something went wrong on my side. Please try again in a moment."]
  ];

  function friendly(msg) {
    for (var i = 0; i < FRIENDLY.length; i++)
      if (FRIENDLY[i][0].test(msg || "")) return FRIENDLY[i][1];
    return msg || "Sign in failed. Please try again.";
  }

  function showErr(msg) {
    var e = errEl();
    if (!e) return;
    e.textContent = friendly(msg);
    e.style.display = 'block';
    e.classList.add('show');
    var card = e.closest('.card');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }
  window.__v441showErr = showErr;

  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    var isAuth = typeof url === 'string' && /\/api\/auth\/(login|register)/.test(url);
    if (!isAuth) return _fetch.apply(this, arguments);

    reqSeq += 1;
    var mySeq = reqSeq;

    clearErr();
    var btn = document.querySelector('.btn-main');
    if (btn) { btn.disabled = true; btn.dataset.v441lock = '1'; }

    var req = _fetch.apply(this, arguments);

    /* v452: surface any auth failure ourselves - app.js swallows several of them */
    req.then(function (r) {
      try {
        r.clone().text().then(function (t) {
          try {
            var j = JSON.parse(t);
            if (j && j.ok === false && j.error) showErr(j.error);
          } catch (e) {}
        }).catch(function () {});
      } catch (e) {}
      return r;
    }).catch(function () {});

    function real(r) { return r; }
    function fake() { return staleResponse(); }

    var wrapped = {
      then: function (onOk, onErr) {
        return req.then(
          function (r) { return (mySeq === reqSeq ? onOk : onErr) ? onOk(r) : onOk(r); },
          function (e) {
            if (mySeq !== reqSeq) return staleResponse().then(function (r) {
              return onOk ? onOk(r) : r;
            });
            if (onErr) return onErr(e);
            throw e;
          }
        );
      },
      catch: function (fn) {
        return wrapped.then(null, fn);
      },
      finally: function (fn) {
        return req.then(function (r) {
          if (mySeq === reqSeq) { unlock(); if (fn) fn(); }
          return r;
        }, function (e) {
          if (mySeq === reqSeq) { unlock(); if (fn) fn(); }
          throw e;
        });
      }
    };

    function unlock() {
      var b = document.querySelector('.btn-main');
      if (b && b.dataset.v441lock === '1') {
        b.disabled = false;
        b.removeAttribute('data-v441lock');
      }
    }

    return wrapped;
  };

  ['input', 'keyup', 'change'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      var t = e.target;
      if (!t) return;
      if (t.type === 'password' || t.type === 'email' ||
          /email|pass/i.test(t.id || '') || /email|pass/i.test(t.name || '')) clearErr();
    }, true);
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn-main')) clearErr();
  }, true);
})();
