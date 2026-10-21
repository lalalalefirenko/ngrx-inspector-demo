import { Injectable } from '@angular/core';
import { map, timer } from 'rxjs';
import { CUSTOMER, PRODUCTS, shippingCost } from './shop.data';
import { Coupon, Order, ShopState } from './shop.models';

@Injectable({ providedIn: 'root' })
export class ShopApi {
  loadProducts() {
    return timer(320).pipe(map(() => structuredClone(PRODUCTS)));
  }
  loadCustomer() {
    return timer(180).pipe(map(() => structuredClone(CUSTOMER)));
  }
  applyPromo(code: string) {
    return timer(260).pipe(
      map((): Coupon => {
        if (code.trim().toUpperCase() !== 'FORM10')
          throw new Error('This code is not valid. Try FORM10 for 10% off.');
        return { code: 'FORM10', percentOff: 10 };
      }),
    );
  }
  placeOrder(state: ShopState, simulateFailure: boolean) {
    return timer(420).pipe(
      map((): Order => {
        if (!state.cart.items.length)
          throw new Error('Your bag is empty. Add a product before checking out.');
        if (!state.customer.profile)
          throw new Error('Your profile is still loading. Please try again.');
        if (simulateFailure)
          throw new Error('Payment was declined. Your bag is saved — please try again.');
        const shipping = shippingCost(state.checkout.shippingMethod, state.cart.summary.subtotal);
        return {
          id: `ORD-${1048 + state.orders.history.length}`,
          customerId: state.customer.profile.id,
          items: structuredClone(state.cart.items),
          coupon: structuredClone(state.cart.coupon),
          shipping: {
            method: state.checkout.shippingMethod,
            cost: shipping,
            address: structuredClone(state.customer.profile.address),
          },
          totals: {
            ...state.cart.summary,
            shipping,
            grandTotal: state.cart.summary.total + shipping,
          },
          status: 'confirmed',
          payment: { method: 'card', status: 'paid', last4: '4242' },
        };
      }),
    );
  }
}
