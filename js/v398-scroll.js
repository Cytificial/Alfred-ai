/* v398-scroll: Auto-scroll that respects user scroll-up.
 * Pattern from prompt-kit/chat-container.
 * Threshold 60px. Uses RAF for smooth scrolling. */
(function () {
  'use strict';
  if (window.__v398scroll) return; window.__v398scroll = '1';

  var pinned = true;
  var SCROLL_THRESHOLD = 60;
  var scrollEl = null;
  var btn = null;

  function findScroll() {
    // Find the actual scrollable container holding messages
    var candidates = [
      document.getElementById('chat-scroll'),
      document.querySelector('.chat-scroll'),
      document.querySelector('.views .view.show')
    ];
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el && el.scrollHeight > el.clientHeight + 20) return el;
    }
    return candidates.find(function (e) { return !!e; }) || null;
  }

  function distanceFromBottom(el) {
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  }

  function createBtn() {
    if (btn) return btn;
    btn = document.createElement('button');
    btn.className = 'v398-scroll-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to bottom');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
    btn.addEventListener('click', function () {
      pinned = true;
      scrollToBottom(true);
      btn.classList.remove('show');
    });
    var view = document.querySelector('#view-chat');
    if (view) view.appendChild(btn);
    return btn;
  }

  function scrollToBottom(smooth) {
    if (!scrollEl) scrollEl = findScroll();
    if (!scrollEl) return;
    try {
      if (smooth) scrollEl.scrollTo({ top: 9e9, behavior: 'smooth' });
      else scrollEl.scrollTop = scrollEl.scrollHeight;
    } catch (e) { scrollEl.scrollTop = scrollEl.scrollHeight; }
  }

  function onScroll() {
    if (!scrollEl) scrollEl = findScroll();
    if (!scrollEl) return;
    var gap = distanceFromBottom(scrollEl);
    pinned = gap < SCROLL_THRESHOLD;
    var b = createBtn();
    if (gap > 200) b.classList.add('show');
    else b.classList.remove('show');
  }

  // Wrap scrollBottom globally so existing code uses our logic
  window.__v398scrollTo = scrollToBottom;

  // Patch MutationObserver — when new content appears, scroll if pinned
  setInterval(function () {
    var el = findScroll();
    if (el !== scrollEl) {
      if (scrollEl) scrollEl.removeEventListener('scroll', onScroll, { passive: true });
      scrollEl = el;
      if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true });
    }
    if (pinned && scrollEl) {
      var gap = distanceFromBottom(scrollEl);
      if (gap > 200) scrollToBottom(true);
    }
  }, 100);

  // RAF-throttled initial hookup
  function hookRAF() {
    if (!scrollEl) scrollEl = findScroll();
    if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookRAF);
  else hookRAF();
  setTimeout(hookRAF, 800);
  setTimeout(hookRAF, 2000);
})();
