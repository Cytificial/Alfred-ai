/* v380-chat: markdown rendering for AI bubbles.
 * Waits 800ms after the stream goes idle before converting, so partial
 * fences don't get locked in as plain text. */
(function () {
  'use strict';
  if (window.__v380md) return; window.__v380md = '1';

  /* ---------- HTML escape ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- inline formatting ---------- */
  function inline(s) {
    return s
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  /* ---------- markdown renderer ---------- */
  function renderMarkdown(raw) {
    if (!raw) return '';
    var src = String(raw).replace(/\r\n/g, '\n');
    // Normalize: if fence opener is glued to preceding text, split before it.
    // Do NOT split ``` from its language identifier (e.g. ```javascript).
    src = src.replace(/([^\n`])```/g, '$1\n```');

    var out = [];
    var lines = src.split('\n');
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // fenced code
      var fence = line.match(/^\s*```\s*([A-Za-z0-9_+\-]*)\s*$/);
      if (fence) {
        var lang = (fence[1] || '').toLowerCase();
        var buf = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        var cid = 'v380c' + Math.random().toString(36).slice(2, 8);
        out.push(
          '<div class="v380-code" style="max-width:100%">' +
            '<div class="v380-code-hd">' +
              '<span class="v380-lang">' + esc(lang || 'code') + '</span>' +
              '<button class="v380-copy" data-target="' + cid + '" type="button">Copy</button>' +
            '</div>' +
            '<pre id="' + cid + '"><code>' + esc(buf.join('\n')) + '</code></pre>' +
          '</div>'
        );
        continue;
      }

      // heading
      var h = line.match(/^(#{1,4})\s+(.+)$/);
      if (h) {
        var lv = h[1].length;
        out.push('<h' + lv + '>' + inline(esc(h[2])) + '</h' + lv + '>');
        i++; continue;
      }

      // unordered list
      if (/^\s*[-*+]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          items.push('<li>' + inline(esc(lines[i].replace(/^\s*[-*+]\s+/, ''))) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        var oitems = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          oitems.push('<li>' + inline(esc(lines[i].replace(/^\s*\d+\.\s+/, ''))) + '</li>');
          i++;
        }
        out.push('<ol>' + oitems.join('') + '</ol>');
        continue;
      }

      // blank
      if (/^\s*$/.test(line)) { i++; continue; }

      // paragraph
      var para = [line]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^```/.test(lines[i]) &&
             !/^#{1,4}\s/.test(lines[i]) &&
             !/^\s*[-*+]\s+/.test(lines[i]) &&
             !/^\s*\d+\.\s+/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push('<p>' + inline(esc(para.join(' '))) + '</p>');
    }
    return out.join('');
  }
  window.__v380Markdown = renderMarkdown;

  /* ---------- per-bubble state ---------- */
  var bubbles = new WeakMap();
  var IDLE_MS = 800;

  function scan() {
    var list = document.querySelectorAll('.msg.ai .bubble, .msg.assistant .bubble');
    list.forEach(function (b) {
      // v414: NEVER touch the welcome bubble — app.js owns its structure
      if (b.querySelector('#welcome-msg') || b.querySelector('#welcome-time')) return;
      // Also skip any bubble that already contains a rendered markdown block
      if (b._v380Rendered) return;
      var s = bubbles.get(b);
      if (!s) { s = { raw: '', changed: Date.now(), rendered: false }; bubbles.set(b, s); }
      if (s.rendered) return;
      if (b.querySelector('.v129-dots')) {
        s.raw = b.textContent;
        s.changed = Date.now();
        return;
      }
      var raw = b.textContent || '';
      if (raw !== s.raw) {
        s.raw = raw;
        s.changed = Date.now();
        return;
      }
      if (Date.now() - s.changed < IDLE_MS) return;
      if (!raw.trim()) return;
      b.innerHTML = renderMarkdown(raw);
      b.classList.add('v380-md');
      s.rendered = true;
    });
  }
  setInterval(scan, 200);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();

  /* ---------- copy buttons ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.v380-copy');
    if (!btn) return;
    var t = document.getElementById(btn.getAttribute('data-target'));
    if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var txt = t.textContent;
    function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () {
        var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed';
        ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        ta.remove(); ok();
      });
    } else {
      var ta2 = document.createElement('textarea'); ta2.value = txt; ta2.style.position = 'fixed';
      ta2.style.opacity = '0'; document.body.appendChild(ta2); ta2.select();
      try { document.execCommand('copy'); } catch (err) {}
      ta2.remove(); ok();
    }
  }, true);

  /* ---------- dedup thinking indicators ---------- */
  setInterval(function () {
    document.querySelectorAll('.msg.ai').forEach(function (m) {
      if (m.querySelector('.proc') && m.querySelector('.v129-dots')) {
        m.querySelector('.v129-dots').remove();
      }
    });
  }, 200);
})();
