/* v438-eye: overlay placed INSIDE the input's own parent. No viewport coordinates. */
(function () {
  'use strict';
  if (window.__v438) return; window.__v438 = '1';

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

    var existing = wrap.querySelector('.pw-visible-div');

    /* === HIDE === */
    if (existing) {
      var finalVal = existing.getAttribute('data-val');
      if (finalVal == null) finalVal = existing.innerText || '';
      realInput.value = finalVal;
      realInput.style.opacity = '';
      existing.remove();
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var cs = getComputedStyle(realInput);

    /* Ensure the input's parent has position: relative */
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
    d.setAttribute('data-val', realInput.value);
    d.textContent = realInput.value;

    /* Overlay EXACTLY on top of the input inside the same parent */
    d.style.cssText = [
      'position:absolute',
      'left:0','top:0','right:0','bottom:0',
      'box-sizing:border-box',
      'padding:' + cs.padding,
      'padding-right:52px',
      'margin:0',
      'border:1px solid transparent',
      'border-radius:' + cs.borderRadius,
      'background:transparent',
      'color:' + cs.color,
      'font:' + cs.font,
      'line-height:' + cs.lineHeight,
      'outline:none',
      'caret-color:#7fc4ff',
      'white-space:pre-wrap',
      'word-break:break-all',
      'overflow:hidden',
      'z-index:5',
      'display:flex',
      'align-items:center',
      'cursor:text'
    ].join(';');

    /* Insert right after the input, inside same parent */
    parent.insertBefore(d, realInput.nextSibling);
    d._v438input = realInput;

    /* Hide the input but keep it in DOM */
    realInput.style.opacity = '0';
    realInput.style.pointerEvents = 'none';

    /* Sync */
    function sync() {
      var v = d.innerText || d.textContent || '';
      d.setAttribute('data-val', v);
      realInput.value = v;
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

  /* Pre-submit sync */
  function syncAll() {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var inp = vis._v438input;
      if (!inp) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.innerText || '';
      inp.value = v;
      inp.style.opacity = '';
      inp.style.pointerEvents = '';
    });
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn-main, button[type="submit"]')) syncAll();
  }, true);
  document.addEventListener('submit', syncAll, true);
})();
