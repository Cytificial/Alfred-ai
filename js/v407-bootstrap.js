/* v407-bootstrap: refresh plan + name from server on every page load */
(function () {
  'use strict';
  if (window.__v407) return; window.__v407 = '1';

  function applyUser(u) {
    if (!u) return;
    var plan = u.plan || 'Free';
    var name = u.name || '';
    try {
      localStorage.setItem('alfred_plan', JSON.stringify({ id: plan.toLowerCase(), name: plan }));
      if (name) localStorage.setItem('alfred_name', name);
      localStorage.setItem('alfred_authed', '1');
    } catch (e) {}

    // Sidebar footer badge
    var label = plan === 'Free' ? 'Free Plan' : plan + ' Plan';
    document.querySelectorAll('.side-foot .pf-tx i, #user-plan-label').forEach(function (el) {
      el.textContent = label;
    });

    // Top bar model label
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
  }

  function refresh() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.user) applyUser(j.user);
      })
      .catch(function () {});
  }

  // Run immediately + on interval
  refresh();
  setInterval(refresh, 10000);

  // Expose for manual call
  window.__v407refresh = refresh;
})();
