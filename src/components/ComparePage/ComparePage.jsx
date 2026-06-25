import { useState, useEffect } from 'preact/hooks';

const CMP_KEY  = 'itk_compare';
const META_KEY = 'itk_compare_products';

// Hardcoded property table — replaces with real data later
const PROP_ROWS = [
  { name: 'Вид воды',                           val: 'Питьевая' },
  { name: 'Объём (л)',                           val: '19' },
  { name: 'Упаковка',                            val: 'Оборотная упаковка' },
  { name: 'Категория',                           val: 'Природная питьевая вода' },
  { name: 'Залоговая стоимость за бутыль',       val: '450 ₽' },
  { name: 'Место розлива',                       val: 'Центральная Россия' },
  { name: 'Срок годности',                       val: '6 месяцев' },
  { name: 'Дата розлива',                        val: 'Расположена сверху на крышке' },
  { name: 'Срок хранения после вскрытия (дней)', val: 'не более 5' },
  { name: 'Для кулера',                          val: 'Да' },
  { name: 'Диаметр горлышка (мм)',               val: '54' },
  { name: 'Общая минерализация',                 val: '450' },
  { name: 'Общая жёсткость',                     val: '6' },
  { name: 'Водородный показатель (pH)',           val: '8.5' },
  { name: 'Калий (К+)',                          val: '5' },
  { name: 'Кальций (Ca²⁺)',                      val: '130' },
  { name: 'Магний (Mg²⁺)',                       val: '25' },
  { name: 'Хлориды (Cl⁻)',                       val: '25' },
  { name: 'Сульфаты (SO₄²⁻)',                   val: '50' },
  { name: 'Гидрокарбонаты (HCO₃⁻)',             val: '400' },
  { name: 'Страна производитель',                val: 'Россия' },
];

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

export default function ComparePage() {
  const [items,    setItems]    = useState([]);
  const [diffOnly, setDiffOnly] = useState(false);

  function loadItems() {
    try {
      const ids = JSON.parse(localStorage.getItem(CMP_KEY) || '[]');
      setItems(buildItems(ids, readMeta()));
    } catch {}
  }

  useEffect(() => {
    loadItems();
    function onUpdate() { loadItems(); }
    window.addEventListener('compare:update', onUpdate);
    return () => window.removeEventListener('compare:update', onUpdate);
  }, []);

  function remove(id) {
    window.CompareBus.remove(id);
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
    localStorage.setItem(CMP_KEY, '[]');
    window.dispatchEvent(new CustomEvent('compare:update', { detail: { ids: [] } }));
  }

  // For "diff only": hide rows where all item values are equal
  const visibleProps = diffOnly
    ? PROP_ROWS.filter(row => {
        const vals = items.map(() => row.val);
        return new Set(vals).size > 1;
      })
    : PROP_ROWS;

  if (items.length === 0) {
    return (
      <div class="cmp-empty">
        <svg width="64" height="64" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="2" y1="5" x2="22" y2="5"/>
          <line x1="2" y1="15" x2="22" y2="15"/>
          <polyline points="6,1 2,5 6,9"/>
          <polyline points="18,11 22,15 18,19"/>
        </svg>
        <p class="cmp-empty-title">Нет товаров для сравнения</p>
        <p class="cmp-empty-sub">Добавляйте товары из каталога, нажимая на иконку сравнения</p>
        <a href="/catalog/" class="cmp-empty-btn">Перейти в каталог</a>
      </div>
    );
  }

  return (
    <div class="cmp-page">
      <div class="cmp-head">
        <div class="cmp-head-left">
          <h1 class="cmp-title">Сравнение товаров</h1>
          <span class="cmp-count">{items.length} {plural(items.length, 'товар', 'товара', 'товаров')}</span>
        </div>
        <div class="cmp-head-right">
          <label class="cmp-diff-toggle">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={e => setDiffOnly(e.target.checked)}
            />
            <span class="cmp-diff-label">Только отличия</span>
          </label>
          <button class="cmp-clear-btn" type="button" onClick={clearAll}>Очистить сравнение</button>
        </div>
      </div>

      <div class="cmp-scroll">
        <table class="cmp-table">

          {/* ── Шапка: карточки товаров ── */}
          <thead>
            <tr>
              <th class="cmp-th-label"></th>
              {items.map(item => (
                <th class="cmp-th-product" key={item.id}>
                  <div class="cmp-product-col">
                    <button
                      class="cmp-rm-btn"
                      type="button"
                      aria-label="Убрать из сравнения"
                      onClick={() => remove(item.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>

                    <a href={item.href || '/catalog/'} class="cmp-product-img-wrap">
                      <img
                        src={item.image || 'https://placehold.co/200x200'}
                        alt={item.title || ''}
                        width="160"
                        height="160"
                        loading="lazy"
                        class="cmp-product-img"
                      />
                    </a>

                    <div class="cmp-product-price">{fmt(item.price || 0)} ₽</div>

                    <a href={item.href || '/catalog/'} class="cmp-product-title">{item.title || 'Товар'}</a>

                    <button
                      class="cmp-cart-btn"
                      type="button"
                      onClick={() => addToCart(item)}
                    >В корзину</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Строки характеристик ── */}
          <tbody>
            {visibleProps.length === 0 ? (
              <tr>
                <td class="cmp-no-diff" colspan={items.length + 1}>
                  Все характеристики совпадают
                </td>
              </tr>
            ) : visibleProps.map(row => (
              <tr class="cmp-prop-row" key={row.name}>
                <td class="cmp-prop-name">{row.name}</td>
                {items.map(item => (
                  <td class="cmp-prop-val" key={item.id}>{row.val}</td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
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
