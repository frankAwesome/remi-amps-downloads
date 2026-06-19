/* ══════════════════════════════════════════════════════════════
   REMI Amps — site interactions
   Vanilla JS. One rAF scroll loop drives all scroll-linked motion.
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* year */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ── reveal on scroll (with stagger via --d / --i) ── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* statement words */
  $$(".statement__big .reveal-word").forEach((el, i) => el.style.setProperty("--i", i));
  const stmtIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { $$(".reveal-word", e.target).forEach((w) => w.classList.add("in")); stmtIO.unobserve(e.target); } });
  }, { threshold: 0.4 });
  const stmt = $(".statement__big"); if (stmt) stmtIO.observe(stmt);

  /* amps visual badges + tilt-in */
  const ampVis = $(".amps__visual");
  if (ampVis) new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting));
  }, { threshold: 0.3 }).observe(ampVis);

  /* ── count-up stats ── */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      countIO.unobserve(el);
      if (reduce || target === 0) { el.textContent = suffix + target; return; }
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = suffix + Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ── nav stuck state ── */
  const nav = $("#nav");
  /* ── elements driven by scroll loop ── */
  const bar = $(".scrollbar span");
  const parallax = $$("[data-parallax]");
  const ampsSection = $(".amps");
  const modes = $$(".amps__modes li");
  const fxPin = $(".fx__pin");
  const fxTrack = $(".fx__track");

  /* current/target for smoothed values */
  let activeMode = -1;

  function onScroll() {
    const sy = window.scrollY, vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    /* progress bar */
    if (bar) bar.style.width = (docH > 0 ? (sy / docH) * 100 : 0) + "%";

    /* nav */
    if (nav) nav.classList.toggle("is-stuck", sy > 40);

    if (reduce) return;

    /* parallax layers */
    for (const el of parallax) {
      const speed = +el.dataset.parallax;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(2)}px, 0)`;
    }

    /* AMPS pinned — drive mode chips by scroll progress through the section */
    if (ampsSection && modes.length) {
      const r = ampsSection.getBoundingClientRect();
      const total = ampsSection.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      const idx = clamp(Math.floor(p * modes.length), 0, modes.length - 1);
      if (idx !== activeMode) {
        modes.forEach((m, i) => m.classList.toggle("is-active", i === idx));
        activeMode = idx;
      }
    }

    /* FX horizontal scroll — translate the track on vertical scroll */
    if (fxPin && fxTrack && getComputedStyle(fxTrack).position === "sticky") {
      const r = fxPin.getBoundingClientRect();
      const total = fxPin.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      const dist = fxTrack.scrollWidth - window.innerWidth + 48;
      fxTrack.style.transform = `translate3d(${(-p * dist).toFixed(2)}px,0,0)`;
    }
  }

  let ticking = false;
  function requestScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }
  addEventListener("scroll", requestScroll, { passive: true });
  addEventListener("resize", requestScroll);
  onScroll();

  if (reduce) return; /* skip pointer-driven flourishes */

  /* ── custom cursor glow ── */
  const cursor = $(".cursor");
  if (cursor && matchMedia("(hover:hover)").matches) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, riding = false;
    const ride = () => {
      cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      /* idle when settled so the page can reach a stable frame */
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) requestAnimationFrame(ride);
      else riding = false;
    };
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!riding) { riding = true; requestAnimationFrame(ride); }
    }, { passive: true });
    const hot = "a,button,.btn,[data-magnetic],.fx__card,.feature,.dcard";
    document.addEventListener("pointerover", (e) => { if (e.target.closest(hot)) cursor.classList.add("is-hot"); });
    document.addEventListener("pointerout", (e) => { if (e.target.closest(hot)) cursor.classList.remove("is-hot"); });
  }

  /* ── magnetic buttons ── */
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* ── 3D tilt on [data-tilt] ── */
  $$("[data-tilt]").forEach((el) => {
    const inner = el.firstElementChild || el;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = `perspective(1200px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg)`;
      inner.style.transition = "transform .08s linear";
    });
    el.addEventListener("pointerleave", () => {
      inner.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
      inner.style.transform = "";
    });
  });
})();
