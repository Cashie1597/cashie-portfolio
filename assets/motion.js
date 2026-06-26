/* ============================================================
   Cashie.dev — Motion Layer (behaviour)
   Design unchanged. 60fps (transform/opacity, rAF-throttled),
   fully gated by prefers-reduced-motion. Degrades gracefully:
   if this script never runs, the existing inline reveals still work.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* ---- Ambient gradient drift (behind all content) ---- */
  if (!reduce) {
    var amb = document.createElement("div");
    amb.className = "cashie-ambient";
    amb.setAttribute("aria-hidden", "true");
    amb.innerHTML = '<i class="a1"></i><i class="a2"></i><i class="a3"></i>';
    document.body.insertBefore(amb, document.body.firstChild);
  }

  /* ---- Per-section reveal stagger (refines existing reveals) ---- */
  var groups = [];
  document.querySelectorAll(".reveal").forEach(function (el) {
    var p = el.parentElement || document.body;
    var g = groups.filter(function (x) { return x.p === p; })[0];
    if (!g) { g = { p: p, items: [] }; groups.push(g); }
    g.items.push(el);
  });
  groups.forEach(function (g) {
    g.items.forEach(function (el, i) { el.style.transitionDelay = (Math.min(i, 6) * 65) + "ms"; });
  });

  /* ---- Count-up numbers in live previews ---- */
  function countUp(el) {
    var m = (el.textContent || "").trim().match(/^(\d[\d,]*)(\D*)$/);
    if (!m) return;
    var target = parseInt(m[1].replace(/,/g, ""), 10);
    var suffix = m[2] || "";
    if (reduce || isNaN(target)) { el.textContent = target.toLocaleString() + suffix; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- Progress fills in previews ---- */
  function fillBar(el) {
    var target = el.getAttribute("data-cashie-w") || "25%";
    if (reduce) { el.style.width = target; return; }
    el.style.width = "0%";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.style.width = target; });
    });
  }

  /* ---- Trigger count-ups + fills when previews scroll into view ---- */
  var numbers = document.querySelectorAll(".faux-runtime .rt-value, .mini-runtime .mr-v");
  var bars = document.querySelectorAll(".faux-brief .fb-progress-fill, .mini-brief .mb-bar-fill");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.matches(".rt-value, .mr-v")) countUp(e.target);
        else fillBar(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    numbers.forEach(function (n) { io.observe(n); });
    bars.forEach(function (b) { io.observe(b); });
  } else {
    numbers.forEach(countUp);
    bars.forEach(fillBar);
  }

  /* ---- Pointer glow that tracks the cursor on premium work cards ---- */
  if (!reduce && finePointer) {
    document.querySelectorAll(".work-card-premium").forEach(function (card) {
      var win = card.querySelector(".mac-window");
      if (!win) return;
      var raf = null, x = 0, y = 0;
      card.addEventListener("pointermove", function (e) {
        var r = win.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () {
          win.style.setProperty("--mx", x + "px");
          win.style.setProperty("--my", y + "px");
          raf = null;
        });
      });
    });
  }

  /* ---- Living dashboards: ticking session clocks + fluctuating load ---- */
  (function liveDashboards() {
    if (reduce) return;
    var boards = [].slice.call(document.querySelectorAll(".faux-runtime, .mini-runtime"));
    if (!boards.length) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }

    boards.forEach(function (b) {
      b._on = false;
      b._clocks = [].slice.call(b.querySelectorAll(".rt-row-time")).filter(function (el) {
        return /^\d{2}:\d{2}:\d{2}$/.test((el.textContent || "").trim());
      }).map(function (el) {
        var p = el.textContent.trim().split(":").map(Number);
        return { el: el, s: p[0] * 3600 + p[1] * 60 + p[2] };
      });
      b._load = [].slice.call(b.querySelectorAll(".rt-value, .mr-v")).filter(function (el) {
        return /%$/.test((el.textContent || "").trim());
      })[0] || null;
      b._base = b._load ? (parseInt(b._load.textContent, 10) || 42) : 42;
      /* desync the live dot pulses so they breathe, not blink in lockstep */
      [].slice.call(b.querySelectorAll(".rt-dot.green, .mr-dot:not(.gray)")).forEach(function (d, i) {
        d.style.animationDelay = (-(i * 0.55)).toFixed(2) + "s";
      });
    });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target._on = e.isIntersecting; });
    }, { threshold: 0.2 });
    boards.forEach(function (b) { io.observe(b); });

    var tick = 0;
    setInterval(function () {
      if (document.hidden) return;
      tick++;
      boards.forEach(function (b) {
        if (!b._on) return;
        b._clocks.forEach(function (c) {
          c.s++;
          c.el.textContent = pad(Math.floor(c.s / 3600)) + ":" + pad(Math.floor((c.s % 3600) / 60)) + ":" + pad(c.s % 60);
        });
        if (b._load && tick % 2 === 0) {
          var v = Math.max(30, Math.min(60, b._base + Math.round((Math.random() - 0.5) * 10)));
          b._load.textContent = v + "%";
        }
      });
    }, 1000);
  })();

  /* ---- Nav gains depth on scroll ---- */
  var nav = document.querySelector("header.nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
