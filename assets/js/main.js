// ============================================================
// AJQ / SYSTEM — shared behavior
// ============================================================

// --- theme cycle (persisted) ---
(function () {
  const KEY = 'ajq-theme';
  const THEMES = ['dark', 'light', 'blue', 'pink'];
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  function apply(theme) {
    if (theme === 'dark') { root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme', theme); }
    if (btn) {
      const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
      const label = `Theme: ${theme} — click for ${next}`;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  apply(THEMES.includes(saved) ? saved : 'dark');

  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* storage unavailable */ }
    });
  }
})();

// --- live NYC clock in status bar ---
function tickClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  el.textContent = fmt.format(now) + ' EST · NYC';
}
tickClock();
setInterval(tickClock, 1000);

// --- mobile nav toggle ---
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.navlinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
})();

// --- scroll reveal ---
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    items.forEach((i) => i.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((i) => io.observe(i));
})();

// --- signature signal / waveform scope (hero canvas) ---
(function () {
  const canvas = document.getElementById('scope-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const gridColor = 'rgba(33, 43, 57, 0.6)';
  const lineColor = '#ffb454';
  const lineColor2 = 'rgba(87, 217, 163, 0.5)';

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // secondary faint wave
    ctx.beginPath();
    ctx.strokeStyle = lineColor2;
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + Math.sin((x + t * 0.6) * 0.018) * (h * 0.14) * Math.sin(t * 0.002 + x * 0.002);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // primary signal line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 6;
    for (let x = 0; x <= w; x += 2) {
      const y =
        h / 2 +
        Math.sin((x + t) * 0.035) * (h * 0.22) +
        Math.sin((x + t) * 0.09) * (h * 0.06);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // sweep dot
    const sweepX = (t * 1.4) % w;
    const sweepY =
      h / 2 +
      Math.sin((sweepX + t) * 0.035) * (h * 0.22) +
      Math.sin((sweepX + t) * 0.09) * (h * 0.06);
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(sweepX, sweepY, 3, 0, Math.PI * 2);
    ctx.fill();

    t += 1.1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  if (reduceMotion) {
    draw();
  } else {
    requestAnimationFrame(draw);
  }
})();

// --- blog post list rendering (used on blog.html) ---
const BLOG_POSTS = [
  {
    slug: 'blog/nas-homelab.html',
    date: '2026-07-24',
    title: 'Building a NAS I actually trust',
    excerpt: 'Notes from setting up a home NAS — what it\u2019s for, why Unraid, and the small decisions that end up mattering most.',
    tags: ['homelab', 'infra']
  },
  {
    slug: 'blog/first-post.html',
    date: '2026-07-15',
    title: 'Why this site is built like a status board',
    excerpt: 'On treating a personal site like a system with modules, not a brochure — and what that buys you as an engineer.',
    tags: ['meta', 'design']
  }
];
BLOG_POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));

function renderBlogList() {
  const list = document.getElementById('blog-list');
  if (!list) return;
  const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  list.innerHTML = BLOG_POSTS.map((p) => `
    <div class="blog-item reveal">
      <div class="blog-date">${fmt.format(new Date(p.date))}</div>
      <div>
        <h3><a href="${p.slug}">${p.title}</a></h3>
        <p>${p.excerpt}</p>
        <div class="blog-tags">${p.tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.reveal').forEach((i) => {
    // re-run observer for newly injected nodes
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    io.observe(i);
  });
}
renderBlogList();

function renderLatestPostPreview() {
  const el = document.getElementById('latest-post');
  if (!el || BLOG_POSTS.length === 0) return;
  const p = BLOG_POSTS[0];
  const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  el.innerHTML = `
    <div class="card-tag"><span>${fmt.format(new Date(p.date))}</span><span class="muted">LATEST</span></div>
    <h3><a href="${p.slug}">${p.title}</a></h3>
    <p>${p.excerpt}</p>
    <div class="card-links"><a href="${p.slug}">Read post →</a><a href="blog.html" class="muted">All posts</a></div>
  `;
}
renderLatestPostPreview();
