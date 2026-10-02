/* v413-sync: ONE script, does ONE thing. Updates badge text. */
(function () {
  'use strict';
  if (window.__v413) return; window.__v413 = '1';

  function apply(u) {
    if (!u || !u.plan) return;
    var label = u.plan === 'Free' ? 'Free Plan' : u.plan + ' Plan';
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge) badge.textContent = label;
    document.querySelectorAll('.model .m-tx b').forEach(function (el) {
      if (/^(Free|Pro|Ultra)$/i.test(el.textContent.trim())) el.textContent = u.plan;
    });
    if (u.name) {
      var n = document.getElementById('user-name');
      if (n) n.textContent = u.name;
    }
  }

  setTimeout(function () {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok && j.user) apply(j.user); })
      .catch(function () {});
  }, 800);
})();
