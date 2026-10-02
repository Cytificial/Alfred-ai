/* v439-eye: overlay stops before eye icon + trim trailing newlines + clean toggle. */
(function () {
  'use strict';
  if (window.__v439) return; window.__v439 = '1';

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.eye');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var wrap = b.parentElement;
    if (!wrap) return;
    var realInput = wrap.querySelector('input.pw');
    if (!realInput) return;

    var existing = wrap._v439div;

    /* === HIDE === */
    if (existing && document.body.contains(existing)) {
      var finalVal = existing.getAttribute('data-val') || '';
      realInput.value = finalVal;
      realInput.style.opacity = '';
      realInput.style.pointerEvents = '';
      existing.remove();
      wrap._v439div = null;
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var cs = getComputedStyle(realInput);
    var parent = realInput.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    var d = document.createElement('div');
    d.className = 'pw-visible-div';
    d.setAttribute('contenteditable', 'true');
    d.setAttribute('autocorrect', 'off');
    d.setAttribute('autocapitalize', 'off');
    d.setAttribute('spellcheck', 'false');
    /* store initial value in data-val only */
    d.setAttribute('data-val', realInput.value);
    d.textContent = realInput.value;

    /* CRITICAL: right:44px — stop before the eye icon so eye stays tappable */
    d.style.cssText = [
      'position:absolute',
      'left:0','top:0','right:44px','bottom:0',
      'box-sizing:border-box',
      'padding:' + cs.padding,
      'margin:0',
      'border:0',
      'background:transparent',
      'color:' + cs.color,
      'font:' + cs.font,
      'line-height:' + cs.lineHeight,
      'outline:none',
      'caret-color:#7fc4ff',
      'white-space:pre-wrap',
      'word-break:break-all',
      'overflow:hidden',
      'z-index:4',
      'display:flex',
      'align-items:center',
      'cursor:text'
    ].join(';');

    parent.insertBefore(d, realInput.nextSibling);
    wrap._v439div = d;
    d._v439input = realInput;

    realInput.style.opacity = '0';
    realInput.style.pointerEvents = 'none';

    /* Sync via data-val only — never trust innerText */
    function sync() {
      var raw = d.innerText || d.textContent || '';
      /* Strip Chrome's auto-appended trailing newline(s) */
      var clean = raw.replace(/[\r\n]+$/, '');
      d.setAttribute('data-val', clean);
      realInput.value = clean;
      /* If Chrome added trailing newline to the div itself, remove it */
      if (raw !== clean && d.innerText.length > clean.length) {
        // Silently rebuild text nodes (only if there was actually a trailing newline)
        try { d.innerText = clean; } catch (e) {}
      }
    }
    d.addEventListener('input', sync);
    d.addEventListener('keyup', sync);
    d.addEventListener('paste', function () { setTimeout(sync, 0); });

    setTimeout(function () {
      d.focus();
      try {
        var r = document.createRange();
        r.selectNodeContents(d);
        r.collapse(false);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      } catch (err) {}
    }, 30);
    b.classList.add('on');
  }, true);

  /* Pre-submit sync — read from data-val, not innerText */
  function syncAll() {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var inp = vis._v439input;
      if (!inp) return;
      var v = vis.getAttribute('data-val') || '';
      inp.value = v.replace(/[\r\n]+$/, '');
      inp.style.opacity = '';
      inp.style.pointerEvents = '';
    });
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn-main, button[type="submit"]')) syncAll();
  }, true);
  document.addEventListener('submit', syncAll, true);

  console.log('[v439-eye] final version installed');
})();
