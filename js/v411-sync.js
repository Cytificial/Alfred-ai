/* v411-sync: minimal. Just header text. No layout, no module rewriting. */
(function () {
  'use strict';
  if (window.__v411) return; window.__v411 = '1';

  function apply(u) {
    if (!u || !u.plan) return;
    var label = u.plan === 'Free' ? 'Free Plan' : u.plan + ' Plan';
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge && badge.textContent !== label) badge.textContent = label;
    document.querySelectorAll('.model .m-tx b').forEach(function (el) {
      if (/^(Free|Pro|Ultra)$/i.test(el.textContent.trim())) el.textContent = u.plan;
    });
    if (u.name) {
      var n = document.getElementById('user-name');
      if (n) n.textContent = u.name;
    }
    try { localStorage.setItem('alfred_plan', JSON.stringify({ id: u.plan.toLowerCase(), name: u.plan })); } catch (e) {}
  }

  function sync() {
    fetch('http://localhost:8082/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok && j.user) apply(j.user); })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(sync, 400); });
  else setTimeout(sync, 400);
})();
