const $ = (s, r = document) => r.querySelector(s);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#y').textContent = new Date().getFullYear();

// Gõ chữ luân phiên (sửa danh sách vai trò ở đây)
const roles = ['web developer', 'UI designer', 'người thích chill', 'dân mê lo-fi'];
const out = $('#type');
let r = 0, c = 0, del = false;
(function type() {
  const w = roles[r];
  out.textContent = w.slice(0, c);
  if (!del && c === w.length) { del = true; return setTimeout(type, 1400); }
  if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 45 : 90);
})();

// Hiện dần + chạy highlight khi cuộn tới
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .2 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Ánh sáng theo chuột + nền dịch nhẹ
const bg = $('.bg');
addEventListener('pointermove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
  if (!still) bg.style.transform = `translate(${(.5 - e.clientX / innerWidth) * 24}px,${(.5 - e.clientY / innerHeight) * 24}px)`;
});

// Card nghiêng 3D
const tilt = card => {
  card.addEventListener('pointermove', e => {
    if (still) return;
    const b = card.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
};

// Click để bắn tia sáng
const cols = ['#ffb38a', '#8ff0c8', '#b9a4ff', '#ff8fb8'];
addEventListener('click', e => {
  if (still) return;
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('i');
    const a = Math.random() * 6.28, d = 30 + Math.random() * 60;
    s.className = 'spark';
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:${cols[i % 4]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
});

// Đom đóm bay lơ lửng
const cv = $('#fx'), ctx = cv.getContext('2d');
let W, H, dots = [];
function size() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  dots = Array.from({ length: Math.min(60, W / 22) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.5,
    vx: (Math.random() - .5) * .3, vy: -.15 - Math.random() * .4,
    p: Math.random() * 6.28, c: cols[Math.floor(Math.random() * 4)]
  }));
}
size(); addEventListener('resize', size);
(function loop() {
  ctx.clearRect(0, 0, W, H);
  if (!still) dots.forEach(d => {
    d.x += d.vx + Math.sin(d.p += .02) * .3; d.y += d.vy;
    if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
    ctx.globalAlpha = .35 + Math.sin(d.p * 2) * .3;
    ctx.fillStyle = d.c; ctx.shadowColor = d.c; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill();
  });
  requestAnimationFrame(loop);
})();

// Đọc data.json: dự án + thông tin liên hệ
const mk = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
const safe = u => /^(https?:|mailto:|#|\.{0,2}\/)/.test(u || '') ? u : '#';
const link = (a, u) => { a.href = safe(u); if (/^https?:/.test(u)) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
fetch('data.json').then(r => { if (!r.ok) throw 0; return r.json(); }).then(({ contact = {}, projects = [] }) => {
  $('#projects-list').replaceChildren(...projects.map(p => {
    const a = link(mk('a', '', 'card tilt'), p.url);
    a.style.setProperty('--c', p.color || '#b9a4ff');
    a.append(mk('div', '', 'thumb'), mk('h3', p.title), mk('p', p.description));
    tilt(a); return a;
  }));
  const m = $('#mail'); m.textContent = contact.email || ''; m.href = 'mailto:' + (contact.email || '');
  $('#links').replaceChildren(...(contact.links || []).map(l => link(mk('a', l.label), l.url)));
}).catch(() => $('#projects-list').replaceChildren(mk('p', 'Không đọc được data.json. Hãy mở trang qua server (Live Server, npx serve) hoặc deploy lên Vercel.')));
