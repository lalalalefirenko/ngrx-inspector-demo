import { TestBed } from '@angular/core/testing';
import { provideEffects } from '@ngrx/effects';
import { Store, provideStore } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { DemoService } from '../demo.service';
import { PRODUCTS } from './shop.data';
import { CartActions, DemoActions } from './shop.actions';
import { cartReducer, reducers } from './shop.reducers';
import { ShopState } from './shop.models';
import * as effects from './shop.effects';

describe('Cart business rules', () => {
  const empty = () => cartReducer(undefined, { type: '@init' });
  it('uses integer cents and recalculates quantities and discounts without mutating previous state', () => {
    const original = empty();
    const added = cartReducer(
      original,
      CartActions.productAdded({ product: PRODUCTS[0], quantity: 1 }),
    );
    const changed = cartReducer(
      added,
      CartActions.quantityChanged({ productId: PRODUCTS[0].id, quantity: 2 }),
    );
    expect(original.items).toEqual([]);
    expect(added.summary.total).toBe(14900);
    expect(changed.summary).toEqual({ subtotal: 29800, discount: 0, total: 29800 });
    expect(changed.items[0].quantity).toBe(2);
  });
  it('preserves the items and totals when reordering; rejects incomplete or duplicate IDs', () => {
    let state = empty();
    for (const product of PRODUCTS.slice(0, 3))
      state = cartReducer(state, CartActions.productAdded({ product, quantity: 1 }));
    const productIds = state.items.map((item) => item.productId).reverse();
    const reordered = cartReducer(state, CartActions.itemsReordered({ productIds }));
    expect(reordered.items.map((item) => item.productId)).toEqual(productIds);
    expect(reordered.summary).toEqual(state.summary);
    expect(cartReducer(state, CartActions.itemsReordered({ productIds: [productIds[0]] }))).toBe(
      state,
    );
    expect(
      cartReducer(
        state,
        CartActions.itemsReordered({ productIds: [productIds[0], productIds[0], productIds[0]] }),
      ),
    ).toBe(state);
  });
  it('bounds quantities and preserves nested options', () => {
    const state = cartReducer(
      empty(),
      CartActions.productAdded({ product: PRODUCTS[0], quantity: 20 }),
    );
    expect(state.items[0].quantity).toBe(9);
    const wrapped = cartReducer(state, CartActions.giftWrapToggled({ productId: PRODUCTS[0].id }));
    expect(wrapped.items[0].options).toEqual({ color: 'Graphite', giftWrap: true });
    expect(state.items[0].options.giftWrap).toBe(false);
  });
});

describe('Real NgRx demonstration scenarios', () => {
  let demo: DemoService;
  let store: Store<ShopState>;
  const snapshot = () => firstValueFrom(store);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers), provideEffects(effects)],
    });
    demo = TestBed.inject(DemoService);
    store = TestBed.inject(Store<ShopState>);
  });
  it('replays the same cart state and totals twice', async () => {
    await demo.run('cart');
    const first = await snapshot();
    expect(first.cart.items.map((item) => item.productId)).toEqual([
      'prod_003',
      'prod_001',
      'prod_002',
    ]);
    expect(first.cart.summary).toEqual({ subtotal: 50600, discount: 5060, total: 45540 });
    expect(first.cart.coupon).toEqual({ code: 'FORM10', percentOff: 10 });
    expect(first.checkout.shippingMethod).toBe('express');
    await demo.run('cart');
    expect(await snapshot()).toEqual(first);
  });
  it('moves the completed cart into a deterministic order and clears the cart', async () => {
    await demo.run('order');
    const state = await snapshot();
    expect(state.checkout.status).toBe('success');
    expect(state.cart.items).toEqual([]);
    expect(state.orders.lastOrderId).toBe('ORD-1048');
    expect(state.orders.history[0].totals.grandTotal).toBe(46740);
    expect(state.orders.history[0].items).toHaveLength(3);
    expect(state.orders.history[0].payment.status).toBe('paid');
  });
  it('preserves the cart on failed payment and resets all slices cleanly', async () => {
    await demo.run('error');
    const state = await snapshot();
    expect(state.checkout.status).toBe('error');
    expect(state.checkout.error).toContain('Payment was declined');
    expect(state.cart.items).toHaveLength(3);
    expect(state.orders.history).toEqual([]);
    store.dispatch(DemoActions.reset());
    const reset = await snapshot();
    expect(reset.cart.items).toEqual([]);
    expect(reset.catalog.favorites).toEqual([]);
    expect(reset.checkout.status).toBe('idle');
  });
  it('applies a bundle with added, removed, moved and edited stable cart lines', async () => {
    await demo.run('diff');
    const state = await snapshot();
    expect(state.cart.items.map((item) => item.id)).toEqual(['line_001', 'line_004', 'line_003']);
    expect(state.cart.items[0].quantity).toBe(3);
    expect(state.cart.items[0].options.giftWrap).toBe(false);
    expect(state.cart.items[1].options.giftWrap).toBe(true);
    expect(state.cart.summary).toEqual({ subtotal: 63500, discount: 6350, total: 57150 });
  });
});
