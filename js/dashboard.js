'use strict';

let _ctxId = null;  // template ID for context menu

// ── Render card grid ─────────────────────────────────────────────────────
function renderGrid(filter = '', statusFilter = '') {
  let list = storeGetAll().filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  if (statusFilter) list = list.filter(t => (t.status || 'draft') === statusFilter);
  const grid   = document.getElementById('card-grid');
  const empty  = document.getElementById('db-empty');
  const count  = document.getElementById('db-count');

  count.textContent = `${list.length} 件`;

  if (!list.length) {
    grid.innerHTML = ''; empty.classList.remove('hidden'); return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = '';
  list.slice().reverse().forEach(tmpl => {
    const card = document.createElement('div');
    card.className = 'db-card';
    card.dataset.id = tmpl.id;

    const updAt = new Date(tmpl.updatedAt).toLocaleDateString('ja-JP');
    const thumb = tmpl.thumbnail || getDefaultThumb(tmpl.baseTemplate);
    const status = tmpl.status === 'complete' ? 'complete' : 'draft';
    const statusLabel = status === 'complete' ? '完了' : '下書き';

    card.innerHTML = `
      <div class="db-card__thumb">
        ${thumb}
        <div class="db-card__thumb-overlay">
          <button class="db-card__edit-btn" data-id="${tmpl.id}">✏️ 編集</button>
        </div>
      </div>
      <div class="db-card__body">
        <div class="db-card__info">
          <div class="db-card__name" title="${tmpl.name}">${tmpl.name}</div>
          <div class="db-card__meta">${updAt} <span class="db-card__status db-card__status--${status}">${statusLabel}</span></div>
        </div>
        <button class="db-card__menu-btn" data-id="${tmpl.id}" title="メニュー">⋮</button>
      </div>
    `;

    card.querySelector('.db-card__edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      location.href = `editor.html?id=${tmpl.id}`;
    });
    card.querySelector('.db-card__menu-btn').addEventListener('click', e => {
      e.stopPropagation();
      openCtxMenu(tmpl.id, e.clientX, e.clientY);
    });
    card.addEventListener('click', () => location.href = `editor.html?id=${tmpl.id}`);

    grid.appendChild(card);
  });
}

function getDefaultThumb(baseTemplate) {
  const t = templateGet(baseTemplate);
  return t ? t.svg : `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#f4f4f4"/><text x="60" y="84" text-anchor="middle" font-size="11" fill="#aaa">BLANK</text></svg>`;
}

// ── Context Menu ─────────────────────────────────────────────────────────
function openCtxMenu(id, x, y) {
  _ctxId = id;
  const menu = document.getElementById('ctx-menu');
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  menu.classList.remove('hidden');
}

function closeCtxMenu() {
  document.getElementById('ctx-menu').classList.add('hidden');
  _ctxId = null;
}

document.addEventListener('click', closeCtxMenu);

document.getElementById('ctx-menu').addEventListener('click', async e => {
  const action = e.target.dataset.action;
  if (!action || !_ctxId) return;
  closeCtxMenu();

  if (action === 'edit') {
    location.href = `editor.html?id=${_ctxId}`;
  } else if (action === 'duplicate') {
    storeDuplicate(_ctxId);
    { const f = _getFilters(); renderGrid(f.text, f.status); }
  } else if (action === 'export') {
    const tmpl = storeGet(_ctxId);
    if (!tmpl) return;
    const mjmlStr = buildMJML(tmpl.sections, tmpl.globalStyle);
    const result  = await window.mjml(mjmlStr, { validationLevel: 'soft' });
    const blob    = new Blob([result.html], { type: 'text/html' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url; a.download = (tmpl.name || 'email') + '.html'; a.click();
    URL.revokeObjectURL(url);
  } else if (action === 'delete') {
    if (confirm(`「${storeGet(_ctxId)?.name}」を削除しますか？この操作は取り消せません。`)) {
      storeRemove(_ctxId);
      { const f = _getFilters(); renderGrid(f.text, f.status); }
    }
  }
});

// ── Template Picker ──────────────────────────────────────────────────────
function openPicker() {
  const overlay = document.getElementById('picker-overlay');
  const grid    = document.getElementById('picker-grid');
  grid.innerHTML = '';

  templateGetAll().forEach(t => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.innerHTML = `
      <div class="picker-item__thumb">${t.svg}</div>
      <div class="picker-item__label">
        <div class="picker-item__name">${t.name}</div>
        <div class="picker-item__desc">${t.desc}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      const built  = templateBuild(t.id);
      const newTmpl = storeCreate({ name: t.name, baseTemplate: t.id, globalStyle: built.globalStyle, sections: built.sections });
      overlay.classList.add('hidden');
      location.href = `editor.html?id=${newTmpl.id}`;
    });
    grid.appendChild(item);
  });

  overlay.classList.remove('hidden');
}

document.getElementById('picker-close').addEventListener('click', () => {
  document.getElementById('picker-overlay').classList.add('hidden');
});
document.getElementById('picker-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

// ── Search ───────────────────────────────────────────────────────────────
function _getFilters() {
  return {
    text:   document.getElementById('search-input').value,
    status: document.getElementById('status-filter').value,
  };
}
document.getElementById('search-input').addEventListener('input', () => { const f = _getFilters(); renderGrid(f.text, f.status); });
document.getElementById('status-filter').addEventListener('change', () => { const f = _getFilters(); renderGrid(f.text, f.status); });

// ── New buttons ──────────────────────────────────────────────────────────
document.getElementById('btn-new').addEventListener('click', openPicker);
document.getElementById('btn-new2').addEventListener('click', openPicker);

// ── Init ─────────────────────────────────────────────────────────────────
renderGrid('', '');
