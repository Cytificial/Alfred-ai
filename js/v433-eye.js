/* v433-eye: reveal overlay. Input stays in DOM (app.js can read it) but is invisible. */
(function () {
  'use strict';
  if (window.__v433) return; window.__v433 = '1';

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

    var vis = wrap.querySelector('.pw-visible-div');

    if (vis) {
      /* === HIDE === */
      realInput.value = vis.getAttribute('data-val') || vis.textContent || '';
      realInput.style.opacity = '';
      realInput.style.position = '';
      realInput.style.zIndex = '';
      realInput.style.pointerEvents = '';
      vis.remove();
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var val = realInput.value;
    var cs = getComputedStyle(realInput);

    /* Build overlay div */
    var d = document.createElement('div');
    d.className = 'pw-visible-div';
    d.setAttribute('contenteditable', 'true');
    d.setAttribute('autocorrect', 'off');
    d.setAttribute('autocapitalize', 'off');
    d.setAttribute('spellcheck', 'false');
    d.setAttribute('data-val', val);
    d.textContent = val;

    d.style.cssText = [
      'position:absolute',
      'left:0','top:0','right:0','bottom:0',
      'box-sizing:border-box',
      'padding:' + cs.padding,
      'color:#eaf4ff',
      'font:' + cs.font,
      'line-height:' + cs.lineHeight,
      'outline:none',
      'caret-color:#7fc4ff',
      'white-space:pre-wrap',
      'word-break:break-all',
      'overflow-wrap:anywhere',
      'padding-right:52px',
      'z-index:2',
      'background:transparent',
      'display:flex',
      'align-items:center'
    ].join(';');

    /* Make the input invisible but still in the DOM (app.js can read .value) */
    realInput.style.opacity = '0';
    realInput.style.position = 'absolute';
    realInput.style.zIndex = '1';
    realInput.style.width = '100%';
    realInput.style.height = '100%';
    realInput.style.top = '0';
    realInput.style.left = '0';
    realInput.style.pointerEvents = 'none';

    /* Put the div in the same parent as the input, right after it */
    realInput.parentNode.style.position = 'relative';
    realInput.parentNode.insertBefore(d, realInput.nextSibling);

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

  /* Belt-and-suspenders: sync before submit */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.querySelectorAll) return;
    form.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        var v = vis.getAttribute('data-val') || vis.textContent || '';
        input.value = v;
        input.style.opacity = '';   // make sure it's visible for app.js check
        input.style.position = '';
        input.style.pointerEvents = '';
        input.style.zIndex = '';
      }
    });
  }, true);

  /* Also sync every 50ms as absolute backup */
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

  console.log('[v433-eye] overlay reveal installed');
})();
