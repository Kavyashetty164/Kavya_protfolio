// ---- Hero scroll-scrub ----
  const states = [
    { comment: "// BUILDING END-TO-END", desc: "Designing interfaces in React and wiring them to Python and Flask APIs underneath." },
    { comment: "// TURNING NUMBERS INTO INSIGHT", desc: "Building Power BI dashboards and analysis that make raw data easy to act on." },
    { comment: "// STRUCTURE FIRST", desc: "Modelling real-world logic — queues, priority systems, scheduling — before writing a line of UI." },
    { comment: "// MCA STUDENT, BENGALURU", desc: "Currently deepening my computer science fundamentals while shipping client and personal projects." }
  ];
  const pinWrap = document.getElementById('heroPinWrap');
  const lines = document.querySelectorAll('.hero-headline .line');
  const commentEl = document.getElementById('heroComment');
  const descEl = document.getElementById('heroDesc');
  const segs = document.querySelectorAll('.scrub-seg i');
  let currentIndex = -1;

  function updateHero(){
    const rect = pinWrap.getBoundingClientRect();
    const total = pinWrap.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const progress = total > 0 ? scrolled / total : 0;
    const idx = Math.min(3, Math.floor(progress * 4));

    if (idx !== currentIndex) {
      lines.forEach(l => l.classList.toggle('active', Number(l.dataset.i) === idx));
      commentEl.textContent = states[idx].comment;
      descEl.textContent = states[idx].desc;
      currentIndex = idx;
    }

    segs.forEach((seg, i) => {
      const segProgress = Math.min(Math.max((progress * 4) - i, 0), 1);
      seg.style.width = (segProgress * 100) + '%';
    });
  }
  window.addEventListener('scroll', updateHero, { passive: true });
  updateHero();

  // ---- Scroll reveal ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---- Live JSON preview ----
  const fName = document.getElementById('fName');
  const fEmail = document.getElementById('fEmail');
  const fMsg = document.getElementById('fMsg');
  const fConsent = document.getElementById('fConsent');
  const pvName = document.getElementById('pvName');
  const pvEmail = document.getElementById('pvEmail');
  const pvMsg = document.getElementById('pvMsg');
  const sendBtn = document.getElementById('sendBtn');

  function syncPreview(){
    pvName.textContent = fName.value.trim() ? fName.value.trim() : '[Awaiting Name]';
    pvName.classList.toggle('empty', !fName.value.trim());
    pvEmail.textContent = fEmail.value.trim() ? fEmail.value.trim() : '[Awaiting Email]';
    pvEmail.classList.toggle('empty', !fEmail.value.trim());
    pvMsg.textContent = fMsg.value.trim() ? '"' + fMsg.value.trim() + '"' : '"[Awaiting Message]"';
    pvMsg.classList.toggle('empty', !fMsg.value.trim());
    updateSendState();
  }
  function updateSendState(){
    const ready = fName.value.trim() && fEmail.value.trim() && fMsg.value.trim() && fConsent.checked;
    sendBtn.disabled = !ready;
  }
  [fName, fEmail, fMsg].forEach(el => el.addEventListener('input', syncPreview));
  fConsent.addEventListener('change', updateSendState);

  sendBtn.addEventListener('click', () => {
    const subject = encodeURIComponent('Portfolio contact from ' + fName.value.trim());
    const body = encodeURIComponent(fMsg.value.trim() + '\n\n— ' + fName.value.trim() + ' (' + fEmail.value.trim() + ')');
    window.location.href = `mailto:kavyamurthy2004@gmail.com?subject=${subject}&body=${body}`;
  });
