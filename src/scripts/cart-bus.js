import { CartStore } from './cart-store';

const CHANNEL = 'itk_cart';

const PRODUCT_META_KEY = 'itk_cart_products';

function saveProductMeta(id, meta) {
  try {
    const raw = localStorage.getItem(PRODUCT_META_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[id] = meta;
    localStorage.setItem(PRODUCT_META_KEY, JSON.stringify(store));
  } catch {}
}

const channel = new BroadcastChannel(CHANNEL);

channel.onmessage = ({ data }) => {
  if (data.type !== 'SET') return;
  CartStore.update(data.id, data.qty);
  renderCounter(data.id, data.qty);
};

export const CartBus = {
  add(id) {
    CartStore.add(id);
    broadcast(id, CartStore.qty(id));
    renderCounter(id, CartStore.qty(id));
  },

  update(id, qty) {
    CartStore.update(id, qty);
    broadcast(id, qty);
    renderCounter(id, qty);
  },

  remove(id) {
    CartStore.remove(id);
    broadcast(id, 0);
    renderCounter(id, 0);
  },

  qty:   CartStore.qty.bind(CartStore),
  count: CartStore.count,
};

function broadcast(id, qty) {
  channel.postMessage({ type: 'SET', id, qty });
}

function renderCounter(id, qty) {
  document.querySelectorAll(`button.pc-btn[data-product-id="${id}"]`).forEach(btn => {
    const foot = btn.closest('.pc-foot');
    if (!foot) return;

    const existing = foot.querySelector('.pc-counter');

    if (qty <= 0) {
      existing?.remove();
      btn.hidden = false;
      return;
    }

    if (existing) {
      const input = existing.querySelector('.pc-counter-input');
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
  });
}

document.addEventListener('click', e => {
  const t = e.target;

  const addBtn = t.closest('button.pc-btn[data-product-id]');
  if (addBtn?.dataset.productId) {
    const id = addBtn.dataset.productId;
    CartBus.add(id);
    const { productTitle, productImage, productPrice, productHref } = addBtn.dataset;
    if (productTitle) {
      saveProductMeta(id, {
        title: productTitle,
        image: productImage ?? '',
        price: Number(productPrice) || 0,
        href:  productHref ?? '#',
      });
    }
    return;
  }

  const counterBtn = t.closest('[data-action]');
  if (counterBtn) {
    const counter = counterBtn.closest('.pc-counter[data-product-id]');
    if (counter?.dataset.productId) {
      const id  = counter.dataset.productId;
      const act = counterBtn.dataset.action;
      if (act === 'plus')  CartBus.add(id);
      if (act === 'minus') CartBus.update(id, CartBus.qty(id) - 1);
    }
  }
});

document.addEventListener('change', e => {
  const input = e.target;
  if (!input.matches('.pc-counter-input')) return;
  const counter = input.closest('.pc-counter[data-product-id]');
  if (!counter?.dataset.productId) return;
  const qty = parseInt(input.value, 10);
  CartBus.update(counter.dataset.productId, isNaN(qty) ? 1 : qty);
});

window.CartBus = CartBus;

for (const [id, qty] of CartStore.entries()) {
  if (qty > 0) renderCounter(id, qty);
}