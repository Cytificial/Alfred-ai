/* v404-agentic: effort toggle, council display in thinking card, engine submenu */
(function () {
  'use strict';
  if (window.__v404) return; window.__v404 = '1';

  var EFFORTS = [
    { id: 'fast',     icon: '⚡', label: 'Fast' },
    { id: 'balanced', icon: '⚖️', label: 'Balanced' },
    { id: 'deep',     icon: '🧠', label: 'Deep' },
  ];
  var state = { effort: 'balanced' };

  /* ---- 1. Effort toggle above composer ---- */
  function buildToggle() {
    var c = document.querySelector('.composer');
    if (!c || document.querySelector('.v404-toggle')) return;
    var wrap = document.createElement('div');
    wrap.className = 'v404-toggle';
    wrap.innerHTML = EFFORTS.map(function (e) {
      return '<button type="button" class="v404-eff' + (e.id === state.effort ? ' on' : '') + '" data-id="' + e.id + '">' +
             '<span class="v404-ef-i">' + e.icon + '</span>' +
             '<span class="v404-ef-l">' + e.label + '</span>' +
             '</button>';
    }).join('');
    c.parentNode.insertBefore(wrap, c);
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.v404-eff');
      if (!b) return;
      e.preventDefault();
      state.effort = b.getAttribute('data-id');
      wrap.querySelectorAll('.v404-eff').forEach(function (x) {
        x.classList.toggle('on', x === b);
      });
    });
  }

  /* ---- 2. Inject effort+engine into every chat send ---- */
  (function () {
    var _origFetch = window.fetch;
    window.fetch = function (url, opts) {
      try {
        if (typeof url === 'string' && url.indexOf('/api/chat/stream') > -1 && opts && opts.body) {
          var b = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
          if (!b.effort) b.effort = state.effort;
          if (!b.engine) b.engine = window.__v404engine || '';
          opts = Object.assign({}, opts, { body: JSON.stringify(b) });
        }
      } catch (e) {}
      return _origFetch.call(this, url, opts);
    };
  })();

  /* ---- 3. Listen for SSE events ---- */
  window.addEventListener('alfred:sse', function (e) {
    var ev = e.detail || {};

    // Council phase — show progress in thinking card
    if (ev.phase === 'council') {
      var card = findLiveCard();
      if (card) {
        var body = card.querySelector('.v390-body');
        if (body && !body.querySelector('.v404-council')) {
          var row = document.createElement('div');
          row.className = 'v404-council';
          var n = ev.count || 2;
          row.innerHTML = '<span class="v390-pi">🤝</span>' +
                          '<span class="v390-pl">Gathering perspectives</span>' +
                          '<span class="v404-dots">' +
                          Array.from({length:n}).map(function(){return '<i></i>';}).join('') +
                          '</span>';
          body.appendChild(row);
        }
      }
    }

    // Council result — mark a mind as ready
    if (typeof ev.council_result === 'number') {
      var card2 = findLiveCard();
      var dots = card2 && card2.querySelectorAll('.v404-dots i');
      if (dots && dots[ev.council_result]) {
        dots[ev.council_result].classList.add(ev.ok ? 'ok' : 'fail');
      }
    }

    // Streaming reasoning chunks
    if (ev.think_start) {
      var c3 = findLiveCard();
      if (c3) {
        var b3 = c3.querySelector('.v390-body');
        if (b3 && !b3.querySelector('.v404-reason')) {
          var pre = document.createElement('pre');
          pre.className = 'v404-reason';
          b3.appendChild(pre);
          c3.classList.add('v390-open');
        }
      }
    }
    if (typeof ev.think === 'string') {
      var c4 = findLiveCard();
      var pre2 = c4 && c4.querySelector('.v404-reason');
      if (pre2) {
        pre2.textContent += ev.think;
        pre2.scrollTop = pre2.scrollHeight;
      }
    }
    if (ev.think_end) {
      var c5 = findLiveCard();
      if (c5) { c5.classList.add('v390-open'); }
    }
  });

  function findLiveCard() {
    var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
    for (var i = msgs.length - 1; i >= 0; i--) {
      var c = msgs[i].querySelector('.v390-card');
      if (c && !c.classList.contains('v390-complete')) return c;
    }
    // fallback: last card even if complete
    if (msgs.length) {
      var m = msgs[msgs.length - 1];
      return m.querySelector('.v390-card');
    }
    return null;
  }

  /* ---- 4. Engine submenu on long-press Retry ---- */
  async function loadEngines() {
    try {
      var r = await fetch('http://localhost:8082/api/engines', { credentials: 'include' });
      var j = await r.json();
      return (j && j.engines) || [];
    } catch (e) { return []; }
  }

  // Listen for our custom menu creation (v380-actions). When it builds the
  // Regenerate option for AI messages, append an "Engines" section.
  document.addEventListener('click', function (e) {
    var menuItem = e.target.closest && e.target.closest('.v380-menu-item');
    if (!menuItem) return;
  }, true);

  // Simpler: watch for menu open, add engine chooser if AI message
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (!n.classList || !n.classList.contains('v380-menu')) return;
        decorateMenu(n);
      });
    });
  }).observe(document.body, { childList: true });

  async function decorateMenu(menu) {
    if (menu.querySelector('.v404-engine-sec')) return;
    var engines = await loadEngines();
    if (!engines.length) return;
    var cur = window.__v404engine || '';
    var sec = document.createElement('div');
    sec.className = 'v404-engine-sec';
    sec.innerHTML = '<div class="v404-engine-h">Ask another mind</div>' +
                    engines.map(function (en) {
                      return '<button type="button" class="v404-engine" data-id="' + en.id + '"' +
                             (en.id === cur ? ' class="on"' : '') + '>' +
                             '<b>' + en.label + '</b>' +
                             '<i>' + en.desc + '</i>' +
                             '</button>';
                    }).join('');
    menu.appendChild(sec);
    sec.addEventListener('click', function (e) {
      var b = e.target.closest('.v404-engine');
      if (!b) return;
      e.preventDefault(); e.stopPropagation();
      var id = b.getAttribute('data-id');
      window.__v404engine = id;
      // close menu
      var m = b.closest('.v380-menu');
      if (m) m.remove();
      // find last user message text and resend with chosen engine
      var lastUser = null;
      var msgs = document.querySelectorAll('.msg.user, .msg.me');
      if (msgs.length) lastUser = msgs[msgs.length - 1].querySelector('.bubble');
      if (lastUser) {
        var inp = document.querySelector('#msg-input, .composer input:not([type=file]), .composer textarea');
        if (inp) {
          inp.value = lastUser.textContent || '';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(function () {
            var send = document.querySelector('.composer .send');
            if (send) send.click();
          }, 100);
        }
      }
    });
  }

  /* ---- 5. Boot ---- */
  function boot() { buildToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 900); });
  else setTimeout(boot, 900);
  setTimeout(boot, 2500);
})();
