import { useState, useEffect } from 'preact/hooks';

const FAV_KEY  = 'itk_favorites';
const META_KEY = 'itk_favorites_products';

function readMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
  catch { return {}; }
}

function buildItems(ids, meta) {
  return ids.map(id => ({ id, ...(meta[id] || {}) }));
}

function fmt(n) {
  return n.toLocaleString('ru-RU');
}

export default function FavoritesPage() {
  const [items, setItems] = useState([]);

  function loadItems() {
    try {
      const ids = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      setItems(buildItems(ids, readMeta()));
    } catch {}
  }

  useEffect(() => {
    loadItems();

    function onUpdate() { loadItems(); }
    window.addEventListener('favorites:update', onUpdate);
    return () => window.removeEventListener('favorites:update', onUpdate);
  }, []);

  function remove(id) {
    window.FavoritesBus.remove(id);
  }

  function addToCart(item) {
    try {
      const raw   = localStorage.getItem('itk_cart_products');
      const store = raw ? JSON.parse(raw) : {};
      if (!store[item.id] && item.title) {
        store[item.id] = { title: item.title, image: item.image ?? '', price: item.price ?? 0, href: item.href ?? '#' };
        localStorage.setItem('itk_cart_products', JSON.stringify(store));
      }
    } catch {}
    window.CartBus.update(item.id, 1);
  }

  function clearAll() {
    localStorage.setItem(FAV_KEY, '[]');
    window.dispatchEvent(new CustomEvent('favorites:update', { detail: { ids: [] } }));
  }

  if (items.length === 0) {
    return (
      <div class="fp-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        <p class="fp-empty-title">Нет избранных товаров</p>
        <p class="fp-empty-sub">Добавляйте понравившиеся товары, нажимая на сердечко</p>
        <a href="/catalog/" class="fp-empty-btn">Перейти в каталог</a>
      </div>
    );
  }

  return (
    <div class="fp-page">
      <div class="fp-head">
        <div class="fp-head-left">
          <h1 class="fp-title">Избранные товары</h1>
          <span class="fp-count">{items.length} {plural(items.length, 'товар', 'товара', 'товаров')}</span>
        </div>
        <button class="fp-clear-btn" type="button" onClick={clearAll}>Очистить</button>
      </div>

      <div class="fp-grid">
        {items.map(item => (
          <div class="fp-card" key={item.id}>

            <a href={item.href || '/catalog/'} class="fp-card-img-wrap">
              {item.badge && <span class="fp-card-badge">{item.badge}</span>}
              <img
                src={item.image || 'https://placehold.co/240x240'}
                alt={item.title || ''}
                width="240"
                height="240"
                loading="lazy"
                class="fp-card-img"
              />
            </a>

            <div class="fp-card-body">
              <div class="fp-card-prices">
                <span class="fp-card-price">{fmt(item.price || 0)} ₽</span>
                {item.oldPrice && <span class="fp-card-old">{fmt(item.oldPrice)} ₽</span>}
              </div>

              <a href={item.href || '/catalog/'} class="fp-card-title">{item.title || 'Товар'}</a>

              <div class="fp-card-meta">
                {item.rating && (
                  <span class="fp-card-rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {item.rating}
                  </span>
                )}
                {item.status && (
                  <span class={`fp-card-status ${item.status}`}>
                    {item.status === 'instock' ? 'Есть в наличии' : 'Нет в наличии'}
                  </span>
                )}
                {item.article && (
                  <span class="fp-card-art">Арт. {item.article}</span>
                )}
              </div>
            </div>

            <div class="fp-card-foot">
              <button
                class="fp-cart-btn"
                type="button"
                onClick={() => addToCart(item)}
              >В корзину</button>

              <button
                class="fp-rm-btn"
                type="button"
                aria-label="Удалить из избранного"
                onClick={() => remove(item.id)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
