'use strict';

// ── State ───────────────────────────────────────────────────────────────
const params   = new URLSearchParams(location.search);
const TMPL_ID  = params.get('id');

let state = {
  id:          TMPL_ID,
  name:        '新規テンプレート',
  status:      'draft',
  globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
  sections:    [],
};

let selectedId   = null;
let _fileUploadCb = null;

// ── Undo / Redo ──────────────────────────────────────────────────────────
const UNDO_LIMIT = 30;
const undoStack  = [];
let   undoPtr    = -1;
let   _undoDebounceTimer = null;

function pushUndo() {
  const snap = JSON.parse(JSON.stringify(state.sections));
  undoStack.splice(undoPtr + 1);
  undoStack.push(snap);
  if (undoStack.length > UNDO_LIMIT) undoStack.shift(); else undoPtr++;
  updateUndoBtn();
}

function performUndo() {
  if (undoPtr <= 0) return;
  undoPtr--;
  state.sections = JSON.parse(JSON.stringify(undoStack[undoPtr]));
  refreshAll();
  updateUndoBtn();
}

function performRedo() {
  if (undoPtr >= undoStack.length - 1) return;
  undoPtr++;
  state.sections = JSON.parse(JSON.stringify(undoStack[undoPtr]));
  refreshAll();
  updateUndoBtn();
}

function updateUndoBtn() {
  el('btn-undo').disabled = undoPtr <= 0;
  el('btn-redo').disabled = undoPtr >= undoStack.length - 1;
}

// ── DOM helpers ──────────────────────────────────────────────────────────
const el    = id => document.getElementById(id);
const q     = sel => document.querySelector(sel);
let _toast  = null;

function toast(msg, dur = 1800) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(_toast);
  _toast = setTimeout(() => t.classList.add('hidden'), dur);
}

// ── Section operations ───────────────────────────────────────────────────
function addSection(type) {
  const comp = COMPONENTS.find(c => c.id === type);
  state.sections.push({ id: crypto.randomUUID(), type, props: JSON.parse(JSON.stringify(comp.defaultProps)) });
  pushUndo();
  refreshAll();
}

function removeSection(id) {
  state.sections = state.sections.filter(s => s.id !== id);
  if (selectedId === id) { selectedId = null; showGlobalPanel(); }
  pushUndo();
  refreshAll();
}

function duplicateSection(id) {
  const idx = state.sections.findIndex(s => s.id === id);
  if (idx === -1) return;
  const clone = JSON.parse(JSON.stringify(state.sections[idx]));
  clone.id = crypto.randomUUID();
  state.sections.splice(idx + 1, 0, clone);
  selectedId = clone.id;
  pushUndo();
  refreshAll();
  showSectionPanel(clone.id);
}

function updateSectionProp(id, key, value) {
  const sec = state.sections.find(s => s.id === id);
  if (sec) sec.props[key] = value;
  scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
  autoSave();
  clearTimeout(_undoDebounceTimer);
  _undoDebounceTimer = setTimeout(pushUndo, 600);
}

function updateSocialItem(secId, idx, field, value) {
  const sec = state.sections.find(s => s.id === secId);
  if (sec && sec.props.items) {
    sec.props.items[idx][field] = value;
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
    autoSave();
    clearTimeout(_undoDebounceTimer);
    _undoDebounceTimer = setTimeout(pushUndo, 600);
  }
}

function addSocialItem(secId) {
  const sec = state.sections.find(s => s.id === secId);
  if (sec) {
    sec.props.items.push({ name: 'twitter', href: '#', label: 'X', iconBg: '#000000' });
    showSectionPanel(secId);
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
  }
}

function removeSocialItem(secId, idx) {
  const sec = state.sections.find(s => s.id === secId);
  if (sec && sec.props.items.length > 1) {
    sec.props.items.splice(idx, 1);
    showSectionPanel(secId);
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
  }
}

