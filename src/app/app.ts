import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { DemoService } from './demo.service';
import { CartActions, CatalogActions, CheckoutActions } from './store/shop.actions';
import { Category, Product, ShopState, ShippingMethod, Sort } from './store/shop.models';
import {
  selectCart,
  selectCartCount,
  selectCartLines,
  selectCatalog,
  selectCheckout,
  selectCustomer,
  selectGrandTotal,
  selectLastOrder,
  selectProducts,
  selectShippingCost,
} from './store/shop.selectors';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly store: Store<ShopState> = inject(Store);
  readonly demo = inject(DemoService);
  readonly catalog = this.store.selectSignal(selectCatalog);
  readonly cart = this.store.selectSignal(selectCart);
  readonly customer = this.store.selectSignal(selectCustomer);
  readonly checkout = this.store.selectSignal(selectCheckout);
  readonly products = this.store.selectSignal(selectProducts);
  readonly lines = this.store.selectSignal(selectCartLines);
  readonly count = this.store.selectSignal(selectCartCount);
  readonly shipping = this.store.selectSignal(selectShippingCost);
  readonly total = this.store.selectSignal(selectGrandTotal);
  readonly lastOrder = this.store.selectSignal(selectLastOrder);
  readonly busy = computed(
    () =>
      this.demo.running() ||
      this.catalog().status === 'loading' ||
      this.customer().status === 'loading' ||
      this.cart().promoStatus === 'loading' ||
      this.checkout().status === 'loading',
  );
  readonly categories: Category[] = ['All', 'Audio', 'Workspace', 'Everyday'];
  readonly promoCode = signal('FORM10');

  ngOnInit() {
    void this.demo.reset();
  }
  add(product: Product) {
    this.store.dispatch(CartActions.productAdded({ product, quantity: 1 }));
  }
  category(category: Category) {
    this.store.dispatch(CatalogActions.categorySelected({ category }));
  }
  sort(event: Event) {
    this.store.dispatch(
      CatalogActions.sortChanged({ sort: (event.target as HTMLSelectElement).value as Sort }),
    );
  }
  search(event: Event) {
    this.store.dispatch(
      CatalogActions.searchChanged({ query: (event.target as HTMLInputElement).value }),
    );
  }
  favorite(productId: string) {
    this.store.dispatch(CatalogActions.favoriteToggled({ productId }));
  }
  quantity(productId: string, quantity: number) {
    this.store.dispatch(CartActions.quantityChanged({ productId, quantity }));
  }
  remove(productId: string) {
    this.store.dispatch(CartActions.productRemoved({ productId }));
  }
  giftWrap(productId: string) {
    this.store.dispatch(CartActions.giftWrapToggled({ productId }));
  }
  moveUp(index: number) {
    const productIds = this.cart().items.map((item) => item.productId);
    [productIds[index - 1], productIds[index]] = [productIds[index], productIds[index - 1]];
    this.store.dispatch(CartActions.itemsReordered({ productIds }));
  }
  promo(event: Event) {
    this.promoCode.set((event.target as HTMLInputElement).value);
  }
  applyPromo(event: Event) {
    event.preventDefault();
    this.store.dispatch(CartActions.promoCodeSubmitted({ code: this.promoCode() }));
  }
  removePromo() {
    this.store.dispatch(CartActions.promoCodeRemoved());
  }
  setShipping(event: Event) {
    this.store.dispatch(
      CheckoutActions.shippingMethodChanged({
        method: (event.target as HTMLSelectElement).value as ShippingMethod,
      }),
    );
  }
  placeOrder() {
    this.store.dispatch(
      CheckoutActions.orderSubmitted({ simulateFailure: this.demo.simulateFailure() }),
    );
  }
}
