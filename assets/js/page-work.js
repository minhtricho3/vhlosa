function renderWork(data) {
  const grid = document.getElementById('workGrid');
  grid.innerHTML = '';
  (data.projects || []).forEach(proj => {
    const article = Site.el('article', 'project');
    article.innerHTML = `
      <h3>${Site.escapeHtml(proj.title)}</h3>
      <p>${Site.escapeHtml(proj.description)}</p>
      <ul class="tags">${(proj.tags || []).map(t => `<li>${Site.escapeHtml(t)}</li>`).join('')}</ul>
      <a href="${Site.escapeHtml(proj.link || '#')}" class="project-link">Xem chi tiết</a>
    `;
    grid.appendChild(article);
  });

  if (data.profile && data.profile.name) document.title = `Dự án — ${data.profile.name}`;
}

Site.initPage('../data/content.json', renderWork);
