/* v430-eye: reveal with proper input-like styling + continuous sync + submit hook */
(function () {
  'use strict';
  if (window.__v430) return; window.__v430 = '1';

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.eye');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var wrap = b.parentElement;
    if (!wrap) return;
    var realInput = wrap.querySelector('input');
    if (!realInput) return;

    var vis = wrap.querySelector('.pw-visible-div');

    if (vis) {
      /* === HIDE === */
      realInput.value = vis.getAttribute('data-val') || vis.textContent || '';
      realInput.style.display = '';
      vis.remove();
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var val = realInput.value;
    var cs = getComputedStyle(realInput);

    /* Build a div that visually matches the input */
    var d = document.createElement('div');
    d.className = 'pw-visible-div';
    d.setAttribute('contenteditable', 'true');
    d.setAttribute('autocorrect', 'off');
    d.setAttribute('autocapitalize', 'off');
    d.setAttribute('spellcheck', 'false');
    d.setAttribute('data-val', val);
    d.textContent = val;

    /* Copy every relevant computed style so it looks IDENTICAL */
    d.style.cssText = [
      'box-sizing:border-box',
      'width:100%',
      'min-height:' + cs.height,
      'padding:' + cs.padding,
      'border:' + cs.border,
      'border-radius:' + cs.borderRadius,
      'background:' + cs.background,
      'color:' + cs.color,
      'font:' + cs.font,
      'line-height:' + cs.lineHeight,
      'outline:none',
      'caret-color:#7fc4ff',
      'white-space:pre-wrap',
      'word-break:break-all',
      'overflow-wrap:anywhere',
      'padding-right:52px'
    ].join(';');

    /* Place div right where the input is */
    realInput.style.display = 'none';
    realInput.parentNode.insertBefore(d, realInput.nextSibling);

    /* Sync on every keystroke */
    function sync() {
      d.setAttribute('data-val', d.textContent || '');
      realInput.value = d.textContent || '';
    }
    d.addEventListener('input', sync);
    d.addEventListener('keyup', sync);
    d.addEventListener('blur', sync);
    d.addEventListener('paste', function () { setTimeout(sync, 10); });

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

  /* CRITICAL: sync visible div -> input BEFORE any submit handler runs */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.querySelectorAll) return;
    form.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        var v = vis.getAttribute('data-val');
        if (v == null) v = vis.textContent || '';
        input.value = v;
        input.removeAttribute('disabled');
      }
    });
  }, true);  /* capture phase — runs before app.js */

  /* Also hook the click on Sign In button as extra insurance */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.btn-main, .send');
    if (!btn) return;
    var form = btn.closest('form');
    if (!form) return;
    form.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        var v = vis.getAttribute('data-val');
        if (v == null) v = vis.textContent || '';
        input.value = v;
      }
    });
  }, true);

  console.log('[v430-eye] reveal + sync installed');
})();
