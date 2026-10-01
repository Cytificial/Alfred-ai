/* v402-search: conversation search in History view */
(function () {
  'use strict';
  if (window.__v402search) return; window.__v402search = '1';

  function ensureUI() {
    var view = document.getElementById('view-history');
    if (!view || view.querySelector('.v402-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'v402-wrap';
    wrap.innerHTML =
      '<div class="v402-head"><h2>🕘 History</h2>' +
      '<input type="search" placeholder="Search your conversations..." class="v402-search"/></div>' +
      '<div class="v402-results"></div>';
    view.appendChild(wrap);
    var inp = wrap.querySelector('.v402-search');
    var out = wrap.querySelector('.v402-results');
    var t = null;
    inp.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { doSearch(inp.value, out); }, 250);
    });
  }

  function doSearch(q, out) {
    if (!q || q.length < 2) { out.innerHTML = ''; return; }
    out.innerHTML = '<div class="v402-loading">Searching…</div>';
    fetch('http://localhost:8082/api/chats/search?q=' + encodeURIComponent(q), { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var rows = (j && j.results) || [];
        if (!rows.length) { out.innerHTML = '<div class="v402-empty">No matches.</div>'; return; }
        out.innerHTML = rows.map(function (r) {
          var when = new Date((r.updated || 0) * 1000).toLocaleDateString();
          return '<button class="v402-item" data-id="' + r.id + '">' +
            '<b>' + (r.title || 'Chat') + '</b>' +
            '<i>' + when + '</i>' +
            '<span>' + (r.preview || '') + '</span>' +
          '</button>';
        }).join('');
        out.querySelectorAll('.v402-item').forEach(function (btn) {
          btn.onclick = function () {
            window.__v129chat = parseInt(btn.getAttribute('data-id'), 10);
            var navChat = document.querySelector('.nav-item[data-view="chat"]');
            if (navChat) navChat.click();
          };
        });
      })
      .catch(function () { out.innerHTML = '<div class="v402-empty">Search failed.</div>'; });
  }

  document.addEventListener('click', function (e) {
    var nav = e.target.closest && e.target.closest('.nav-item[data-view="history"]');
    if (!nav) return;
    setTimeout(ensureUI, 100);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(ensureUI, 1500); });
  else setTimeout(ensureUI, 1500);
})();
