function renderContact(data) {
  const p = data.profile || {};
  document.getElementById('contactText').textContent = p.contactText || '';

  const list = document.getElementById('contactList');
  list.innerHTML = '';
  if (p.email) list.appendChild(Site.el('li', null, `<a href="mailto:${Site.escapeHtml(p.email)}">${Site.escapeHtml(p.email)}</a>`));
  if (p.github) list.appendChild(Site.el('li', null, `<a href="${Site.escapeHtml(p.github)}" target="_blank" rel="noreferrer">${Site.escapeHtml(Site.displayUrl(p.github))}</a>`));
  if (p.linkedin) list.appendChild(Site.el('li', null, `<a href="${Site.escapeHtml(p.linkedin)}" target="_blank" rel="noreferrer">${Site.escapeHtml(Site.displayUrl(p.linkedin))}</a>`));

  if (p.name) document.title = `Liên hệ — ${p.name}`;
}

Site.initPage('../data/content.json', renderContact);
