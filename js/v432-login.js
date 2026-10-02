/* v432: prevent double-submit + clear stale errors + absorb autofill popup taps */
(function () {
  'use strict';
  if (window.__v432) return; window.__v432 = '1';

  var pending = false;
  var lastFinish = 0;

  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    if (typeof url === 'string' && /\/api\/auth\/(login|register)/.test(url)) {
      pending = true;
      // clear old error immediately
      var errEl = document.getElementById('err') || document.querySelector('.err');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      var btn = document.querySelector('.btn-main');
      if (btn) { btn.disabled = true; btn.dataset.v432lock = '1'; }

      var req = _fetch.call(this, url, opts);
      var finish = function () {
        pending = false;
        lastFinish = Date.now();
        var b = document.querySelector('.btn-main');
        if (b && b.dataset.v432lock === '1') {
          b.disabled = false;
          b.removeAttribute('data-v432lock');
        }
      };
      req.then(finish, finish);
      return req;
    }
    return _fetch.call(this, url, opts);
  };

  // 4) Block clicks if a request is in flight OR was just resolved (<400ms ago)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.btn-main');
    if (!btn) return;
    if (pending || (Date.now() - lastFinish) < 400) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);

  // 5) Clear error on any typing in email/password
  ['input', 'keyup', 'keydown', 'change'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      var t = e.target;
      if (!t) return;
      var isCred = (t.type === 'email') || (t.type === 'password') ||
                   (t.classList && t.classList.contains('pw')) ||
                   (t.classList && t.classList.contains('pw-visible-div'));
      if (isCred) {
        var errEl = document.getElementById('err') || document.querySelector('.err');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      }
    }, true);
  });

  console.log('[v432] login lock + autofill absorb installed');
})();