// ── Layer Panel ──────────────────────────────────────────────────────────
function renderLayerPanel() {
  const list = el('layer-list');
  el('layer-count').textContent = state.sections.length;

  if (!state.sections.length) {
    list.innerHTML = '<div class="ed-layer-empty">セクションを追加してください</div>';
    return;
  }

  list.innerHTML = '';
  state.sections.forEach(sec => {
    const comp = COMPONENTS.find(c => c.id === sec.type);
    const item = document.createElement('div');
    item.className = 'ed-layer-item' + (sec.id === selectedId ? ' active' : '');
    item.dataset.id = sec.id;
    item.innerHTML = `
      <span class="ed-layer-item__drag" title="ドラッグで並び替え">≡</span>
      <span class="ed-layer-item__icon">${comp ? comp.icon : '?'}</span>
      <span class="ed-layer-item__name">${comp ? comp.name : sec.type}</span>
      <button class="ed-layer-item__dup" data-id="${sec.id}" title="複製">⧉</button>
      <button class="ed-layer-item__del" data-id="${sec.id}" title="削除">✕</button>
    `;
    item.addEventListener('click', e => {
      if (e.target.classList.contains('ed-layer-item__del')) return;
      if (e.target.classList.contains('ed-layer-item__dup')) return;
      selectedId = sec.id;
      showSectionPanel(sec.id);
      renderLayerPanel();
    });
    item.querySelector('.ed-layer-item__dup').addEventListener('click', e => {
      e.stopPropagation();
      duplicateSection(sec.id);
    });
    item.querySelector('.ed-layer-item__del').addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('このセクションを削除しますか？')) removeSection(sec.id);
    });
    list.appendChild(item);
  });

  // SortableJS
  if (list._sortable) list._sortable.destroy();
  if (typeof Sortable === 'undefined') return;
  list._sortable = Sortable.create(list, {
    animation: 140,
    handle: '.ed-layer-item__drag',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    forceFallback: true,
    onEnd(evt) {
      if (evt.oldIndex === evt.newIndex) return;
      const [moved] = state.sections.splice(evt.oldIndex, 1);
      state.sections.splice(evt.newIndex, 0, moved);
      pushUndo();
      refreshAll();
    },
  });
}

// ── Component Panel ──────────────────────────────────────────────────────
function renderCompPanel(query = '') {
  const list = el('comp-list');
  list.innerHTML = '';
  const q = query.trim().toLowerCase();
  const filtered = q
    ? COMPONENTS.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    : COMPONENTS;
  filtered.forEach(comp => {
    const item = document.createElement('div');
    item.className = 'ed-comp-item';
    item.innerHTML = `<span class="ed-comp-item__icon">${comp.icon}</span><span class="ed-comp-item__name">${comp.name}</span>`;
    item.addEventListener('click', () => addSection(comp.id));
    list.appendChild(item);
  });
  if (filtered.length === 0) {
    list.innerHTML = '<p class="ed-comp-empty">見つかりません</p>';
  }
}

// ── Right Panel ──────────────────────────────────────────────────────────
function _setActiveTab(tab) {
  el('tab-global').classList.toggle('ed-props-tab--active', tab === 'global');
  el('tab-section').classList.toggle('ed-props-tab--active', tab === 'section');
}

function showGlobalPanel() {
  el('props-global').classList.remove('hidden');
  el('props-section').classList.add('hidden');
  _setActiveTab('global');
  selectedId = null;
}

