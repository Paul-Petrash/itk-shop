import { useState, useEffect } from 'preact/hooks';

export default function CmpLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('itk_compare') || '[]');
      setCount(ids.length);
    } catch {}

    function onUpdate(e) { setCount(e.detail.ids.length); }
    window.addEventListener('compare:update', onUpdate);
    return () => window.removeEventListener('compare:update', onUpdate);
  }, []);

  return (
    <a href="/compare/">
      <span class="ha-ci">
        <svg width="20" height="16" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="2" y1="5" x2="22" y2="5"/>
          <line x1="2" y1="15" x2="22" y2="15"/>
          <polyline points="6,1 2,5 6,9"/>
          <polyline points="18,11 22,15 18,19"/>
        </svg>
        {count > 0 && <span class="bdg">{count}</span>}
      </span>
      <span>Сравнение</span>
    </a>
  );
}
