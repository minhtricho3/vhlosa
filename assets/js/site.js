const Site = (function () {
  const PREVIEW_KEY = 'osa_preview_content';

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function displayUrl(url) { return String(url ?? '').replace(/^https?:\/\//, ''); }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('vi-VN');
  }

  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  async function loadContent(contentPath) {
    // A draft saved by the admin page (same browser) takes priority, so
    // "Xem trước" reflects unsaved edits without needing a redeploy.
    const draft = localStorage.getItem(PREVIEW_KEY);
    if (draft) {
      try { return JSON.parse(draft); } catch (e) { /* fall through to fetch */ }
    }
    const res = await fetch(contentPath, { cache: 'no-store' });
    return res.json();
  }

  function renderAvatar(profile, imgId, fallbackId) {
    const img = document.getElementById(imgId);
    const fallback = document.getElementById(fallbackId);
    if (!img || !fallback) return;
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

  function setupNav() {
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');
    if (navToggle && navList) {
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
    }

    // Highlight the nav link matching the current page (multi-page site now,
    // so this is a path comparison rather than scroll-spy).
    const here = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    document.querySelectorAll('[data-nav]').forEach(link => {
      const target = link.getAttribute('href').replace(/\/$/, '') || '/';
      link.classList.toggle('active', target === here);
    });
  }

  function showMaintenance(message) {
    document.querySelectorAll('body > *').forEach(node => {
      if (node.id !== 'bg-particles' && !node.classList.contains('ambient')) node.style.display = 'none';
    });
    const screen = el('div', 'maintenance');
    screen.innerHTML = `
      <div class="maintenance-box">
        <span class="brand">Osa</span>
        <div class="maintenance-pulse"></div>
        <h1>Đang bảo trì</h1>
        <p>${escapeHtml(message || 'Trang đang được nâng cấp, quay lại sau nhé!')}</p>
      </div>
    `;
    document.body.appendChild(screen);
  }

  // contentPath: relative path to data/content.json from the current page.
  // renderFn(data): called only when the site is not in maintenance mode.
  async function initPage(contentPath, renderFn) {
    setupNav();
    document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
    try {
      const data = await loadContent(contentPath);
      if (data.site && data.site.maintenanceMode) {
        showMaintenance(data.site.maintenanceMessage);
        return;
      }
      renderFn(data);
    } catch (err) {
      console.error('Không tải được nội dung:', err);
    }
  }

  return { escapeHtml, displayUrl, formatDate, el, loadContent, renderAvatar, setupNav, showMaintenance, initPage };
})();
