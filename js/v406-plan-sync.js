/* v406: refresh plan from server + fix sidebar + CURRENT badge */
(function () {
  'use strict';
  if (window.__v406) return; window.__v406 = '1';

  function updateBadge(plan) {
    var label = plan === 'Free' ? 'Free Plan' : plan + ' Plan';
    document.querySelectorAll('.side-foot .pf-tx i').forEach(function (el) {
      if (el.textContent !== label) el.textContent = label;
    });
    // Top bar shows "Free" — update that too
    document.querySelectorAll('.model .m-tx b, .model .m-tx').forEach(function (el) {
      if (/^(Free|Pro|Ultra)( Plan)?$/.test(el.textContent.trim())) {
        el.textContent = label;
      }
    });
  }

  function updateCurrentBadge(plan) {
    // Modules page CURRENT badge — move to correct card
    var cards = document.querySelectorAll('.v405-plan-card, [data-plan]');
    cards.forEach(function (c) {
      var nameEl = c.querySelector('.v405-plan-name, b');
      var txt = nameEl ? nameEl.textContent.trim().split(' ')[0] : '';
      var isActive = txt === plan;
      c.classList.toggle('current', isActive);
      var badge = c.querySelector('.v405-current');
      if (isActive && !badge) {
        if (nameEl) nameEl.insertAdjacentHTML('beforeend', ' <span class="v405-current">CURRENT</span>');
      } else if (!isActive && badge) {
        badge.remove();
      }
    });
  }

  function syncPlan() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var u = (j && j.user) || {};
        var plan = u.plan || 'Free';
        var name = u.name || '';
        try {
          localStorage.setItem('alfred_plan', JSON.stringify({ id: plan.toLowerCase(), name: plan }));
          if (name) localStorage.setItem('alfred_name', name);
        } catch (e) {}
        updateBadge(plan);
        updateCurrentBadge(plan);
      })
      .catch(function () {
        // fallback to localStorage
        try {
          var p = JSON.parse(localStorage.getItem('alfred_plan') || '{"name":"Free"}');
          updateBadge(p.name || 'Free');
        } catch (e) {}
      });
  }

  // On boot
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(syncPlan, 900); });
  else setTimeout(syncPlan, 900);

  // Every 8s
  setInterval(syncPlan, 8000);

  // On nav to modules
  document.addEventListener('click', function (e) {
    var nav = e.target.closest && e.target.closest('.nav-item');
    if (nav) setTimeout(syncPlan, 400);
  }, true);
})();
