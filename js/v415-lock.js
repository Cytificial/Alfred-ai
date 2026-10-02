/* v415-lock: keep Pro badge stable, ignore any app.js override */
(function () {
  'use strict';
  function lock() {
    document.querySelectorAll('.side-foot .pf-tx i').forEach(function (el) {
      if (el.textContent.trim() !== 'Pro Plan') el.textContent = 'Pro Plan';
    });
    document.querySelectorAll('.model .m-tx b').forEach(function (el) {
      var t = el.textContent.trim();
      if (/^(Free|Pro|Ultra)/i.test(t) && t !== 'Pro') el.textContent = 'Pro';
    });
  }
  [200, 800, 1500, 3000, 6000].forEach(function (t) { setTimeout(lock, t); });
  setInterval(lock, 3000);
})();
