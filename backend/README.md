# REHMAN PERFUME — backend

The API behind the storefront (`frontend/`) and the staff panel (`admin/`).

**MongoDB holds every data table. Cloudinary holds every file and image.** That
split is the whole design: a product's price, stock and copy are rows; the
photograph of the bottle is bytes on Cloudinary, with a row in `media` recording
what it is and who uploaded it.

```
backend/
  package.json          scripts: dev · start · seed · seed:fresh · export-fixtures · smoke
  .env.example          every value a placeholder — copy to .env and fill in
  .env                  gitignored; identical to the example on a fresh clone
  src/
    server.js           listen, plus a graceful shutdown on SIGINT/SIGTERM
    app.js              helmet · cors · cookies · json · routes · error handler
    config/
      env.js            read once, validated at boot, fails loudly and early
      db.js             the Mongoose connection
      cloudinary.js     the SDK client, and `isConfigured()`
    models/             15 schemas + options.js + index.js — see the table below
    middleware/
      asyncHandler.js   so a rejected promise reaches the error handler
      auth.js           requireAuth · requireRole · optionalAuth
      validate.js       zod over body / query / params
      upload.js         multer, memory storage, allowlist, size and count limits
      error.js          ApiError → `{ message }`
    routes/
      index.js          the /api router: checkout, review-image upload, mounts
      public.js         catalogue, coupons, tracking, health
      auth.js           register, login, logout, me, password reset
      account.js        the signed-in patron's own profile, addresses, orders…
      admin.js          everything behind requireRole
    services/           the business logic — one file per collection
    lib/
      format.js         slugify, rupees, IST dates — mirrored from the storefront
      pricing.js        the one money rule set
      views.js          every serializer: one document, two shapes
      sku.js            RP-ORG-1047
      barcode.js        Code 128, mirrored from the SKU
      orderNumber.js    RP2042
  seed/                 a readable snapshot — see "The seed" below
  scripts/
    fixtures.mjs        loads both apps' data modules
    documents.mjs       the reconciliation: fixtures → documents
    seed.mjs            documents → MongoDB
    export-fixtures.mjs documents → seed/*.json
    backfill-barcodes.mjs fills `barcode` on rows that predate the field
    barcode.mjs         decodes the encoder's own output back to its input
    smoke.mjs           the whole thing, over HTTP, against a throwaway mongod
```

There is deliberately **no `controllers/` directory**. The handlers are thin
enough — validate, call a service, serialize, `res.json` — that a layer between
the route and the service would be a file per resource containing one line. The
plan drew one; the code does not need it, so it is not there.

## Running it

```bash
cd backend
npm install
npm run dev            # http://localhost:8000, restarts on save

# in two more terminals
cd frontend && npm run dev    # http://localhost:5173
cd admin    && npm run dev    # http://localhost:5174
```

Both `vite.config.js` files already proxy `/api` to `http://localhost:8000` with
**no path rewrite**, so `/api/products` reaches this server as `/products` and
nothing is stripped. Nothing in either frontend needs editing: every read in both
apps already goes through `api.withFallback(path, fixture)`, which tries the
backend first and quietly falls back to the bundled fixtures. Start this server
and both apps stop falling back.

`.env` ships with **placeholders**, and that is enough to run everything except
uploads:

| variable | placeholder | what it does |
| --- | --- | --- |
| `PORT` | `8000` | what `server.js` listens on |
| `NODE_ENV` | `development` | production refuses a placeholder `JWT_SECRET` |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>…` | every data table |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | uploads only |
| `CLOUDINARY_API_KEY` | `your-api-key` | uploads only |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | uploads only |
| `CLOUDINARY_FOLDER` | `rehman` | prefix for every folder written |
| `JWT_SECRET` | `replace-with-a-long-random-string` | signs the session cookie |
| `COOKIE_SECURE` | `false` | `true` once the API is on HTTPS |
| `SESSION_IDLE_HOURS` | `4` | signed out after this long with nothing happening, every role |
| `SESSION_MAX_DAYS` | `7` | hard ceiling; use slides the idle window but never this |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:5174` | credentialed, so a list, never `*` |
| `SHIPPING_FEE` | `79` | seeded into `settings` on first run |
| `FREE_SHIPPING_OVER` | `999` | seeded into `settings` on first run |

