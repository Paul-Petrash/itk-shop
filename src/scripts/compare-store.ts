const STORAGE_KEY = 'itk_compare';
const META_KEY    = 'itk_compare_products';

export interface CmpMeta {
  title: string;
  image: string;
  price: number;
  href: string;
  oldPrice?: number;
  rating?: number;
  status?: string;
  article?: string;
  badge?: string;
}

const ids = new Set<string>(load());

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function emit(): void {
  window.dispatchEvent(new CustomEvent('compare:update', { detail: { ids: [...ids] } }));
}

export const CompareStore = {
  toggle(id: string): boolean {
    ids.has(id) ? ids.delete(id) : ids.add(id);
    persist();
    emit();
    return ids.has(id);
  },

  remove(id: string): void {
    ids.delete(id);
    persist();
    emit();
  },

  has(id: string): boolean { return ids.has(id); },

  entries(): string[] { return [...ids]; },

  saveMeta(id: string, meta: CmpMeta): void {
    try {
      const raw   = localStorage.getItem(META_KEY);
      const store: Record<string, CmpMeta> = raw ? JSON.parse(raw) : {};
      store[id]   = meta;
      localStorage.setItem(META_KEY, JSON.stringify(store));
    } catch {}
  },

  getMeta(): Record<string, CmpMeta> {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
    catch { return {}; }
  },
};
