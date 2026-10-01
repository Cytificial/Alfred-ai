/* v392c-think: phase card with proper completion state */
(function () {
  'use strict';
  if (window.__v392think) return; window.__v392think = '1';

  var current = null;

  function newCard(aiMsg) {
    var card = document.createElement('div');
    card.className = 'v390-card v390-open';
    card.innerHTML =
      '<div class="v390-head">' +
        '<span class="v390-icon"></span>' +
        '<span class="v390-title">Working on it…</span>' +
        '<span class="v390-chev">▾</span>' +
      '</div>' +
      '<div class="v390-body"></div>';
    var bubble = aiMsg.querySelector('.bubble');
    if (bubble) aiMsg.insertBefore(card, bubble); else aiMsg.appendChild(card);
    card.querySelector('.v390-head').addEventListener('click', function () {
      card.classList.toggle('v390-open');
    });
    return card;
  }

  function addPhase(card, label, icon) {
    var body = card.querySelector('.v390-body');
    var row = document.createElement('div');
    row.className = 'v390-phase';
    row.innerHTML = '<span class="v390-pi">' + (icon || '·') + '</span>' +
                    '<span class="v390-pl">' + label + '</span>' +
                    '<span class="v390-ps"></span>';
    body.appendChild(row);
    return row;
  }

  function completeRow(row) {
    var s = row && row.querySelector('.v390-ps');
    if (s && !s.textContent) s.textContent = '✓';
    if (row) row.classList.add('v390-done');
  }

  function completeCard(card) {
    if (!card || card._v392done) return;
    card._v392done = true;
    card.querySelectorAll('.v390-phase').forEach(completeRow);
    card.classList.add('v390-complete');   // stops the pulse animation
    card.querySelector('.v390-title').textContent = 'Reasoning · tap to expand';
    setTimeout(function () { card.classList.remove('v390-open'); }, 700);
  }

  function beginThinking(aiMsg) {
    if (current && current.el === aiMsg) return;
    if (current && current.el !== aiMsg) { try { current.done(); } catch (e) {} current = null; }
    if (aiMsg.querySelector('.v390-card')) return;

    var card = newCard(aiMsg);
    var bubble = aiMsg.querySelector('.bubble');
    if (bubble && !bubble.textContent.trim()) bubble.classList.add('v392-hidden');

    var row1 = addPhase(card, 'Understanding your question', '💭');
    var row2 = null, row3 = null;

    var t1 = setTimeout(function () {
      if (card._v392done) return;
      completeRow(row1);
      row2 = addPhase(card, 'Searching & thinking', '🔎');
    }, 1500);

    var t2 = setTimeout(function () {
      if (card._v392done) return;
      completeRow(row1); completeRow(row2);
      row3 = addPhase(card, 'Writing the answer', '✍️');
    }, 4000);

    current = {
      el: aiMsg,
      card: card,
      done: function () {
        clearTimeout(t1); clearTimeout(t2);
        completeRow(row1); completeRow(row2); completeRow(row3);
        completeCard(card);
        if (bubble && bubble.textContent.trim()) bubble.classList.remove('v392-hidden');
        current = null;
      }
    };
    setTimeout(function () { if (current && current.el === aiMsg) current.done(); }, 60000);
  }

  function detectCompletion() {
    if (!current) return;
    var b = current.el.querySelector('.bubble');
    if (!b) return;
    var txt = (b.textContent || '').trim();
    var stillLoading = !!current.el.querySelector('.v129-dots');
    // Also treat "has text + card complete timer expired" as done
    if (txt.length > 0 && !stillLoading) {
      current.done();
    }
  }

  function scan() {
    var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
    if (!msgs.length) return;
    var latest = msgs[msgs.length - 1];
    if (latest.querySelector('.v390-card')) { detectCompletion(); return; }
    if (latest.querySelector('.bubble')) beginThinking(latest);
  }

  setInterval(scan, 120);

  try {
    var root = document.querySelector('.views') || document.body;
    new MutationObserver(function () {
      var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
      if (!msgs.length) return;
      var latest = msgs[msgs.length - 1];
      if (!latest.querySelector('.v390-card') && latest.querySelector('.bubble')) {
        beginThinking(latest);
      }
    }).observe(root, { childList: true, subtree: true });
  } catch (e) {}
})();