function showSectionPanel(id) {
  const sec  = state.sections.find(s => s.id === id);
  if (!sec) return;
  const comp = COMPONENTS.find(c => c.id === sec.type);
  if (!comp) return;

  el('props-global').classList.add('hidden');
  el('props-section').classList.remove('hidden');
  _setActiveTab('section');
  el('props-title').textContent = (comp.icon || '') + ' ' + comp.name;

  const fields = el('props-fields');
  fields.innerHTML = '';

  comp.propSchema.forEach(field => {
    const val = sec.props[field.key];

    if (field.type === 'section-divider') {
      const div = document.createElement('div');
      div.className = 'ed-prop-divider';
      div.textContent = field.label;
      fields.appendChild(div);
      return;
    }

    if (field.type === 'social-list') {
      fields.appendChild(buildSocialListEditor(sec.id, sec.props.items));
      return;
    }

    const row = document.createElement('div');
    row.className = 'ed-prop-row';

    const label = document.createElement('label');
    label.className = 'ed-prop-label';
    label.textContent = field.label;
    row.appendChild(label);

    let input;

    if (field.type === 'color') {
      input = document.createElement('input');
      input.type = 'color';
      input.className = 'ed-prop-color';
      // Convert rgba/named colors to hex for <input type=color>
      input.value = toHex(val) || '#ffffff';
      input.addEventListener('input', () => updateSectionProp(id, field.key, input.value));

    } else if (field.type === 'text' || field.type === 'url') {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'ed-prop-input';
      input.value = val || '';
      input.placeholder = field.type === 'url' ? 'https://...' : '';
      input.addEventListener('input', () => updateSectionProp(id, field.key, input.value));

    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'ed-prop-textarea';
      input.value = val || '';
      input.addEventListener('input', () => updateSectionProp(id, field.key, input.value));

    } else if (field.type === 'number') {
      const wrap = document.createElement('div');
      wrap.className = 'ed-prop-number';
      input = document.createElement('input');
      input.type = 'number';
      input.className = 'ed-prop-input';
      input.value = val || 0;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      input.addEventListener('input', () => updateSectionProp(id, field.key, Number(input.value)));
      wrap.appendChild(input);
      row.appendChild(wrap);
      fields.appendChild(row);
      return;

    } else if (field.type === 'select') {
      input = document.createElement('select');
      input.className = 'ed-prop-select';
      field.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        if (val === opt.value) o.selected = true;
        input.appendChild(o);
      });
      input.addEventListener('change', () => updateSectionProp(id, field.key, input.value));

    } else if (field.type === 'toggle') {
      const wrap = document.createElement('div');
      wrap.className = 'ed-prop-toggle';
      input = document.createElement('input');
      input.type = 'checkbox'; input.checked = !!val;
      input.addEventListener('change', () => updateSectionProp(id, field.key, input.checked));
      const lbl = document.createElement('span');
      lbl.style.fontSize = '12px'; lbl.textContent = val ? 'ON' : 'OFF';
      input.addEventListener('change', () => { lbl.textContent = input.checked ? 'ON' : 'OFF'; });
      wrap.appendChild(input); wrap.appendChild(lbl);
      row.appendChild(wrap);
      fields.appendChild(row);
      return;

    } else if (field.type === 'image') {
      const wrap = document.createElement('div');
      wrap.className = 'ed-prop-image-wrap';
      const urlRow = document.createElement('div');
      urlRow.className = 'ed-prop-image-row';
      input = document.createElement('input');
      input.type = 'text'; input.className = 'ed-prop-input';
      input.value = val || ''; input.placeholder = 'https://... または ファイルを選択';
      input.addEventListener('input', () => updateSectionProp(id, field.key, input.value));
      const fileBtn = document.createElement('button');
      fileBtn.className = 'ed-btn ed-btn--ghost ed-prop-image-btn';
      fileBtn.textContent = '📁';
      fileBtn.title = 'ファイルからアップロード';
      fileBtn.addEventListener('click', () => {
        _fileUploadCb = (base64) => {
          input.value = base64;
          updateSectionProp(id, field.key, base64);
        };
        el('file-upload-input').click();
      });
      urlRow.appendChild(input); urlRow.appendChild(fileBtn);
      wrap.appendChild(urlRow);
      row.appendChild(wrap);
      fields.appendChild(row);
      return;
    }

    if (input) {
      row.appendChild(input);
      fields.appendChild(row);
    }
  });
}

