/* v390-think: phase card — shows live thinking/search phases above AI reply */
(function () {
  'use strict';
  if (window.__v390think) return; window.__v390think = '1';

  var current = null; // {el, phases:[], startedAt}

  function newCard(aiMsgEl) {
    var card = document.createElement('div');
    card.className = 'v390-card';
    card.innerHTML =
      '<div class="v390-head" role="button" tabindex="0">' +
        '<span class="v390-icon"></span>' +
        '<span class="v390-title">Working on it</span>' +
        '<span class="v390-chev">▾</span>' +
      '</div>' +
      '<div class="v390-body"></div>';
    // Insert before the AI bubble
    var bubble = aiMsgEl.querySelector('.bubble');
    if (bubble) aiMsgEl.insertBefore(card, bubble);
    else aiMsgEl.appendChild(card);

    var head = card.querySelector('.v390-head');
    head.addEventListener('click', function () {
      card.classList.toggle('v390-open');
    });
    return card;
  }

  function addPhase(card, label, kind, extra) {
    var body = card.querySelector('.v390-body');
    var row = document.createElement('div');
    row.className = 'v390-phase v390-' + kind;
    var icon = kind === 'searching' ? '🔎' : kind === 'thinking' ? '🧠' :
               kind === 'answering' ? '✍️' : kind === 'routing' ? '💭' :
               kind === 'sources' ? '📚' : '·';
    row.innerHTML = '<span class="v390-pi">' + icon + '</span>' +
                    '<span class="v390-pl">' + label + '</span>' +
                    '<span class="v390-ps"></span>';
    body.appendChild(row);
    card.classList.add('v390-open');

    if (kind === 'sources' && extra && extra.list && extra.list.length) {
      var list = document.createElement('div');
      list.className = 'v390-sources';
      extra.list.forEach(function (u, i) {
        try {
          var host = new URL(u).hostname.replace(/^www\./, '');
          var a = document.createElement('a');
          a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.textContent = '[' + (i + 1) + '] ' + host;
          list.appendChild(a);
        } catch (e) {}
      });
      body.appendChild(list);
    }
    return row;
  }

  function complete(card) {
    card.querySelectorAll('.v390-phase').forEach(function (r) {
      var s = r.querySelector('.v390-ps');
      if (s && !s.textContent) s.textContent = '✓';
      r.classList.add('v390-done');
    });
    card.querySelector('.v390-title').textContent = 'Reasoning · tap to expand';
    setTimeout(function () { card.classList.remove('v390-open'); }, 600);
  }

  function attachToNewAIMessage() {
    // find latest AI message without a card yet
    var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
    for (var i = msgs.length - 1; i >= 0; i--) {
      var m = msgs[i];
      if (m.querySelector('.v390-card')) continue;
      if (m.querySelector('.v129-dots') || !m.querySelector('.bubble')) continue;
      return newCard(m);
    }
    return null;
  }

  var _v391Watchdog = null;
  function armWatchdog() {
    if (_v391Watchdog) clearTimeout(_v391Watchdog);
    _v391Watchdog = setTimeout(function () {
      if (current) {
        var body = current.querySelector('.v390-body');
        var err = document.createElement('div');
        err.className = 'v390-phase';
        err.innerHTML = '<span class="v390-pi">⚠️</span><span class="v390-pl">No response from engines — try again</span>';
        body.appendChild(err);
        complete(current);
        current = null;
      }
    }, 45000);
  }
  window.addEventListener('alfred:sse', function (e) {
    try { console.log('[v390 sse]', e.detail); } catch (er) {}
    var ev = e.detail || {};
    if (ev.phase) {
      armWatchdog();
      // hide old proc card
      document.querySelectorAll('.proc').forEach(function (p) { p.remove(); });
      document.querySelectorAll('.v129-dots').forEach(function (d) { d.remove(); });
      if (!current) current = attachToNewAIMessage();
      if (current) {
        var label = ev.label || ev.phase;
        if (ev.phase === 'sources' && ev.count) label = ev.label + ' (' + ev.count + ')';
        addPhase(current, label, ev.phase, ev);
      }
    }
    if (ev.think) {
      if (!current) current = attachToNewAIMessage();
      if (current) {
        var body = current.querySelector('.v390-body');
        var pre = document.createElement('pre');
        pre.className = 'v390-reason';
        pre.textContent = ev.think;
        body.appendChild(pre);
      }
    }
    if (typeof ev.t === 'string' && ev.t.length) {
      if (_v391Watchdog) { clearTimeout(_v391Watchdog); _v391Watchdog = null; }
      // answer is streaming — mark card complete on first token
      if (current && !current._done) {
        complete(current);
        current._done = true;
        current = null;
      }
    }
    if (ev.done) {
      if (_v391Watchdog) { clearTimeout(_v391Watchdog); _v391Watchdog = null; }
      if (current) { complete(current); current = null; }
    }
  });

  // Cleanup: if a new user message is sent, detach from previous card
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.send');
    if (b) { current = null; }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) current = null;
  }, true);
})();
