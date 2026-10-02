/* v408-sync: bulletproof plan display — runs on every relevant event */
(function () {
  'use strict';
  if (window.__v408) return; window.__v408 = '1';

  var last = null;

  function setText(sel, value) {
    var el = document.querySelector(sel);
    if (el && el.textContent.trim() !== value) el.textContent = value;
  }

  function applyUser(u) {
    if (!u || !u.plan) return;
    var plan = u.plan;
    var name = u.name || '';
    var sig = plan + '|' + name;
    if (sig === last) return;
    last = sig;

    try {
      localStorage.setItem('alfred_plan', JSON.stringify({ id: plan.toLowerCase(), name: plan }));
      if (name) localStorage.setItem('alfred_name', name);
    } catch (e) {}

    var label = plan === 'Free' ? 'Free Plan' : plan + ' Plan';

    // Sidebar footer
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge) badge.textContent = label;

    // Top bar (appears twice — mobile + desktop)
    document.querySelectorAll('.model .m-tx b').forEach(function (el) {
      if (/^(Free|Pro|Ultra)( Plan)?$/i.test(el.textContent.trim())) {
        el.textContent = plan;
      }
    });

    // User name
    if (name) setText('#user-name', name);

    // Modules page — CURRENT badge should be on the user's plan
    document.querySelectorAll('.mod-card, .plan-card, .v405-plan-card, [data-plan]').forEach(function (c) {
      var t = (c.querySelector('b, .plan-name') || {}).textContent || '';
      var planName = t.trim().split(/\s/)[0];
      if (['Free', 'Pro', 'Ultra'].indexOf(planName) > -1) {
        if (planName === plan) {
          c.classList.add('current');
        } else {
          c.classList.remove('current');
        }
      }
    });
  }

  function sync() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.user) applyUser(j.user);
      })
      .catch(function () {});
  }

  // Fire on every relevant moment
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
  setTimeout(sync, 500);
  setTimeout(sync, 1500);
  setTimeout(sync, 3000);

  // On nav clicks
  document.addEventListener('click', function (e) {
    var nav = e.target.closest && e.target.closest('.nav-item');
    if (nav) setTimeout(sync, 300);
  }, true);

  // When login succeeds (page might reload)
  window.addEventListener('storage', sync);
  window.__v408refresh = sync;
})();
