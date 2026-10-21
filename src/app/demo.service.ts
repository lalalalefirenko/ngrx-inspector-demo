import { Injectable, inject, signal } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { firstValueFrom, timeout } from 'rxjs';
import { PRODUCTS } from './store/shop.data';
import { ShopState } from './store/shop.models';
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
} from './store/shop.actions';

export type Scene = 'cart' | 'order' | 'error' | 'diff';

@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly store: Store<ShopState> = inject(Store);
  private readonly actions = inject(Actions);
  readonly running = signal(false);
  readonly activeScene = signal<Scene | null>(null);
  readonly message = signal('Open NgRx Inspector, then choose a scene.');
  readonly simulateFailure = signal(false);

  private async request(action: Action, success: string, failure: string) {
    const completed = firstValueFrom(this.actions.pipe(ofType(success, failure), timeout(5000)));
    this.store.dispatch(action);
    const result = await completed;
    if (result.type === failure) throw new Error((result as Action & { error: string }).error);
  }
  private async load() {
    this.store.dispatch(DemoActions.reset());
    await this.request(
      CustomerActions.sessionRequested(),
      CustomerApiActions.loadProfileSuccess.type,
      CustomerApiActions.loadProfileFailure.type,
    );
    await this.request(
      CatalogActions.opened(),
      ProductsApiActions.loadProductsSuccess.type,
      ProductsApiActions.loadProductsFailure.type,
    );
  }
  async reset() {
    if (this.running()) return;
    this.running.set(true);
    this.activeScene.set(null);
    this.simulateFailure.set(false);
    try {
      await this.load();
      this.message.set('Fresh start. Choose a scene or explore the shop.');
    } catch (error) {
      this.message.set(
        error instanceof Error ? error.message : 'Could not load the demo. Try Reset demo.',
      );
    } finally {
      this.running.set(false);
    }
  }
  async run(scene: Scene) {
    if (this.running()) return;
    this.running.set(true);
    this.activeScene.set(scene);
    this.simulateFailure.set(false);
    this.message.set('Playing scene…');
    try {
      await this.load();
      for (const product of PRODUCTS.slice(0, 3))
        this.store.dispatch(
          CartActions.productAdded({ product: structuredClone(product), quantity: 1 }),
        );
      this.store.dispatch(CatalogActions.favoriteToggled({ productId: 'prod_001' }));
      this.store.dispatch(
        CartActions.itemsReordered({ productIds: ['prod_003', 'prod_001', 'prod_002'] }),
      );
      this.store.dispatch(CartActions.giftWrapToggled({ productId: 'prod_001' }));
      await this.request(
        CartActions.promoCodeSubmitted({ code: 'FORM10' }),
        PromoApiActions.applyCodeSuccess.type,
        PromoApiActions.applyCodeFailure.type,
      );
      this.store.dispatch(CheckoutActions.shippingMethodChanged({ method: 'express' }));
      this.store.dispatch(CartActions.quantityChanged({ productId: 'prod_001', quantity: 2 }));
      if (scene === 'diff') {
        const state = await firstValueFrom<ShopState>(this.store);
        const headphones = state.cart.items.find((item) => item.productId === 'prod_001')!;
        const keyboard = state.cart.items.find((item) => item.productId === 'prod_003')!;
        const speaker = PRODUCTS[3];
        this.store.dispatch(
          CartActions.workspaceBundleApplied({
            bundleId: 'focus-essentials',
            items: [
              { ...headphones, quantity: 3, options: { ...headphones.options, giftWrap: false } },
              {
                id: 'line_004',
                productId: speaker.id,
                name: speaker.name,
                unitPrice: speaker.price,
                quantity: 1,
                options: { color: speaker.color, giftWrap: true },
              },
              keyboard,
            ],
          }),
        );
        this.message.set(
          'Bundle applied. Inspect added, removed, moved and changed items in Diff.',
        );
      } else if (scene === 'order') {
        await this.request(
          CheckoutActions.orderSubmitted({ simulateFailure: false }),
          OrdersApiActions.placeOrderSuccess.type,
          OrdersApiActions.placeOrderFailure.type,
        );
        this.message.set('Order confirmed. Inspect the order payload and state diff.');
      } else if (scene === 'error') {
        const completed = firstValueFrom(
          this.actions.pipe(ofType(OrdersApiActions.placeOrderFailure), timeout(5000)),
        );
        this.simulateFailure.set(true);
        this.store.dispatch(CheckoutActions.orderSubmitted({ simulateFailure: true }));
        await completed;
        this.message.set('Payment declined. Turn off the failure switch to retry.');
      } else {
        this.message.set('Cart is ready. Select Quantity changed to see a rich diff.');
      }
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Scene stopped. Try Reset demo.');
    } finally {
      this.running.set(false);
    }
  }
}
