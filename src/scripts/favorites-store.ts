const STORAGE_KEY  = 'itk_favorites';
const META_KEY     = 'itk_favorites_products';

export interface FavMeta {
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
  window.dispatchEvent(new CustomEvent('favorites:update', { detail: { ids: [...ids] } }));
}

export const FavoritesStore = {
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

  saveMeta(id: string, meta: FavMeta): void {
    try {
      const raw  = localStorage.getItem(META_KEY);
      const store: Record<string, FavMeta> = raw ? JSON.parse(raw) : {};
      store[id]  = meta;
      localStorage.setItem(META_KEY, JSON.stringify(store));
    } catch {}
  },

  getMeta(): Record<string, FavMeta> {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
    catch { return {}; }
  },
};
