(function(){
  if (window.__v370dbg) return; window.__v370dbg = '1';
  var box = document.createElement('div');
  box.id = 'v370dbg';
  box.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:999999;background:#000d;color:#7fc4ff;font:11px monospace;padding:6px 8px;border-radius:6px;max-width:80vw;pointer-events:none;display:none';
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(box); });
  window.__v370log = function(m){
    box.style.display = 'block';
    box.textContent = m + '  |  ' + (box.textContent.split('  |  ')[0] || '');
  };
})();
