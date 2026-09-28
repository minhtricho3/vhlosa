function renderBlog(data) {
  const wrap = document.getElementById('postList');
  wrap.innerHTML = '';
  (data.posts || [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(post => {
      const a = Site.el('a', 'post-row');
      a.href = post.link || '#';
      a.innerHTML = `
        <div class="post-head">
          <h3>${Site.escapeHtml(post.title)}</h3>
          <time class="post-date" datetime="${Site.escapeHtml(post.date || '')}">${Site.escapeHtml(Site.formatDate(post.date))}</time>
        </div>
        <p>${Site.escapeHtml(post.excerpt)}</p>
      `;
      wrap.appendChild(a);
    });

  if (data.profile && data.profile.name) document.title = `Blog — ${data.profile.name}`;
}

Site.initPage('../data/content.json', renderBlog);
