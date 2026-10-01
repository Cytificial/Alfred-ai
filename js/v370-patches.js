// v370: password eye toggle (both login + register)
document.addEventListener("click", function (e) {
  var b = e.target.closest(".eye");
  if (!b) return;
  var wrap = b.closest(".inp-wrap");
  if (!wrap) return;
  var input = wrap.querySelector("input");
  if (!input) return;
  var showing = input.type === "text";
  input.type = showing ? "password" : "text";
  b.classList.toggle("on", !showing);
  b.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});
