/* v405-plan: dynamic Modules page + sidebar badge + tier awareness */
(function () {
  'use strict';
  if (window.__v405plan) return; window.__v405plan = '1';

  var CACHE = null;

  function getPlan() {
    try {
      var p = JSON.parse(localStorage.getItem('alfred_plan') || '{"id":"free","name":"Free"}');
      return p.name || 'Free';
    } catch (e) { return 'Free'; }
  }

  function getName() {
    try { return localStorage.getItem('alfred_name') || ''; } catch (e) { return ''; }
  }

  /* ---- 1. Sidebar badge — show real plan ---- */
  function fixSidebar() {
    var plan = getPlan();
    // .pf-tx i is the "Free Plan" text
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge) {
      var label = plan === 'Free' ? 'Free Plan' : plan + ' Plan';
      if (badge.textContent !== label) badge.textContent = label;
    }
    var nameEl = document.getElementById('user-name');
    var nm = getName();
    if (nameEl && nm && nameEl.textContent !== nm) nameEl.textContent = nm;
  }

  /* ---- 2. Dynamic Modules page ---- */
  function chipHTML(c) {
    var isExtra = !!c.extra;
    return '<span class="v405-chip' + (isExtra ? ' extra' : '') + '">' +
      '<i class="v405-dot"></i>' + esc(c.label) + '</span>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  function renderModules(plans) {
    var view = document.getElementById('view-modules');
    if (!view) return;
    var grid = view.querySelector('.mods-inner') || view;

    // Find any existing hardcoded free/pro/ultra block and replace it
    // We rewrite the entire .mods-body area with our dynamic version
    var body = view.querySelector('.mods-body');
    if (!body) {
      // create a skeleton
      view.innerHTML =
        '<div class="mods-scroll"><div class="mods-inner">' +
        '<div class="mods-head"><div><h2>AI Modules</h2>' +
        '<p>Powerful tools to enhance your experience</p></div></div>' +
        '<div class="mods-body"></div></div></div>';
      body = view.querySelector('.mods-body');
    }

    // Replace the module grid area with plan cards
    var html = '<div class="v405-plans"><div class="v405-title">ALFRED\'S POWER LEVELS</div>';
    ['Free', 'Pro', 'Ultra'].forEach(function (plan) {
      var data = plans[plan] || {};
      var chips = data.chips || [];
      var active = plan === getPlan();
      html +=
        '<div class="v405-plan-card' + (active ? ' current' : '') + '">' +
          '<div class="v405-plan-head">' +
            '<span class="v405-plan-badge ' + plan.toLowerCase() + '">A</span>' +
            '<div class="v405-plan-tx">' +
              '<div class="v405-plan-name">' + plan +
                (active ? ' <span class="v405-current">CURRENT</span>' : '') +
              '</div>' +
              '<div class="v405-plan-sub">' + esc(data.headline || '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="v405-chips">' +
            chips.map(chipHTML).join('') +
          '</div>' +
        '</div>';
    });
    html += '</div>';

    // Find the old grid (.mod-grid) and replace it, keeping the package column
    var oldGrid = body.querySelector('.mod-grid');
    if (oldGrid) {
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      oldGrid.parentNode.replaceChild(wrap.firstChild, oldGrid);
    } else {
      body.insertAdjacentHTML('afterbegin', html);
    }
  }

  function load() {
    if (CACHE) { renderModules(CACHE); fixSidebar(); return; }
    fetch('http://localhost:8082/api/plan-display')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.plans) {
          CACHE = j.plans;
          renderModules(CACHE);
          fixSidebar();
        }
      })
      .catch(function (e) { console.warn('[v405] plan-display failed', e); });
  }

  /* ---- 3. Re-render on nav clicks ---- */
  document.addEventListener('click', function (e) {
    var nav = e.target.closest && e.target.closest('.nav-item[data-view="modules"]');
    if (nav) setTimeout(load, 60);
  }, true);

  /* ---- 4. Watch for plan change (login response updates localStorage) ---- */
  var lastPlan = getPlan();
  setInterval(function () {
    var p = getPlan();
    if (p !== lastPlan) {
      lastPlan = p;
      fixSidebar();
      if (CACHE) renderModules(CACHE);
    }
  }, 2000);

  /* ---- 5. Boot ---- */
  function boot() {
    fixSidebar();
    // Slight delay so app.js has finished rendering the modules grid
    setTimeout(load, 1500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 800); });
  } else {
    setTimeout(boot, 800);
  }
})();
