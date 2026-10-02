/* v435-eye: overlay with direct div->input reference (survives body-level append). */
(function () {
  'use strict';
  if (window.__v435) return; window.__v435 = '1';

  /* Keep a map: div -> real input */
  window.__v435map = new WeakMap();

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

    var existing = wrap._v435div;

    if (existing && document.body.contains(existing)) {
      /* === HIDE === */
      realInput.value = existing.getAttribute('data-val') || existing.textContent || '';
      realInput.style.opacity = '';
      realInput.style.pointerEvents = '';
      existing.remove();
      wrap._v435div = null;
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
    wrap._v435div = d;

    /* CRITICAL: link div -> input so submit can find it later */
    window.__v435map.set(d, realInput);
    d._v435input = realInput;   /* also as a property, in case WeakMap fails */

    /* Hide the input visually (but keep value + DOM presence) */
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

    /* Realign on viewport change */
    function realign() {
      var r = realInput.getBoundingClientRect();
      d.style.left = r.left + 'px';
      d.style.top = r.top + 'px';
      d.style.width = r.width + 'px';
      d.style.height = r.height + 'px';
    }
    window.addEventListener('resize', realign);
    window.addEventListener('scroll', realign, { passive: true });
    var t = setInterval(function () {
      if (!document.body.contains(d)) { clearInterval(t); return; }
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

  /* Helper: find the real input for a visible div */
  function inputFor(vis) {
    if (vis._v435input && document.body.contains(vis._v435input)) return vis._v435input;
    if (window.__v435map && window.__v435map.get) {
      var i = window.__v435map.get(vis);
      if (i) return i;
    }
    // Fallback: look for input.pw in DOM (there's only one per form)
    var form = vis.closest && vis.closest('form');
    if (form) return form.querySelector('input.pw');
    return null;
  }

  /* Submit: sync div -> real input RIGHT before app.js reads it */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form) return;
    var divs = document.querySelectorAll('.pw-visible-div');
    divs.forEach(function (vis) {
      var input = inputFor(vis);
      if (!input) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      input.value = v;
      input.style.opacity = '';
      input.style.pointerEvents = '';
    });
  }, true);

  /* ALSO: capture on click of Sign In button, in case app.js does click not submit */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.btn-main, button[type="submit"]');
    if (!btn) return;
    var form = btn.closest('form');
    var divs = document.querySelectorAll('.pw-visible-div');
    divs.forEach(function (vis) {
      var input = inputFor(vis);
      if (!input) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      input.value = v;
      input.style.opacity = '';
      input.style.pointerEvents = '';
    });
  }, true);

  /* Continuous polling sync — guarantees input always has latest value */
  setInterval(function () {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var input = inputFor(vis);
      if (!input) return;
      var v = vis.getAttribute('data-val');
      if (v == null) v = vis.textContent || '';
      if (input.value !== v) {
        input.value = v;
      }
      input.style.opacity = '';
      input.style.pointerEvents = '';
    });
  }, 40);

  console.log('[v435-eye] linked overlay installed');
})();
