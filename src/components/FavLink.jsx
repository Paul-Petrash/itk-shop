import { useState, useEffect } from 'preact/hooks';

export default function FavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('itk_favorites') || '[]');
      setCount(ids.length);
    } catch {}

    function onUpdate(e) { setCount(e.detail.ids.length); }
    window.addEventListener('favorites:update', onUpdate);
    return () => window.removeEventListener('favorites:update', onUpdate);
  }, []);

  return (
    <a href="/favorites/">
      <span class="ha-ci">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        {count > 0 && <span class="bdg">{count}</span>}
      </span>
      <span>Избранное</span>
    </a>
  );
}
