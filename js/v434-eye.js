/* v434-eye: reveal div positioned by exact pixel coordinates from getBoundingClientRect.
 * No CSS positioning dependency — works regardless of parent structure. */
(function () {
  'use strict';
  if (window.__v434) return; window.__v434 = '1';

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.eye');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var wrap = b.parentElement;
    if (!wrap) return;
    var realInput = wrap.querySelector('input.pw') || wrap.querySelector('input');
    if (!realInput) return;

    var existing = wrap.querySelector('.pw-visible-div');

    if (existing) {
      /* === HIDE === */
      realInput.value = existing.getAttribute('data-val') || existing.textContent || '';
      realInput.style.opacity = '';
      realInput.style.pointerEvents = '';
      existing.remove();
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

    /* Absolute pixel positioning — attaches to body, uses viewport coords */
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

    /* Hide the input (but keep its value) */
    realInput.style.opacity = '0';
    realInput.style.pointerEvents = 'none';

    /* Sync on every keystroke */
    function sync() {
      var v = d.textContent || '';
      d.setAttribute('data-val', v);
      realInput.value = v;
    }
    d.addEventListener('input', sync);
    d.addEventListener('keyup', sync);
    d.addEventListener('blur', sync);
    d.addEventListener('paste', function () { setTimeout(sync, 10); });

    /* Keep aligned if user scrolls or rotates */
    function realign() {
      var r = realInput.getBoundingClientRect();
      d.style.left = r.left + 'px';
      d.style.top = r.top + 'px';
      d.style.width = r.width + 'px';
      d.style.height = r.height + 'px';
    }
    window.addEventListener('resize', realign);
    window.addEventListener('scroll', realign, { passive: true });
    var realignTimer = setInterval(function () {
      if (!document.body.contains(d)) { clearInterval(realignTimer); return; }
      realign();
    }, 200);

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

  /* Submit insurance */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.querySelectorAll) return;
    form.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        var v = vis.getAttribute('data-val') || vis.textContent || '';
        input.value = v;
        input.style.opacity = '';
        input.style.pointerEvents = '';
      }
    });
  }, true);

  /* Polling backup */
  setInterval(function () {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (!input) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      if (input.value !== v) input.value = v;
    });
  }, 50);

  console.log('[v434-eye] pixel-position reveal installed');
})();
