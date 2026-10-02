/* v410-sync: update header + plan badge from /api/auth/me. Nothing else. */
(function () {
  'use strict';
  if (window.__v410) return; window.__v410 = '1';

  var lastPlan = null;

  function apply(plan, name) {
    if (!plan || plan === lastPlan) return;
    lastPlan = plan;

    var label = plan === 'Free' ? 'Free Plan' : plan + ' Plan';

    // Sidebar footer badge
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge) badge.textContent = label;

    // Top bar label — only if it currently says Free/Pro/Ultra
    document.querySelectorAll('.model .m-tx b').forEach(function (el) {
      if (/^(Free|Pro|Ultra)$/i.test(el.textContent.trim())) {
        el.textContent = plan;
      }
    });

    // User name
    if (name) {
      var nameEl = document.getElementById('user-name');
      if (nameEl) nameEl.textContent = name;
    }

    // Modules page — CURRENT badge
    document.querySelectorAll('.v410-plan').forEach(function (c) {
      var p = c.getAttribute('data-plan');
      c.classList.toggle('current', p === plan);
    });

    try {
      localStorage.setItem('alfred_plan', JSON.stringify({ id: plan.toLowerCase(), name: plan }));
      if (name) localStorage.setItem('alfred_name', name);
    } catch (e) {}
  }

  function sync() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.user) apply(j.user.plan || 'Free', j.user.name || '');
      })
      .catch(function () {});
  }

  // Run once when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(sync, 600); });
  } else {
    setTimeout(sync, 600);
  }

  // Re-sync on nav to modules
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('.nav-item[data-view="modules"]');
    if (n) setTimeout(sync, 400);
  }, true);
})();
