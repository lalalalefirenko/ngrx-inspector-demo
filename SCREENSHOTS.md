# Screenshots for NgRx Inspector

Use three main screenshots: **a detailed cart Diff**, **an order Payload**, and **cart State**. Each demonstrates a different feature. Optional screenshots can show a compact quantity Diff and payment error handling.

## Prepare each screenshot

1. Run `npm start` and open `http://127.0.0.1:4201/`.
2. Open DevTools → **NgRx Inspector** and keep the panel visible while the scene runs. You can undock DevTools into a separate window.
3. Clear the extension's search query and disable any filters that hide the required events. The connection status should be **Connected**.
4. Click **Clear history** in the extension before running the scene. Do this before the scene because Diff requires the previous state snapshot.
5. Click the application button specified below and wait until the scene buttons become available again.
6. Select an action in the list on the left, or click **Latest action** if it is the most recent action.
7. Select the required tab and expand nodes by clicking `+` or their names. Wait for the green highlighting on new action rows to disappear.

Keep the action list visible on the left, the selected action name at the top, and the relevant data on the right. Keep the full catalog and repeated product details collapsed so the main example fits without scrolling.

## 1. Main screenshot: a detailed cart Diff

**Application:** click **04 Rich cart diff**.

**Extension:** **Latest action** → `[Cart] Workspace bundle applied` → **Diff**.

Expand `cart → items`, the changed item `line_001`, its `options`, and `cart → summary`. Added and removed objects appear as compact previews; they do not need to be expanded in this tab.

| Changed field or item         | Before → after                         |
| ----------------------------- | -------------------------------------- |
| Studio headphones, `line_001` | Moved `[1] → [0]`                      |
| `quantity`                    | `2 → 3`                                |
| `options.giftWrap`            | `true → false`                         |
| Pocket speaker, `line_004`    | Added at `[1]`, highlighted in green   |
| Arc desk lamp, `line_002`     | Removed from `[2]`, highlighted in red |
| `summary.subtotal`            | `50600 → 63500`                        |
| `summary.discount`            | `5060 → 6350`                          |
| `summary.total`               | `45540 → 57150`                        |

Use this as the first screenshot: it shows matching by ID, moves, additions, removals, a nested boolean change, and related totals. A single action applies a predefined product bundle, giving the multiple changes a clear business meaning.

The action sequence is: load the customer and catalog → add three products → favorite a product → reorder items → enable gift wrap → apply a promo code → change shipping → change quantity → apply the bundle.

## 2. Order Payload

**Application:** click **02 Successful order**.

**Extension:** **Latest action** → `[Orders API] Place order success` → **Payload**.

Expand `order`, `items` and one product, `shipping → address`, `totals`, and `payment`.

- Order `ORD-1048`, customer `cus_1042`.
- Three cart lines containing four units in total.
- `express` shipping to an address in Portland.
- Promo code `FORM10`, `grandTotal: 46740` = `$467.40`.
- `status: "confirmed"`, `payment.status: "paid"`.

Keep `[Checkout] Order submitted` and the successful response visible in the action list. Expand one product's details and leave the others collapsed.

## 3. State and path pinning

**Application:** click **01 Cart & discount**.

**Extension:** `[Cart] Quantity changed` → **State**.

Expand `customer → profile`, `cart → items` and one cart line, `cart → coupon`, `cart → summary`, and `checkout`. Keep `catalog.products` collapsed.

The screenshot will show Alex Morgan, cart lines with IDs, nested options, a 10% discount, a total of `45540`, and `express` shipping.

For a separate path-pinning screenshot, click **pin** next to `cart` to focus on that branch and display its path. Click **unpin** to return to the full state.

## 4. Optional: a compact quantity Diff

**Application:** click **01 Cart & discount**.

**Extension:** **Latest action** → `[Cart] Quantity changed` → **Diff**.

Expand `cart → items → line_001` and `cart → summary`:

- `quantity: 1 → 2`;
- `subtotal: 35700 → 50600`;
- `discount: 3570 → 5060`;
- `total: 32130 → 45540`.

For a separate move screenshot, select `[Cart] Items reordered` in the same action list → **Diff** → expand `cart → items`. The `line_003` item will show **Moved [2] → [0]**, with no changes to the totals.

## 5. Optional: payment failure and retry

**Application:** click **03 Payment failure**.

**Extension:** `[Orders API] Place order failure` → **Diff** → expand `checkout`. It will show `status: "loading" → "error"` and an error message. The cart is preserved.

Next, turn off **Simulate payment failure** in the application and click **Checkout**. A new `[Checkout] Order submitted` and `[Orders API] Place order success` will appear in the list. You can select the successful response's Payload while keeping both the failure and the retry visible in the action list.

## Verified examples

The `verification/` directory contains actual screenshots of the extension: `inspector-rich-diff.png`, `inspector-diff.png`, and `inspector-array-move.png`. The accompanying JSON files contain the original actions and Store snapshots. For final screenshots, repeat these steps using your installed version of the extension.
