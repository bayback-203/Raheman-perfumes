# REHMAN PERFUME — Storefront

The customer-facing shop, built with **React 18 + Vite 5**, **Tailwind CSS 3** and
**Zustand**. This package contains the shopper's side of the house only.

| Folder      | Owns                                        | Status                       |
| ----------- | ------------------------------------------- | ---------------------------- |
| `frontend/` | Every shopper-facing page (this package)     | built                        |
| `admin/`    | Staff and admin screens                      | built — see `admin/README.md` |
| `backend/`  | API, MongoDB tables and Cloudinary files     | built — see `backend/README.md` |

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run smoke    # render every route and report failures
```

The backend does not need to exist to explore the shop. See *Data* below.

## Architecture

### Routing

`src/App.jsx` declares every route inside a single `Layout` parent, so the
header, footer, drawers and toaster mount once and survive navigation.

| Path                  | Page                                                    |
| --------------------- | ------------------------------------------------------- |
| `/`                   | `HomePage` — hero, pillars, collections, rails, FAQ      |
| `/shop`               | `ShopPage` — full catalogue                              |
| `/shop/:collection`   | `ShopPage` — men, women, unisex, attars, combos, …       |
| `/shop/originals`     | `OriginalPerfumesPage`                                   |
| `/shop/inspired`      | `InspiredMixingPage`                                     |
| `/product/:slug`      | `ProductDetailPage`                                      |
| `/search`             | `SearchResultsPage`                                      |
| `/offers`             | `OffersPage` — vault, coupons, combos, volume ladder     |
| `/cart`               | `CartPage`                                               |
| `/checkout`           | `CheckoutPage`                                           |
| `/wishlist`           | `WishlistPage`                                           |
| `/account`            | `AccountPage` — overview, orders, addresses, …           |
| `/track-order`        | `OrderTrackingPage`                                      |
| `/pages/:slug`        | `ContentPage` — policy, FAQ and editorial pages          |
| `*`                   | `NotFoundPage`                                           |

### Data and the API boundary

Every catalogue read goes through `src/services/productService.js`, which calls
a strict `api.get`: it asks the backend and returns the server's answer, or
throws. There is no bundled catalogue and no silent degrade — when the server
does not answer the stores stay empty and the screens say so ("The shop could not
be reached") rather than inventing a shop to fill the gap:

```js
detailBundle: (slug) => api.get(`/products/${slug}/bundle`)
```

The storefront is therefore strictly API-driven everywhere. `VITE_API_BASE_URL`
(default `/api`, proxied to `localhost:8000` in dev) sets the origin.

Zustand stores hold client state and persist to `localStorage`:

| Store            | Holds                                                  |
| ---------------- | ------------------------------------------------------ |
| `cartStore`      | Lines, quantities, coupon code, gift wrap, totals      |
| `wishlistStore`  | Saved product ids                                       |
| `authStore`      | Profile, addresses, orders — from the server once signed in, else empty |
| `uiStore`        | Drawers, search overlay, toasts, recently viewed        |

Three rules keep these honest:

- **Never persist a function.** `cartStore` stores `couponCode` as a string and
  resolves the coupon through a `coupon()` getter, because `JSON.stringify`
  drops functions and a persisted `discount()` would throw on reload.
- **Money is computed, never stored.** `summary()` derives subtotal, discount,
  shipping, GST and payable from the lines.
- **Totals live in one place.** `getServerCart`-style duplication is avoided by
  reading `summary()` from the store wherever a total is needed.

### Filtering

`useCatalogue` (`src/hooks/useCatalogue.js`) is the single filtering engine
behind Shop, Originals, Inspired and Search. It returns filters, the sorted and
paginated page, active chips, and — importantly — **facets derived from the
catalogue itself**, not a hardcoded list. Add a scent family or a maison to
`src/data/products.js` and it appears in the sidebar with a correct count; it
can never drift out of sync with the data.

`CatalogueView` renders that state so all four surfaces share one layout,
toolbar, chip row and pagination.

### Design system

`tailwind.config.js` carries the full token set — the warm ivory canvas
(`#F8F3EA`), obsidian contrast (`#11100F`) and champagne gold (`#D8B93C` →
`#C89B3C`) of the *Haute Parfumerie Prestige* system, plus the serif/sans pairing
and type scale.

Two deliberate substitutions:

- **`Icon.jsx`** renders inline SVG paths (~90 of them) instead of the design's
  Material Symbols webfont, so the shop makes no external font request for icons.
- **`FlaconArt.jsx`** draws the bottle artwork as vectors (`FlaconStage`) rather
  than shipping photography, so the catalogue renders with zero image requests.

Provenance is a first-class concept: `Original`, `Inspired`, `Mixed` and
`Custom`. It drives the tier badges, the pricing model and the filter facets.

### Accessibility

Overlays implement a focus trap, Escape-to-close and a ref-counted body scroll
lock, and carry `aria-modal`. Motion respects `prefers-reduced-motion`. Toasts
announce through `role="status"`.

## Verification

`npm run smoke` renders every route through Vite's SSR pipeline and asserts that
each page contains the text it should, that all 49 catalogue slugs resolve to a
PDP bundle, and that every coupon validates at its minimum order and only there.

It exists because `vite build` proves the modules parse and imports resolve, but
never executes a render body — a call to a store method that does not exist
would still build cleanly and then break in the browser.

```bash
npm run build && npm run smoke
```

**Known coverage gap:** effects do not run under `renderToString`, so
`ProductDetailPage` always renders its loading skeleton in the smoke test. Its
data layer is covered by the bundle check above; its populated render needs a
browser.

## Conventions

- `@/` aliases `src/`.
- Components are function declarations exported by name, with a default export
  for the primary component of each file.
- Comments explain *why* a non-obvious decision was made, not what the line does.
- No `require()` — this is an ESM/Vite build.
