import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CartItem,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  ShippingMethod,
  Sort,
} from './shop.models';

export const DemoActions = createActionGroup({ source: 'Demo', events: { Reset: emptyProps() } });
export const CatalogActions = createActionGroup({
  source: 'Catalog Page',
  events: {
    Opened: emptyProps(),
    'Category selected': props<{ category: Category }>(),
    'Search changed': props<{ query: string }>(),
    'Sort changed': props<{ sort: Sort }>(),
    'Favorite toggled': props<{ productId: string }>(),
  },
});
export const ProductsApiActions = createActionGroup({
  source: 'Products API',
  events: {
    'Load products success': props<{ products: Product[] }>(),
    'Load products failure': props<{ error: string }>(),
  },
});
export const CustomerActions = createActionGroup({
  source: 'Customer',
  events: { 'Session requested': emptyProps() },
});
export const CustomerApiActions = createActionGroup({
  source: 'Customer API',
  events: {
    'Load profile success': props<{ customer: Customer }>(),
    'Load profile failure': props<{ error: string }>(),
  },
});
export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Workspace bundle applied': props<{ bundleId: string; items: CartItem[] }>(),
    'Product added': props<{ product: Product; quantity: number }>(),
    'Quantity changed': props<{ productId: string; quantity: number }>(),
    'Product removed': props<{ productId: string }>(),
    'Gift wrap toggled': props<{ productId: string }>(),
    'Items reordered': props<{ productIds: string[] }>(),
    'Promo code submitted': props<{ code: string }>(),
    'Promo code removed': emptyProps(),
  },
});
export const PromoApiActions = createActionGroup({
  source: 'Promo API',
  events: {
    'Apply code success': props<{ coupon: Coupon }>(),
    'Apply code failure': props<{ error: string }>(),
  },
});
export const CheckoutActions = createActionGroup({
  source: 'Checkout',
  events: {
    'Shipping method changed': props<{ method: ShippingMethod }>(),
    'Order submitted': props<{ simulateFailure: boolean }>(),
  },
});
export const OrdersApiActions = createActionGroup({
  source: 'Orders API',
  events: {
    'Place order success': props<{ order: Order }>(),
    'Place order failure': props<{ error: string }>(),
  },
});