`config/env.js` validates at boot and exits with a list of sentences naming what
is wrong — not a Mongoose stack trace ten seconds later. It does **not** reject
placeholder-looking values, because placeholders are the point; the one exception
is `JWT_SECRET` under `NODE_ENV=production`, where a placeholder is forgeable by
anyone who can read this repository.

**With the placeholders untouched, the app boots and serves the entire catalogue.
Only the upload routes are affected**: they answer `503` with *"Cloudinary is not
configured — set `CLOUDINARY_*` in `.env`"*. `CLOUDINARY_*` is not "absent" but
"still the placeholder", so `isConfigured()` compares against the placeholder
strings rather than checking for emptiness.

A replica set is required — stock movements and order placement run inside a
transaction, which a standalone `mongod` cannot do. Atlas always is one. For a
local server: `mongodb://127.0.0.1:27017/rehman?replicaSet=rs0`.

## Collections

Fifteen. Each one exists because a screen or an endpoint reads it.

| collection | holds |
| --- | --- |
| `products` | sku, **barcode** (mirrors the sku, staff-only), slug, name, brand→ref, category→ref, tier, family, gender, concentration, copy, `notes{top,heart,base}`, `volumes[]`, listPrice, mrp, **cost**, stock, shopReserve, safeLimit, status, badges, longevity, projection, `collections[]` (facet keys), `images[]`→media, batch, origin, salesYtd, `ratingBaseline` |
| `categories` | name, slug, description, status, shelf, **`kind: 'shelf' \| 'facet'`** — one collection, two relations |
| `brands` | name, slug, short, house, country, origin, status, since |
| `customers` | the patron: name, email, phone, city, status, loyaltyTier, loyaltyPoints, joined, `notes` (staff-only), `addresses[]`, `lifetime{}` (opening balance), `wishlist[]`→ref |
| `users` | credentials: email, passwordHash, role, customer→ref, tokenVersion, reset token |
| `orders` | number, customer→ref, placedAt, channel, status, `payment{}`, address **snapshot**, `items[]`, `pricing{}` (frozen), `tracking{}`, `shipmentEvents[]`, inclusions, notes |
| `stockledgers` | product→ref, previous, change, next, reason, reasonNote, batch, actor→ref, idempotencyKey, at — **append-only** |
| `activities` | actor, tone, text, target, at — append-only audit feed |
| `reviews` | product→ref, customer→ref, name, city, rating, title, body, date, verified, `photos[]`→media, photoCount, helpful, status |
| `coupons` | code, label, headline, description, **`type`/`value`/`minOrder`/`cap`/`scope`**, terms, active, window, usageLimit, usedCount |
| `media` | publicId, secureUrl, format, bytes, width, height, resourceType, folder, ownerType, ownerId, alt, uploadedBy |
| `settings` | named singletons: `pricing`, `store`, `content` |
| `counters` | atomic `$inc` sequences: `order`, `sku:<TIER>` |

Unique indexes on `products.sku`, `products.barcode`, `products.slug`,
`brands.slug`, `categories.slug`, `coupons.code`, `customers.email`,
`users.email`, `orders.number`; a `$text` index over the product's name, brand,
family and notes; `timestamps` everywhere.

`category` and `brand` are **ObjectId refs, not names**. The admin fixtures join
by name, and a rename therefore orphaned a whole shelf — which the admin app
patched around client-side. With a ref, that bug class cannot exist.

## The three rules the code holds

**Money is computed, never stored.** With one deliberate exception: a *placed
order* stores the `pricing` snapshot it was priced under — subtotal, discount,
shipping, total, the coupon and the fee rule. An order that re-prices when the
shipping fee changes is not an order, it is a quote. Everywhere else money is
derived: a cart total, an analytics tile, a customer's lifetime spend.

