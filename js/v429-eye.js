/* v429-eye: THE FIX. Real input hidden, visible div shows text. Chrome can't mask a div. */
(function () {
  'use strict';
  if (window.__v429) return; window.__v429 = '1';

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

    var currentlyShowing = !!wrap.querySelector('.pw-visible-div');

    if (currentlyShowing) {
      // === HIDE ===
      var vis = wrap.querySelector('.pw-visible-div');
      var stored = vis.getAttribute('data-val') || vis.textContent || '';
      realInput.value = stored;
      realInput.style.display = '';
      vis.remove();
      realInput.focus();
      try { realInput.setSelectionRange(realInput.value.length, realInput.value.length); } catch (err) {}
      b.classList.remove('on');
    } else {
      // === SHOW ===
      var val = realInput.value;
      realInput.style.display = 'none';

      var vis = document.createElement('div');
      vis.className = 'pw-visible-div';
      vis.setAttribute('contenteditable', 'true');
      vis.setAttribute('autocorrect', 'off');
      vis.setAttribute('autocapitalize', 'off');
      vis.setAttribute('spellcheck', 'false');
      vis.setAttribute('data-val', val);
      vis.textContent = val;
      vis.style.cssText = 'width:100%;box-sizing:border-box;color:inherit;font:inherit;' +
        'background:transparent;border:0;outline:none;padding:0;min-height:24px;' +
        'white-space:pre-wrap;word-break:break-all;caret-color:#7fc4ff;';
      // keep realInput's styling (padding, etc)
      var cs = getComputedStyle(realInput);
      vis.style.fontSize = cs.fontSize;
      vis.style.fontFamily = cs.fontFamily;
      vis.style.color = cs.color;

      realInput.parentNode.insertBefore(vis, realInput.nextSibling);

      vis.addEventListener('input', function () {
        vis.setAttribute('data-val', vis.textContent);
      });

      setTimeout(function () {
        vis.focus();
        try {
          var r = document.createRange();
          r.selectNodeContents(vis);
          r.collapse(false);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
        } catch (err) {}
      }, 30);
      b.classList.add('on');
    }
  }, true);

  // Before form submit: copy visible div value back into real input
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form) return;
    form.querySelectorAll('.pw-visible-div').forEach(function (vis) {
      var wrap = vis.parentElement;
      var input = wrap && wrap.querySelector('input');
      if (input) {
        input.value = vis.getAttribute('data-val') || vis.textContent || '';
      }
    });
  }, true);

  console.log('[v429-eye] div-based toggle installed');
})();
