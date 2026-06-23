import { useState, useEffect } from 'preact/hooks';

const CART_KEY     = 'itk_cart';
const META_KEY     = 'itk_cart_products';

function readMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function buildItems(pairs, meta) {
  return pairs
    .map(([id, qty]) => ({ id, qty, ...(meta[id] || {}) }))
    .filter(i => i.title);
}

export default function Cart({ cartSrc }) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const entries = JSON.parse(raw);
        setCount(entries.reduce((s, [, q]) => s + q, 0));
        setItems(buildItems(entries, readMeta()));
      }
    } catch {}

    function onUpdate(e) {
      setCount(e.detail.count);
      setItems(buildItems(e.detail.items.map(i => [i.id, i.qty]), readMeta()));
    }
    window.addEventListener('cart:update', onUpdate);
    return () => window.removeEventListener('cart:update', onUpdate);
  }, []);

  function remove(id) {
    window.dispatchEvent(new CustomEvent('cart:request-remove', { detail: { id } }));
  }

  const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  return (
    <div class="ha-c-wrap">
      <a href="/cart/" class="ha-c">
        <span class="ha-ci">
          <img src={cartSrc} width="20" height="20" alt="" />
          {count > 0 && <span class="bdg">{count}</span>}
        </span>
        <span>Корзина</span>
      </a>

      {count > 0 && (
        <div class="cart-drop">
          <ul class="cart-drop__list">
            {items.map(item => (
              <li class="cart-drop__item" key={item.id}>
                <a href={item.href} class="cart-drop__thumb">
                  <img src={item.image} alt={item.title} width="56" height="56" />
                </a>
                <div class="cart-drop__info">
                  <div class="cart-drop__price">
                    {(item.price || 0).toLocaleString('ru-RU')} ₽
                    {item.qty > 1 && (
                      <span class="cart-drop__qty"> × {item.qty} шт</span>
                    )}
                  </div>
                  <a href={item.href} class="cart-drop__title">{item.title}</a>
                </div>
                <button
                  class="cart-drop__rm"
                  type="button"
                  aria-label="Удалить"
                  onClick={() => remove(item.id)}
                >×</button>
              </li>
            ))}
          </ul>
          <div class="cart-drop__foot">
            <div class="cart-drop__row">
              <span>Итого</span>
              <span class="cart-drop__sum">{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <a href="/cart/" class="cart-drop__go">В корзину</a>
          </div>
        </div>
      )}
    </div>
  );
}