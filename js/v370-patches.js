/* v370L: type-flip reveal (required by Chrome) + dual class (keeps app.js happy) */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.eye');
    if (!b) return;
    var wrap = b.parentElement;
    if (!wrap) return;
    var input = wrap.querySelector('input.pw, input.pw-revealed');
    if (!input) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    var isPw = input.type === 'password';
    if (isPw) {
      input.type = 'text';
      input.classList.remove('pw');
      input.classList.add('pw-revealed');
      input.style.webkitTextSecurity = 'none';
      input.style.letterSpacing = 'normal';
      input.setAttribute('autocomplete', 'off');
    } else {
      input.type = 'password';
      input.classList.remove('pw-revealed');
      input.classList.add('pw');
      input.style.webkitTextSecurity = '';
      input.style.letterSpacing = '';
      input.setAttribute('autocomplete', 'current-password');
    }
    var v = input.value; input.value = ''; input.value = v;

    b.classList.toggle('on', isPw);
    b.setAttribute('aria-label', isPw ? 'Hide password' : 'Show password');
    try { input.focus(); var L = input.value.length; input.setSelectionRange(L, L); } catch (err) {}
    console.log('[v370L] ' + (isPw ? 'reveal' : 'hide') + ' type=' + input.type + ' cls=' + input.className);
  }, true);
})();
