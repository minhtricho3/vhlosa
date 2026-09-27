const PREVIEW_KEY = 'osa_preview_content';

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function displayUrl(url){ return String(url ?? '').replace(/^https?:\/\//, ''); }

function formatDate(iso){
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('vi-VN');
}

function el(tag, className, html){
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

async function loadContent(){
  // A draft saved by the admin page (same browser) takes priority, so
  // "Xem trước" shows unsaved edits without needing a redeploy.
  const draft = localStorage.getItem(PREVIEW_KEY);
  if (draft) {
    try { return JSON.parse(draft); } catch (e) { /* fall through to fetch */ }
  }
  const res = await fetch('data/content.json', { cache: 'no-store' });
  return res.json();
}

function renderAvatar(profile){
  const img = document.getElementById('avatar');
  const fallback = document.getElementById('avatarFallback');
  if (profile.avatar) {
    img.src = profile.avatar;
    img.style.display = 'block';
    fallback.style.display = 'none';
  } else {
    fallback.textContent = (profile.name || 'O').trim().charAt(0).toUpperCase();
    fallback.style.display = 'flex';
    img.style.display = 'none';
  }
}

function renderProfile(p){
  document.getElementById('kicker').textContent = p.kicker || '';
  document.getElementById('name').textContent = p.name || '';
  document.getElementById('role').textContent = p.role || '';
  document.getElementById('lede').textContent = p.lede || '';
  document.getElementById('bio').textContent = p.bio || '';
  document.getElementById('contactText').textContent = p.contactText || '';
  renderAvatar(p);

  const skillsEl = document.getElementById('skills');
  skillsEl.innerHTML = '';
  (p.skills || []).forEach(s => skillsEl.appendChild(el('li', null, escapeHtml(s))));

  const contactList = document.getElementById('contactList');
  contactList.innerHTML = '';
  if (p.email) contactList.appendChild(el('li', null, `<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>`));
  if (p.github) contactList.appendChild(el('li', null, `<a href="${escapeHtml(p.github)}" target="_blank" rel="noreferrer">${escapeHtml(displayUrl(p.github))}</a>`));
  if (p.linkedin) contactList.appendChild(el('li', null, `<a href="${escapeHtml(p.linkedin)}" target="_blank" rel="noreferrer">${escapeHtml(displayUrl(p.linkedin))}</a>`));

  if (p.name) document.title = `${p.name} — ${(p.role || 'Portfolio').split('—')[0].trim()}`;
}

function renderProjects(list){
  const grid = document.getElementById('workGrid');
  grid.innerHTML = '';
  (list || []).forEach(proj => {
    const article = el('article', 'project');
    article.innerHTML = `
      <h3>${escapeHtml(proj.title)}</h3>
      <p>${escapeHtml(proj.description)}</p>
      <ul class="tags">${(proj.tags || []).map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      <a href="${escapeHtml(proj.link || '#')}" class="project-link">Xem chi tiết</a>
    `;
    grid.appendChild(article);
  });
}

function renderPosts(list){
  const wrap = document.getElementById('postList');
  wrap.innerHTML = '';
  (list || [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(post => {
      const a = el('a', 'post-row');
      a.href = post.link || '#';
      a.innerHTML = `
        <div class="post-head">
          <h3>${escapeHtml(post.title)}</h3>
          <time class="post-date" datetime="${escapeHtml(post.date || '')}">${escapeHtml(formatDate(post.date))}</time>
        </div>
        <p>${escapeHtml(post.excerpt)}</p>
      `;
      wrap.appendChild(a);
    });
}

function setupNav(){
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');
  const setActive = (id) => {
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => observer.observe(section));
}

(async function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  setupNav();
  try {
    const data = await loadContent();
    renderProfile(data.profile || {});
    renderProjects(data.projects || []);
    renderPosts(data.posts || []);
  } catch (err) {
    console.error('Không tải được nội dung:', err);
  }
})();
