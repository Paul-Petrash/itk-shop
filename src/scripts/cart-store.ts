const STORAGE_KEY = 'itk_cart';

// in-memory state
const cart = new Map<string, number>(loadFromStorage());

function loadFromStorage(): [string, number][] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart]));
}

function totalCount(): number {
  let n = 0;
  cart.forEach(q => (n += q));
  return n;
}

function emit(): void {
  window.dispatchEvent(
    new CustomEvent('cart:update', {
      detail: {
        items: [...cart.entries()].map(([id, qty]) => ({ id, qty })),
        count: totalCount(),
      },
    })
  );
}

export const CartStore = {
  /** Update quantity. qty <= 0 removes item. Does not broadcast — use CartBus for that. */
  update(id: string, qty: number): void {
    qty > 0 ? cart.set(id, qty) : cart.delete(id);
    persist();
    emit();
  },

  add(id: string): void {
    this.update(id, (cart.get(id) ?? 0) + 1);
  },

  remove(id: string): void {
    this.update(id, 0);
  },

  qty(id: string): number {
    return cart.get(id) ?? 0;
  },

  count: totalCount,

  /** Read-only snapshot for initialisation */
  entries(): IterableIterator<[string, number]> {
    return cart.entries();
  },
};