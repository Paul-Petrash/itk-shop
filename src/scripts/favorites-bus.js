import { FavoritesStore } from './favorites-store';

const FavoritesBus = {
  toggle(id) { FavoritesStore.toggle(id); syncButtons(); },
  remove(id) { FavoritesStore.remove(id); syncButtons(); },
  has:    FavoritesStore.has.bind(FavoritesStore),
};

window.FavoritesBus = FavoritesBus;

document.addEventListener('click', e => {
  const btn = e.target.closest('.pc-fav-btn[data-product-id]');
  if (!btn?.dataset.productId) return;

  const id = btn.dataset.productId;

  if (!FavoritesBus.has(id)) {
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

  FavoritesBus.toggle(id);
});

function syncButtons() {
  document.querySelectorAll('.pc-fav-btn[data-product-id]').forEach(btn => {
    btn.classList.toggle('is-active', FavoritesBus.has(btn.dataset.productId));
  });
}

syncButtons();