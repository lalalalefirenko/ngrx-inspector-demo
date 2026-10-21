import { CartItem, CartSummary, Coupon, Customer, Product, ShippingMethod } from './shop.models';

// All prices are integer cents. Fixed IDs make screenshot scenes reproducible.
export const PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'Studio headphones',
    description: 'A little less noise. A little more focus.',
    category: 'Audio',
    price: 14900,
    color: 'Graphite',
    image: 'headphones',
    badge: 'Bestseller',
  },
  {
    id: 'prod_002',
    name: 'Arc desk lamp',
    description: 'A softer light for your brightest ideas.',
    category: 'Workspace',
    price: 8900,
    color: 'Sage',
    image: 'lamp',
    badge: null,
  },
  {
    id: 'prod_003',
    name: 'Mechanical keyboard',
    description: 'Good things, one keystroke at a time.',
    category: 'Workspace',
    price: 11900,
    color: 'Chalk',
    image: 'keyboard',
    badge: 'New arrival',
  },
  {
    id: 'prod_004',
    name: 'Pocket speaker',
    description: 'Big sound. Small footprint.',
    category: 'Audio',
    price: 6900,
    color: 'Sand',
    image: 'speaker',
    badge: null,
  },
  {
    id: 'prod_005',
    name: 'Everyday backpack',
    description: 'Room for the things that move you.',
    category: 'Everyday',
    price: 7900,
    color: 'Olive',
    image: 'backpack',
    badge: null,
  },
  {
    id: 'prod_006',
    name: 'Insulated bottle',
    description: 'Stay in your flow. Take a sip.',
    category: 'Everyday',
    price: 3500,
    color: 'Terracotta',
    image: 'bottle',
    badge: null,
  },
];

export const CUSTOMER: Customer = {
  id: 'cus_1042',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  membership: 'plus',
  address: { street: '24 Maple Street', city: 'Portland', country: 'US', postalCode: '97205' },
};

export function cartSummary(items: CartItem[], coupon: Coupon | null): CartSummary {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = coupon ? Math.round((subtotal * coupon.percentOff) / 100) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function shippingCost(method: ShippingMethod, subtotal: number): number {
  return method === 'express' ? 1200 : subtotal >= 10000 || subtotal === 0 ? 0 : 500;
}
