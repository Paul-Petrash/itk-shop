import { useState, useEffect } from 'preact/hooks';
import './CartPage.css';

const CART_KEY = 'itk_cart';
const META_KEY = 'itk_cart_products';

function readMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
  catch { return {}; }
}

function buildItems(pairs, meta) {
  return pairs.map(([id, qty]) => ({ id, qty, ...(meta[id] || {}) }));
}

function fmt(n) {
  return n.toLocaleString('ru-RU');
}

// TODO: брать из данных товара
const HARDCODED_ARTICLE = '0033185';
const HARDCODED_DEPOSIT = 450;
const GIFT_THRESHOLD    = 1005; // ₽ до следующего подарка — заменить на динамику

// TODO: брать с API
const GIFTS = [
  {
    id: 'g1',
    image: 'https://placehold.co/200x200',
    title: 'Вода Аква Ареал 0.33 л без газа, ПЭТ (24 шт.)',
    price: 780,
    oldPrice: 1115,
    badge: 'Только для вас',
    discount: '-30%',
  },
  {
    id: 'g2',
    image: 'https://placehold.co/200x200',
    title: 'Стакан одноразовый бумажный 200 мл (50 шт.)',
    price: 0,
    oldPrice: 320,
    badge: 'Подарок',
    discount: '-100%',
  },
  {
    id: 'g3',
    image: 'https://placehold.co/200x200',
    title: 'Помпа механическая для бутыли 19 л',
    price: 0,
    oldPrice: 290,
    badge: 'Подарок',
    discount: '-100%',
  },
  {
    id: 'g4',
    image: 'https://placehold.co/200x200',
    title: 'Фильтр-насадка на кран (1 шт.)',
    price: 199,
    oldPrice: 450,
    badge: 'Только для вас',
    discount: '-56%',
  },
];

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(buildItems(JSON.parse(raw), readMeta()));
    } catch {}

    function onUpdate(e) {
      setItems(buildItems(e.detail.items.map(i => [i.id, i.qty]), readMeta()));
    }
    window.addEventListener('cart:update', onUpdate);
    return () => window.removeEventListener('cart:update', onUpdate);
  }, []);

  function setQty(id, qty) {
    window.dispatchEvent(new CustomEvent('cart:request-update', { detail: { id, qty: Math.max(1, qty) } }));
  }

  function remove(id) {
    window.dispatchEvent(new CustomEvent('cart:request-remove', { detail: { id } }));
  }

  const goodsTotal = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  if (items.length === 0) {
    return (
      <div class="cp-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p class="cp-empty-title">Корзина пуста</p>
        <p class="cp-empty-sub">Добавьте товары из каталога</p>
        <a href="/catalog/" class="cp-empty-btn">Перейти в каталог</a>
      </div>
    );
  }

  return (
    <div class="cp-layout">

      {/* ── Список товаров ── */}
      <section class="cp-items">
        <div class="cp-items-head">
          <h1 class="cp-items-title">Корзина</h1>
          <span class="cp-items-count">{items.length} {plural(items.length, 'товар', 'товара', 'товаров')}</span>
        </div>

        {/* Баннер подарка */}
        <div class="cp-gift-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
          </svg>
          <span>Выберите подарок или закажите ещё на <strong>{fmt(GIFT_THRESHOLD)} ₽</strong>, чтобы получить более ценный подарок!</span>
        </div>

        <div class="cp-list">
          {items.map(item => {
            const price = item.price || 0;
            const sum   = price * item.qty;
            return (
              <div class="cp-item" key={item.id}>

                {/* Изображение */}
                <a href={item.href || '/catalog/'} class="cp-item-img">
                  <img src={item.image || ''} alt={item.title || ''} width="100" height="100" loading="lazy" />
                </a>

                {/* Инфо: название + мета + рекомендуем */}
                <div class="cp-item-info">
                  <a href={item.href || '/catalog/'} class="cp-item-name">{item.title || 'Товар'}</a>
                  <div class="cp-item-props">
                    <div class="cp-item-prop">
                      <span class="cp-prop-name">Артикул</span>
                      <span class="cp-prop-val">{HARDCODED_ARTICLE}</span>
                    </div>
                    <div class="cp-item-prop">
                      <span class="cp-prop-name">Залоговая стоимость за бутыль</span>
                      <span class="cp-prop-val">{fmt(HARDCODED_DEPOSIT)} ₽</span>
                    </div>
                  </div>
                  <a href="#" class="cp-item-recommend">Также рекомендуем</a>
                </div>

                {/* Количество + цена за штуку */}
                <div class="cp-item-qty-wrap">
                  <div class="cp-item-qty">
                    <button class="cp-qty-btn" type="button" aria-label="Убавить"
                      onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                    <input
                      class="cp-qty-input"
                      type="number"
                      value={item.qty}
                      min="1"
                      aria-label="Количество"
                      onBlur={e   => setQty(item.id, parseInt(e.target.value) || 1)}
                      onKeyDown={e => e.key === 'Enter' && setQty(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button class="cp-qty-btn" type="button" aria-label="Добавить"
                      onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <div class="cp-item-unit">{fmt(price)} ₽/шт</div>
                </div>

                {/* Итоговая сумма */}
                <div class="cp-item-sum">{fmt(sum)} ₽</div>

                {/* Удалить */}
                <button class="cp-item-rm" type="button" aria-label="Удалить товар"
                  onClick={() => remove(item.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>

              </div>
            );
          })}
        </div>
        {/* ── Секция подарков ── */}
        <div class="cp-gifts">
          <h2 class="cp-gifts-title">Выберите один из подарков</h2>
          <div class="cp-gifts-grid">
            {GIFTS.map(gift => (
              <div class="cp-gift-card" key={gift.id}>
                <div class="cp-gift-img-wrap">
                  <img src={gift.image} alt={gift.title} width="200" height="200" loading="lazy" />
                  <span class="cp-gift-badge">{gift.badge}</span>
                  {gift.discount && <span class="cp-gift-disc">{gift.discount}</span>}
                </div>
                <div class="cp-gift-body">
                  <div class="cp-gift-name">{gift.title}</div>
                  <div class="cp-gift-prices">
                    {gift.oldPrice > 0 && (
                      <span class="cp-gift-old">{fmt(gift.oldPrice)} ₽</span>
                    )}
                    <span class="cp-gift-price">
                      {gift.price > 0 ? `${fmt(gift.price)} ₽` : 'Бесплатно'}
                    </span>
                  </div>
                  <button class="cp-gift-btn" type="button">В корзину</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── Сводка заказа ── */}
      <aside class="cp-side">
        <div class="cp-side-inner">

          {/* Промокод — layout only */}
          <div class="cp-promo">
            <input class="cp-promo-input" type="text" placeholder="Промокод или сертификат" />
            <button class="cp-promo-btn" type="button">Применить</button>
          </div>

          {/* Строки суммы */}
          <div class="cp-breakdown">
            <div class="cp-br-row">
              <span>Товары, {items.length} шт.</span>
              <span>{fmt(goodsTotal)} ₽</span>
            </div>
            <div class="cp-br-row">
              <span>Залог</span>
              <span>0 ₽</span>
            </div>
            {/* Строка скидки — показывается когда есть купон */}
            {/* <div class="cp-br-row cp-br-discount">
              <span>Скидка</span>
              <span>−0 ₽</span>
            </div> */}
          </div>

          <div class="cp-total">
            <span>Итого</span>
            <span class="cp-total-sum">{fmt(goodsTotal)} ₽</span>
          </div>

          <a href="/order/" class="cp-checkout-btn">Перейти к оформлению</a>

          <a href="/catalog/" class="cp-continue">← Продолжить покупки</a>
        </div>
      </aside>

    </div>
  );
}

function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
