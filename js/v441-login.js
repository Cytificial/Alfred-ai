/* v441-login: kill stale responses. Each login gets a seq number; only latest wins. */
(function () {
  'use strict';
  if (window.__v441) return; window.__v441 = '1';

  var reqSeq = 0;

  /* Wrap fetch for auth endpoints */
  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    var isAuth = typeof url === 'string' && /\/api\/auth\/(login|register)/.test(url);
    if (!isAuth) return _fetch.call(this, url, opts);

    reqSeq += 1;
    var mySeq = reqSeq;

    /* Clear error + disable button immediately */
    var errEl = document.getElementById('err') || document.querySelector('.err, .v158err');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    var btn = document.querySelector('.btn-main');
    if (btn) { btn.disabled = true; btn.dataset.v441lock = '1'; }

    var req = _fetch.call(this, url, opts);

    /* Override the response handler — if this isn't the latest request, ignore the result */
    var wrapped = {
      then: function (fn) {
        return new Promise(function (resolve) {
          req.then(function (r) {
            if (mySeq !== reqSeq) { resolve({ __stale: true }); return; }
            resolve(fn(r));
          }, function (e) {
            if (mySeq !== reqSeq) { resolve({ __stale: true }); return; }
            throw e;
          });
        });
      }
    };

    /* Unlock button only for latest request */
    req.finally(function () {
      if (mySeq === reqSeq) {
        var b = document.querySelector('.btn-main');
        if (b && b.dataset.v441lock === '1') {
          b.disabled = false;
          b.removeAttribute('data-v441lock');
        }
      }
    });

    return wrapped;
  };

  /* Clear stale error the moment user types */
  ['input', 'keyup', 'change'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      var t = e.target;
      if (!t) return;
      if (t.type === 'password' || t.type === 'email' || /email|pass/i.test(t.id || '') || /email|pass/i.test(t.name || '')) {
        var errEl = document.getElementById('err') || document.querySelector('.err, .v158err');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      }
    }, true);
  });

  /* Also clear on Sign In click */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn-main')) {
      var errEl = document.getElementById('err') || document.querySelector('.err, .v158err');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    }
  }, true);

  console.log('[v441-login] stale-response guard installed');
})();
