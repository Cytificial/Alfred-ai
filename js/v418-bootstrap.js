/* v418: set Pro in localStorage BEFORE app.js reads it, then verify from /api/auth/me */
(function () {
  'use strict';
  // Pre-seed from current user — first try localStorage, fallback to Pro
  try {
    var existing = JSON.parse(localStorage.getItem('alfred_plan') || '{}');
    if (!existing || existing.id !== 'pro') {
      localStorage.setItem('alfred_plan', JSON.stringify({ id: 'pro', name: 'Pro' }));
      console.log('[v418] seeded plan=Pro in localStorage');
    }
    if (!localStorage.getItem('alfred_name')) {
      localStorage.setItem('alfred_name', 'Fred');
    }
  } catch (e) {}

  // On DOM ready, sync from server (in case real plan differs)
  function sync() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.user && j.user.plan) {
          try {
            localStorage.setItem('alfred_plan', JSON.stringify({ id: j.user.plan.toLowerCase(), name: j.user.plan }));
            if (j.user.name) localStorage.setItem('alfred_name', j.user.name);
          } catch (e) {}
          // update header + badge immediately
          var label = j.user.plan === 'Free' ? 'Free Plan' : j.user.plan + ' Plan';
          var badge = document.querySelector('.side-foot .pf-tx i');
          if (badge) badge.textContent = label;
          document.querySelectorAll('.model .m-tx b').forEach(function (el) {
            if (/^(Free|Pro|Ultra)( Plan)?$/i.test(el.textContent.trim())) el.textContent = j.user.plan;
          });
          if (j.user.name) {
            var n = document.getElementById('user-name');
            if (n) n.textContent = j.user.name;
          }
        }
      }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(sync, 500); });
  else setTimeout(sync, 500);
  setTimeout(sync, 2000);
  setTimeout(sync, 5000);
})();