function buildSocialListEditor(secId, items) {
  const wrap = document.createElement('div');
  const label = document.createElement('div');
  label.className = 'ed-prop-label'; label.textContent = 'SNSアカウント';
  wrap.appendChild(label);

  const list = document.createElement('div');
  list.className = 'ed-social-list';

  const SNS_OPTIONS = [
    { value: 'twitter',    label: 'X (Twitter)' },
    { value: 'instagram',  label: 'Instagram' },
    { value: 'facebook',   label: 'Facebook' },
    { value: 'youtube',    label: 'YouTube' },
    { value: 'linkedin',   label: 'LinkedIn' },
    { value: 'pinterest',  label: 'Pinterest' },
    { value: 'github',     label: 'GitHub' },
    { value: 'snapchat',   label: 'Snapchat' },
    { value: 'vimeo',      label: 'Vimeo' },
    { value: 'medium',     label: 'Medium' },
    { value: 'soundcloud', label: 'SoundCloud' },
    { value: 'dribbble',   label: 'Dribbble' },
  ];
  const DEFAULT_BG = {
    twitter: '#000000', instagram: '#E1306C', facebook: '#1877F2',
    youtube: '#FF0000', linkedin: '#0A66C2', pinterest: '#E60023',
    github: '#24292E', snapchat: '#FFFC00', vimeo: '#1AB7EA',
    medium: '#000000', soundcloud: '#FF5500', dribbble: '#EA4C89',
  };

  function renderItems() {
    list.innerHTML = '';
    items.forEach((item, idx) => {
      // Wrapper
      const wrap = document.createElement('div');
      wrap.className = 'ed-social-item-wrap';

      // Row 1: [color] [network select] [delete]
      const row1 = document.createElement('div');
      row1.className = 'ed-social-item';

      const colorIn = document.createElement('input');
      colorIn.type = 'color'; colorIn.className = 'ed-social-color';
      colorIn.value = toHex(item.iconBg || DEFAULT_BG[item.name] || '#999999');
      colorIn.title = 'アイコン背景色';
      colorIn.addEventListener('input', () => updateSocialItem(secId, idx, 'iconBg', colorIn.value));

      const sel = document.createElement('select');
      sel.className = 'ed-prop-select';
      SNS_OPTIONS.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        if (item.name === opt.value) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', () => {
        updateSocialItem(secId, idx, 'name', sel.value);
        const def = DEFAULT_BG[sel.value] || '#999999';
        colorIn.value = def;
        updateSocialItem(secId, idx, 'iconBg', def);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'ed-social-item__del'; delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => removeSocialItem(secId, idx));

      row1.appendChild(colorIn); row1.appendChild(sel); row1.appendChild(delBtn);

      // Row 2: [label text] [URL]
      const row2 = document.createElement('div');
      row2.className = 'ed-social-item ed-social-item--urls';

      const labelIn = document.createElement('input');
      labelIn.type = 'text'; labelIn.className = 'ed-prop-input ed-social-label';
      labelIn.value = item.label; labelIn.placeholder = '表示テキスト（空=非表示）';
      labelIn.addEventListener('input', () => updateSocialItem(secId, idx, 'label', labelIn.value));

      const urlIn = document.createElement('input');
      urlIn.type = 'text'; urlIn.className = 'ed-prop-input';
      urlIn.value = item.href; urlIn.placeholder = 'URL';
      urlIn.addEventListener('input', () => updateSocialItem(secId, idx, 'href', urlIn.value));

      row2.appendChild(labelIn); row2.appendChild(urlIn);

      wrap.appendChild(row1); wrap.appendChild(row2);
      list.appendChild(wrap);
    });
  }

  renderItems();
  wrap.appendChild(list);

  const addBtn = document.createElement('button');
  addBtn.className = 'ed-social-add'; addBtn.textContent = '+ SNSを追加';
  addBtn.addEventListener('click', () => addSocialItem(secId));
  wrap.appendChild(addBtn);

  return wrap;
}

// ── Global Style Panel ───────────────────────────────────────────────────
function syncGlobalPanel() {
  const gs = state.globalStyle;
  el('gs-bgColor').value      = toHex(gs.bgColor) || '#f4f4f4';
  el('gs-primaryColor').value = toHex(gs.primaryColor) || '#4f8ef7';
  el('gs-fontFamily').value   = gs.fontFamily;
  el('gs-maxWidth').value     = gs.maxWidth;
  el('gs-baseFontSize').value = gs.baseFontSize || 15;
  el('gs-lineHeight').value   = gs.lineHeight   || 1.8;
}

function bindGlobalPanel() {
  ['gs-bgColor', 'gs-primaryColor'].forEach(id => {
    el(id).addEventListener('input', () => {
      const key = id.replace('gs-', '');
      state.globalStyle[key] = el(id).value;
      scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
      autoSave();
    });
  });
  el('gs-fontFamily').addEventListener('change', () => {
    state.globalStyle.fontFamily = el('gs-fontFamily').value;
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
    autoSave();
  });
  el('gs-maxWidth').addEventListener('input', () => {
    state.globalStyle.maxWidth = Number(el('gs-maxWidth').value);
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
    autoSave();
  });
  el('gs-baseFontSize').addEventListener('input', () => {
    state.globalStyle.baseFontSize = Number(el('gs-baseFontSize').value);
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
    autoSave();
  });
  el('gs-lineHeight').addEventListener('input', () => {
    state.globalStyle.lineHeight = el('gs-lineHeight').value;
    scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
    autoSave();
  });
}

// ── Utility: color to hex ────────────────────────────────────────────────
function toHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#') && (color.length === 4 || color.length === 7)) return color;
  // rgba/rgb → strip alpha and convert to hex via canvas
  try {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 1;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  } catch { return '#000000'; }
}

// ── Save / Export ────────────────────────────────────────────────────────
function autoSave() {
  const upd = { name: el('ed-name').value.trim() || '新規テンプレート', globalStyle: state.globalStyle, sections: state.sections };
  if (state.id) {
    storeUpdate(state.id, upd);
  } else if (state.sections.length > 0) {
    const created = storeCreate(upd);
    state.id = created.id;
    history.replaceState({}, '', `?id=${state.id}`);
  }
}

function saveNow() {
  autoSave();
  toast('✓ 保存しました');
}

