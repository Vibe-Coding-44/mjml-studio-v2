'use strict';

const STORE_KEY = 'email_gen_templates';

function _storeLoad() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
}

function _storeSave(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert('⚠️ 保存領域(localStorage)が満杯です。古いテンプレートを削除してください。');
    }
  }
}

function storeGetAll() {
  return _storeLoad();
}

function storeGet(id) {
  return _storeLoad().find(t => t.id === id) || null;
}

function storeCreate({ name = '新規テンプレート', baseTemplate = 'blank', globalStyle, sections } = {}) {
  const list = _storeLoad();
  const now = new Date().toISOString();
  const tmpl = {
    id: crypto.randomUUID(),
    name,
    status: 'draft',
    baseTemplate,
    createdAt: now,
    updatedAt: now,
    thumbnail: null,
    globalStyle: globalStyle || {
      bgColor: '#f4f4f4',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      primaryColor: '#4f8ef7',
      maxWidth: 600,
      baseFontSize: 15,
      lineHeight: '1.8',
    },
    sections: sections ? JSON.parse(JSON.stringify(sections)) : [],
  };
  list.push(tmpl);
  _storeSave(list);
  return tmpl;
}

function storeUpdate(id, updates) {
  const list = _storeLoad();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const safeUpdates = { ...updates };
  if (updates.sections)    safeUpdates.sections    = JSON.parse(JSON.stringify(updates.sections));
  if (updates.globalStyle) safeUpdates.globalStyle = JSON.parse(JSON.stringify(updates.globalStyle));
  list[idx] = { ...list[idx], ...safeUpdates, updatedAt: new Date().toISOString() };
  _storeSave(list);
  return list[idx];
}

function storeRemove(id) {
  _storeSave(_storeLoad().filter(t => t.id !== id));
}

function storeDuplicate(id) {
  const original = storeGet(id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy = { ...JSON.parse(JSON.stringify(original)), id: crypto.randomUUID(), name: original.name + ' のコピー', createdAt: now, updatedAt: now, thumbnail: null };
  const list = _storeLoad();
  list.push(copy);
  _storeSave(list);
  return copy;
}

function storeSetThumbnail(id, svgDataUrl) {
  storeUpdate(id, { thumbnail: svgDataUrl });
}
