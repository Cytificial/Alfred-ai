/* v380-actions: long-press user messages -> Copy / Retry / Delete */
(function () {
  'use strict';

  function lastUserText() {
    var list = document.querySelectorAll('.msg.user .bubble, .msg.me .bubble');
    if (!list.length) return '';
    return list[list.length - 1].textContent || '';
  }

  function getInput() {
    return document.querySelector('#msg-input') ||
           document.querySelector('.composer input:not([type=file])') ||
           document.querySelector('.composer textarea');
  }

  function toast(m) {
    var t = document.createElement('div');
    t.className = 'v380-toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('out'); }, 1400);
    setTimeout(function(){ t.remove(); }, 1900);
  }

  function closeMenu() {
    var m = document.getElementById('v380-menu');
    if (m) m.remove();
    document.removeEventListener('click', closeMenu, true);
    document.removeEventListener('touchstart', closeMenu, true);
  }

  function openMenu(msgEl, bubble) {
    closeMenu();
    var rect = bubble.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.id = 'v380-menu';
    menu.className = 'v380-menu';
    menu.style.top = (rect.bottom + 6 + window.scrollY) + 'px';
    menu.style.left = (rect.left + window.scrollX) + 'px';

    var isAI = msgEl.classList.contains('ai') || msgEl.classList.contains('assistant');

    var items = [];
    items.push({ k: 'copy', label: 'Copy', fn: function(){
      var text = bubble.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function(){ toast('Copied'); }, function(){
          var ta = document.createElement('textarea'); ta.value = text;
          ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          ta.remove(); toast('Copied');
        });
      } else {
        var ta = document.createElement('textarea'); ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove(); toast('Copied');
      }
      closeMenu();
    }});

    if (!isAI) {
      items.push({ k: 'retry', label: 'Retry', fn: function(){
        var inp = getInput();
        if (!inp) { toast('No input'); closeMenu(); return; }
        inp.value = bubble.textContent || '';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        var btn = document.querySelector('.send');
        if (btn) btn.click();
        closeMenu();
      }});
    } else {
      items.push({ k: 'regenerate', label: 'Regenerate', fn: function(){
        // Remove this AI bubble and re-send last user prompt
        var lastUser = document.querySelectorAll('.msg.user, .msg.me');
        if (!lastUser.length) { toast('Nothing to regenerate'); closeMenu(); return; }
        var txt = lastUser[lastUser.length - 1].querySelector('.bubble').textContent || '';
        var inp = getInput();
        if (!inp) { toast('No input'); closeMenu(); return; }
        inp.value = txt;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        msgEl.remove();
        var btn = document.querySelector('.send');
        if (btn) btn.click();
        closeMenu();
      }});
    }

    items.push({ k: 'delete', label: 'Delete', danger: true, fn: function(){
      msgEl.remove();
      closeMenu();
    }});

    items.forEach(function(it){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'v380-menu-item' + (it.danger ? ' danger' : '');
      b.textContent = it.label;
      b.addEventListener('click', function(e){ e.stopPropagation(); it.fn(); }, true);
      menu.appendChild(b);
    });

    document.body.appendChild(menu);
    setTimeout(function(){
      document.addEventListener('click', closeMenu, true);
      document.addEventListener('touchstart', closeMenu, true);
    }, 10);
  }

  /* long-press (500ms) */
  var pressTimer = null, pressStart = null;
  function onStart(e) {
    var msg = e.target.closest && e.target.closest('.msg');
    if (!msg) return;
    var bubble = msg.querySelector('.bubble');
    if (!bubble) return;
    var t = e.touches ? e.touches[0] : e;
    pressStart = { x: t.clientX, y: t.clientY };
    pressTimer = setTimeout(function(){
      if (!pressStart) return;
      openMenu(msg, bubble);
      pressStart = null;
    }, 500);
  }
  function onMove(e) {
    if (!pressStart) return;
    var t = e.touches ? e.touches[0] : e;
    if (Math.abs(t.clientX - pressStart.x) > 10 || Math.abs(t.clientY - pressStart.y) > 10) {
      clearTimeout(pressTimer); pressStart = null;
    }
  }
  function onEnd() { clearTimeout(pressTimer); pressStart = null; }

  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
})();
