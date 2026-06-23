import { useState, useEffect } from 'preact/hooks';
import './CatalogFilters.css';

const SHOW_LIMIT = 5;

function getParams() {
  return new URLSearchParams(window.location.search);
}

function readState(params, groups, pMin, pMax) {
  const price = {
    min: parseFloat(params.get('price_min')) || pMin,
    max: parseFloat(params.get('price_max')) || pMax,
  };
  const checked = {};
  groups.forEach(g => {
    const raw = params.get(`f_${g.id}`);
    checked[g.id] = raw ? new Set(raw.split(',')) : new Set();
  });
  return { price, checked };
}

function buildParams(price, checked, pMin, pMax) {
  const params = getParams();

  // clear old filter params
  [...params.keys()]
    .filter(k => k === 'price_min' || k === 'price_max' || k.startsWith('f_'))
    .forEach(k => params.delete(k));

  if (price.min !== pMin) params.set('price_min', price.min);
  if (price.max !== pMax) params.set('price_max', price.max);
  Object.entries(checked).forEach(([id, values]) => {
    if (values.size > 0) params.set(`f_${id}`, [...values].join(','));
  });

  return params;
}

function dispatch() {
  window.dispatchEvent(new CustomEvent('catalog:filter'));
}

export default function CatalogFilters({ groups, priceMin, priceMax }) {
  const [price, setPrice] = useState({ min: priceMin, max: priceMax });
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(groups.map(g => [g.id, new Set()]))
  );
  const [collapsed, setCollapsed] = useState({});
  const [expanded, setExpanded] = useState({});

  // Read initial state from URL; re-sync when URL changes externally (popstate / header tags)
  useEffect(() => {
    function syncFromUrl() {
      const params = getParams();
      const s = readState(params, groups, priceMin, priceMax);
      setPrice(s.price);
      setChecked(s.checked);
    }
    syncFromUrl();

    // Слушаем внешние изменения фильтров
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('catalog:filter', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('catalog:filter', syncFromUrl);
    }
  }, []);

  function push(newPrice, newChecked) {
    const params = buildParams(newPrice, newChecked, priceMin, priceMax);
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    dispatch();
  }

  function handleCheck(groupId, value, e) {
    const next = { ...checked, [groupId]: new Set(checked[groupId]) };
    if (e.target.checked) {
      next[groupId].add(value);
    }
    else next[groupId].delete(value);
    setChecked(next);
    push(price, next);
  }

  //todo добавить debounce
  function handlePriceInput(field, val) {
    const num = parseFloat(val);
    if (isNaN(num)) {
      return;
    }
    const next = { ...price, [field]: num };
    setPrice(next);
    push(next, checked);
  }

  function reset() {
    const next = { min: priceMin, max: priceMax };
    const nextChecked = Object.fromEntries(groups.map(g => [g.id, new Set()]));
    setPrice(next);
    setChecked(nextChecked);
    window.history.replaceState(null, '', window.location.pathname);
    dispatch();
  }

  function toggleCollapse(id) {
    setCollapsed(s => ({ ...s, [id]: !s[id] }));
  }

  function toggleExpand(id) {
    setExpanded(s => ({ ...s, [id]: !s[id] }));
  }

  const hasActive =
    price.min !== priceMin ||
    price.max !== priceMax ||
    Object.values(checked).some(s => s.size > 0);

  return (
    <aside class="cf">
      <div class="cf-head">
        <span class="cf-heading">Фильтры</span>
        {hasActive && (
          <button class="cf-reset" type="button" onClick={reset}>
            Сбросить
          </button>
        )}
      </div>

      {/* Price */}
      <div class="cf-group">
        <button
          class={`cf-group-btn ${collapsed.price ? 'is-collapsed' : ''}`}
          type="button"
          onClick={() => toggleCollapse('price')}
        >
          <span>Цена, ₽</span>
          <svg class="cf-chevron" width="10" height="6" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>
        </button>
        {!collapsed.price && (
          <div class="cf-price">
            <label class="cf-price-field">
              <span>от</span>
              <input
                type="number"
                value={price.min}
                min={priceMin}
                max={priceMax}
                onBlur={e => handlePriceInput('min', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePriceInput('min', e.target.value)}
              />
            </label>
            <label class="cf-price-field">
              <span>до</span>
              <input
                type="number"
                value={price.max}
                min={priceMin}
                max={priceMax}
                onBlur={e => handlePriceInput('max', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePriceInput('max', e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      {/* Checkbox groups */}
      {groups.map(group => {
        const isCollapsed = collapsed[group.id];
        const isExpanded = expanded[group.id];
        const options = group.options ?? [];
        const visible = isExpanded ? options : options.slice(0, SHOW_LIMIT);
        const selectedCount = checked[group.id]?.size ?? 0;

        return (
          <div class="cf-group" key={group.id}>
            <button
              class={`cf-group-btn ${isCollapsed ? 'is-collapsed' : ''}`}
              type="button"
              onClick={() => toggleCollapse(group.id)}
            >
              <span>
                {group.title}
                {selectedCount > 0 && <span class="cf-sel-cnt">{selectedCount}</span>}
              </span>
              <svg class="cf-chevron" width="10" height="6" viewBox="0 0 10 6">
                <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              </svg>
            </button>

            {!isCollapsed && (
              <div class="cf-options">
                {visible.map(opt => (
                  <label class="cf-opt" key={opt.value}>
                    <input
                      type="checkbox"
                      checked={checked[group.id]?.has(opt.value) ?? false}
                      onChange={e => handleCheck(group.id, opt.value, e)}
                    />
                    <span class="cf-opt-box" />
                    <span class="cf-opt-label">{opt.label}</span>
                    {opt.count != null && (
                      <span class="cf-opt-cnt">{opt.count}</span>
                    )}
                  </label>
                ))}

                {options.length > SHOW_LIMIT && (
                  <button
                    class="cf-more"
                    type="button"
                    onClick={() => toggleExpand(group.id)}
                  >
                    {isExpanded
                      ? 'Скрыть'
                      : `Показать ещё ${options.length - SHOW_LIMIT}`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
