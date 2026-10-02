/* v440-eye: no ghost text, cleaner sync, smoother toggle. */
(function () {
  'use strict';
  if (window.__v440) return; window.__v440 = '1';

  function findInput(btn) {
    var wrap = btn.parentElement;
    return wrap && wrap.querySelector('input.pw');
  }

  function hideInput(inp) {
    /* visibility:hidden prevents ghost render but keeps .value readable by JS */
    inp.style.visibility = 'hidden';
    inp.style.pointerEvents = 'none';
  }
  function showInput(inp) {
    inp.style.visibility = '';
    inp.style.pointerEvents = '';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.eye');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var inp = findInput(b);
    if (!inp) return;

    var wrap = b.parentElement;
    var existing = wrap.querySelector('.pw-visible-div');

    /* === HIDE === */
    if (existing) {
      var finalVal = existing.getAttribute('data-val') || '';
      inp.value = finalVal;
      showInput(inp);
      existing.remove();
      inp.focus();
      try { inp.setSelectionRange(finalVal.length, finalVal.length); } catch (err) {}
      b.classList.remove('on');
      return;
    }

    /* === SHOW === */
    var cs = getComputedStyle(inp);
    var parent = inp.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    var d = document.createElement('div');
    d.className = 'pw-visible-div';
    d.setAttribute('contenteditable', 'true');
    d.setAttribute('autocorrect', 'off');
    d.setAttribute('autocapitalize', 'off');
    d.setAttribute('spellcheck', 'false');
    d.setAttribute('data-val', inp.value);
    d.textContent = inp.value;

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

    parent.insertBefore(d, inp.nextSibling);
    hideInput(inp);
    d._v440input = inp;

    /* Sync — data-val is truth, never innerText */
    function sync() {
      var raw = d.innerText || d.textContent || '';
      var clean = raw.replace(/[\r\n]+$/, '');
      d.setAttribute('data-val', clean);
      inp.value = clean;
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
    }, 20);
    b.classList.add('on');
  }, true);

  /* Pre-submit sync */
  function syncAll() {
    document.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var inp = vis._v440input;
      if (!inp) return;
      var v = (vis.getAttribute('data-val') || '').replace(/[\r\n]+$/, '').trim();
      inp.value = v;
      inp.style.visibility = '';
      inp.style.pointerEvents = '';
    });
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn-main, button[type="submit"]')) {
      syncAll();
    }
  }, true);
  document.addEventListener('submit', syncAll, true);

  console.log('[v440-eye] ghost-free installed');
})();
