/* v437-login: password reveal overlay + clean sync. No polling. No dummy fields. */
(function () {
  'use strict';
  if (window.__v437) return; window.__v437 = '1';

  /* Only sync when the visible div emits an input event — no polling to avoid stale writes */
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

    var existing = wrap._v437div;

    if (existing && document.body.contains(existing)) {
      /* === HIDE === */
      var finalVal = existing.getAttribute('data-val');
      if (finalVal == null) finalVal = existing.innerText || '';
      realInput.value = finalVal;
      realInput.style.opacity = '';
      realInput.style.pointerEvents = '';
      existing.remove();
      wrap._v437div = null;
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var rect = realInput.getBoundingClientRect();
    var cs = getComputedStyle(realInput);

    var d = document.createElement('div');
    d.className = 'pw-visible-div';
    d.setAttribute('contenteditable', 'true');
    d.setAttribute('autocorrect', 'off');
    d.setAttribute('autocapitalize', 'off');
    d.setAttribute('spellcheck', 'false');
    d.setAttribute('data-val', realInput.value);
    d.textContent = realInput.value;

    d.style.cssText = [
      'position:fixed',
      'left:' + rect.left + 'px',
      'top:' + rect.top + 'px',
      'width:' + rect.width + 'px',
      'height:' + rect.height + 'px',
      'box-sizing:border-box',
      'padding:' + cs.padding,
      'padding-right:52px',
      'margin:0',
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
      'overflow:hidden',
      'z-index:2147483647',
      'display:flex',
      'align-items:center'
    ].join(';');

    document.body.appendChild(d);
    wrap._v437div = d;
    d._v437input = realInput;

    /* Hide input but keep it in DOM */
    realInput.style.opacity = '0';
    realInput.style.pointerEvents = 'none';

    /* Sync: use innerText (better for contenteditable than textContent) */
    function sync() {
      var v = d.innerText || d.textContent || '';
      d.setAttribute('data-val', v);
      realInput.value = v;
    }
    d.addEventListener('input', sync);
    d.addEventListener('keyup', sync);
    d.addEventListener('paste', function () { setTimeout(sync, 0); });

    /* Realign on viewport changes */
    function realign() {
      var r = realInput.getBoundingClientRect();
      d.style.left = r.left + 'px';
      d.style.top = r.top + 'px';
      d.style.width = r.width + 'px';
      d.style.height = r.height + 'px';
    }
    window.addEventListener('resize', realign);
    window.addEventListener('scroll', realign, { passive: true });

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

  /* Sync div → input on ANY click on Sign In (before app.js reads) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.btn-main, button[type="submit"]');
    if (!btn) return;
    syncDivsToInputs();
  }, true);

  /* Sync on submit */
  document.addEventListener('submit', function (e) {
    syncDivsToInputs();
  }, true);

  function syncDivsToInputs() {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var inp = vis._v437input;
      if (!inp || !document.body.contains(inp)) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.innerText || '';
      inp.value = v;
      inp.style.opacity = '';
      inp.style.pointerEvents = '';
    });
  }

  console.log('[v437-login] clean overlay installed');
})();