async function exportHtml(mode) {
  const html = getLastHtml();
  if (!html) {
    toast('⚠️ HTMLの生成に失敗しました。セクションを確認してください。', 4000);
    return;
  }
  const htmlBytes = new Blob([html]).size;
  if (htmlBytes > 95000) {
    toast(`⚠️ HTMLサイズ ${Math.round(htmlBytes / 1024)}KB — Gmail 102KB制限を超過しています。画像はBase64ではなく外部URLを使用してください。`, 5000);
  }
  if (mode === 'dl') {
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = (el('ed-name').value.trim() || 'email') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    try {
      await navigator.clipboard.writeText(html);
      toast('✓ クリップボードにコピーしました');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = html;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('✓ クリップボードにコピーしました');
    }
  }
}

async function exportPlainText() {
  const html = getLastHtml();
  if (!html) { toast('⚠️ テキスト生成に失敗しました', 3000); return; }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('style, script, head').forEach(n => n.remove());
  const raw = (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  try {
    await navigator.clipboard.writeText(raw);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = raw; ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  }
  toast('✓ テキスト版をコピーしました（マルチパート用）');
}

// ── Refresh all ──────────────────────────────────────────────────────────
function refreshAll() {
  renderLayerPanel();
  scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));
  autoSave();
}

// ── Init ─────────────────────────────────────────────────────────────────
function init() {
  // Load existing template or start fresh
  if (TMPL_ID) {
    const tmpl = storeGet(TMPL_ID);
    if (tmpl) {
      state.id          = tmpl.id;
      state.name        = tmpl.name;
      state.globalStyle = { baseFontSize: 15, lineHeight: '1.8', ...tmpl.globalStyle };
      state.sections    = tmpl.sections;
      el('ed-name').value = tmpl.name;
    }
  }

  syncGlobalPanel();
  bindGlobalPanel();
  renderCompPanel();
  el('comp-search').addEventListener('input', e => renderCompPanel(e.target.value));
  renderLayerPanel();
  pushUndo();  // initial snapshot

  // Initial render
  scheduleRender(state.sections, state.globalStyle, el('preview-frame'), el('render-error'));

  // Toolbar: save
  el('btn-save').addEventListener('click', saveNow);
  el('ed-name').addEventListener('input', () => {
    state.name = el('ed-name').value.trim();
    autoSave();
  });

  // Toolbar: undo
  el('btn-undo').addEventListener('click', performUndo);
  el('btn-redo').addEventListener('click', performRedo);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') { e.preventDefault(); performRedo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); performUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); performRedo(); }
  });

  // Export dropdown
  el('btn-export-trigger').addEventListener('click', () => {
    el('export-menu').classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.ed-dropdown')) el('export-menu').classList.add('hidden');
  });
  el('btn-export-dl').addEventListener('click',   () => { el('export-menu').classList.add('hidden'); exportHtml('dl'); });
  el('btn-export-copy').addEventListener('click', () => { el('export-menu').classList.add('hidden'); exportHtml('copy'); });
  el('btn-export-text').addEventListener('click', () => { el('export-menu').classList.add('hidden'); exportPlainText(); });

  // Preview toggle
  el('btn-pc').addEventListener('click', function() {
    el('preview-frame').className = 'ed-preview-frame ed-preview-frame--pc';
    this.classList.add('ed-btn--active'); el('btn-mobile').classList.remove('ed-btn--active');
  });
  el('btn-mobile').addEventListener('click', function() {
    el('preview-frame').className = 'ed-preview-frame ed-preview-frame--mobile';
    this.classList.add('ed-btn--active'); el('btn-pc').classList.remove('ed-btn--active');
  });

  // Props tabs
  el('tab-global').addEventListener('click', () => { showGlobalPanel(); renderLayerPanel(); });
  el('tab-section').addEventListener('click', () => {
    if (selectedId) showSectionPanel(selectedId);
  });

  // Props close
  el('btn-props-close').addEventListener('click', () => {
    selectedId = null;
    showGlobalPanel();
    renderLayerPanel();
  });

  // File upload
  el('file-upload-input').addEventListener('change', function() {
    const file = this.files[0];
    if (!file || !_fileUploadCb) return;
    if (!confirm(`⚠️ 画像をBase64で埋め込みます。\nHTMLサイズが増大しGmailの102KB制限に抵触する可能性があります。\n\n外部URL入力の使用を推奨します。\n\nそれでも続行しますか？`)) {
      this.value = ''; _fileUploadCb = null; return;
    }
    const reader = new FileReader();
    reader.onload = e => { _fileUploadCb(e.target.result); _fileUploadCb = null; };
    reader.readAsDataURL(file);
    this.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
