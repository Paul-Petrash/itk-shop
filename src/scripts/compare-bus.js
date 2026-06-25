import { CompareStore } from './compare-store';

const CompareBus = {
  toggle(id) { CompareStore.toggle(id); syncButtons(); },
  remove(id) { CompareStore.remove(id); syncButtons(); },
  has:    CompareStore.has.bind(CompareStore),
};

window.CompareBus = CompareBus;

document.addEventListener('click', e => {
  const btn = e.target.closest('.pc-cmp-btn[data-product-id]');
  if (!btn?.dataset.productId) return;

  const id = btn.dataset.productId;

  if (!CompareBus.has(id)) {
    const { productTitle, productImage, productPrice, productHref,
            productOldprice, productRating, productStatus, productArticle, productBadge } = btn.dataset;
    if (productTitle) {
      CompareStore.saveMeta(id, {
        title:    productTitle,
        image:    productImage    ?? '',
        price:    Number(productPrice)    || 0,
        href:     productHref     ?? '#',
        oldPrice: productOldprice ? Number(productOldprice) : undefined,
        rating:   productRating   ? Number(productRating)   : undefined,
        status:   productStatus,
        article:  productArticle,
        badge:    productBadge,
      });
    }
  }

  CompareBus.toggle(id);
});

function syncButtons() {
  document.querySelectorAll('.pc-cmp-btn[data-product-id]').forEach(btn => {
    btn.classList.toggle('is-active', CompareBus.has(btn.dataset.productId));
  });
}

syncButtons();