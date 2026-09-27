// Client-side only. There is no server here, so this passphrase is just a
// deterrent against casual visitors — anyone can read it from this file.
// For real access control, restrict /admin at the hosting level (see README).
const PASSPHRASE = 'osa2026';

const DRAFT_KEY = 'osa_admin_draft';
const PREVIEW_KEY = 'osa_preview_content';

let state = { profile: {}, projects: [], posts: [] };

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/* ---------------- Gate ---------------- */
const gate = document.getElementById('gate');
const editor = document.getElementById('editor');
const gatePassword = document.getElementById('gatePassword');
const gateSubmit = document.getElementById('gateSubmit');

function tryEnter(){
  if (gatePassword.value === PASSPHRASE) {
    gate.style.display = 'none';
    editor.hidden = false;
    initEditor();
  } else {
    alert('Sai mật khẩu.');
  }
}
gateSubmit.addEventListener('click', tryEnter);
gatePassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryEnter(); });

/* ---------------- Load / save state ---------------- */
async function fetchDefaults(){
  const res = await fetch('../data/content.json', { cache: 'no-store' });
  return res.json();
}

async function loadInitialState(){
  const draft = localStorage.getItem(DRAFT_KEY);
  if (draft) {
    try { return JSON.parse(draft); } catch (e) { /* ignore corrupt draft */ }
  }
  return fetchDefaults();
}

function saveDraft(){
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

/* ---------------- Profile form ---------------- */
const fields = ['name', 'kicker', 'role', 'lede', 'bio', 'email', 'github', 'linkedin', 'contactText'];

function bindProfileForm(){
  fields.forEach(key => {
    const input = document.getElementById(`f-${key}`);
    input.addEventListener('input', () => {
      state.profile[key] = input.value;
      saveDraft();
    });
  });

  const skillsInput = document.getElementById('f-skills');
  skillsInput.addEventListener('input', () => {
    state.profile.skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    saveDraft();
  });

  const avatarInput = document.getElementById('f-avatar');
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.profile.avatar = reader.result;
      renderAvatarPreview();
      saveDraft();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('clearAvatar').addEventListener('click', () => {
    state.profile.avatar = '';
    document.getElementById('f-avatar').value = '';
    renderAvatarPreview();
    saveDraft();
  });
}

function renderAvatarPreview(){
  const img = document.getElementById('avatarPreview');
  const fallback = document.getElementById('avatarPreviewFallback');
  if (state.profile.avatar) {
    img.src = state.profile.avatar;
    img.style.display = 'block';
    fallback.style.display = 'none';
  } else {
    fallback.textContent = (state.profile.name || 'O').trim().charAt(0).toUpperCase();
    fallback.style.display = 'flex';
    img.style.display = 'none';
  }
}

function populateProfileForm(){
  fields.forEach(key => {
    document.getElementById(`f-${key}`).value = state.profile[key] || '';
  });
  document.getElementById('f-skills').value = (state.profile.skills || []).join(', ');
  renderAvatarPreview();
}

/* ---------------- Repeating lists (projects / posts) ---------------- */
function renderRepeatList({ containerId, templateId, items, fieldsMap, onChange }){
  const container = document.getElementById(containerId);
  const template = document.getElementById(templateId);
  container.innerHTML = '';

  items.forEach((item, index) => {
    const node = template.content.cloneNode(true);
    const wrapper = node.querySelector('.repeat-item');
    wrapper.dataset.index = index;

    Object.entries(fieldsMap).forEach(([field, transform]) => {
      const input = wrapper.querySelector(`[data-field="${field}"]`);
      input.value = transform ? transform.toForm(item[field]) : (item[field] || '');
      input.addEventListener('input', () => {
        items[index][field] = transform ? transform.fromForm(input.value) : input.value;
        onChange();
        saveDraft();
      });
    });

    wrapper.querySelector('.remove-btn').addEventListener('click', () => {
      items.splice(index, 1);
      onChange();
      saveDraft();
    });

    container.appendChild(wrapper);
  });
}

const tagsTransform = {
  toForm: (v) => (v || []).join(', '),
  fromForm: (v) => v.split(',').map(s => s.trim()).filter(Boolean)
};

function renderProjects(){
  renderRepeatList({
    containerId: 'projectList',
    templateId: 'projectTemplate',
    items: state.projects,
    fieldsMap: { title: null, description: null, tags: tagsTransform, link: null },
    onChange: renderProjects
  });
}

function renderPosts(){
  renderRepeatList({
    containerId: 'postList',
    templateId: 'postTemplate',
    items: state.posts,
    fieldsMap: { title: null, date: null, excerpt: null, link: null },
    onChange: renderPosts
  });
}

document.getElementById('addProject').addEventListener('click', () => {
  state.projects.push({ title: '', description: '', tags: [], link: '#' });
  renderProjects();
  saveDraft();
});

document.getElementById('addPost').addEventListener('click', () => {
  state.posts.unshift({ title: '', date: new Date().toISOString().slice(0, 10), excerpt: '', link: '#' });
  renderPosts();
  saveDraft();
});

/* ---------------- Top actions ---------------- */
document.getElementById('resetBtn').addEventListener('click', async () => {
  if (!confirm('Khôi phục toàn bộ nội dung về mặc định? Bản nháp hiện tại sẽ mất.')) return;
  state = await fetchDefaults();
  populateProfileForm();
  renderProjects();
  renderPosts();
  saveDraft();
});

document.getElementById('previewBtn').addEventListener('click', () => {
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(state));
  window.open('../index.html', '_blank');
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = JSON.parse(reader.result);
      state.projects = state.projects || [];
      state.posts = state.posts || [];
      state.profile = state.profile || {};
      populateProfileForm();
      renderProjects();
      renderPosts();
      saveDraft();
    } catch (err) {
      alert('File JSON không hợp lệ.');
    }
  };
  reader.readAsText(file);
});

/* ---------------- Init ---------------- */
async function initEditor(){
  state = await loadInitialState();
  state.projects = state.projects || [];
  state.posts = state.posts || [];
  state.profile = state.profile || {};
  bindProfileForm();
  populateProfileForm();
  renderProjects();
  renderPosts();
}
