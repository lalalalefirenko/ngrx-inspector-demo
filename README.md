# NgRx Inspector Demo

A local Angular application using real NgRx Store, Effects, and the published `ngrx-inspector` package. It demonstrates actions, Payload, State, and Diff in the Chrome extension. All data and API responses are local; no backend or accounts are required.

## Getting started

Requires Node.js `^22.22.3`, `^24.15.0`, or `>=26`. Verified with Node.js 24.18.0.

```bash
cd /home/dev/Downloads/ngrx-inspector-demo
npm ci
npm start
```

Open <http://127.0.0.1:4201/>, then open DevTools → **NgRx Inspector**. Keep the extension panel visible while running a scene. Use `npm start`: the inspector bridge is disabled in production builds.

## Scenes

| Button                  | Result                                                                                 | Final action                       |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| **01 Cart & discount**  | Cart items, reordering, gift wrap, quantities, a promo code, and shipping              | `[Cart] Quantity changed`          |
| **02 Successful order** | A complete order with an address, payment, and totals; the cart is cleared             | `[Orders API] Place order success` |
| **03 Payment failure**  | A payment error with the cart preserved for a retry                                    | `[Orders API] Place order failure` |
| **04 Rich cart diff**   | One action showing additions, removals, moves, nested changes, and recalculated totals | `[Cart] Workspace bundle applied`  |

Each scene resets the Store, loads fixed data, and dispatches real actions. Wait until the scene finishes and its buttons become available again. **Reset demo** clears the business state; **Clear history** in the extension clears the action list.

**[Step-by-step screenshot recipes → SCREENSHOTS.md](SCREENSHOTS.md)**

Manual controls dispatch the same actions: `+` on a product card, quantity controls, `Move up`, `Gift wrap`, removal, the `FORM10` promo code, shipping, and `Checkout`. Other promo codes produce a failure action. After the payment failure scene, turn off **Simulate payment failure** and click **Checkout** to demonstrate a successful retry.

State slices: `customer`, `catalog`, `cart`, `checkout`, and `orders`. Array items have stable `id` fields so the extension can identify moves. All monetary amounts are integer USD cents: `50600` = `$506.00`.

## Validation and source files

```bash
npm test           # Business rules and real Store + Effects scenarios
npm run build      # Production build
npm run build:demo # Development build with the inspector bridge enabled
```

- `src/app/store/shop.data.ts` — products and customer data.
- `src/app/store/shop.actions.ts` — action names and payloads.
- `src/app/store/shop.reducers.ts` — state changes.
- `src/app/store/shop.api.ts`, `shop.effects.ts` — asynchronous success and failure responses.
- `src/app/demo.service.ts` — the sequence of actions in each scene.
- `verification/` — action JSON, screenshots of the actual extension panel, and browser verification results.
