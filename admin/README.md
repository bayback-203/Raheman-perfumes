# REHMAN PERFUME — Admin Panel

The staff side of the house: catalogue, orders, customers and the stock room,
built with **React 18 + Vite 5**, **Tailwind CSS 3** and **Zustand** — the same
stack and the same conventions as `../frontend`, in a separate app.

| Folder      | Owns                                        | Status                        |
| ----------- | ------------------------------------------- | ----------------------------- |
| `frontend/` | Every shopper-facing page                    | built                         |
| `admin/`    | Staff and admin screens (this package)       | built — five sections pending |
| `backend/`  | API, MongoDB tables and Cloudinary files     | built — see `backend/README.md` |

## Running it

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run smoke    # render every route and report failures
```

Port **5174** — the storefront keeps 5173, so both can run at once. `/api` is
proxied to `localhost:8000` exactly as the storefront does it.

This package deliberately does **not** import from `../frontend`. A relative
import across the two would pull storefront sources into this app's Tailwind
content glob and break the storefront on any refactor. The handful of genuinely
shared, presentation-only files — `lib/cn.js`, `ui/Icon.jsx`, most of
`lib/format.js`, and `ui/FlaconArt.jsx` — are copied, each carrying a header
comment naming the file it came from.

## Architecture

### Routing

`src/App.jsx` exports `AppRoutes` (the tree) separately from `App` (which wraps
it in a `BrowserRouter`), so the smoke test can render the tree under a
`StaticRouter` — a `BrowserRouter` reads `window.location`, which Node has not
got. Paths are root-level: this app *is* the admin, so `/products` is the
catalogue rather than `/admin/products`.

| Path             | Page                                                  |
| ---------------- | ----------------------------------------------------- |
| `/`              | `DashboardPage` — tiles, revenue chart, feed, sellers  |
| `/products`      | `ProductsPage` — catalogue table, bulk actions         |
| `/categories`    | `CategoriesBrandsPage` — two tables, add/edit modals   |
| `/orders`        | `OrdersPage` — status tabs, drawer with the stepper    |
| `/customers`     | `CustomersPage` — the customer book                    |
| `/inventory`     | `InventoryPage` — the shelf and the stock ledger       |
| `/offers`        | `OffersPage` — coupon table, create/edit modal          |
| `/reviews`       | `ReviewsPage` — moderation queue, bulk actions          |
| `/analytics`     | `AnalyticsPage` — revenue window, mix, best sellers     |
| `/settings`      | `SettingsPage` — pricing, store identity, staff         |
| `*`              | Redirect to `/`                                        |

Deep links: `?focus=<id>` opens a record in Products, Orders and Customers, and
the `⌘K` palette builds those links from the store.

The last five read and write **live data only** — they have no fixtures, so with
the backend down they say so rather than drawing a plausible table. See
`hooks/useServerResource.js`.

### Data and the API boundary

Everything the panel renders comes from `src/store/adminStore.js`, which starts
**empty** and is filled by `adminApi.pull()` inside `hydrate()` — the server's
rows, or nothing. `lib/api.js` is strict: a read returns the server's answer or
throws, and a write goes through `api.mutate`, which resolves only once the server
has taken the change. There is no `withFallback` and no bundled fixtures any more,
so **with the backend down the tables stay empty and the shell says so** rather
than drawing a plausible back office.

Writes are store actions, but each one asks the server first. If the server does
not answer, the action surfaces "Not saved" and changes nothing — a write the
server has not taken did not happen.

### The store

`src/store/adminStore.js` (zustand + `persist`, key `rehman-admin-v1`) owns every
mutation the panel offers, so a screen can never invent its own way of changing a
record:

| Action | Effect |
| --- | --- |
| `upsertProduct` | Creates (with the next free SKU for its tier) or updates a fragrance |
| `duplicateProduct` | Copies a record as a fresh draft |
| `setProductStatus` / `setProductsStatus` | One status, or one status across many rows |
| `deleteProduct` / `deleteProducts` | Removes records |
| `adjustStock` | Moves stock **and** writes the ledger row, in one action |
| `updateOrderStatus` / `advanceOrder` | Sets a status, or steps one along `ORDER_FLOW` |
| `upsertCategory` / `deleteCategory` | Categories; a rename re-points its fragrances, deletion is refused while in use |
| `upsertBrand` / `deleteBrand` | Maisons; a rename re-points its fragrances, same refusal |
| `setCustomerStatus` / `setCustomerNote` | Block, reinstate, or save a staff note |

Three rules, carried over from the storefront:

- **Never persist a function.** `partialize` writes data only; actions are
  recreated on load, so a persisted closure can never be restored stale.
- **Money is computed, never stored.** An order's `amount` comes from its lines;
  the dashboard's totals come from `lib/derive.js`. No total is typed twice.
- **Derived state is not state.** Low stock, revenue, best sellers and the status
  counts are pure functions of the slices in `lib/derive.js` — keeping them out
  of the store is what stops a saved payload going stale against the data.

### Design system

The admin chrome follows the Stitch mockups' material palette, mapped onto the
storefront's tokens: cream page ground, white cards, obsidian sidebar
(`shell.obsidian`) with champagne-gold highlights, gold text on gold as
`brand.goldInk` so contrast holds. Two divergences from the mockups, both for
consistency with what is already built: **Cormorant Garamond** rather than Bodoni
Moda (one brand, one serif), and a **softer radius scale** of our own — the panel
started near-square for density, but read as hard-edged, so `borderRadius` in
`tailwind.config.js` now leans modern and rounded. Pill badges and avatars stay
genuinely circular.

Charts are inline SVG (`ui/Chart.jsx`); there is no chart library. Product
thumbnails reuse the storefront's vector flacon, so the panel makes no image
requests either.

## Verification

`npm run smoke` renders every route through Vite's SSR pipeline and asserts:

1. Every route renders and its `<h1>` is the heading it should be. The heading is
   read from the `<h1>` rather than searched for anywhere in the text, because
   the sidebar prints every nav label on every page — a substring match would
   pass even on a dead route.
2. Every entry in `ADMIN_NAV` (`src/data/navigation.js`) is backed by a page, so
   adding a nav item without building its screen fails here, not in the browser.
3. The dashboard's derived figures agree with the rows they are built from:
   revenue excludes cancellations, low stock flags a line at/under its limit and
   skips archived ones, and the daily/channel/tier mixes resolve live orders
   against the catalogue. Store writes are server-backed now, so their
   round-trip is exercised in a browser rather than here. A category in use, a
   rename that carries its fragrances, and an empty shelf added then removed are
   all live-server behaviours.

It exists because `vite build` proves the modules parse and imports resolve, but
never executes a render body — a call to a store method that does not exist would
still build cleanly and then break in the browser.

```bash
npm run build && npm run smoke
```

**Known coverage gap:** effects do not run under `renderToString`, so anything
that only appears in an effect — a drawer opened by a `?focus=` deep link, the
`⌘K` palette, the toasts — is out of reach. Rendering those needs a browser.

### Click-through

With `npm run dev` open, in order:

1. Create a product in **Products** → it appears in the table *and* moves the
   dashboard's product count.
2. Advance an order in **Orders** → the status pill, the tab counts and the
   dashboard feed all move together.
3. Adjust stock in **Inventory** to just below its safe limit → the fragrance
   appears in the dashboard's low-stock panel.
4. Reload → all of the above survive; the store is persisted.
5. Reset from the topbar's user menu → every screen is back to the seed.

## Conventions

- `@/` aliases `src/`.
- Components are function declarations exported by name, with a default export
  for the primary component of each file.
- Comments explain *why* a non-obvious decision was made, not what the line does.
- No `require()` — this is an ESM/Vite build.

## Known deviations from the plan

- **No volumes editor on the product form.** The storefront's products carry
  `volumes: [{ size, price, mrp, label }]`, but the admin record does not — a
  sizes editor here would imply a field the record has not got. Add the field to
  `src/data/products.js` first if it is wanted.
- **`data/inventory.js` and `data/activity.js` were dated two weeks behind the
  order book.** Their dates were moved forward so the ledger's "latest day" and
  the activity feed sit inside the same window as the orders and the analytics
  series; a feed ending two weeks before the newest order reads as stale on
  first load.
