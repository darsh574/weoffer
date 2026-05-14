/* =========================================================
   WeOffer Growth — interactions
   Boots progressively. Falls back gracefully if GSAP/Lenis
   are blocked (e.g. offline). All sections still display.
   ========================================================= */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- helpers ---------- */
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  /* ---------- year ---------- */
  ready(() => {
    const y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  });

  /* ---------- loader ---------- */
  function bootLoader() {
    const loader  = $('#loader');
    const count   = $('#loader-count');
    const barFill = $('#loader-bar');
    if (!loader || !count || !barFill) return Promise.resolve();

    return new Promise((resolve) => {
      let v = 0;
      const target = 100;
      const start = performance.now();
      const dur = reduced ? 250 : 1400;

      const step = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        v = Math.round(eased * target);
        count.textContent = String(v);
        barFill.style.right = (100 - v) + '%';
        if (t < 1) requestAnimationFrame(step);
        else {
          requestAnimationFrame(() => {
            loader.classList.add('is-done');
            setTimeout(resolve, 500);
          });
        }
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- custom cursor ---------- */
  function bootCursor() {
    if (isTouch || reduced) return;
    const cursor = $('#cursor');
    const label  = $('#cursor-label');
    if (!cursor) return;

    let mx = window.innerWidth / 2,  my = window.innerHeight / 2;
    let cx = mx, cy = my;

    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    window.addEventListener('mouseenter', () => cursor.classList.add('is-ready'));
    window.addEventListener('mouseleave', () => cursor.classList.remove('is-ready'));

    const tick = () => {
      cx = lerp(cx, mx, 0.22);
      cy = lerp(cy, my, 0.22);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Show after first move
    setTimeout(() => cursor.classList.add('is-ready'), 200);

    // Hover states
    const setState = (state, text = '') => {
      cursor.classList.remove('is-link', 'is-button', 'is-hidden');
      if (state) cursor.classList.add('is-' + state);
      label.textContent = text;
    };

    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (!t) { setState(null); return; }
      const kind = t.dataset.cursor;
      if (kind === 'hide')   return setState(null) || cursor.classList.add('is-hidden');
      if (kind === 'link')   return setState('link');
      if (kind === 'button') return setState('button', t.dataset.cursorLabel || 'Go');
    });
  }

  /* ---------- magnetic hover ---------- */
  function bootMagnetic() {
    if (isTouch || reduced) return;
    $$('.magnetic').forEach((el) => {
      let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;

      const animate = () => {
        cx = lerp(cx, tx, 0.18);
        cy = lerp(cy, ty, 0.18);
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) {
          raf = requestAnimationFrame(animate);
        } else { raf = 0; }
      };

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = (e.clientX - r.left) - r.width / 2;
        const relY = (e.clientY - r.top)  - r.height / 2;
        tx = relX * 0.28;
        ty = relY * 0.28;
        if (!raf) raf = requestAnimationFrame(animate);
      });
      el.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  /* ---------- header pin on scroll ---------- */
  function bootHeader() {
    const header = $('#site-header');
    if (!header) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-pinned', y > 60);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  function bootSmoothScroll() {
    if (reduced) return;
    if (typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Sync with ScrollTrigger if present
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
    }

    // Anchor links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -40, duration: 1.4 });
    });
  }

  /* ---------- intersection-based reveals (fallback + supplement) ---------- */
  function bootReveals() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- GSAP-driven hero + section reveals ---------- */
  function bootGsap() {
    if (reduced || !window.gsap) {
      // Fallback: instantly show hero/mask elements
      $$('.hero__title .word').forEach((w) => (w.style.transform = 'translateY(0)'));
      $$('.reveal-mask__inner').forEach((w) => (w.style.transform = 'translateY(0)'));
      return;
    }
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Hero word reveal
    gsap.to('.hero__title .word', {
      y: '0%',
      duration: 1.1,
      stagger: 0.06,
      ease: 'expo.out',
      delay: 0.05
    });

    gsap.fromTo(
      '.hero__overline, .hero__sub, .hero__ctas, .hero__scroll',
      { y: 24, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1, ease: 'expo.out',
        stagger: 0.1, delay: 0.55
      }
    );

    // Generic mask reveals (.reveal-mask__inner) — staggered per group
    if (window.ScrollTrigger) {
      $$('.reveal-mask').forEach((mask) => {
        const inner = mask.querySelector('.reveal-mask__inner');
        if (!inner) return;
        gsap.to(inner, {
          y: '0%',
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: mask,
            start: 'top 88%',
            once: true
          }
        });
      });

      // Hero parallax for bg layers
      gsap.to('.hero__bg-grid', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero__bg-glow', {
        yPercent: 60,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // Bigstrip horizontal slide
      gsap.utils.toArray('.bigstrip__line').forEach((line, i) => {
        gsap.fromTo(line,
          { x: i % 2 === 0 ? '-6vw' : '6vw' },
          {
            x: i % 2 === 0 ? '6vw' : '-6vw',
            ease: 'none',
            scrollTrigger: {
              trigger: '.bigstrip',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      });

      // Pillars stagger in
      gsap.utils.toArray('.pillar').forEach((p, i) => {
        gsap.fromTo(p,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: p, start: 'top 88%', once: true }
          }
        );
      });
    }
  }

  /* ---------- counters ---------- */
  function bootCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;

    const animate = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1600;
      const start = performance.now();
      const isFloat = !Number.isInteger(target);

      const step = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = target * eased;
        el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- contact / landing form ----------
     POSTs to Google Apps Script web app if data-sheet URL is configured.
     Falls back to mailto if the URL is missing or the request fails.
     Sheet endpoint accepts FormData (no preflight) — see /apps-script.gs. */
  function bootForm() {
    $$('#contact-form, #lp-form').forEach((form) => {

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const name     = (data.get('name')     || '').toString().trim();
        const email    = (data.get('email')    || '').toString().trim();
        const phone    = (data.get('phone')    || '').toString().trim();
        const business = (data.get('business') || '').toString().trim();
        const msg      = ((data.get('message') || data.get('pain') || '')).toString().trim();

        if (!name || !email || !msg) {
          form.classList.add('is-invalid');
          const first = form.querySelector('input:invalid, textarea:invalid');
          if (first) first.focus();
          return;
        }

        const isAudit = form.id === 'lp-form';
        const btn = form.querySelector('button[type="submit"] .btn__label');
        const setBtn = (t) => { if (btn) btn.textContent = t; };

        const sheetUrl = form.dataset.sheet || '';
        const looksConfigured = sheetUrl && /^https:\/\/script\.google\.com\//.test(sheetUrl);

        const showSuccess = () => {
          const successId = isAudit ? 'lp-form-success' : 'contact-success';
          const successEl = document.getElementById(successId);
          if (successEl) {
            form.querySelectorAll('.field, .btn, .lp-form__fine').forEach((el) => el.style.display = 'none');
            successEl.hidden = false;
            successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            setBtn('Sent. Thank you.');
          }
        };

        const mailtoFallback = () => {
          const subject = encodeURIComponent(
            isAudit
              ? `Free automation audit — ${name}${business ? ' (' + business + ')' : ''}`
              : `New project enquiry — ${name}${business ? ' (' + business + ')' : ''}`
          );
          const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}` +
            (phone ? `\nPhone: ${phone}` : '') +
            `\nBusiness: ${business}\n\n${msg}`
          );
          setBtn('Opening mail…');
          window.location.href = `mailto:weoffer.info@gmail.com?subject=${subject}&body=${body}`;
          setTimeout(() => setBtn('Sent. Thank you.'), 800);
        };

        if (!looksConfigured) {
          // No Apps Script URL set yet — use mailto so the form still works.
          mailtoFallback();
          return;
        }

        // Attach a few helpful extras for the sheet
        data.append('source', isAudit ? 'landing' : 'main-site');
        data.append('page', window.location.href);
        data.append('referrer', document.referrer || '');
        data.append('submitted_at', new Date().toISOString());

        setBtn('Sending…');
        try {
          // FormData POST → no preflight → Apps Script receives e.parameter
          const res = await fetch(sheetUrl, { method: 'POST', body: data });
          if (!res.ok) throw new Error('Sheet ' + res.status);
          showSuccess();
        } catch (err) {
          console.warn('Sheet submit failed, falling back to mailto:', err);
          mailtoFallback();
        }
      });
    });
  }

  /* ---------- boot sequence ---------- */
  ready(async () => {
    bootHeader();
    bootCursor();
    bootMagnetic();
    bootForm();
    bootReveals();
    bootCounters();

    // Wait for loader before kicking off scroll-tied animations.
    await bootLoader();

    bootSmoothScroll();
    bootGsap();
  });

})();
