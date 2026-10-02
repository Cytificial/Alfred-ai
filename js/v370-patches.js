/* v370-patches (simple): password eye toggle. Type flip only. */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.eye');
  if (!b) return;
  var wrap = b.parentElement;
  var input = wrap && wrap.querySelector('input');
  if (!input) return;
  e.preventDefault();
  e.stopPropagation();
  var isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  b.classList.toggle('on', isPw);
}, true);
