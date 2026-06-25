const RESERVED = new Set(['id', 'price', 'rating']);

const items = Array.from(
  document.querySelectorAll('[data-id]')
).map(el => ({
  el,
  price:  Number(el.dataset.price),
  rating: Number(el.dataset.rating),
  meta: Object.fromEntries(
    Object.entries(el.dataset)
      .filter(([k]) => !RESERVED.has(k))
      .map(([k, v]) => [k, v ?? ''])
  ),
}));

function buildState() {
  const p = new URLSearchParams(window.location.search);
  const checked = {};
  p.forEach((val, key) => {
    if (key.startsWith('f_')) checked[key.slice(2)] = new Set(val.split(','));
  });
  return {
    priceMin: parseFloat(p.get('price_min') ?? '') || 0,
    priceMax: parseFloat(p.get('price_max') ?? '') || Infinity,
    sort:     p.get('sort') ?? '',
    checked,
  };
}

function applyFilter(state) {
  let visible = 0;

  for (const item of items) {
    let show = item.price >= state.priceMin && item.price <= state.priceMax;

    if (show) {
      for (const [groupId, values] of Object.entries(state.checked)) {
        if (values.size === 0) continue;
        const raw = item.meta[groupId];
        if (!raw) { show = false; break; }
        const itemVals = raw.includes(',') ? raw.split(',') : [raw];
        if (!itemVals.some(v => values.has(v))) { show = false; break; }
      }
    }

    item.el.hidden = !show;
    if (show) visible++;
  }

  updateUI(visible, state.sort);
}

function applySort(sort) {
  if (!sort) return;
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const visible = items.filter(i => !i.el.hidden);
  visible.sort((a, b) => {
    switch (sort) {
      case 'price_asc':  return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'rating':     return b.rating - a.rating;
      default:           return 0;
    }
  });
  visible.forEach(i => grid.appendChild(i.el));
}

function updateUI(visible, sort = '') {
  const countEl = document.getElementById('catalog-count');
  if (countEl) countEl.textContent = String(visible);

  const emptyEl = document.getElementById('catalog-empty');
  if (emptyEl) emptyEl.hidden = visible > 0;

  applySort(sort);
}

function run() {
  applyFilter(buildState());
}

const sortEl = document.getElementById('catalog-sort');
if (sortEl) {
  sortEl.value = new URLSearchParams(window.location.search).get('sort') ?? '';
  sortEl.addEventListener('change', () => {
    const params = new URLSearchParams(window.location.search);
    if (sortEl.value) params.set('sort', sortEl.value);
    else params.delete('sort');
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    run();
  });
}

window.addEventListener('catalog:filter', run);
window.addEventListener('popstate', run);

document.getElementById('catalog-reset')?.addEventListener('click', () => {
  window.history.replaceState(null, '', window.location.pathname);
  window.dispatchEvent(new CustomEvent('catalog:filter'));
});

if (window.location.search) run();