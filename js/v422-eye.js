/* v422-eye: bulletproof eye toggle. Handles pointer, touch, click events. */
window.__eyeTap = function (event, btn) {
  if (window.__eyeLock) return false;  // prevent double-fire from pointer+touch+click
  window.__eyeLock = true;
  setTimeout(function () { window.__eyeLock = false; }, 250);

  try {
    if (event) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    // Visual feedback
    btn.style.background = 'rgba(127,196,255,0.15)';
    setTimeout(function () { btn.style.background = 'transparent'; }, 150);

    // Find input — try multiple lookups
    var input = null;
    var wrap = btn.parentElement;
    if (wrap) input = wrap.querySelector('input');
    if (!input) {
      // Fallback: look in the same .fld container
      var fld = btn.closest('.fld');
      if (fld) input = fld.querySelector('input');
    }
    if (!input) { alert('v422: no input'); return false; }

    var showing = input.getAttribute('data-shown') === '1';
    var newType = showing ? 'password' : 'text';

    // Clone-replace to bypass Chrome's cached password mask
    var clone = document.createElement('input');
    clone.type = newType;
    clone.className = input.className;
    clone.value = input.value;
    clone.placeholder = input.placeholder || '';
    clone.id = input.id || '';
    clone.name = input.name || '';
    clone.autocomplete = input.autocomplete || '';
    clone.style.cssText = input.style.cssText;
    clone.setAttribute('data-shown', showing ? '0' : '1');
    if (!showing) {
      clone.style.setProperty('-webkit-text-security', 'none', 'important');
      clone.style.setProperty('text-security', 'none', 'important');
      clone.classList.add('pw-revealed');
    } else {
      clone.classList.remove('pw-revealed');
    }
    input.parentNode.replaceChild(clone, input);
    btn.classList.toggle('on', !showing);

    setTimeout(function () {
      try {
        clone.focus();
        clone.setSelectionRange(clone.value.length, clone.value.length);
      } catch (e) {}
    }, 30);

    return false;
  } catch (err) {
    alert('v422 ERROR: ' + err.message);
    return false;
  }
};
console.log('[v422-eye] v2 handler installed');
