import { useState, useEffect } from 'preact/hooks';

export default function Cart({ cartSrc }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Restore count from localStorage before first cart:update fires
    try {
      const raw = localStorage.getItem('itk_cart');
      if (raw) {
        const entries = JSON.parse(raw);
        setCount(entries.reduce((acc, [, qty]) => acc + qty, 0));
      }
    } catch {}

    function onUpdate(e) {
      setCount(e.detail.count);
    }
    window.addEventListener('cart:update', onUpdate);
    return () => window.removeEventListener('cart:update', onUpdate);
  }, []);

  return (
    <a href="/cart/" class="ha-c">
      <span class="ha-ci">
        <img src={cartSrc} width="20" height="20" alt="" />
        {count > 0 && <span class="bdg">{count}</span>}
      </span>
      <span>Корзина</span>
    </a>
  );
}
