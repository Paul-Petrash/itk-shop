import { FavoritesStore } from './favorites-store';

document.addEventListener('click', e => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.pc-fav-btn[data-product-id]');
  if (!btn?.dataset.productId) return;

  const id = btn.dataset.productId;

  if (!FavoritesStore.has(id)) {
    const { productTitle, productImage, productPrice, productHref,
            productOldprice, productRating, productStatus, productArticle, productBadge } = btn.dataset;
    if (productTitle) {
      FavoritesStore.saveMeta(id, {
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

  FavoritesStore.toggle(id);
  syncButtons();
});

window.addEventListener('favorites:request-remove', ((e: CustomEvent<{ id: string }>) => {
  FavoritesStore.remove(e.detail.id);
  syncButtons();
}) as EventListener);

function syncButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('.pc-fav-btn[data-product-id]').forEach(btn => {
    btn.classList.toggle('is-active', FavoritesStore.has(btn.dataset.productId!));
  });
}

syncButtons();
