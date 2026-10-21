import { createSelector } from '@ngrx/store';
import { shippingCost } from './shop.data';
import { ShopState } from './shop.models';

export const selectCatalog = (state: ShopState) => state.catalog;
export const selectCart = (state: ShopState) => state.cart;
export const selectCustomer = (state: ShopState) => state.customer;
export const selectCheckout = (state: ShopState) => state.checkout;
export const selectOrders = (state: ShopState) => state.orders;
export const selectProducts = createSelector(selectCatalog, (catalog) => {
  const query = catalog.filters.query.trim().toLowerCase();
  const products = catalog.products.filter(
    (product) =>
      (catalog.filters.category === 'All' || product.category === catalog.filters.category) &&
      `${product.name} ${product.description}`.toLowerCase().includes(query),
  );
  return catalog.sort === 'featured'
    ? products
    : products.sort((a, b) =>
        catalog.sort === 'price-asc' ? a.price - b.price : b.price - a.price,
      );
});
export const selectCartCount = createSelector(selectCart, (cart) =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0),
);
export const selectCartLines = createSelector(selectCart, selectCatalog, (cart, catalog) =>
  cart.items.map((item) => ({
    ...item,
    image: catalog.products.find((product) => product.id === item.productId)?.image ?? 'headphones',
  })),
);
export const selectShippingCost = createSelector(selectCart, selectCheckout, (cart, checkout) =>
  shippingCost(checkout.shippingMethod, cart.summary.subtotal),
);
export const selectGrandTotal = createSelector(
  selectCart,
  selectShippingCost,
  (cart, shipping) => cart.summary.total + shipping,
);
export const selectLastOrder = createSelector(selectOrders, (orders) => orders.history[0] ?? null);
