/* =========================================================
   Kavya Shree G N — Portfolio interactions
   One rAF loop drives every scroll-linked effect.
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Page offsets are cached and refreshed on resize so the loop never forces layout
  const topCache = new Map();
  const pageTop = el => {
    if (!topCache.has(el)) topCache.set(el, el.getBoundingClientRect().top + window.scrollY);
    return topCache.get(el);
  };
  // 0 when the element's top enters the bottom of the viewport, 1 after `span` viewports
  const enterProgress = (el, y, vh, span = 0.8) => clamp((y + vh - pageTop(el)) / (vh * span));

  /* ---------- Preloader ---------- */
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');
  const loaderCount = $('#loaderCount');
  const loaderStep = $('#loaderStep');
  const steps = ['LOADING MODULES...', 'COMPILING ASSETS...', 'ESTABLISHING LINK...', 'SYSTEM READY'];
  const minTime = reduceMotion ? 0 : 2200;
  const start = performance.now();
  let loaded = false;
  window.addEventListener('load', () => { loaded = true; });
  setTimeout(() => { loaded = true; }, 5000);

  function tickLoader(now) {
    const t = clamp((now - start) / Math.max(minTime, 1));
    const p = loaded ? t : Math.min(t, 0.92);
    const e = 1 - Math.pow(1 - p, 2);
    loaderBar.style.width = (e * 100) + '%';
    loaderCount.textContent = Math.round(e * 100);
    loaderStep.textContent = steps[Math.min(steps.length - 1, Math.floor(e * steps.length))];
    if (p >= 1) {
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
        document.body.classList.add('ready');
        setTimeout(() => loader.remove(), 1000);
      }, reduceMotion ? 0 : 350);
      return;
    }
    requestAnimationFrame(tickLoader);
  }
  requestAnimationFrame(tickLoader);

  /* ---------- Reveal on scroll ---------- */
  $$('[data-reveal-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],[data-reveal-stagger]').forEach(el => io.observe(el));

  /* ---------- Hero: scroll-scrubbed timeline ---------- */
  const states = [
    { comment: '// TURNING IDEAS INTO REALITY', desc: 'Available for hire. Building fast, responsive web applications using modern tech stacks.' },
    { comment: '// BUILDING END-TO-END', desc: 'Designing interfaces in React and wiring them to Python and Flask APIs underneath.' },
    { comment: '// TURNING NUMBERS INTO INSIGHT', desc: 'Building Power BI dashboards and analysis that make raw data easy to act on.' }
  ];
  const heroPin = $('#home');
  const hero = $('#hero');
  const subject = $('#heroSubject');
  const heroFlash = $('#heroFlash');
  const lines = $$('.hero-headline .line');
  const commentEl = $('#heroComment');
  const descEl = $('#heroDesc');
  const scrubBar = $('#scrubBar');
  let heroIdx = 0, heroP = 0;

  // Optional real head-turn clip: set data-turn-video="assets/hero-turn.mp4" on #hero
  let turnVideo = null;
  const videoSrc = hero.dataset.turnVideo;
  if (videoSrc) {
    turnVideo = document.createElement('video');
    Object.assign(turnVideo, { src: videoSrc, muted: true, playsInline: true, preload: 'auto' });
    turnVideo.setAttribute('muted', '');
    turnVideo.addEventListener('loadedmetadata', () => hero.classList.add('has-video'));
    turnVideo.addEventListener('error', () => { turnVideo.remove(); turnVideo = null; });
    subject.appendChild(turnVideo);
  }

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/<>_#01';
  let scrambleId = 0;
  function scramble(el, text) {
    const id = ++scrambleId;
    if (reduceMotion) { el.textContent = text; return; }
    let f = 0;
    const total = 20;
    (function run() {
      if (id !== scrambleId) return;
      const reveal = Math.floor((f / total) * text.length);
      el.textContent = [...text].map((c, i) => i < reveal || c === ' ' ? c : glyphs[(Math.random() * glyphs.length) | 0]).join('');
      if (f++ < total) requestAnimationFrame(run); else el.textContent = text;
    })();
  }
  function setHeroState(idx) {
    if (idx === heroIdx) return;
    lines.forEach((l, i) => {
      l.classList.toggle('is-leaving', i === heroIdx);
      l.classList.toggle('is-active', i === idx);
    });
    heroIdx = idx;
    scramble(commentEl, states[idx].comment);
    descEl.classList.add('swap');
    setTimeout(() => { descEl.textContent = states[idx].desc; descEl.classList.remove('swap'); }, 220);
  }

  let mx = 0.62, my = 0.38, smx = 0.62, smy = 0.38;
  hero.addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; });

  function updateHero(y, vh) {
    const top = pageTop(heroPin);
    if (y > top + heroPin.offsetHeight) return;
    const total = heroPin.offsetHeight - vh;
    const target = total > 0 ? clamp((y - top) / total) : 0;
    heroP = reduceMotion ? target : lerp(heroP, target, 0.14);
    const p = heroP;

    const f = clamp(p / 0.92) * states.length;
    setHeroState(Math.min(states.length - 1, Math.floor(f)));
    scrubBar.style.transform = `scaleX(${p})`;

    if (turnVideo && turnVideo.duration) {
      const t = p * (turnVideo.duration - 0.05);
      if (Math.abs(turnVideo.currentTime - t) > 0.03) turnVideo.currentTime = t;
    } else {
      // Photo mode: the portrait sways and turns slightly as the timeline plays
      const turn = Math.sin(p * Math.PI * 2);
      subject.style.setProperty('--sr', (turn * 9) + 'deg');
      subject.style.setProperty('--sx', (turn * -3) + 'vw');
      subject.style.setProperty('--ss', 1 + Math.sin(p * Math.PI) * 0.06);
    }

    // Studio light follows the mouse and sweeps with the timeline
    smx = lerp(smx, mx, 0.06); smy = lerp(smy, my, 0.06);
    hero.style.setProperty('--lx', ((smx * 0.5 + 0.35 + Math.sin(p * Math.PI * 2) * 0.08) * 100) + '%');
    hero.style.setProperty('--ly', ((smy * 0.4 + 0.2) * 100) + '%');

    // Bright flash as the timeline crosses into each new headline
    let flash = 0;
    for (let b = 1; b < states.length; b++) flash = Math.max(flash, 1 - Math.abs(f - b) / 0.12);
    heroFlash.style.opacity = reduceMotion ? 0 : clamp(flash) * 0.85;
  }

  /* ---------- About: tilted device card ---------- */
  const aboutSec = $('#about');
  const profileCard = $('#profileCard');
  let cardMouse = { x: 0, y: 0 }, cm = { x: 0, y: 0 };
  if (finePointer) {
    profileCard.addEventListener('pointermove', e => {
      const r = profileCard.getBoundingClientRect();
      cardMouse = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    });
    profileCard.addEventListener('pointerleave', () => { cardMouse = { x: 0, y: 0 }; });
  }
  function updateAbout(y, vh) {
    const e = ease(enterProgress(aboutSec, y, vh, 1.0));
    cm.x = lerp(cm.x, cardMouse.x, 0.1); cm.y = lerp(cm.y, cardMouse.y, 0.1);
    profileCard.style.setProperty('--rx', (lerp(28, 6, e) - cm.y * 10) + 'deg');
    profileCard.style.setProperty('--ry', (lerp(-38, -14, e) + cm.x * 14) + 'deg');
    profileCard.style.setProperty('--rz', lerp(-14, -5, e) + 'deg');
    profileCard.style.setProperty('--ty', lerp(140, 0, e) + 'px');
  }

  /* ---------- Root map cards rise and flatten ---------- */
  const rootGrid = $('#rootGrid');
  const rootCards = $$('.root-item');
  function updateRoots(y, vh) {
    const base = enterProgress(rootGrid, y, vh, 0.9);
    rootCards.forEach((c, i) => {
      const e = ease(clamp(base * 1.5 - i * 0.12));
      c.style.setProperty('--ty', lerp(160, 0, e) + 'px');
      c.style.setProperty('--rx', lerp(48, 0, e) + 'deg');
      c.style.setProperty('--ry', lerp(-18, 0, e) + 'deg');
      c.style.setProperty('--op', e);
    });
  }

  /* ---------- Projects: vertical scroll → horizontal, centre card in focus ---------- */
  const workPin = $('#workPin');
  const workTrack = $('#workTrack');
  const projects = [...workTrack.children];
  let workStart = 0, workDist = 0, workX = 0, focusIdx = -1;
  function sizeWork() {
    const first = projects[0], last = projects[projects.length - 1];
    workStart = innerWidth / 2 - (first.offsetLeft + first.offsetWidth / 2);
    workDist = (last.offsetLeft + last.offsetWidth / 2) - (first.offsetLeft + first.offsetWidth / 2);
    workPin.style.height = (workDist * 1.1 + innerHeight * 1.2) + 'px';
    topCache.clear();
  }
  function updateWork(y, vh) {
    const total = workPin.offsetHeight - vh;
    const p = total > 0 ? clamp((y - pageTop(workPin)) / total) : 0;
    workX = reduceMotion ? p : lerp(workX, p, 0.12);
    workTrack.style.transform = `translate3d(${workStart - workX * workDist}px,0,0)`;
    const idx = Math.round(workX * (projects.length - 1));
    if (idx !== focusIdx) {
      projects.forEach((c, i) => c.classList.toggle('is-focus', i === idx));
      focusIdx = idx;
    }
  }

  /* ---------- Contact: dispatch card straightens, giant word drifts ---------- */
  const contactSec = $('#contact');
  const contactGrid = $('#contactGrid');
  const dispatchCard = $('#dispatchCard');
  const contactWord = $('#contactWord');
  function updateContact(y, vh) {
    const e = ease(enterProgress(contactGrid, y, vh, 0.9));
    dispatchCard.style.setProperty('--ty', lerp(80, 0, e) + 'px');
    dispatchCard.style.setProperty('--op', e);
    const w = clamp((y + vh - pageTop(contactSec)) / (vh + contactSec.offsetHeight));
    contactWord.style.transform = `translate3d(calc(-50% + ${(0.4 - w) * 30}vw),0,0)`;
  }

  /* ---------- Skills marquee ---------- */
  const marquees = $$('.marquee').map(m => {
    const track = $('.marquee-track', m);
    const original = track.innerHTML;
    while (track.scrollWidth < innerWidth * 1.3) track.innerHTML += original;
    track.innerHTML += track.innerHTML;
    const q = { track, dir: m.classList.contains('reverse') ? 1 : -1, speed: +m.dataset.speed || 36, x: 0, hover: false };
    m.addEventListener('pointerenter', () => { q.hover = true; });
    m.addEventListener('pointerleave', () => { q.hover = false; });
    return q;
  });
  function updateMarquees(dt, velocity) {
    if (reduceMotion) return;
    const boost = 1 + Math.min(Math.abs(velocity) * 0.04, 5);
    marquees.forEach(q => {
      const half = q.track.scrollWidth / 2;
      q.x += q.dir * q.speed * (q.hover ? 0.2 : boost) * dt;
      if (q.x <= -half) q.x += half;
      if (q.x > 0) q.x -= half;
      q.track.style.transform = `translate3d(${q.x}px,0,0)`;
    });
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const navLinks = $$('#navLinks a');
  const sections = navLinks.map(a => $(a.getAttribute('href')));
  let activeLink = null;
  function updateNav(y, lastY, vh) {
    if (y > lastY + 3 && y > vh && !document.body.classList.contains('menu-open')) nav.classList.add('hidden');
    else if (y < lastY - 3) nav.classList.remove('hidden');
    let current = navLinks[0];
    sections.forEach((s, i) => { if (s && pageTop(s) - y <= vh * 0.4) current = navLinks[i]; });
    if (current !== activeLink) {
      navLinks.forEach(a => a.classList.toggle('active', a === current));
      activeLink = current;
    }
  }
  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  /* ---------- Smooth scrolling (desktop wheel + anchor links) ---------- */
  const smoothOn = finePointer && !reduceMotion;
  let targetY = scrollY, currentY = scrollY, smoothing = false;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  function scrollToY(y) {
    targetY = clamp(y, 0, maxScroll());
    if (!smoothOn) return window.scrollTo(0, targetY);
    if (!smoothing) currentY = scrollY;
    smoothing = true;
  }
  function smoothStep() {
    if (!smoothing) return;
    currentY = lerp(currentY, targetY, 0.085);
    if (Math.abs(targetY - currentY) < 0.5) { currentY = targetY; smoothing = false; }
    window.scrollTo(0, currentY);
  }
  if (smoothOn) {
    document.documentElement.classList.add('smooth');
    window.addEventListener('wheel', e => {
      if (e.ctrlKey || document.body.classList.contains('is-loading')) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      scrollToY((smoothing ? targetY : scrollY) + d);
    }, { passive: false });
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && $(id);
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (!el) return;
    e.preventDefault();
    scrollToY(id === '#home' ? 0 : pageTop(el));
  }));

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor'), ring = $('#cursorRing');
  let cx = -100, cy = -100, rx = -100, ry = -100;
  if (finePointer) {
    addEventListener('pointermove', e => { cx = e.clientX; cy = e.clientY; document.body.classList.add('has-cursor'); });
    document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
    document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a,button,.pill,.project-card,.root-card,input,textarea,label')));
  }
  function updateCursor() {
    if (!finePointer) return;
    rx = lerp(rx, cx, 0.2); ry = lerp(ry, cy, 0.2);
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
  }

  /* ---------- Main loop ---------- */
  let lastY = scrollY, lastT = performance.now(), velocity = 0;
  function loop(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    smoothStep();
    const y = scrollY, vh = innerHeight;
    velocity = lerp(velocity, (y - lastY) / Math.max(dt, 0.001) / 60, 0.2);

    updateHero(y, vh);
    updateAbout(y, vh);
    updateRoots(y, vh);
    updateWork(y, vh);
    updateContact(y, vh);
    updateMarquees(dt, velocity);
    updateNav(y, lastY, vh);
    updateCursor();

    lastY = y;
    requestAnimationFrame(loop);
  }

  /* ---------- Contact form + live payload preview ---------- */
  const fFirst = $('#fFirst'), fLast = $('#fLast'), fEmail = $('#fEmail'), fMsg = $('#fMsg'), fConsent = $('#fConsent');
  const pvName = $('#pvName'), pvEmail = $('#pvEmail'), pvMsg = $('#pvMsg'), sendBtn = $('#sendBtn');
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const fullName = () => [fFirst.value.trim(), fLast.value.trim()].filter(Boolean).join(' ');
  function syncPreview() {
    const n = fullName(), m = fEmail.value.trim(), msg = fMsg.value.trim();
    pvName.textContent = n || '[Awaiting Name]'; pvName.classList.toggle('empty', !n);
    pvEmail.textContent = m || '[Awaiting Email]'; pvEmail.classList.toggle('empty', !m);
    pvMsg.textContent = msg ? `"${msg}"` : '"[Awaiting Message]"'; pvMsg.classList.toggle('empty', !msg);
    sendBtn.disabled = !(n && validEmail(m) && msg && fConsent.checked);
  }
  [fFirst, fLast, fEmail, fMsg].forEach(el => el.addEventListener('input', syncPreview));
  fConsent.addEventListener('change', syncPreview);
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    if (sendBtn.disabled) return;
    const subject = encodeURIComponent('Portfolio contact from ' + fullName());
    const body = encodeURIComponent(fMsg.value.trim() + '\n\n— ' + fullName() + ' (' + fEmail.value.trim() + ')');
    window.location.href = `mailto:kavyamurthy2004@gmail.com?subject=${subject}&body=${body}`;
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Boot ---------- */
  sizeWork();
  let resizeT;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { topCache.clear(); sizeWork(); }, 120); });
  addEventListener('load', () => { topCache.clear(); sizeWork(); });
  document.fonts && document.fonts.ready.then(() => { topCache.clear(); sizeWork(); });
  requestAnimationFrame(loop);
})();
