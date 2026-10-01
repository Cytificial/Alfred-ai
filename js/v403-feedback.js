/* v403-feedback: thumbs up/down on AI messages */
(function () {
  'use strict';
  if (window.__v403fb) return; window.__v403fb = '1';

  function addThumbs(msgEl) {
    if (msgEl._v403done) return;
    var bubble = msgEl.querySelector('.bubble');
    if (!bubble || !bubble.textContent.trim()) return;
    if (msgEl.querySelector('.v403-bar')) return;
    msgEl._v403done = 1;
    var bar = document.createElement('div');
    bar.className = 'v403-bar';
    bar.innerHTML =
      '<button type="button" class="v403-btn" data-v="1" aria-label="Good response">👍</button>' +
      '<button type="button" class="v403-btn" data-v="-1" aria-label="Bad response">👎</button>';
    bubble.parentNode.insertBefore(bar, bubble.nextSibling);
    bar.querySelectorAll('.v403-btn').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        var vote = parseInt(b.getAttribute('data-v'), 10);
        bar.querySelectorAll('.v403-btn').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        fetch('http://localhost:8082/api/feedback', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: vote, snippet: bubble.textContent.slice(0, 300) })
        }).catch(function () {});
      };
    });
  }

  setInterval(function () {
    var msgs = document.querySelectorAll('.msg.ai, .msg.assistant');
    if (!msgs.length) return;
    var last = msgs[msgs.length - 1];
    if (last.querySelector('.v129-dots') || last.querySelector('.proc')) return;
    addThumbs(last);
  }, 1500);
})();
