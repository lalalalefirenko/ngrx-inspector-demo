export type Category = 'All' | 'Audio' | 'Workspace' | 'Everyday';
export type Sort = 'featured' | 'price-asc' | 'price-desc';
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
export type ShippingMethod = 'standard' | 'express';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'All'>;
  price: number;
  color: string;
  image: string;
  badge: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  membership: 'plus';
  address: { street: string; city: string; country: string; postalCode: string };
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  options: { color: string; giftWrap: boolean };
}

export interface Coupon {
  code: string;
  percentOff: number;
}
export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
}
export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  coupon: Coupon | null;
  shipping: { method: ShippingMethod; cost: number; address: Customer['address'] };
  totals: CartSummary & { shipping: number; grandTotal: number };
  status: 'confirmed';
  payment: { method: 'card'; status: 'paid'; last4: '4242' };
}

export interface CustomerState {
  profile: Customer | null;
  status: RequestStatus;
  error: string | null;
}
export interface CatalogState {
  products: Product[];
  status: RequestStatus;
  error: string | null;
  filters: { category: Category; query: string };
  sort: Sort;
  favorites: string[];
}
export interface CartState {
  currency: 'USD';
  items: CartItem[];
  coupon: Coupon | null;
  summary: CartSummary;
  promoStatus: RequestStatus;
  error: string | null;
}
export interface CheckoutState {
  shippingMethod: ShippingMethod;
  status: RequestStatus;
  error: string | null;
}
export interface OrdersState {
  history: Order[];
  lastOrderId: string | null;
}
export interface ShopState {
  customer: CustomerState;
  catalog: CatalogState;
  cart: CartState;
  checkout: CheckoutState;
  orders: OrdersState;
}
