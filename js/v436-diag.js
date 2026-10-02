/* v436: super-fast sync + diagnostic on Sign In click */
(function () {
  'use strict';
  if (window.__v436) return; window.__v436 = '1';

  /* Aggressive sync — 50 times per second */
  setInterval(function () {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var inp = vis._v435input;
      if (!inp || !document.body.contains(inp)) {
        inp = document.querySelector('#login-form input.pw') ||
              document.querySelector('#register-form input.pw') ||
              document.querySelector('input.pw');
        vis._v435input = inp;
      }
      if (!inp) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      inp.value = v;
    });
  }, 20);

  /* Show what app.js sees when you tap Sign In */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.btn-main');
    if (!btn) return;
    var form = btn.closest('form');
    if (!form) return;
    var pw = form.querySelector('input.pw');
    var div = document.querySelector('.pw-visible-div');
    var lines = [];
    lines.push('form id: ' + (form.id || '(none)'));
    lines.push('input.pw value: "' + (pw ? pw.value : 'NOT FOUND') + '"');
    lines.push('input type: ' + (pw ? pw.type : '-'));
    lines.push('input display: ' + (pw ? getComputedStyle(pw).display : '-'));
    lines.push('input opacity: ' + (pw ? getComputedStyle(pw).opacity : '-'));
    lines.push('div exists: ' + !!div);
    if (div) lines.push('div data-val: "' + (div.getAttribute('data-val') || div.textContent) + '"');
    alert(lines.join('\n'));
  }, true);
})();
