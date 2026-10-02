/* v428-eye: clone-replace on every toggle. Fresh element = Chrome can't cache the mask. */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.eye');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  var wrap = b.parentElement;
  var input = wrap && wrap.querySelector('input');
  if (!input) return;

  var wasShowing = b.classList.contains('on');

  // Build a FRESH input element — Chrome has zero memory of it
  var clone = document.createElement('input');
  clone.type = 'text';                              // always text; mask is pure CSS
  clone.className = input.className;
  clone.value = input.value;
  clone.placeholder = input.placeholder || '';
  clone.id = input.id || '';
  clone.name = input.name || '';
  clone.setAttribute('autocomplete', 'off');
  clone.setAttribute('autocorrect', 'off');
  clone.setAttribute('autocapitalize', 'off');
  clone.setAttribute('spellcheck', 'false');
  clone.setAttribute('data-pw', '1');

  if (wasShowing) {
    // going back to hidden
    clone.style.setProperty('-webkit-text-security', 'disc', 'important');
    clone.style.setProperty('text-security', 'disc', 'important');
  } else {
    // revealing
    clone.style.setProperty('-webkit-text-security', 'none', 'important');
    clone.style.setProperty('text-security', 'none', 'important');
  }

  input.parentNode.replaceChild(clone, input);
  b.classList.toggle('on', !wasShowing);

  setTimeout(function () {
    try {
      clone.focus();
      clone.setSelectionRange(clone.value.length, clone.value.length);
    } catch (err) {}
  }, 30);
}, true);

console.log('[v428-eye] clone-replace handler installed');
