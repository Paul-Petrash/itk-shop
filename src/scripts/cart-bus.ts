import { CartStore } from './cart-store';

const CHANNEL = 'itk_cart';

// --- Product meta (title / image / price / href) keyed by product id ---

const PRODUCT_META_KEY = 'itk_cart_products';

interface ProductMeta { title: string; image: string; price: number; href: string }

function saveProductMeta(id: string, meta: ProductMeta): void {
  try {
    const raw = localStorage.getItem(PRODUCT_META_KEY);
    const store: Record<string, ProductMeta> = raw ? JSON.parse(raw) : {};
    store[id] = meta;
    localStorage.setItem(PRODUCT_META_KEY, JSON.stringify(store));
  } catch {}
}

const channel = new BroadcastChannel(CHANNEL);

// Remote tab → update store directly (no re-broadcast)
channel.onmessage = ({ data }: MessageEvent<{ type: string; id: string; qty: number }>) => {
  if (data.type !== 'SET') return;
  CartStore.update(data.id, data.qty);
  renderCounter(data.id, data.qty);
};

// Wrap mutations: call store + broadcast to other tabs
export const CartBus = {
  add(id: string): void {
    CartStore.add(id);
    broadcast(id, CartStore.qty(id));
    renderCounter(id, CartStore.qty(id));
  },

  update(id: string, qty: number): void {
    CartStore.update(id, qty);
    broadcast(id, qty);
    renderCounter(id, qty);
  },

  remove(id: string): void {
    CartStore.remove(id);
    broadcast(id, 0);
    renderCounter(id, 0);
  },

  qty:   CartStore.qty.bind(CartStore),
  count: CartStore.count,
};

function broadcast(id: string, qty: number): void {
  channel.postMessage({ type: 'SET', id, qty });
}

// --- Counter widget ---

function renderCounter(id: string, qty: number): void {
  const btn = document.querySelector<HTMLButtonElement>(
    `button.pc-btn[data-product-id="${id}"]`
  );
  if (!btn) return;

  const foot = btn.closest<HTMLElement>('.pc-foot');
  if (!foot) return;

  const existing = foot.querySelector<HTMLElement>('.pc-counter');

  if (qty <= 0) {
    existing?.remove();
    btn.hidden = false;
    return;
  }

  if (existing) {
    const input = existing.querySelector<HTMLInputElement>('.pc-counter-input');
    if (input && document.activeElement !== input) input.value = String(qty);
  } else {
    btn.hidden = true;
    const el = document.createElement('div');
    el.className = 'pc-counter';
    el.dataset.productId = id;
    el.innerHTML = `
      <button class="pc-counter-btn" type="button" data-action="minus" aria-label="Убрать">−</button>
      <input  class="pc-counter-input" type="number" value="${qty}" min="1" max="100000" aria-label="Количество">
      <button class="pc-counter-btn" type="button" data-action="plus"  aria-label="Добавить">+</button>
    `;
    btn.insertAdjacentElement('beforebegin', el);
  }
}

// --- Event delegation (one listener for the whole page) ---

document.addEventListener('click', e => {
  const t = e.target as HTMLElement;

  // "В корзину"
  const addBtn = t.closest<HTMLButtonElement>('button.pc-btn[data-product-id]');
  if (addBtn?.dataset.productId) {
    const id = addBtn.dataset.productId;
    CartBus.add(id);
    const { productTitle, productImage, productPrice, productHref } = addBtn.dataset;
    if (productTitle) {
      saveProductMeta(id, {
        title: productTitle,
        image: productImage ?? '',
        price: Number(productPrice) || 0,
        href: productHref ?? '#',
      });
    }
    return;
  }

  // ± buttons inside counter widget
  const counterBtn = t.closest<HTMLElement>('[data-action]');
  if (counterBtn) {
    const counter = counterBtn.closest<HTMLElement>('.pc-counter[data-product-id]');
    if (counter?.dataset.productId) {
      const id  = counter.dataset.productId;
      const act = counterBtn.dataset.action;
      if (act === 'plus')  CartBus.add(id);
      if (act === 'minus') CartBus.update(id, CartBus.qty(id) - 1);
    }
  }
});

// quantity input (on blur / Enter)
document.addEventListener('change', e => {
  const input = e.target as HTMLElement;
  if (!input.matches('.pc-counter-input')) return;
  const counter = input.closest<HTMLElement>('.pc-counter[data-product-id]');
  if (!counter?.dataset.productId) return;
  const qty = parseInt((input as HTMLInputElement).value, 10);
  CartBus.update(counter.dataset.productId, isNaN(qty) ? 1 : qty);
});

// --- Mutation requests from Cart dropdown / CartPage ---
window.addEventListener('cart:request-remove', ((e: CustomEvent<{ id: string }>) => {
  CartBus.remove(e.detail.id);
}) as EventListener);

window.addEventListener('cart:request-update', ((e: CustomEvent<{ id: string; qty: number }>) => {
  CartBus.update(e.detail.id, e.detail.qty);
}) as EventListener);

// --- Init: restore counter widgets for products on this page ---
for (const [id, qty] of CartStore.entries()) {
  if (qty > 0) renderCounter(id, qty);
}