import { ActionReducerMap, createReducer, on } from '@ngrx/store';
import { cartSummary } from './shop.data';
import {
  CartState,
  CatalogState,
  CheckoutState,
  CustomerState,
  OrdersState,
  ShopState,
} from './shop.models';
import {
  CartActions,
  CatalogActions,
  CheckoutActions,
  CustomerActions,
  CustomerApiActions,
  DemoActions,
  OrdersApiActions,
  ProductsApiActions,
  PromoApiActions,
} from './shop.actions';

const customerInitial: CustomerState = { profile: null, status: 'idle', error: null };
const catalogInitial: CatalogState = {
  products: [],
  status: 'idle',
  error: null,
  filters: { category: 'All', query: '' },
  sort: 'featured',
  favorites: [],
};
const cartInitial: CartState = {
  currency: 'USD',
  items: [],
  coupon: null,
  summary: { subtotal: 0, discount: 0, total: 0 },
  promoStatus: 'idle',
  error: null,
};
const checkoutInitial: CheckoutState = { shippingMethod: 'standard', status: 'idle', error: null };
const ordersInitial: OrdersState = { history: [], lastOrderId: null };

function summarize(state: CartState): CartState {
  return { ...state, summary: cartSummary(state.items, state.coupon) };
}
const quantity = (value: number) =>
  Number.isFinite(value) ? Math.max(1, Math.min(9, Math.trunc(value))) : 1;

export const customerReducer = createReducer(
  customerInitial,
  on(DemoActions.reset, () => customerInitial),
  on(CustomerActions.sessionRequested, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),
  on(CustomerApiActions.loadProfileSuccess, (state, { customer }) => ({
    ...state,
    profile: customer,
    status: 'success' as const,
  })),
  on(CustomerApiActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const,
  })),
);
export const catalogReducer = createReducer(
  catalogInitial,
  on(DemoActions.reset, () => catalogInitial),
  on(CatalogActions.opened, (state) => ({ ...state, status: 'loading' as const, error: null })),
  on(ProductsApiActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    status: 'success' as const,
  })),
  on(ProductsApiActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    error,
    status: 'error' as const,
  })),
  on(CatalogActions.categorySelected, (state, { category }) => ({
    ...state,
    filters: { ...state.filters, category },
  })),
  on(CatalogActions.searchChanged, (state, { query }) => ({
    ...state,
    filters: { ...state.filters, query },
  })),
  on(CatalogActions.sortChanged, (state, { sort }) => ({ ...state, sort })),
  on(CatalogActions.favoriteToggled, (state, { productId }) => ({
    ...state,
    favorites: state.favorites.includes(productId)
      ? state.favorites.filter((id) => id !== productId)
      : [...state.favorites, productId],
  })),
);
export const cartReducer = createReducer(
  cartInitial,
  on(DemoActions.reset, () => cartInitial),
  on(CartActions.workspaceBundleApplied, (state, { items }) => summarize({ ...state, items })),
  on(CartActions.productAdded, (state, { product, quantity: amount }) => {
    const existing = state.items.some((item) => item.productId === product.id);
    const items = existing
      ? state.items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: quantity(item.quantity + amount) }
            : item,
        )
      : [
          ...state.items,
          {
            id: product.id.replace('prod_', 'line_'),
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: quantity(amount),
            options: { color: product.color, giftWrap: false },
          },
        ];
    return summarize({ ...state, items });
  }),
  on(CartActions.quantityChanged, (state, { productId, quantity: amount }) =>
    summarize({
      ...state,
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity(amount) } : item,
      ),
    }),
  ),
  on(CartActions.productRemoved, (state, { productId }) => {
    const items = state.items.filter((item) => item.productId !== productId);
    return summarize({
      ...state,
      items,
      ...(items.length ? {} : { coupon: null, promoStatus: 'idle' as const, error: null }),
    });
  }),
  on(CartActions.giftWrapToggled, (state, { productId }) => ({
    ...state,
    items: state.items.map((item) =>
      item.productId === productId
        ? { ...item, options: { ...item.options, giftWrap: !item.options.giftWrap } }
        : item,
    ),
  })),
  on(CartActions.itemsReordered, (state, { productIds }) => {
    // Ignore malformed reorder requests instead of losing or duplicating items.
    if (
      new Set(productIds).size !== state.items.length ||
      productIds.length !== state.items.length ||
      productIds.some((id) => !state.items.some((item) => item.productId === id))
    )
      return state;
    return {
      ...state,
      items: productIds.map((id) => state.items.find((item) => item.productId === id)!),
    };
  }),
  on(CartActions.promoCodeSubmitted, (state) => ({
    ...state,
    promoStatus: 'loading' as const,
    error: null,
  })),
  on(PromoApiActions.applyCodeSuccess, (state, { coupon }) =>
    summarize({ ...state, coupon, promoStatus: 'success', error: null }),
  ),
  on(PromoApiActions.applyCodeFailure, (state, { error }) => ({
    ...state,
    error,
    promoStatus: 'error' as const,
  })),
  on(CartActions.promoCodeRemoved, (state) =>
    summarize({ ...state, coupon: null, promoStatus: 'idle', error: null }),
  ),
  on(OrdersApiActions.placeOrderSuccess, () => cartInitial),
);
export const checkoutReducer = createReducer(
  checkoutInitial,
  on(DemoActions.reset, () => checkoutInitial),
  on(CheckoutActions.shippingMethodChanged, (state, { method }) => ({
    ...state,
    shippingMethod: method,
    error: null,
  })),
  on(CheckoutActions.orderSubmitted, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),
  on(OrdersApiActions.placeOrderSuccess, (state) => ({
    ...state,
    status: 'success' as const,
    error: null,
  })),
  on(OrdersApiActions.placeOrderFailure, (state, { error }) => ({
    ...state,
    status: 'error' as const,
    error,
  })),
  on(
    CartActions.productAdded,
    CartActions.quantityChanged,
    CartActions.productRemoved,
    (state) => ({ ...state, status: 'idle' as const, error: null }),
  ),
);
export const ordersReducer = createReducer(
  ordersInitial,
  on(DemoActions.reset, () => ordersInitial),
  on(OrdersApiActions.placeOrderSuccess, (state, { order }) => ({
    ...state,
    history: [order, ...state.history],
    lastOrderId: order.id,
  })),
);

export const reducers: ActionReducerMap<ShopState> = {
  customer: customerReducer,
  catalog: catalogReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
};
