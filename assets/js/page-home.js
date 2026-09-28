function renderHome(data) {
  const p = data.profile || {};

  document.getElementById('kicker').textContent = p.kicker || '';
  document.getElementById('name').textContent = p.name || '';
  document.getElementById('role').textContent = p.role || '';
  document.getElementById('lede').textContent = p.lede || '';
  Site.renderAvatar(p, 'avatar', 'avatarFallback');
  if (p.name) document.title = `${p.name} — ${(p.role || 'Portfolio').split('—')[0].trim()}`;

  // About teaser: first ~160 chars of the bio.
  const bio = p.bio || '';
  const short = bio.length > 160 ? bio.slice(0, 160).trim() + '…' : bio;
  document.getElementById('aboutTeaser').textContent = short;

  // Work teaser: first 2 projects.
  const workTeaser = document.getElementById('workTeaser');
  workTeaser.innerHTML = '';
  (data.projects || []).slice(0, 2).forEach(proj => {
    workTeaser.appendChild(Site.el('article', 'project', `
      <h3>${Site.escapeHtml(proj.title)}</h3>
      <p>${Site.escapeHtml(proj.description)}</p>
      <ul class="tags">${(proj.tags || []).map(t => `<li>${Site.escapeHtml(t)}</li>`).join('')}</ul>
    `));
  });

  // Blog teaser: 2 most recent posts.
  const blogTeaser = document.getElementById('blogTeaser');
  blogTeaser.innerHTML = '';
  (data.posts || [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 2)
    .forEach(post => {
      const a = Site.el('a', 'post-row');
      a.href = post.link || '#';
      a.innerHTML = `
        <div class="post-head">
          <h3>${Site.escapeHtml(post.title)}</h3>
          <time class="post-date">${Site.escapeHtml(Site.formatDate(post.date))}</time>
        </div>
        <p>${Site.escapeHtml(post.excerpt)}</p>
      `;
      blogTeaser.appendChild(a);
    });
}

Site.initPage('data/content.json', renderHome);
