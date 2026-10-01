/* v399-voice: Web Speech API input + SpeechSynthesis output.
 * Pattern from KoljaB/RealtimeVoiceChat. Astra has NO audio — this is our edge. */
(function () {
  'use strict';
  if (window.__v399voice) return; window.__v399voice = '1';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { console.log('[v399] Web Speech API not supported'); return; }

  var recog = new SR();
  recog.continuous = false;
  recog.interimResults = true;
  recog.lang = navigator.language || 'en-US';

  var listening = false;

  function micBtn() {
    return document.querySelector('.composer .c-ic[aria-label="Voice"], .composer .c-ic[aria-label*="voice" i], .composer .c-ic[aria-label*="mic" i]');
  }
  function inputEl() {
    return document.querySelector('#msg-input') || document.querySelector('.composer input:not([type=file])') || document.querySelector('.composer textarea');
  }

  function setListening(on) {
    listening = !!on;
    var b = micBtn();
    if (b) {
      b.classList.toggle('v399-rec', listening);
      b.setAttribute('aria-label', listening ? 'Stop listening' : 'Voice input');
    }
  }

  function toast(m) {
    var t = document.createElement('div');
    t.className = 'v399-toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  recog.onresult = function (e) {
    var finalText = '', interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    var inp = inputEl();
    if (!inp) return;
    if (finalText) {
      inp.value = (inp.value ? inp.value + ' ' : '') + finalText.trim();
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  recog.onerror = function (e) {
    console.warn('[v399] speech error', e.error);
    if (e.error === 'not-allowed') toast('Microphone permission denied');
    setListening(false);
  };
  recog.onend = function () { setListening(false); };

  // Mic click → toggle listening
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.composer .c-ic');
    if (!b) return;
    var aria = (b.getAttribute('aria-label') || '').toLowerCase();
    if (!/voice|mic|microphone/.test(aria)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (listening) { try { recog.stop(); } catch (er) {} return; }
    try {
      recog.start();
      setListening(true);
      toast('Listening…');
    } catch (er) { console.warn('[v399] start failed', er); }
  }, true);

  // TTS: speak Alfred's replies when user opts in
  var speakOn = false;
  window.__v399speak = function (text) {
    if (!('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(String(text).slice(0, 800));
    u.lang = navigator.language || 'en-US';
    u.rate = 1.0;
    speechSynthesis.speak(u);
  };
  window.__v399toggleSpeak = function () {
    speakOn = !speakOn;
    return speakOn;
  };

  // Auto-speak new AI replies if enabled (opt-in via window.__v399autoSpeak)
  window.__v399autoSpeak = false;
  // Watch for new completed AI messages
  var lastSpoken = '';
  setInterval(function () {
    if (!window.__v399autoSpeak) return;
    var msgs = document.querySelectorAll('.msg.ai .bubble');
    if (!msgs.length) return;
    var last = msgs[msgs.length - 1];
    var txt = (last.textContent || '').trim();
    if (!txt || txt === lastSpoken) return;
    if (document.querySelector('.msg.ai .v129-dots')) return;
    lastSpoken = txt;
    window.__v399speak(txt);
  }, 1500);
})();
