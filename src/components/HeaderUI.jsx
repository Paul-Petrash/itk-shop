import { useState, useEffect, useRef } from 'preact/hooks';
import Cart      from './Cart';
import AuthModal from './AuthModal/AuthModal';

function FavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try { setCount(JSON.parse(localStorage.getItem('itk_favorites') || '[]').length); } catch {}
    const onUpdate = e => setCount(e.detail.ids.length);
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

function CmpLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try { setCount(JSON.parse(localStorage.getItem('itk_compare') || '[]').length); } catch {}
    const onUpdate = e => setCount(e.detail.ids.length);
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

export default function HeaderUI({ cartSrc }) {
  return (
    <>
      <CmpLink />
      <FavLink />
      <Cart cartSrc={cartSrc} />
      <AuthModal />
    </>
  );
}
