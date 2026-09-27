/* wmf-fit.js — make an embedded page fill its Wix "Embed a site" box exactly.
   Wix sizes the embed box as a fixed ratio of screen width, so on wide screens the
   box is taller than the content and a grey gap appears below it. When embedded,
   this scales the page uniformly (like Wix Studio scales everything else) until the
   content exactly fills the box. Re-fits when the window resizes or the content
   changes height while loading (or would overflow after a click). Does nothing on direct visits or when the content
   is already taller than the box. */
(function () {
  if (window.self === window.top) return;
  // Limits per layout band, so scaling never pushes content into a narrower layout
  // than the one the page's own CSS breakpoints expect (media queries use the real width).
  function limits(W) {
    if (W >= 1024) return { minL: 1000, maxZ: 2.5 };  // desktop
    if (W >= 720)  return { minL: 720,  maxZ: 1.4 };  // tablet
    return { minL: 320, maxZ: 1.3 };                   // phone: keep text growth modest
  }

  function init() {
    if (document.getElementById('wmf-fit')) return;
    var fit = document.createElement('div');
    fit.id = 'wmf-fit';
    var nodes = [].slice.call(document.body.childNodes).filter(function (n) {
      return !(n.nodeType === 1 && n.tagName === 'SCRIPT');
    });
    document.body.insertBefore(fit, document.body.firstChild);
    nodes.forEach(function (n) { fit.appendChild(n); });

    var lastH = -1, busy = false, raf, z = 1, interacted = false;
    ['pointerdown', 'click', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, function () { interacted = true; }, true);
    });

    function reset() {
      fit.style.width = ''; fit.style.transform = ''; fit.style.transformOrigin = '';
      document.body.style.height = ''; document.body.style.overflow = '';
    }
    function heightAt(z, W) { fit.style.width = (W / z) + 'px'; return fit.offsetHeight * z; }

    function run() {
      busy = true;
      reset();
      var W = document.documentElement.clientWidth, H = window.innerHeight;
      z = 1;
      var lim = limits(W), maxZ = Math.min(lim.maxZ, W / lim.minL);
      if (maxZ > 1 && fit.offsetHeight < H) {
        var lo = 1, hi = maxZ;
        if (heightAt(hi, W) <= H) lo = hi;
        else for (var i = 0; i < 16; i++) {
          var mid = (lo + hi) / 2;
          if (heightAt(mid, W) <= H) lo = mid; else hi = mid;
        }
        var h = heightAt(lo, W);
        fit.style.transformOrigin = '0 0';
        z = lo;
        fit.style.transform = 'scale(' + lo + ')';
        document.body.style.height = h + 'px';
        document.body.style.overflow = 'hidden';
      }
      lastH = fit.offsetHeight;
      busy = false;
    }
    function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); }

    run();
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (busy || Math.abs(fit.offsetHeight - lastH) <= 1) return;
        // Before the visitor interacts, keep refitting (content still loading/rendering).
        // After that, only refit if the content would overflow the box — so clicking a
        // filter never makes the whole page visibly re-zoom.
        if (!interacted || fit.offsetHeight * z > window.innerHeight + 1) schedule();
        else lastH = fit.offsetHeight;
      }).observe(fit);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
