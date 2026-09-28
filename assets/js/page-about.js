function renderAbout(data) {
  const p = data.profile || {};
  document.getElementById('bio').textContent = p.bio || '';

  const skillsEl = document.getElementById('skills');
  skillsEl.innerHTML = '';
  (p.skills || []).forEach(s => skillsEl.appendChild(Site.el('li', null, Site.escapeHtml(s))));

  if (p.name) document.title = `Giới thiệu — ${p.name}`;
}

Site.initPage('../data/content.json', renderAbout);
