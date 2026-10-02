/* v427-eye: toggle -webkit-text-security on the input. That's it. */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.eye');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  var wrap = b.parentElement;
  var input = wrap && wrap.querySelector('input');
  if (!input) return;
  var showing = (input.style.webkitTextSecurity === 'none' || input.style.textSecurity === 'none');
  if (showing) {
    input.style.webkitTextSecurity = 'disc';
    input.style.textSecurity = 'disc';
  } else {
    input.style.webkitTextSecurity = 'none';
    input.style.textSecurity = 'none';
  }
  b.classList.toggle('on', !showing);
}, true);
