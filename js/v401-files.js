/* v401-files: attach files to messages */
(function () {
  'use strict';
  if (window.__v401files) return; window.__v401files = '1';
  var pending = [];

  function getComposer() { return document.querySelector('.composer'); }

  function chipHTML(f) {
    return '<span class="v401-chip" data-id="' + f.id + '">' +
      '<span class="v401-chip-ic">📎</span>' +
      '<span class="v401-chip-n">' + f.name.slice(0, 22) + (f.name.length > 22 ? '…' : '') + '</span>' +
      '<button type="button" class="v401-chip-x" aria-label="Remove">×</button>' +
    '</span>';
  }

  function renderChips() {
    var wrap = document.querySelector('.v401-chips');
    if (!wrap) {
      var c = getComposer();
      if (!c) return;
      wrap = document.createElement('div');
      wrap.className = 'v401-chips';
      c.parentNode.insertBefore(wrap, c);
    }
    wrap.innerHTML = pending.map(chipHTML).join('');
    wrap.querySelectorAll('.v401-chip-x').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        var id = b.parentElement.getAttribute('data-id');
        pending = pending.filter(function (f) { return f.id !== id; });
        renderChips();
      };
    });
  }

  function uploadFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var b64 = String(reader.result).split(',')[1] || '';
        fetch('http://localhost:8082/api/chat/upload', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, data: b64 })
        }).then(function (r) { return r.json(); })
          .then(function (j) { j.ok ? resolve(j) : reject(new Error(j.error || 'upload failed')); })
          .catch(reject);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.composer .c-ic');
    if (!b) return;
    var aria = (b.getAttribute('aria-label') || '').toLowerCase();
    if (!/attach/.test(aria)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.txt,.md,.json,.csv,.py,.js,.ts,.html,.css,.xml,.yaml,.yml,.log,.sh,.sql,.png,.jpg,.jpeg,.webp';
    inp.multiple = true;
    inp.onchange = function () {
      Array.from(inp.files).forEach(function (f) {
        uploadFile(f).then(function (j) {
          pending.push({ id: j.id, name: j.name });
          renderChips();
        }).catch(function (err) { console.warn('[v401]', err); });
      });
    };
    inp.click();
  }, true);

  // Export pending attachments so v130 send can pick them up
  window.__v401pendingAttachments = function () { return pending.slice(); };
  window.__v401clearAttachments = function () { pending = []; renderChips(); };
})();
