/* v397-stop: Stop generation button + Esc shortcut.
 * Pattern from gptme PR #1884 + assistant-ui.
 * Swaps Send icon to Stop square during streaming. Aborts via AbortController. */
(function () {
  'use strict';
  if (window.__v397stop) return; window.__v397stop = '1';

  var streaming = false;

  function sendBtn() {
    return document.querySelector('.composer .send');
  }

  function setStreaming(on) {
    streaming = !!on;
    var b = sendBtn();
    if (!b) return;
    b.classList.toggle('v397-stop', streaming);
    b.setAttribute('aria-label', streaming ? 'Stop generating' : 'Send message');
    // swap svg
    var svg = b.querySelector('svg');
    if (!svg) return;
    if (streaming) {
      b._v397orig = svg.innerHTML;
      svg.innerHTML = '<rect x="6" y="6" width="12" height="12" rx="1.5"/>';
    } else if (b._v397orig) {
      svg.innerHTML = b._v397orig;
      b._v397orig = null;
    }
  }

  // Track streaming state by watching for v129-dots / proc card
  setInterval(function () {
    var busy = !!document.querySelector('.msg.ai .v129-dots, .msg.ai .proc, .send.v130-stop');
    if (busy !== streaming) setStreaming(busy);
  }, 150);

  // Click on stop button → abort + flush
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.composer .send.v397-stop');
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // Try global abort
    try {
      if (window.__v130ctrl && typeof window.__v130ctrl.abort === 'function') {
        window.__v130ctrl.abort();
      }
    } catch (err) {}
    // Force cleanup of indicators
    document.querySelectorAll('.msg.ai .v129-dots').forEach(function (d) {
      var bub = d.closest('.bubble');
      if (bub && !bub.textContent.trim()) bub.textContent = '(stopped)';
      d.remove();
    });
    document.querySelectorAll('.msg.ai .proc').forEach(function (p) { p.remove(); });
    setStreaming(false);
  }, true);

  // Esc key → same as stop
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !streaming) return;
    var b = sendBtn();
    if (b) b.click();
  }, true);
})();
