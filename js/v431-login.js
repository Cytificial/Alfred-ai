/* v431: kill stale login responses + clear error on typing + tight div sync */
(function () {
  'use strict';
  if (window.__v431) return; window.__v431 = '1';

  /* === 1. Lock the Sign In button while login is in flight === */
  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    var isAuth = typeof url === 'string' && /\/api\/auth\/(login|register)/.test(url);

    if (isAuth) {
      // Clear old error immediately
      var errEl = document.getElementById('err') || document.querySelector('.err');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

      // Disable all Sign In buttons — prevent double-submit race
      var btns = document.querySelectorAll('.btn-main');
      btns.forEach(function (b) { b.disabled = true; b.setAttribute('data-v431-locked', '1'); });

      // Re-enable when the request settles
      var req = _fetch.call(this, url, opts);
      req.finally(function () {
        btns.forEach(function (b) {
          if (b.getAttribute('data-v431-locked') === '1') {
            b.disabled = false;
            b.removeAttribute('data-v431-locked');
          }
        });
      });
      return req;
    }
    return _fetch.call(this, url, opts);
  };

  /* === 2. Clear error the moment user types in password (div or input) === */
  function clearErr() {
    var errEl = document.getElementById('err') || document.querySelector('.err');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
  }

  ['input', 'keyup', 'keydown', 'change'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      var t = e.target;
      if (!t) return;
      var isPw = (t.type === 'password') ||
                 (t.classList && t.classList.contains('pw')) ||
                 (t.classList && t.classList.contains('pw-visible-div'));
      if (isPw) clearErr();
    }, true);
  });

  /* === 3. Tight sync of visible div → real input every 80ms === */
  setInterval(function () {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (!input) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      if (input.value !== v) input.value = v;
    });
  }, 80);

  /* === 4. Sync on any input event in the div (belt+suspenders) === */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('pw-visible-div')) {
      var wrap = t.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        var v = t.textContent || '';
        input.value = v;
        t.setAttribute('data-val', v);
      }
    }
  }, true);

  /* === 5. Also clear error when Sign In button is clicked === */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.btn-main');
    if (b) clearErr();
  }, true);
})();