`lib/pricing.js` is the only place a total is worked out. The storefront's
fixtures store each coupon's discount as a *function* (`pct(10, 999, 500)`),
which cannot go in a database; it is data now — `{type: 'percent', value: 10,
minOrder: 999, cap: 500}` — and the server is the authority. The two apps
disagreed about free delivery (the storefront's cart used ₹999 and publishes that
figure to shoppers; the admin's order book used ₹2,999). **₹999 wins**, because
it is what a shopper is actually charged.

**Derived state is not state.** Stock is a number; `inStock` is `stock > 0`.
`reviewCount` is counted from the `reviews` collection over an opening balance.
A customer's order count is counted, never typed. The storefront's category
fixtures bake in a `count` today, which is exactly the drift the backend removes.
The five-stage tracking timeline is derived from the order's status — a stored
timeline is a second copy of the state that someone has to keep in step by hand,
and the first time they disagree the shopper sees a contradiction.

**A function is never persisted.** Nothing in a document is executable. Where a
fixture had behaviour (a coupon's discount, a badge rule) it became data with a
shape, and the behaviour lives in `services/`.

## Auth

One JWT in an httpOnly cookie (`rehman_session`, `sameSite: 'lax'`, `secure` when
`COOKIE_SECURE`). No refresh dance. Both `api.js` files already send
`credentials: 'include'`, so neither client changed.

**A session ends after four idle hours**, and that applies to every role — an
owner at the panel and a shopper in the shop are signed out the same way and sign
in again. The window is *idle*, not fixed: `resolveSession` re-mints the cookie on
any request carrying a token more than five minutes old, so `exp` is always four
hours ahead of the last thing that happened. Someone working continuously is never
interrupted; someone who walks away is signed out.

Two claims carry it, and the difference is the feature:

- `exp` — the idle deadline, slid forward by use.
- `abs` — the ceiling, minted once at sign-in and copied forward by every renewal.
  Without it, sliding would mean a session that never ends for anyone willing to
  keep touching it, which is weaker than the fixed seven days it replaced.

`SESSION_IDLE_HOURS` and `SESSION_MAX_DAYS` set both. `GET /api/auth/me` reports
them as `session: { idleHours, maxDays }` — on every answer, guest or signed in —
so the two clients run their idle checks on the server's numbers rather than a
copy of them, and `/auth/me` also carries `reason: 'session_expired'` when a
cookie *was* sent and had run out, which is how the sign-in screens get to explain
themselves instead of looking like a fresh visit.

A 401 from a session that ended says so (`code: 'session_expired'`) and **only a
401**, never a 403 — a 403 means signed in but not senior enough, and both clients
key their "the session ended" handling off exactly that distinction.

`tokenVersion` on the user makes revocation real: bumping it invalidates every
token already issued, which is what `POST /api/auth/logout-all` does. Without it
a blocked customer keeps a working cookie.

- `requireAuth`, then `requireRole('owner'|'manager'|'atelier'|'viewer')` on every
  `/api/admin/*` route. A signed-in shopper gets **403, not 404**.
- A **Blocked** customer can still sign in and see their account, in a locked
  state, but `POST /api/orders` refuses with 409. (`cust-1429` in the fixtures
  exists as exactly this case.)
- Passwords are `bcryptjs` at cost 12 — pure JS, so there is no native build step
  on Windows. No serializer returns `passwordHash`.
- Registration creates the `customers` row and the `users` row together, so a
  patron always has a profile to attach an order to.

No mail transport is in scope. `POST /api/auth/password/forgot` stores a hashed
token with an expiry and **logs the reset link to the console** in development.
The data side is complete; only delivery is stubbed.

## Cloudinary

`multer` **memory** storage — nothing touches local disk — then
`uploader.upload_stream`.

Allowlist: `image/png`, `image/jpeg`, `image/webp`, `image/avif` as `image`, plus
`application/pdf` as `raw` for invoices and certificates. 5 MB per file, 8 files.

Folders under `CLOUDINARY_FOLDER`: `products`, `reviews`, `content`.

**Bytes to Cloudinary, the metadata row to Mongo.** `media` holds the public id,
the secure URL, dimensions, size, format and alt text; `product.images[]` and
`review.photos[]` reference media rows. Deleting the owning document destroys the
asset — a `DELETE` on a product destroys its images, or the account fills with
orphans nothing points at.

The storefront currently renders **pure-SVG art and makes no image requests at
all** (`FlaconArt`), so the seed leaves `images: []` and nothing regresses. This
is plumbing for when photography arrives.

## The API

Everything is mounted at `/api`. Both clients proxy `/api` → `:8000` unchanged.

**Public** — `GET /health` · `/products` (query: `q`, `tier`, `family`, `gender`,
`brand`, `collection`, `sort`, `limit`, `page`) · `/products/search?q=` ·
`/products/:slug` · `/products/:slug/bundle` → `{product, reviews}` ·
`/products/:slug/related` · `/categories` · `/brands` ·
`/coupons` · `POST /coupons/validate` `{code, subtotal}` ·
`GET /orders/track/:number`.

`/products/search` is declared **before** `/products/:slug`, or `search` would be
captured as a slug.

`GET /orders/track/:number` answers `200 null` for a number it does not know,
rather than 404 — the tracking page's fixture lookup returns `undefined` for a
miss, and an error status would make the client fall back and render a
*fictional* parcel for a mistyped number.

**Auth** — `POST /auth/register` · `/auth/login` · `/auth/logout` ·
`/auth/logout-all` · `GET /auth/me` · `POST /auth/password/forgot|reset|change`.

`GET /auth/me` is **always 200**, with `authenticated: false` when there is no
session. The storefront asks it on load to restore a session, and a 401 would
make its `withFallback` treat a signed-out visitor as a backend outage — and show
them the demo account instead of a sign-in button. It is also where both clients
read the idle policy (`session`) and, when a cookie had run out, the `reason`
that tells them a session was signed out for being away rather than never
existing.

**Account** — `/account/profile` · `/account/addresses[/:id[/default]]` ·
`/account/orders[/:number]` · `/account/wishlist[/:productId]`.

**Checkout** — `POST /orders` `{items: [{slug, size, qty}], couponCode?,
address?, giftWrap?}`. The basket carries slugs and sizes and **never prices**;
the server resolves each line to a product, takes the price from the volume
ladder, prices the whole basket, takes an order number from `counters`, writes
the order and decrements stock — all in one transaction. `POST
/uploads/review-images` takes the photographs for a review before the review is
submitted, so a failed upload does not orphan a half-written review.

**Admin** — every route the panel's mutation surface needs, mirroring
`adminStore.js` one-for-one so the follow-up rewiring pass is mechanical:

```
GET    /admin/products          GET /admin/orders            GET /admin/customers
POST   /admin/products          GET /admin/orders/:id        GET /admin/customers/:id
GET    /admin/products/:id      PATCH /admin/orders/:id/status    PATCH /admin/customers/:id
PATCH  /admin/products/:id      PATCH /admin/orders/:id/payment   PATCH /admin/customers/:id/notes
PATCH  /admin/products/:id/status  PATCH /admin/orders/:id/tracking  POST /admin/customers/:id/block
DELETE /admin/products/:id      POST /admin/orders/:id/events     POST /admin/customers/:id/unblock
                                PATCH /admin/orders/:id/notes
POST   /admin/inventory/adjust  GET /admin/inventory/ledger   GET /admin/inventory/summary
PATCH  /admin/inventory/reserve
POST   /admin/pos/bills         POST /admin/pos/bills/:id/void
GET    /admin/taxonomy          POST/PATCH/DELETE /admin/categories[/:id]
POST/PATCH/DELETE /admin/brands[/:id]   GET /admin/reviews   PATCH /admin/reviews/:id/status
GET/POST/PATCH/DELETE /admin/coupons[/:id]   PATCH /admin/coupons/:id/active
GET /admin/analytics[/summary|/revenue]   GET /admin/activity
GET /admin/settings   PATCH /admin/settings/pricing|store|content
GET/POST/PATCH/DELETE /admin/staff[/:id]
GET /admin/uploads/limits   POST /admin/uploads   POST /admin/uploads/batch
GET /admin/media   PATCH/DELETE /admin/media/:id
```

The list endpoints return **envelopes** — `{products}`, `{orders}`,
`{customers}`, `{ledger}`, `{categories, brands, facets}` — because the admin's
`asList(payload, key)` reads a named key. A bare array would be silently
discarded and the panel would fall back to its fixtures looking like it worked.

Rejections are shaped `{ message }`, matching what `ApiError` in both clients
already expects.

## The shop counter and the shop reserve

The admin panel's **Shop Billing** screen rings up in-store sales. A counter
bill is an order with `channel: 'Shop'`. It goes through `orders.place()` like
any other order, so it takes an `RP` number, moves stock through the ledger
inside the same transaction, and shows up in the order book and the reports.
There is **one shelf**, with two doors onto it.

`products.shopReserve` is how many units the counter keeps back from the website.
It is a **floor**: the storefront can never sell below it. With `stock: 20` and
`shopReserve: 4`:

| who | sees | may sell |
| --- | --- | --- |
| the shop counter (`/admin/pos/bills`) | 20 | all 20 |
| a shopper (`publicProduct().stockLeft`) | 16 | 16 — the 17th is refused with 409 |

A counter sale lowers both figures (20 → 19 leaves 15 online). The reserve
itself is never published. The binding check runs in `applyAdjustment` against
the count read inside the transaction, so a counter sale and an online checkout
racing for the same bottle cannot both win.

- `PATCH /admin/inventory/reserve {productId, shopReserve}` sets it. Nothing
  leaves the shelf, so it writes **no ledger row**, only an activity entry.
- `POST /admin/pos/bills` takes `{items: [{productId, size, qty}], customerId?,
  customer?: {name, phone}, payment: {method: 'Cash'|'UPI'|'Card', txnRef?},
  discount?: {type: 'flat'|'percent', value}, clientRef?}`. A counter bill has no
  delivery fee. It is born `Delivered` and `Paid`, and the cashier's name is
  stored for the receipt. A retried request with the same `clientRef` returns
  the first bill (`200`, `duplicate: true`) instead of selling twice. A bill with
  no `customerId` is filed under one `Walk-in Customer` record. The typed name
  and phone go on the bill itself.
- `POST /admin/pos/bills/:id/void` is owner or manager only. It returns the
  stock (`Shop sale voided` in the ledger), marks the payment `Refunded` and
  cancels the bill, all in one transaction.

## Integrity rules the server holds

- **Stock movement is atomic.** The shelf update and the ledger row are written
  in one `session.withTransaction`, in both the inventory adjustment and the
  order path (which decrements on placement and restores on cancellation).
- **Every adjustment carries an `idempotencyKey`.** A retried request — a double
  click, a network retry — is recognised by its unique index and returns 200 with
  the original row instead of moving stock twice.
- **Illegal status jumps are 409.** Transitions follow `ORDER_FLOW` (`Pending →
  Packed → Shipped → Delivered`); `Cancelled` is terminal and off the path.
  Delivered → Pending is refused, and the message names what *is* allowed.
- **A category or brand holding products refuses deletion** with 409, naming the
  count. A product archives by default; `?hard=true` deletes only when no order
  line references it, because an order from last year must keep resolving to the
  name and SKU it was placed against.
- **`cost` is never serialized publicly.** `adminProduct()` carries unit cost,
  stock and `salesYtd`; `publicProduct()` must not. Serving the raw document to
  `/api/products` would publish the house's margins to anyone who opens the
  network tab, so `views.js` is the only thing `/api/products` ever returns.
- **A barcode is derived, never supplied.** `barcode` mirrors the product's SKU
  and is set by the model's `pre('save')` hook, so every write path mints one
  without having to remember. `PATCH /admin/products/:id` ignores a `barcode` in
  the body, and `publicProduct()` does not emit the field at all — it is the
  stockroom's own numbering, and a client that could set it could print a label
  that scans to a fragrance the catalogue does not contain. A SKU the symbology
  cannot carry (anything outside A–Z, 0–9, space and hyphen) is a **422 naming
  the field**, not a silently wrong code.

## The seed

```bash
npm run seed           # upsert everything, leave anything else alone
npm run seed:fresh     # drop the database first
npm run barcode        # decode the Code 128 encoder's own output back
npm run backfill:barcodes   # fill `barcode` on rows that predate the field
npm run smoke          # needs no .env and no cluster at all
```

The backend has to hold exactly what the two frontends' fixtures hold, so that
going live changes nothing a shopper or a staff member can see. Rather than
hand-copy 2,600 lines into JSON (which would drift the first time a fixture was
edited), `scripts/fixtures.mjs` reads the modules themselves.

**It loads them by direct ESM import with the `@/` alias rewritten**, not through
Vite's SSR pipeline as the plan proposed. Grepping every data module for imports
showed only two import anything at all — `frontend/src/data/offers.js` wants
`formatPrice` and `admin/src/data/products.js` wants `slugify`, both from
`@/lib/format`, and this package's own `src/lib/format.js` already mirrors that
file. So the alias is rewritten into a temp directory and the module is imported.
No Vite, no build step, no JSON intermediate. If a fixture ever grows an import
of a React component the loader fails loudly naming the module — at that point
the SSR pipeline is genuinely needed and guessing would be worse than stopping.

`scripts/seed.mjs` is **idempotent by construction**. Every collection has a
natural key — a slug, an email, an order number, a legacy fixture id — and each
row is written with `replaceOne({key}, doc, {upsert: true})`. Running it twice
leaves the database identical rather than doubling the catalogue, and because
`replaceOne` keeps the existing `_id`, every reference into a re-seeded row still
resolves. It is a **one-time migration**, not a sync: after it runs the backend
is the source of truth.

One consequence of writing through `replaceOne`: it is a driver-level write, so
**no Mongoose middleware runs** — which is why `documents.mjs` sets each
product's `barcode` itself, from the same `barcodeOf()` the model's save hook
calls. A seed that relied on the hook would store 72 products with no barcode and
report success. For rows already in a live database, `npm run backfill:barcodes`
fills just the missing field, leaving every other value alone
(`--dry-run` reports without writing).

Every seeded account gets the password **`Rehman@2026`**, printed by the seed.

| role | email |
| --- | --- |
| shopper | `rahul.sharma@example.com` |
| owner (superadmin) | `ayaan@rehmanperfume.in` |
| manager | `priya@rehmanperfume.in` |
| atelier | `mehul@rehmanperfume.in` |
| viewer | `ritu@rehmanperfume.in` |

`seed/*.json` is written by `npm run export-fixtures`. **The seed does not read
it** — it calls `buildDocuments()` directly — so those files are a photograph,
not a source of truth: `git diff seed/` answers "what changed when someone edited
a fixture?" without a database. `seed/_reconciliation.json` holds the notes
`buildDocuments()` produced for the run, which is the most useful thing there to
read.

## Verification

```bash
npm run smoke
```

`scripts/smoke.mjs` boots `mongodb-memory-server` **as a replica set** (so
transactions are real), seeds it, starts the actual app on an ephemeral port, and
drives it over HTTP with a cookie-jar `fetch` — no supertest, no mocks of the
app. It runs the checks in groups:

1. Every endpoint the frontends already call answers, with the right envelope key.
2. `publicProduct` carries **no `cost`** key — the margin leak.
3. Coupon maths reproduces the storefront's own functions: `pct(10,999,500)` on
   ₹1,998 is ₹200; `flat(200,1499)` below ₹1,499 is ₹0; a cap is honoured; an
   unknown code is refused in the client's shape.
4. An illegal order transition is 409, a legal one moves, `Cancelled` is terminal.
5. An adjustment writes a ledger row whose `previous`/`change`/`next` agree with
   the shelf; a refused adjustment writes nothing; a repeated idempotency key
   moves stock once.
6. A category holding products refuses deletion, and a **rename follows the
   products** rather than orphaning them.
7. register → me → logout → login round-trips; a shopper gets 403 on
   `/api/admin/*`; a blocked patron signs in but is refused at checkout; an order
   total is priced by the server from its own prices, ignoring any price the
   client sends.
8. The counter's reserve: the shelf is untouched while the website sells less;
   an online order cannot reach into the reserve; the counter can; a retried bill
   with one `clientRef` is one bill; a void returns the stock once.
9. **With placeholder Cloudinary creds the app boots, the catalogue serves, and
   `POST /api/admin/uploads` answers 503 naming the variables.** This is the check
   that proves the placeholder requirement is actually met.
10. Every fragrance carries a Code 128 barcode that mirrors its SKU; the
    storefront never sees it; a caller cannot set one; correcting the SKU
    re-derives it; an unencodable SKU is 422; no two products share a code.

`npm run barcode` is the companion to the smoke suite and tests the encoder where
the smoke suite cannot reach: it expands the 107-symbol width table into bit
patterns, compares them against the specification's own patterns, and then
**decodes its own output back to the input**, verifying the mod-103 check symbol
against literals worked out by hand. That matters because a Code 128 symbol built
from a wrong width or a mis-weighted check digit renders perfectly and scans as
garbage — nothing on screen would look wrong.

Then, in the browser: start all three servers and confirm the storefront grid
fills from Mongo and the admin's Refresh reports the API as live. Expect two
visible deltas, both intended — the admin's Customers drawer shows
`openingSpent + Σ orders`, and `lastOrder` moves to the latest seeded order.

## Known deviations from the plan

Written down because each one is a decision someone will otherwise re-litigate.

1. **No `controllers/` directory.** Handlers are inline in thin route modules.
2. **The seed loads fixtures by direct ESM import**, not Vite's SSR pipeline —
   see "The seed" above for why that turned out to be sufficient and what would
   invalidate it.
3. **The two catalogues are not near-duplicates.** The plan assumed they
   described the same fragrances in two shapes; they overlap on exactly **four**
   (`Sauvage Dior`, `Tobacco Vanille Tribute`, `Baccarat Rouge Tribute`, `Vanilla
   Wood Artisanal Mix`). The storefront has 13 originals plus ~29 house lines,
   the admin 27. So the seed **unions** them, merging on a normalised name, and
   each app contributes the fields it owns — the storefront the public slug,
   editorial copy, volume ladder and facet keys; the admin the SKU, shelf, cost,
   stock and sales figures.
4. **Brand names disagree between the apps** (`Dior Parfums` vs `Christian Dior`,
   `Chanel Haute` vs `Chanel Paris`, `Rehman Signature House` vs `Rehman
   Atelier`, `House of Creed` vs `Creed`, `Ajmal Royal Oudh` vs `Ajmal`). Since
   the name cannot be matched, the merge ignores brand and uses a hand-written
   alias table in `documents.mjs` rather than a derivable rule.
5. **The admin fixtures' SKUs are internally inconsistent.** The order book
   writes `RP-ORG-1054` for Sauvage Dior while the `skuSeq` ladder (starting
   1040, `+= 7`) yields `RP-ORG-1047`. A SKU **used on an order line wins** over
   a derived one; a storefront-only line is minted a fresh SKU at the next free
   slot for its tier.
6. **Storefront-only products get `stock = inStock ? 48 : 0`.** The storefront
   fixture carries no stock figure at all, so `DERIVED_STOCK = 48` in
   `documents.mjs` is the seed's **one arbitrary number**, and is labelled as
   such.
7. **Admin-only products get a single volume at the admin price**, sized from the
   concentration string (else `50ml`; attars `12ml`), rather than an invented
   price ladder. The admin's headline price is the *largest* volume's; inventing
   smaller sizes would have invented prices too.
8. **A SKU becomes `legacySku` and the public slug wins.** `admin/src/data/
   products.js` derives its slug from `name + brand`, which cannot reproduce the
   storefront's published URLs. Seeded products therefore keep the storefront's
   slug — but an admin *rename* would still mint a new one, because that
   derivation lives in the admin app. It is a one-line follow-up in the product
   form and cannot be fixed from the backend.
9. **`/products/search` is a Mongo `$text` index**, not Atlas Search. The
   storefront's local scorer weighs name, brand, tier, family and notes; the
   server reproduces that ordering closely but not identically, so search results
   may reorder.
10. **`openingOrders`/`openingSpent` are stored, not derived.** The admin's
    `orders: 14` / `totalSpent: 148900` are documented as lifetime figures that
    are *not* the sum of its own order book, so they are seeded as an opening
    balance of exactly `lifetime − Σ seeded orders`. The number a staff member
    reads today is unchanged, and it stays live tomorrow.

## Out of scope, stated plainly

- **No payment gateway.** `payment.status` is set by staff or the seed, as today.
- **No mail transport.** Reset links log to the console.
- **No frontend rewiring.** Both apps read live; admin **writes** still go to the
  local Zustand store. Every route that rewiring needs is built and smoke-tested.
- **The analytics chart series and the content pages** are read-only placeholders
  until the second pass.
