/* wmf-fit.js — make an embedded page fill its Wix "Embed a site" box exactly.
   Wix sizes the embed box as a fixed ratio of screen width, so the box is often taller
   than the content and a grey gap appears below it. When embedded, this lays the page
   out a little narrower and scales it up uniformly (like Wix Studio scales everything
   else) until the content exactly fills the box.

   Because the page is laid out narrower than the real screen, the page's own
   @media (max-width: …) breakpoints are re-evaluated against that layout width, so the
   page switches cleanly to its tablet/phone layout instead of squeezing the wider one.

   Re-fits when the window resizes or the content changes height while loading (or would
   overflow after a click). Does nothing on direct visits or when the content is already
   taller than the box. */
(function () {
  if (window.self === window.top) return;

  // How far each screen size may scale, and the narrowest layout width allowed.
  function limits(W) {
    if (W >= 1366) return { minL: 1000, maxZ: 2.5 };  // desktop: keep the desktop layout
    if (W >= 1024) return { minL: 700,  maxZ: 1.8 };  // tablet landscape / small laptop
    if (W >= 600)  return { minL: 360,  maxZ: 1.6 };  // tablet
    return { minL: 320, maxZ: 1.3 };                   // phone: keep text growth modest
  }

  /* ---- breakpoint emulation: make max-width media rules follow the layout width ---- */
  var MQ_RE = /^\s*(?:(?:only\s+)?screen\s+and\s+)?\(\s*max-width\s*:\s*(\d+(?:\.\d+)?)px\s*\)\s*$/i;
  var mq = [], seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function walk(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.type === 4 && r.media) {                    // CSSMediaRule
        if (seen && !seen.has(r)) {
          seen.add(r);
          var m = MQ_RE.exec(r.media.mediaText);
          if (m) mq.push({ r: r, max: parseFloat(m[1]), orig: r.media.mediaText });
        }
        if (r.cssRules) walk(r.cssRules);
      }
    }
  }
  function scan() {
    if (!seen) return;
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; } // cross-origin sheet
      if (rules) walk(rules);
    }
  }
  function emulate(L) { // L = layout width in px, or null to restore the real rules
    for (var i = 0; i < mq.length; i++) {
      var q = mq[i], t = L == null ? q.orig : (L <= q.max ? 'all' : 'not all');
      try { if (q.r.media.mediaText !== t) q.r.media.mediaText = t; } catch (e) {}
    }
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
      emulate(null);
      fit.style.width = ''; fit.style.transform = ''; fit.style.transformOrigin = '';
      document.body.style.height = ''; document.body.style.overflow = '';
    }
    function heightAt(zz, W) {
      var L = W / zz;
      emulate(L);
      fit.style.width = L + 'px';
      return fit.offsetHeight * zz;
    }

    function run() {
      busy = true;
      scan();
      reset();
      var W = document.documentElement.clientWidth, H = window.innerHeight;
      z = 1;
      var lim = limits(W), maxZ = Math.min(lim.maxZ, W / lim.minL);
      if (maxZ > 1 && fit.offsetHeight < H) {
        var lo = 1, hi = maxZ;
        if (heightAt(hi, W) <= H) lo = hi;
        else for (var i = 0; i < 18; i++) {
          var mid = (lo + hi) / 2;
          if (heightAt(mid, W) <= H) lo = mid; else hi = mid;
        }
        if (lo > 1.001) {
          var h = heightAt(lo, W);
          z = lo;
          fit.style.transformOrigin = '0 0';
          fit.style.transform = 'scale(' + lo + ')';
          document.body.style.height = h + 'px';
          document.body.style.overflow = 'hidden';
        } else reset();
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
        // After that, only refit if the content would overflow the box, so clicking a
        // filter never makes the whole page visibly re-zoom.
        if (!interacted || fit.offsetHeight * z > window.innerHeight + 1) schedule();
        else lastH = fit.offsetHeight;
      }).observe(fit);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
