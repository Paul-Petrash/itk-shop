# ITK SHOP

Статичный интернет-магазин на [Astro](https://astro.build) + Preact. Все страницы генерируются при сборке (SSG), что даёт максимальный SEO и скорость загрузки.

## Команды

```sh
pnpm dev      # dev-сервер на localhost:4321
pnpm build    # production-сборка в ./dist/
pnpm preview  # предпросмотр собранного сайта
```

## Переменные окружения

| Переменная       | Описание                                              |
| :--------------- | :---------------------------------------------------- |
| `PUBLIC_API_URL` | URL бэкенда. Значение `mock` включает моковые данные |
| `SITE_URL`       | Публичный URL сайта (нужен для sitemap и canonical)  |

Скопируй `.env.example` → `.env` и задай значения. Для локальной разработки `PUBLIC_API_URL=mock` — запрос к серверу не нужен.

---

## Структура проекта

```
src/
├── assets/               # SVG-иконки и изображения
│   └── icons/
├── components/
│   ├── Cart.jsx          # Preact: иконка корзины с счётчиком в хедере
│   └── catalog/
│       ├── CategoryCard/ # Карточка категории (image + title + count)
│       ├── CatalogFilters/  # Preact: интерактивный сайдбар фильтров
│       ├── ProductCard/  # Карточка товара (статичная Astro)
│       └── ProductList/  # Горизонтальный список карточек
├── layouts/
│   └── Layout.astro      # Базовый layout: SEO-meta, canonical, OG, cart-bus import
├── lib/
│   ├── types.ts          # Общие TypeScript-типы (Product, Category, Cart, FilterGroup…)
│   ├── mock.ts           # Моковые данные (товары, категории, фильтры)
│   └── api.ts            # Все запросы к бэкенду. При PUBLIC_API_URL=mock возвращает mock
├── pages/
│   ├── index.astro       # Главная — featured-товары из API
│   └── catalog/
│       ├── index.astro          # Список категорий (сетка CategoryCard)
│       └── [categorySlug]/
│           ├── index.astro      # Страница категории: фильтры + сетка товаров
│           └── [productSlug].astro  # Карточка товара (schema.org Product)
├── scripts/
│   ├── cart-store.ts     # Хранилище корзины: Map + localStorage + cart:update event
│   ├── cart-bus.ts       # BroadcastChannel (кросс-вкладочная синхронизация)
│   │                     # + renderCounter (виджет ±) + event delegation кликов
│   └── catalog-filter.ts # In-memory индекс товаров + фильтрация/сортировка по data-attrs
└── styles/
    ├── global.css        # CSS-переменные, reset, .wrap, .sr
    └── catalog-page.css  # Стили страницы категории (layout, toolbar, grid, empty state)
```

---

## Маршруты

| URL                                      | Файл                                        |
| :--------------------------------------- | :------------------------------------------ |
| `/`                                      | `pages/index.astro`                         |
| `/catalog/`                              | `pages/catalog/index.astro`                 |
| `/catalog/voda-pitevaya/`                | `pages/catalog/[categorySlug]/index.astro`  |
| `/catalog/voda-pitevaya/arhyz-19l/`      | `pages/catalog/[categorySlug]/[productSlug].astro` |
| `/sitemap-index.xml`                     | генерируется `@astrojs/sitemap`             |

---

## API-слой (`src/lib/api.ts`)

Все функции — async, вызываются только при сборке (в frontmatter `.astro`-файлов) кроме `getCart()`, который можно вызывать и на клиенте.

| Функция                              | Описание                         |
| :----------------------------------- | :------------------------------- |
| `getCategories()`                    | Список категорий                 |
| `getCategory(slug)`                  | Одна категория                   |
| `getProducts()`                      | Все товары                       |
| `getProductsByCategory(slug)`        | Товары категории                 |
| `getProduct(categorySlug, slug)`     | Один товар                       |
| `getFilters(categorySlug)`           | Группы фильтров для категории    |
| `getCart()`                          | Содержимое корзины               |

При `PUBLIC_API_URL=mock` каждая функция возвращает данные из `src/lib/mock.ts` без сетевых запросов.

---

## SEO

- `Layout.astro` — `<title>`, `<meta description>`, `<link canonical>`, OpenGraph
- Страница категории — `BreadcrumbList` (schema.org microdata)
- Страница товара — `Product` + `Offer` (schema.org microdata), breadcrumb
- Сетка товаров — `ItemList` + `itemListElement` (schema.org)
- Sitemap — автоматически через `@astrojs/sitemap`, включает все статичные страницы
- Все товары рендерятся в HTML при сборке — поисковик видит их без JS

---

## Фильтрация (`src/scripts/catalog-filter.ts`)

Работает без серверного рендеринга:

1. Каждая карточка товара имеет `data-id`, `data-price`, `data-rating` и `data-{groupId}` атрибуты
2. При загрузке страницы строится **in-memory индекс** — массив объектов с уже распарсенными числами
3. При изменении фильтра/сортировки функция `applyFilter()` проходит по индексу и показывает/скрывает карточки
4. Фильтр Preact (`CatalogFilters`) и нативный `<select>` сортировки обновляют URL-параметры и диспатчат `catalog:filter`

```
Фильтр/сортировка изменились
  → URL обновился (?f_brand=arhyz&sort=price_asc)
  → catalog:filter event
  → applyFilter(buildState())
  → скрыть/показать [data-id] элементы + переставить DOM для сортировки
```

---

## Корзина

### Архитектура

```
cart-store.ts          cart-bus.ts                Cart.jsx (Preact)
──────────────         ──────────────             ─────────────────
Map<id, qty>     ←──  оборачивает store     ──→  слушает cart:update
localStorage           BroadcastChannel            показывает счётчик
emit(cart:update)      renderCounter() виджет ±
                       делегирование кликов
                             ↑
                       Layout.astro (глобальный import)
```

### Поток данных

- Клик «В корзину» → `CartBus.add(id)` → `CartStore.update()` + broadcast + `renderCounter()`
- `CartStore.update()` → сохранить в localStorage + диспатч `cart:update`
- `cart:update` → `Cart.jsx` обновляет счётчик в хедере
- Другая вкладка получает через `BroadcastChannel` → напрямую в `CartStore.update()` (без ре-броадкаста)

### Кнопка «В корзину»

Когда товар добавлен в корзину, `renderCounter()` прячет кнопку «В корзину» и вставляет виджет `−` / количество / `+`. При уменьшении до 0 виджет убирается и кнопка возвращается.

### Хранение

`localStorage['itk_cart']` — JSON-массив пар `[id, qty]`, совместимый с `new Map()`.
