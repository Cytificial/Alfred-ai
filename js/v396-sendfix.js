/* v396-sendfix: prevent stuck streaming flag from blocking future sends */
(function () {
  'use strict';
  if (window.__v396sendfix) return; window.__v396sendfix = '1';

  var lastSendAt = 0;

  // Track every click on .send — remember the time
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.send');
    if (!b) return;
    lastSendAt = Date.now();
    // if the send button has the "stop" class for over 90s, force-reset
    setTimeout(function () {
      try {
        var btn = document.querySelector('.send');
        if (!btn) return;
        // if there are no dots and no proc card, streaming likely finished — safe to clear stop
        var anyDots = document.querySelector('.msg.ai .v129-dots');
        var anyProc = document.querySelector('.msg.ai .proc');
        if (!anyDots && !anyProc && btn.classList.contains('v130-stop')) {
          btn.classList.remove('v130-stop');
          console.log('[v396] force-cleared stuck v130-stop class');
        }
      } catch (err) {}
    }, 90000);
  }, true);

  // Watchdog: if any AI message has an empty bubble for > 90s, mark it as failed
  setInterval(function () {
    var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
    if (!msgs.length) return;
    var last = msgs[msgs.length - 1];
    var b = last.querySelector('.bubble');
    if (!b) return;
    var txt = (b.textContent || '').trim();
    var hasDots = !!last.querySelector('.v129-dots');
    var hasProc = !!last.querySelector('.proc');
    var hasCard = !!last.querySelector('.v390-card:not(.v390-complete)');
    if (txt.length || hasDots || hasProc || hasCard) {
      if (last._v396mark) last._v396mark = null;
      return;
    }
    // empty bubble, no indicators — start a timer
    if (!last._v396mark) {
      last._v396mark = Date.now();
      return;
    }
    if (Date.now() - last._v396mark > 60000) {
      // give up — show error and clear any stuck state
      b.textContent = 'Something went wrong — please try again.';
      b.style.whiteSpace = 'pre-wrap';
      try {
        var btn = document.querySelector('.send');
        if (btn) { btn.classList.remove('v130-stop'); btn.disabled = false; }
      } catch (e) {}
      console.log('[v396] watchdog fired — cleared stuck state');
      last._v396mark = null;
    }
  }, 4000);

  // Health check: every 30s, if nothing has been sent for a while, clear any stuck flag
  setInterval(function () {
    if (!lastSendAt) return;
    var elapsed = Date.now() - lastSendAt;
    if (elapsed < 120000) return; // only if 2 minutes since last send
    var btn = document.querySelector('.send');
    if (btn && btn.classList.contains('v130-stop')) {
      btn.classList.remove('v130-stop');
      btn.disabled = false;
      console.log('[v396] 2-min idle — force cleared stuck flag');
    }
  }, 30000);

  // Also expose a manual reset
  window.__v396reset = function () {
    try {
      var btn = document.querySelector('.send');
      if (btn) { btn.classList.remove('v130-stop'); btn.disabled = false; }
      document.querySelectorAll('.v129-dots').forEach(function (d) { d.remove(); });
      document.querySelectorAll('.msg.ai .proc').forEach(function (p) { p.remove(); });
      console.log('[v396] manual reset done');
    } catch (e) {}
  };
})();
