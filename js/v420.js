/* v420: bulletproof eye toggle + Pro lock. Everything. */
(function () {
  'use strict';

  /* ============ EYE TOGGLE (clone-replace method) ============ */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.eye');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var wrap = btn.parentElement;
    if (!wrap) return;
    var input = wrap.querySelector('input');
    if (!input) return;

    var showing = input.getAttribute('data-v420') === '1';
    var newType = showing ? 'password' : 'text';

    // Clone the input — a NEW element Chrome has never seen before
    var clone = document.createElement('input');
    clone.type = newType;
    clone.className = input.className;
    clone.value = input.value;
    clone.placeholder = input.placeholder || '';
    clone.id = input.id || '';
    clone.name = input.name || '';
    clone.autocomplete = input.autocomplete || '';
    if (!showing) {
      clone.classList.add('pw-revealed');
      clone.setAttribute('data-v420', '1');
    } else {
      clone.classList.remove('pw-revealed');
      clone.setAttribute('data-v420', '0');
    }
    // Inline override
    if (!showing) {
      clone.style.webkitTextSecurity = 'none';
      clone.style.textSecurity = 'none';
    }

    input.parentNode.replaceChild(clone, input);
    btn.classList.toggle('on', !showing);

    setTimeout(function () {
      try {
        clone.focus();
        clone.setSelectionRange(clone.value.length, clone.value.length);
      } catch (err) {}
    }, 30);
  }, true);

  /* ============ PRO LOCK — MutationObserver catches every write ============ */
  function applyPro() {
    // Sidebar footer badge
    var badge = document.querySelector('.side-foot .pf-tx i');
    if (badge && badge.textContent.trim() !== 'Pro Plan') {
      badge.textContent = 'Pro Plan';
    }
    // Top bar model label (the small "Free" next to A logo)
    var mtx = document.querySelector('.model .m-tx b');
    if (mtx && /^(Free|Pro|Ultra)( Plan)?$/i.test(mtx.textContent.trim()) && mtx.textContent.trim() !== 'Pro') {
      mtx.textContent = 'Pro';
    }
    // Also try common alternative selectors
    document.querySelectorAll('.m-tx b, .pf-tx i').forEach(function (el) {
      var t = el.textContent.trim();
      if (/^(Free Plan|Free|Ultra Plan|Ultra)$/.test(t) && t.indexOf('Pro') === -1) {
        el.textContent = (el.tagName === 'I') ? 'Pro Plan' : 'Pro';
      }
    });
  }

  function startLock() {
    applyPro();
    // Observe every DOM change
    try {
      new MutationObserver(function () { applyPro(); })
        .observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
    // Also poll every 300ms as backup
    setInterval(applyPro, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startLock);
  else startLock();

  // Also right away
  applyPro();
})();
