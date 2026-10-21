import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, takeUntil, withLatestFrom } from 'rxjs';
import { ShopApi } from './shop.api';
import { ShopState } from './shop.models';
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

export const loadProducts = createEffect(
  (actions = inject(Actions), api = inject(ShopApi)) =>
    actions.pipe(
      ofType(CatalogActions.opened),
      exhaustMap(() =>
        api.loadProducts().pipe(
          map((products) => ProductsApiActions.loadProductsSuccess({ products })),
          catchError((error: Error) =>
            of(ProductsApiActions.loadProductsFailure({ error: error.message })),
          ),
          takeUntil(actions.pipe(ofType(DemoActions.reset))),
        ),
      ),
    ),
  { functional: true },
);
export const loadCustomer = createEffect(
  (actions = inject(Actions), api = inject(ShopApi)) =>
    actions.pipe(
      ofType(CustomerActions.sessionRequested),
      exhaustMap(() =>
        api.loadCustomer().pipe(
          map((customer) => CustomerApiActions.loadProfileSuccess({ customer })),
          catchError((error: Error) =>
            of(CustomerApiActions.loadProfileFailure({ error: error.message })),
          ),
          takeUntil(actions.pipe(ofType(DemoActions.reset))),
        ),
      ),
    ),
  { functional: true },
);
export const applyPromo = createEffect(
  (actions = inject(Actions), api = inject(ShopApi)) =>
    actions.pipe(
      ofType(CartActions.promoCodeSubmitted),
      exhaustMap(({ code }) =>
        api.applyPromo(code).pipe(
          map((coupon) => PromoApiActions.applyCodeSuccess({ coupon })),
          catchError((error: Error) =>
            of(PromoApiActions.applyCodeFailure({ error: error.message })),
          ),
          takeUntil(
            actions.pipe(
              ofType(
                DemoActions.reset,
                CartActions.promoCodeRemoved,
                OrdersApiActions.placeOrderSuccess,
              ),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
export const placeOrder = createEffect(
  (actions = inject(Actions), api = inject(ShopApi), store = inject(Store<ShopState>)) =>
    actions.pipe(
      ofType(CheckoutActions.orderSubmitted),
      withLatestFrom(store),
      exhaustMap(([{ simulateFailure }, state]) =>
        api.placeOrder(state, simulateFailure).pipe(
          map((order) => OrdersApiActions.placeOrderSuccess({ order })),
          catchError((error: Error) =>
            of(OrdersApiActions.placeOrderFailure({ error: error.message })),
          ),
          takeUntil(actions.pipe(ofType(DemoActions.reset))),
        ),
      ),
    ),
  { functional: true },
);
