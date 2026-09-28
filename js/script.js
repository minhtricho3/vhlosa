const $ = (s, r = document) => r.querySelector(s);
const still = false;
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

// Ánh sáng theo chuột (chỉ dùng transform, throttle bằng rAF)
const glow = $('.glow'); let gx = 0, gy = 0, gt = 0;
addEventListener('pointermove', e => {
  gx = e.clientX; gy = e.clientY;
  if (!gt) gt = requestAnimationFrame(() => { gt = 0; glow.style.transform = `translate3d(${gx}px,${gy}px,0)`; });
}, { passive: true });

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

// Đom đóm: vẽ sẵn sprite phát sáng, không dùng shadowBlur
const cv = $('#fx'), ctx = cv.getContext('2d');
const sprites = cols.map(c => {
  const s = document.createElement('canvas'); s.width = s.height = 32;
  const g = s.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, c); gr.addColorStop(1, 'transparent');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s;
});
let W, H, dots = [];
function size() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  dots = Array.from({ length: Math.min(28, W / 40) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: 5 + Math.random() * 9,
    vx: (Math.random() - .5) * .3, vy: -.15 - Math.random() * .35,
    p: Math.random() * 6.28, s: sprites[Math.floor(Math.random() * 4)]
  }));
}
size(); addEventListener('resize', size);
(function loop() {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  ctx.clearRect(0, 0, W, H);
  for (const d of dots) {
    d.x += d.vx + Math.sin(d.p += .02) * .3; d.y += d.vy;
    if (d.y < -20) { d.y = H + 20; d.x = Math.random() * W; }
    ctx.globalAlpha = .4 + Math.sin(d.p * 2) * .3;
    ctx.drawImage(d.s, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
  }
})();

// Đọc data.json: dự án + thông tin liên hệ
const mk = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
const safe = u => /^(https?:|mailto:|#|\.{0,2}\/)/.test(u || '') ? u : '#';
const link = (a, u) => { a.href = safe(u); if (/^https?:/.test(u)) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
fetch('data.json').then(r => { if (!r.ok) throw 0; return r.json(); }).then(({ contact = {}, projects = [], music = [] }) => {
  $('#projects-list').replaceChildren(...projects.map(p => {
    const a = link(mk('a', '', 'card tilt'), p.url);
    a.style.setProperty('--c', p.color || '#b9a4ff');
    a.append(mk('div', '', 'thumb'), mk('h3', p.title), mk('p', p.description));
    tilt(a); return a;
  }));
  const m = $('#mail'); m.textContent = contact.email || ''; m.href = 'mailto:' + (contact.email || '');
  $('#links').replaceChildren(...(contact.links || []).map(l => link(mk('a', l.label), l.url)));
  initPlayer(music);
}).catch(() => { $('#ptitle').textContent = 'Chưa tải được nhạc'; $('#projects-list').replaceChildren(mk('p', 'Không đọc được data.json. Hãy mở trang qua server (Live Server, npx serve) hoặc deploy lên Vercel.')); });

// Trình phát nhạc: danh sách bài lấy từ "music" trong data.json
const au = $('#audio'), pl = $('#player'), seek = $('#seek'), vol = $('#vol');
let tracks = [], ti = 0, want = false, drag = false;
const fmt = t => isFinite(t) ? Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') : '0:00';
const tryPlay = () => au.play().catch(() => {});
function load(i) {
  ti = (i + tracks.length) % tracks.length;
  au.src = tracks[ti].file;
  $('#ptitle').textContent = $('#ptitle').title = tracks[ti].title || tracks[ti].file;
}
function initPlayer(list) {
  tracks = list.filter(t => t && t.file);
  if (!tracks.length) { $('#ptitle').textContent = 'Chưa có nhạc'; return; }
  load(0);
  if (want) tryPlay();
}
const step = d => { if (!tracks.length) return; const on = !au.paused; load(ti + d); if (on) tryPlay(); };
$('#play').onclick = () => tracks.length && (au.paused ? tryPlay() : au.pause());
$('#prev').onclick = () => step(-1);
$('#next').onclick = () => step(1);
au.addEventListener('play', () => pl.classList.add('playing'));
au.addEventListener('pause', () => pl.classList.remove('playing'));
au.addEventListener('ended', () => { load(ti + 1); tryPlay(); });
au.addEventListener('error', () => $('#ptitle').textContent = 'Không mở được: ' + tracks[ti].title);
au.addEventListener('timeupdate', () => {
  if (!drag && au.duration) seek.value = au.currentTime / au.duration * 1000;
  $('#ptime').textContent = fmt(au.currentTime) + ' / ' + fmt(au.duration);
});
seek.addEventListener('pointerdown', () => drag = true);
addEventListener('pointerup', () => drag = false);
seek.addEventListener('input', () => { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; });
try { const sv = localStorage.getItem('osa-vol'); if (sv !== null) vol.value = sv; } catch {}
au.volume = +vol.value;
vol.addEventListener('input', () => {
  au.volume = +vol.value; au.muted = false; pl.classList.toggle('muted', au.volume === 0);
  try { localStorage.setItem('osa-vol', vol.value); } catch {}
});
$('#mute').onclick = () => { au.muted = !au.muted; pl.classList.toggle('muted', au.muted); };
// Bấm bất kỳ chỗ nào lần đầu là tự phát nhạc (trình duyệt chỉ cho phát sau khi người dùng tương tác)
const first = e => {
  if (e.target.closest && e.target.closest('#player')) return;
  want = true; if (tracks.length) tryPlay();
};
const evs = ['pointerdown', 'pointerup', 'keydown'];
evs.forEach(n => addEventListener(n, first, true));
au.addEventListener('playing', () => evs.forEach(n => removeEventListener(n, first, true)), { once: true });
