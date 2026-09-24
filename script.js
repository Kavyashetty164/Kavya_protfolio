/* =========================================================
   Kavya Shree G N — Portfolio interactions
   One rAF loop drives every scroll-linked effect so the page
   stays smooth; everything degrades gracefully without JS.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const topCache = new Map();
  const pageTop = el => {
    if (!topCache.has(el)) topCache.set(el, el.getBoundingClientRect().top + window.scrollY);
    return topCache.get(el);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Text splitting ---------- */
  function splitChars(el) {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach(c => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.style.setProperty('--i', i++);
            s.textContent = c === ' ' ? ' ' : c;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  }
  function splitWords(el) {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            w.style.setProperty('--i', i++);
            inner.style.setProperty('--i', i);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  }
  $$('.hero-headline .line').forEach(splitChars);
  $$('.split-words').forEach(splitWords);
  splitChars($('#footerName'));

  /* ---------- Preloader ---------- */
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');
  const loaderCount = $('#loaderCount');
  const minTime = reduceMotion ? 0 : 1500;
  const start = performance.now();
  let loaded = false;
  window.addEventListener('load', () => { loaded = true; });

  function tickLoader(now) {
    const t = clamp((now - start) / minTime);
    // Hold at 90% until the page has actually loaded
    const p = loaded ? t : Math.min(t, 0.9);
    const eased = 1 - Math.pow(1 - p, 3);
    loaderBar.style.width = (eased * 100) + '%';
    loaderCount.textContent = String(Math.round(eased * 100)).padStart(3, '0');
    if (p >= 1) return finishLoading();
    requestAnimationFrame(tickLoader);
  }
  function finishLoading() {
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('ready');
    setTimeout(() => loader.remove(), 1200);
  }
  // Safety net in case 'load' never fires (e.g. a slow font request)
  setTimeout(() => { loaded = true; }, 4000);
  requestAnimationFrame(tickLoader);

  /* ---------- Reveal on scroll ---------- */
  $$('[data-reveal-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.matches('.counter-row')) runCounters(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal],[data-reveal-stagger],.split-words,.footer-name').forEach(el => io.observe(el));

  function runCounters(root) {
    $$('[data-count]', root).forEach(el => {
      const target = +el.dataset.count;
      const t0 = performance.now();
      const dur = 1600;
      const step = now => {
        const p = clamp((now - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Hero scroll-scrub ---------- */
  const states = [
    { comment: '// TURNING IDEAS INTO REALITY', desc: 'Available for hire. Building fast, responsive web applications using modern tech stacks.' },
    { comment: '// BUILDING END-TO-END', desc: 'Designing interfaces in React and wiring them to Python and Flask APIs underneath.' },
    { comment: '// TURNING NUMBERS INTO INSIGHT', desc: 'Building Power BI dashboards and analysis that make raw data easy to act on.' },
    { comment: '// MACHINE LEARNING IN PRACTICE', desc: 'Exploring model fundamentals and applied AI while completing my MCA in Bengaluru.' }
  ];
  // Camera "keyframes" for the portrait — interpolated as you scroll
  const frames = [
    { x: 0, y: 0, s: 1.0 },
    { x: -4, y: -3, s: 1.14 },
    { x: 3, y: -6, s: 1.26 },
    { x: -1, y: 1, s: 1.06 }
  ];
  const heroPin = $('#home');
  const hero = $('#hero');
  const heroImg = $('#heroImg');
  const heroMedia = $('#heroMedia');
  const heroFlash = $('#heroFlash');
  const heroDim = $('#heroDim');
  const heroContent = $('.hero-content');
  const heroSide = $('.hero-side');
  const lines = $$('.hero-headline .line');
  const commentEl = $('#heroComment');
  const descEl = $('#heroDesc');
  const segs = $$('.scrub-seg i');
  let heroIdx = 0;
  let heroP = 0;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/<>_#*01';
  let scrambleId = 0;
  function scramble(el, text) {
    const id = ++scrambleId;
    if (reduceMotion) { el.textContent = text; return; }
    let frame = 0;
    const total = 22;
    const run = () => {
      if (id !== scrambleId) return;
      const reveal = Math.floor((frame / total) * text.length);
      el.textContent = text.split('').map((c, i) =>
        i < reveal || c === ' ' ? c : glyphs[Math.floor(Math.random() * glyphs.length)]
      ).join('');
      if (frame++ < total) requestAnimationFrame(run); else el.textContent = text;
    };
    run();
  }
  function setHeroState(idx) {
    if (idx === heroIdx) return;
    lines.forEach(l => {
      const i = +l.dataset.i;
      l.classList.toggle('is-leaving', i === heroIdx);
      l.classList.toggle('is-active', i === idx);
    });
    heroIdx = idx;
    scramble(commentEl, states[idx].comment);
    descEl.classList.add('swap');
    setTimeout(() => { descEl.textContent = states[idx].desc; descEl.classList.remove('swap'); }, 250);
  }

  // Spotlight + parallax follow the mouse inside the hero
  let mx = 0.5, my = 0.4, smx = 0.5, smy = 0.4;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width;
    my = (e.clientY - r.top) / r.height;
  });

  function updateHero(scrollY, vh) {
    const top = pageTop(heroPin);
    const total = heroPin.offsetHeight - vh;
    const target = total > 0 ? clamp((scrollY - top) / total) : 0;
    heroP = reduceMotion ? target : lerp(heroP, target, 0.12);
    const p = heroP;
    if (scrollY > top + heroPin.offsetHeight) return;

    // Only the first 88% scrubs through states; the tail lets the hero settle before release
    const sp = clamp(p / 0.88);
    const f = sp * 4;
    setHeroState(Math.min(3, Math.floor(f)));
    segs.forEach((s, i) => { s.style.transform = `scaleX(${clamp(f - i)})`; });

    // Portrait camera move
    const k = sp * (frames.length - 1);
    const a = frames[Math.floor(k)] || frames[frames.length - 1];
    const b = frames[Math.min(Math.floor(k) + 1, frames.length - 1)];
    const t = k - Math.floor(k);
    const ease = t * t * (3 - 2 * t);
    smx = lerp(smx, mx, 0.08);
    smy = lerp(smy, my, 0.08);
    const px = (smx - 0.5) * -24, py = (smy - 0.5) * -16;
    const x = lerp(a.x, b.x, ease), y = lerp(a.y, b.y, ease), s = lerp(a.s, b.s, ease);
    heroMedia.style.transform = `translate3d(calc(${x}% + ${px}px), calc(${y}% + ${py}px), 0) scale(${s})`;
    hero.style.setProperty('--mx', (smx * 100) + '%');
    hero.style.setProperty('--my', (smy * 100) + '%');

    // Light flash as the timeline crosses each boundary
    let flash = 0;
    for (let bnd = 1; bnd < 4; bnd++) flash = Math.max(flash, 1 - Math.abs(f - bnd) / 0.14);
    heroFlash.style.opacity = reduceMotion ? 0 : clamp(flash) * 0.75;

    // Exit: content drifts up & fades, portrait dims
    const exit = clamp((p - 0.9) / 0.1);
    heroContent.style.opacity = heroSide.style.opacity = 1 - exit;
    heroContent.style.translate = `0 ${-exit * 60}px`;
    heroDim.style.opacity = exit * 0.5;
  }

  /* ---------- About: profile card tilt on scroll + mouse ---------- */
  const profileCard = $('#profileCard');
  const aboutSec = $('#about');
  let cardMouse = { x: 0, y: 0 };
  function updateProfile(vh) {
    const rTop = pageTop(aboutSec) - window.scrollY;
    const p = clamp(1 - (rTop + aboutSec.offsetHeight * 0.25) / vh); // 0 entering → 1 settled
    const e = 1 - Math.pow(1 - p, 3);
    profileCard.style.setProperty('--ry', ((1 - e) * 24 + cardMouse.x * 12) + 'deg');
    profileCard.style.setProperty('--rx', ((1 - e) * 10 - cardMouse.y * 10) + 'deg');
    profileCard.style.setProperty('--rz', ((1 - e) * -6) + 'deg');
  }
  if (finePointer) {
    profileCard.addEventListener('pointermove', e => {
      const r = profileCard.getBoundingClientRect();
      cardMouse.x = (e.clientX - r.left) / r.width - 0.5;
      cardMouse.y = (e.clientY - r.top) / r.height - 0.5;
      profileCard.style.setProperty('--sx', ((cardMouse.x + 0.5) * 100) + '%');
      profileCard.style.setProperty('--sy', ((cardMouse.y + 0.5) * 100) + '%');
    });
    profileCard.addEventListener('pointerleave', () => { cardMouse = { x: 0, y: 0 }; });
  }

  /* ---------- Projects: vertical scroll → horizontal track ---------- */
  const workPin = $('#workPin');
  const workTrack = $('#workTrack');
  const workBar = $('#workBar');
  const workCount = $('#workCount');
  const workCards = workTrack.children.length;
  let workDist = 0, workX = 0;
  function sizeWork() {
    workDist = Math.max(0, workTrack.scrollWidth - window.innerWidth);
    workPin.style.height = (workDist + window.innerHeight * 1.15) + 'px';
    topCache.clear();
  }
  function updateWork(scrollY, vh) {
    const total = workPin.offsetHeight - vh;
    const p = total > 0 ? clamp((scrollY - pageTop(workPin)) / total) : 0;
    workX = reduceMotion ? p : lerp(workX, p, 0.1);
    workTrack.style.transform = `translate3d(${-workX * workDist}px,0,0)`;
    workBar.style.transform = `scaleX(${workX})`;
    const n = Math.min(workCards, Math.floor(workX * workCards) + 1);
    workCount.textContent = String(n).padStart(2, '0') + ' / ' + String(workCards).padStart(2, '0');
  }

  /* ---------- Skills marquee (speeds up with scroll velocity) ---------- */
  const marquees = $$('.marquee').map(m => {
    const track = $('.marquee-track', m);
    const original = track.innerHTML;
    // Fill to at least 2× viewport so the loop never shows a gap
    while (track.scrollWidth < window.innerWidth * 1.2) track.innerHTML += original;
    track.innerHTML += track.innerHTML;
    return { track, dir: m.classList.contains('reverse') ? 1 : -1, speed: +m.dataset.speed || 40, x: 0, hover: false, m };
  });
  marquees.forEach(q => {
    q.m.addEventListener('pointerenter', () => { q.hover = true; });
    q.m.addEventListener('pointerleave', () => { q.hover = false; });
  });
  function updateMarquees(dt, velocity) {
    if (reduceMotion) return;
    const boost = 1 + Math.min(Math.abs(velocity) * 0.04, 6);
    marquees.forEach(q => {
      const half = q.track.scrollWidth / 2;
      const v = q.speed * (q.hover ? 0.2 : boost);
      q.x += q.dir * v * dt;
      if (q.x <= -half) q.x += half;
      if (q.x > 0) q.x -= half;
      q.track.style.transform = `translate3d(${q.x}px,0,0)`;
    });
  }

  /* ---------- Contact giant word ---------- */
  const contactWord = $('#contactWord');
  const contactSec = $('#contact');
  function updateContact(vh) {
    const rTop = pageTop(contactSec) - window.scrollY;
    const p = clamp((vh - rTop) / (vh + contactSec.offsetHeight));
    contactWord.style.transform = `translate3d(${(0.25 - p) * 60}vw,0,0)`;
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const navLinks = $$('#navLinks a');
  const indicator = $('#navIndicator');
  const sections = navLinks.map(a => $(a.getAttribute('href')));
  let activeLink = null;
  function moveIndicator(a) {
    if (!a || !indicator) return;
    indicator.style.width = a.offsetWidth + 'px';
    indicator.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  function updateNav(scrollY, lastY, vh) {
    nav.classList.toggle('scrolled', scrollY > 40);
    const goingDown = scrollY > lastY + 2, goingUp = scrollY < lastY - 2;
    if (goingDown && scrollY > vh * 0.6 && !document.body.classList.contains('menu-open')) nav.classList.add('hidden');
    else if (goingUp) nav.classList.remove('hidden');

    let current = navLinks[0];
    sections.forEach((s, i) => { if (s && pageTop(s) - scrollY <= vh * 0.4) current = navLinks[i]; });
    if (current !== activeLink) {
      navLinks.forEach(a => a.classList.toggle('active', a === current));
      activeLink = current;
      moveIndicator(current);
    }
  }
  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  navLinks.forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Smooth scrolling ----------
     Wheel input sets a target; each frame the page eases toward it.
     Touch devices keep native momentum scrolling. */
  const smoothOn = finePointer && !reduceMotion;
  let targetY = window.scrollY, currentY = window.scrollY, smoothing = false;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  function scrollToY(y) {
    targetY = clamp(y, 0, maxScroll());
    if (!smoothOn) return window.scrollTo(0, targetY);
    if (!smoothing) currentY = window.scrollY;
    smoothing = true;
  }
  function smoothStep() {
    if (!smoothing) { currentY = targetY = window.scrollY; return; }
    currentY = lerp(currentY, targetY, 0.085);
    if (Math.abs(targetY - currentY) < 0.5) { currentY = targetY; smoothing = false; }
    window.scrollTo(0, currentY);
  }
  if (smoothOn) {
    document.documentElement.classList.add('smooth');
    window.addEventListener('wheel', e => {
      if (e.ctrlKey || document.body.classList.contains('is-loading')) return; // leave pinch-zoom alone
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      scrollToY((smoothing ? targetY : window.scrollY) + delta);
    }, { passive: false });
  }
  // Anchor links glide instead of jumping
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    scrollToY(id === '#home' ? 0 : pageTop(el) - (id === '#work' ? 0 : 20));
  }));

  /* ---------- Main loop ---------- */
  const progressBar = $('#scrollProgress');
  let lastY = window.scrollY, lastT = performance.now(), velocity = 0;
  function loop(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    smoothStep();
    const y = window.scrollY;
    const vh = window.innerHeight;
    velocity = lerp(velocity, (y - lastY) / Math.max(dt, 0.001) / 60, 0.2);

    const docH = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`;

    updateHero(y, vh);
    updateProfile(vh);
    updateWork(y, vh);
    updateMarquees(dt, velocity);
    updateContact(vh);
    updateNav(y, lastY, vh);
    updateCursor();

    lastY = y;
    requestAnimationFrame(loop);
  }

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor'), ring = $('#cursorRing');
  let cx = -100, cy = -100, rx = -100, ry = -100;
  function updateCursor() {
    if (!finePointer) return;
    rx = lerp(rx, cx, 0.18);
    ry = lerp(ry, cy, 0.18);
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
  }
  if (finePointer) {
    window.addEventListener('pointermove', e => {
      cx = e.clientX; cy = e.clientY;
      document.body.classList.add('has-cursor');
    });
    document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
    document.addEventListener('pointerover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a,button,.pill,.project-card,.root-card,input,textarea,label'));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px,${y * 0.4}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });

    /* 3D tilt + spotlight on cards */
    $$('.root-card').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 14) + 'deg');
        el.style.setProperty('--rx', (-y * 14) + 'deg');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }
  $$('.spot').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (e.clientX - r.left) + 'px');
      el.style.setProperty('--py', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Contact form + live JSON preview ---------- */
  const fName = $('#fName'), fEmail = $('#fEmail'), fMsg = $('#fMsg'), fConsent = $('#fConsent');
  const pvName = $('#pvName'), pvEmail = $('#pvEmail'), pvMsg = $('#pvMsg');
  const sendBtn = $('#sendBtn');
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function syncPreview() {
    const n = fName.value.trim(), m = fEmail.value.trim(), msg = fMsg.value.trim();
    pvName.textContent = n || '[Awaiting Name]';
    pvName.classList.toggle('empty', !n);
    pvEmail.textContent = m || '[Awaiting Email]';
    pvEmail.classList.toggle('empty', !m);
    pvMsg.textContent = msg ? `"${msg}"` : '"[Awaiting Message]"';
    pvMsg.classList.toggle('empty', !msg);
    sendBtn.disabled = !(n && validEmail(m) && msg && fConsent.checked);
  }
  [fName, fEmail, fMsg].forEach(el => el.addEventListener('input', syncPreview));
  fConsent.addEventListener('change', syncPreview);
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    if (sendBtn.disabled) return;
    const subject = encodeURIComponent('Portfolio contact from ' + fName.value.trim());
    const body = encodeURIComponent(fMsg.value.trim() + '\n\n— ' + fName.value.trim() + ' (' + fEmail.value.trim() + ')');
    window.location.href = `mailto:kavyamurthy2004@gmail.com?subject=${subject}&body=${body}`;
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Boot ---------- */
  sizeWork();
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { topCache.clear(); sizeWork(); moveIndicator(activeLink); }, 120);
  });
  document.fonts && document.fonts.ready.then(() => { topCache.clear(); sizeWork(); moveIndicator(activeLink); });
  window.addEventListener('load', () => { topCache.clear(); sizeWork(); });
  requestAnimationFrame(loop);
})();
