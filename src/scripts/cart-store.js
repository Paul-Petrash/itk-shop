const STORAGE_KEY = 'itk_cart';

const cart = new Map(loadFromStorage());

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart]));
}

function totalCount() {
  let n = 0;
  cart.forEach(q => (n += q));
  return n;
}

function emit() {
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
  update(id, qty) {
    qty > 0 ? cart.set(id, qty) : cart.delete(id);
    persist();
    emit();
  },

  add(id) {
    this.update(id, (cart.get(id) ?? 0) + 1);
  },

  remove(id) {
    this.update(id, 0);
  },

  qty(id) {
    return cart.get(id) ?? 0;
  },

  count: totalCount,

  entries() {
    return cart.entries();
  },
};