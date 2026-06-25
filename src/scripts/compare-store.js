const STORAGE_KEY = 'itk_compare';
const META_KEY    = 'itk_compare_products';

const ids = new Set(load());

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function emit() {
  window.dispatchEvent(new CustomEvent('compare:update', { detail: { ids: [...ids] } }));
}

export const CompareStore = {
  toggle(id) {
    ids.has(id) ? ids.delete(id) : ids.add(id);
    persist();
    emit();
    return ids.has(id);
  },

  remove(id) {
    ids.delete(id);
    persist();
    emit();
  },

  has(id) { return ids.has(id); },

  entries() { return [...ids]; },

  saveMeta(id, meta) {
    try {
      const raw   = localStorage.getItem(META_KEY);
      const store = raw ? JSON.parse(raw) : {};
      store[id]   = meta;
      localStorage.setItem(META_KEY, JSON.stringify(store));
    } catch {}
  },

  getMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
    catch { return {}; }
  },
};