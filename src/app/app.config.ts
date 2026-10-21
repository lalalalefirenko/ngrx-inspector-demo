import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideNgRxInspector } from 'ngrx-inspector';
import { reducers } from './store/shop.reducers';
import * as shopEffects from './store/shop.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      },
    }),
    provideEffects(shopEffects),
    provideNgRxInspector(),
  ],
};
