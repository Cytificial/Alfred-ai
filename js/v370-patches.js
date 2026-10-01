/* v370b-patches: password eye toggle — bulletproof
 * Runs in capture phase, stops app.js interference, re-applies on reset. */
(function () {
  'use strict';

  function findInput(btn) {
    // Walk up from the button looking for a container that has an <input>
    var n = btn.parentElement;
    for (var i = 0; i < 5 && n; i++) {
      var inp = n.querySelector('input');
      if (inp) return inp;
      n = n.parentElement;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.eye');
    if (!b) return;

    var input = findInput(b);
    if (!input) {
      console.warn('[v370b] eye clicked, no input found near', b);
      return;
    }

    // Block any other handlers (app.js) from stealing the click.
    e.preventDefault();
    e.stopImmediatePropagation();

    var wasHidden = (input.type === 'password');
    var nextType = wasHidden ? 'text' : 'password';
    input.type = nextType;
    b.classList.toggle('on', wasHidden);
    b.setAttribute('aria-label', wasHidden ? 'Hide password' : 'Show password');

    if(window.__v370log)window.__v370log("click inp="+input.id+" was="+(wasHidden?"pw":"txt")+" now="+input.type);

    // Re-apply twice in case app.js flips it back.
    function reapply() { if (input.type !== nextType) { input.type = nextType; } }
    setTimeout(reapply, 0);
    setTimeout(reapply, 60);
  }, true);

  // Also intercept pointerdown/touchstart so mobile fires our handler first.
  ['pointerdown', 'touchstart'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      var b = e.target && e.target.closest && e.target.closest('.eye');
      if (!b) return;
      // Don't do the toggle here — just make sure the click event isn't consumed.
      e.stopPropagation();
    }, true);
  });
})();
